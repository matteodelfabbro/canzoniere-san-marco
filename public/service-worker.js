const CACHE_NAME = 'canzoniere-offline-verificato-30';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/firebase-config.js",
  "./data/songs-index.json",
  "./data/songs-tags.json",
  "./data/search-suggestions.json",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./fonts/manrope-latin.woff2",
  "./fonts/manrope-latin-ext.woff2"
];

const PRECACHE_BATCH_SIZE = 8;

async function getSongAssetsFromIndex(cache) {
  try {
    const indexRequest = new Request('./data/songs-index.json');
    let response = cache ? await cache.match(indexRequest, { ignoreSearch: true }) : null;
    if (!response) {
      response = await fetch(new Request('./data/songs-index.json', { cache: 'reload' }));
    }
    if (response && response.ok) {
      const items = await response.clone().json();
      if (Array.isArray(items)) {
        return items
          .map(item => item && item.file ? ('./' + String(item.file).replace(/^\.?\/?/, '')) : null)
          .filter(Boolean);
      }
    }
  } catch (error) {
    console.warn('Impossibile estrarre l\'elenco dei canti da songs-index.json', error);
  }
  return [];
}

function matchOfflineAsset(request) {
  // app.js aggiunge ?v=... a indici e canti per evitare dati vecchi online.
  // Il precache usa invece gli URL canonici senza query: offline dobbiamo
  // ignorare soltanto la query, mantenendo invariati percorso e origine.
  return caches.match(request, { ignoreSearch: true });
}

async function isValidOfflineResponse(url, response) {
  if (!response || !response.ok) return false;
  if (!new URL(url, self.location.origin).pathname.endsWith('.json')) return true;
  try {
    await response.clone().json();
    return true;
  } catch {
    return false;
  }
}

async function cacheAssetBatch(cache, urls) {
  const downloaded = await Promise.all(urls.map(async url => {
    const request = new Request(url, { cache: 'reload' });
    const response = await fetch(request);
    if (!await isValidOfflineResponse(url, response)) {
      throw new Error(`Precache non valida per ${url}: ${response.status}`);
    }
    return { request, response };
  }));

  await Promise.all(downloaded.map(({ request, response }) => cache.put(request, response)));
}

async function prepareCompleteOfflineCache() {
  try {
    const cache = await caches.open(CACHE_NAME);

    // Prima l'app essenziale: pagina, stile, logica, font e indici di ricerca.
    await cacheAssetBatch(cache, CORE_ASSETS);

    // Estrae dinamicamente la lista dei canti da songs-index.json
    const songAssets = await getSongAssetsFromIndex(cache);

    // Poi i canti, pochi alla volta: evita centinaia di richieste simultanee
    // che su iPad possono lasciare una cache solo parzialmente popolata.
    for (let index = 0; index < songAssets.length; index += PRECACHE_BATCH_SIZE) {
      await cacheAssetBatch(cache, songAssets.slice(index, index + PRECACHE_BATCH_SIZE));
    }
  } catch (error) {
    // Una cache incompleta non deve mai diventare la versione offline attiva.
    await caches.delete(CACHE_NAME);
    throw error;
  }
}

async function missingOfflineAssets() {
  const cache = await caches.open(CACHE_NAME);
  const songAssets = await getSongAssetsFromIndex(cache);
  const allAssets = [...CORE_ASSETS, ...songAssets];
  const checks = await Promise.all(allAssets.map(async url => ({
    url,
    valid: await isValidOfflineResponse(url, await cache.match(new Request(url), { ignoreSearch: true }))
  })));
  return checks.filter(({ valid }) => !valid).map(({ url }) => url);
}

async function ensureOfflineCache() {
  let missing = await missingOfflineAssets();
  if (missing.length && self.navigator.onLine !== false) {
    const cache = await caches.open(CACHE_NAME);
    for (let index = 0; index < missing.length; index += PRECACHE_BATCH_SIZE) {
      await cacheAssetBatch(cache, missing.slice(index, index + PRECACHE_BATCH_SIZE));
    }
    missing = await missingOfflineAssets();
  }
  return { ready: missing.length === 0 };
}

self.addEventListener('install', event => {
  event.waitUntil(prepareCompleteOfflineCache());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'CHECK_OFFLINE_READY') return;
  const reply = event.ports?.[0];
  const task = ensureOfflineCache()
    .then(result => reply?.postMessage(result))
    .catch(error => {
      console.warn('Verifica cache offline non riuscita.', error);
      reply?.postMessage({ ready: false });
    });
  event.waitUntil(task);
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Non intercettare gli URL riservati di Firebase Hosting (/__/firebase/...).
  if (new URL(event.request.url).pathname.startsWith('/__')) return;

  // Rete-prima per tutto ciò che modifichiamo spesso durante lo sviluppo
  // (dati dei canti, stile, logica): chi è online vede sempre l'ultima
  // versione pubblicata. Cache-first resta solo per icone e manifest,
  // che di fatto non cambiano quasi mai.
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const isSong = pathname.startsWith('/songs/') && pathname.endsWith('.json');
  const isFrequentlyUpdated = pathname.endsWith('.json') || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.html') || pathname.endsWith('/');

  if (isSong) {
    // Su Safari/iPad una richiesta rete-prima può restare sospesa a lungo in
    // modalità aereo. I canti già verificati devono aprirsi immediatamente
    // dalla cache; quando manca la copia locale, usiamo la rete e la salviamo.
    event.respondWith(
      matchOfflineAsset(event.request).then(cached => cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }))
    );
  } else if (isFrequentlyUpdated) {
    const freshRequest = new Request(event.request, { cache: 'reload' });
    event.respondWith(
      fetch(freshRequest)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => matchOfflineAsset(event.request))
    );
  } else {
    // Cache prima solo per icone e manifest: non cambiano quasi mai,
    // niente da guadagnare a ricontrollarli ad ogni apertura del sito.
    event.respondWith(
      matchOfflineAsset(event.request).then(cached => cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }))
    );
  }
});
