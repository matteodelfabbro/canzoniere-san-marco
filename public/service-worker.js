const CACHE_NAME = 'canzoniere-offline-verificato-36';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/redesign.css",
  "./js/app.js",
  "./js/redesign.js",
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
// Oltre questo tempo un canto già salvato (anche di versione precedente)
// viene aperto dalla cache: su iPad in modalità aereo fetch può restare sospesa.
const SONG_NETWORK_TIMEOUT_MS = 4000;

function isSongPath(pathname) {
  return pathname.startsWith('/songs/') && pathname.endsWith('.json');
}

function isSongUrl(url) {
  return isSongPath(new URL(url, self.location.origin).pathname);
}

function versionedUrl(url, version) {
  if (!version) return url;
  return url + (url.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(version);
}

// Una sola copia per file: la query ?v=... serve solo a distinguere le versioni.
// Prima si salva la nuova copia, poi si eliminano le altre: il file non risulta
// mai mancante, nemmeno per un istante, durante la verifica offline.
async function putSingle(cache, request, response) {
  await cache.put(request, response);
  const others = await cache.keys(request, { ignoreSearch: true });
  await Promise.all(others
    .filter(key => key.url !== request.url)
    .map(key => cache.delete(key)));
}

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Rete troppo lenta')), ms);
    fetch(request).then(
      response => { clearTimeout(timer); resolve(response); },
      error => { clearTimeout(timer); reject(error); }
    );
  });
}

async function getSongAssetsFromIndex(cache) {
  try {
    const indexRequest = new Request('./data/songs-index.json');
    let response = null;
    if (self.navigator.onLine !== false) {
      // Online conta l'indice pubblicato, così entrano anche i canti nuovi.
      response = await fetch(new Request('./data/songs-index.json', { cache: 'reload' })).catch(() => null);
      if (response && !response.ok) response = null;
    }
    if (!response && cache) response = await cache.match(indexRequest, { ignoreSearch: true });
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

  await Promise.all(downloaded.map(({ request, response }) => putSingle(cache, request, response)));
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

async function missingOfflineAssets(version) {
  const cache = await caches.open(CACHE_NAME);
  // Con la versione dei dati nota, un canto conta come pronto solo se la
  // copia salvata è proprio quella versione: le correzioni arrivano anche a
  // chi ha già il Canzoniere installato, senza cambiare CACHE_NAME.
  const songAssets = (await getSongAssetsFromIndex(cache)).map(url => versionedUrl(url, version));
  const allAssets = [...CORE_ASSETS, ...songAssets];
  const checks = await Promise.all(allAssets.map(async url => ({
    url,
    valid: await isValidOfflineResponse(url, await cache.match(new Request(url), {
      ignoreSearch: !(version && isSongUrl(url))
    }))
  })));
  return checks.filter(({ valid }) => !valid).map(({ url }) => url);
}

async function ensureOfflineCache(version) {
  let missing = await missingOfflineAssets(version);
  if (missing.length && self.navigator.onLine !== false) {
    const cache = await caches.open(CACHE_NAME);
    for (let index = 0; index < missing.length; index += PRECACHE_BATCH_SIZE) {
      await cacheAssetBatch(cache, missing.slice(index, index + PRECACHE_BATCH_SIZE));
    }
    missing = await missingOfflineAssets(version);
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
  const version = typeof event.data.version === 'string' ? event.data.version : null;
  const task = ensureOfflineCache(version)
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
  const isSong = isSongPath(pathname);
  const isFrequentlyUpdated = pathname.endsWith('.json') || pathname.endsWith('.css') || pathname.endsWith('.js') || pathname.endsWith('.html') || pathname.endsWith('/');

  if (isSong) {
    event.respondWith(handleSongRequest(event));
  } else if (isFrequentlyUpdated) {
    const freshRequest = new Request(event.request, { cache: 'reload' });
    event.respondWith(
      fetch(freshRequest)
        .then(response => {
          const copy = response.clone();
          if (response.ok) caches.open(CACHE_NAME).then(cache => putSingle(cache, event.request, copy));
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

async function handleSongRequest(event) {
  const request = event.request;
  const cache = await caches.open(CACHE_NAME);
  // Copia salvata della stessa versione richiesta dall'app (?v=SONG_DATA_VERSION).
  const exact = await cache.match(request);

  const fromNetwork = fetchWithTimeout(new Request(request, { cache: 'no-cache' }), SONG_NETWORK_TIMEOUT_MS)
    .then(async response => {
      if (await isValidOfflineResponse(request.url, response)) {
        await putSingle(cache, request, response.clone());
      }
      return response;
    });

  if (exact) {
    // Apertura immediata; se si è online si ricontrolla in background, così
    // una correzione arriva alla successiva apertura anche senza cambio versione.
    if (self.navigator.onLine !== false) event.waitUntil(fromNetwork.catch(() => {}));
    return exact;
  }

  // Versione nuova o canto mai aperto: prima la rete, poi qualunque copia salvata.
  let networkResponse = null;
  try {
    networkResponse = await fromNetwork;
    if (networkResponse.ok) return networkResponse;
  } catch (error) {
    // offline o rete lenta: si usa la copia salvata
  }
  const fallback = await cache.match(request, { ignoreSearch: true });
  return fallback || networkResponse || Response.error();
}
