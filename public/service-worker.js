const CACHE_NAME = 'canzoniere-offline-verificato-10';
const APP_ASSETS = [
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
  "./songs/abbracciami.json",
  "./songs/acclamate-al-signore-frisina.json",
  "./songs/accogli-i-nostri-doni.json",
  "./songs/acqua-siamo-noi.json",
  "./songs/adesso-e-la-pienezza.json",
  "./songs/adeste-fideles.json",
  "./songs/adoramus-te-domine.json",
  "./songs/adoro-te.json",
  "./songs/agnello-di-dio-buttazzo-capo-3.json",
  "./songs/agnello-di-dio-ricci-la-tua-dimora.json",
  "./songs/agnello-di-dio.json",
  "./songs/alleluia-buttazzo.json",
  "./songs/alleluia-canto-per-cristo.json",
  "./songs/alleluia-cristo-e-risorto-veramente-capo-2-4.json",
  "./songs/alleluia-e-poi.json",
  "./songs/alleluia-ed-oggi-ancora.json",
  "./songs/alleluia-la-nostra-festa.json",
  "./songs/alleluia-passeranno-i-cieli.json",
  "./songs/alleluia-taize.json",
  "./songs/alleluia-verbum-panis.json",
  "./songs/alza-i-tuoi-occhi-al-cielo.json",
  "./songs/amo.json",
  "./songs/andate-per-le-strade.json",
  "./songs/annunceremo-che-tu.json",
  "./songs/antica-eterna-danza.json",
  "./songs/ascolta-il-mio-cuore.json",
  "./songs/ascoltero-la-tua-parola-capo-2.json",
  "./songs/astro-del-ciel.json",
  "./songs/ave-maria.json",
  "./songs/beati-i-misericordiosi-inno-gmg-2016-capo-2.json",
  "./songs/benedetto-signore-cerco-solo-te.json",
  "./songs/benedetto-tu-signore-ricci.json",
  "./songs/benedici-o-signore.json",
  "./songs/benedizione-a-frate-leone.json",
  "./songs/bisognerebbe.json",
  "./songs/bless-the-lord.json",
  "./songs/bonum-est-confidere.json",
  "./songs/camminero-in-re.json",
  "./songs/camminiamo-incontro-al-signore.json",
  "./songs/cantate-al-signore-ricci.json",
  "./songs/cantate-al-signore-un-canto-nuovo-fallormi.json",
  "./songs/cantiamo-te.json",
  "./songs/chi-ci-separera.json",
  "./songs/chi-dara-da-bere-a-me.json",
  "./songs/chi.json",
  "./songs/chiamati-per-nome.json",
  "./songs/cieli-nuovi-e-terra-nuova.json",
  "./songs/colori.json",
  "./songs/come-fuoco-vivo.json",
  "./songs/come-l-aurora-verrai.json",
  "./songs/come-maria.json",
  "./songs/come-tu-mi-vuoi.json",
  "./songs/come-un-prodigio.json",
  "./songs/con-te-camminero.json",
  "./songs/con-voce-di-giubilo.json",
  "./songs/cristo-e-risorto-veramente.json",
  "./songs/dall-aurora-al-tramonto.json",
  "./songs/davanti-a-questo-amore.json",
  "./songs/del-tuo-spirito-signore.json",
  "./songs/devo-dire-che.json",
  "./songs/dolce-sentire.json",
  "./songs/dona-la-pace-canone.json",
  "./songs/dove-due-o-tre.json",
  "./songs/dove-troveremo-tutto-il-pane.json",
  "./songs/e-bello-lodarti.json",
  "./songs/e-l-incontro-della-vita.json",
  "./songs/e-sono-solo-un-uomo-symbolum-79.json",
  "./songs/ecco-il-nostro-si.json",
  "./songs/ecco-il-pane.json",
  "./songs/ecco-quel-che-abbiamo.json",
  "./songs/eccomi-salmo-39.json",
  "./songs/emmanuel.json",
  "./songs/fammi-conoscere.json",
  "./songs/frutto-della-nostra-terra.json",
  "./songs/giovane-donna.json",
  "./songs/giovanni.json",
  "./songs/gloria-a-dio-ricci-la-tua-dimora.json",
  "./songs/gloria-a-te-parola-vivente.json",
  "./songs/gloria-buttazzo.json",
  "./songs/gloria-gen-verde.json",
  "./songs/gloria-giombini.json",
  "./songs/grandi-cose.json",
  "./songs/hai-detto-si.json",
  "./songs/ho-abbandonato.json",
  "./songs/il-canto-dei-3-giovani.json",
  "./songs/il-canto-del-mare.json",
  "./songs/il-canto-dell-amore.json",
  "./songs/il-disegno.json",
  "./songs/il-giovane-ricco.json",
  "./songs/il-pane-che-ci-hai-dato.json",
  "./songs/il-signore-e-la-luce.json",
  "./songs/il-signore-e-la-mia-forza.json",
  "./songs/il-tuo-amore-annuncero.json",
  "./songs/il-vascello-dell-amore.json",
  "./songs/in-eterno-cantero.json",
  "./songs/in-manus-tuas.json",
  "./songs/in-una-notte-come-tante.json",
  "./songs/invochiamo-la-tua-presenza-capo-3.json",
  "./songs/io-mi-arrendo-capo-3.json",
  "./songs/jesus-christ-you-are-my-life.json",
  "./songs/jubilate-deo.json",
  "./songs/la-canzone-dell-amicizia.json",
  "./songs/la-gioia.json",
  "./songs/la-mia-anima-canta.json",
  "./songs/la-preghiera-di-gesu-e-la-nostra.json",
  "./songs/la-tua-dimora-ricci.json",
  "./songs/laudato-sii-o-mi-signore.json",
  "./songs/laudato-sii-signore-mio.json",
  "./songs/le-tue-mani.json",
  "./songs/le-tue-meraviglie.json",
  "./songs/lode-a-te-o-cristo.json",
  "./songs/lode-al-nome-tuo.json",
  "./songs/luce-di-verita.json",
  "./songs/lui-m-ha-dato.json",
  "./songs/lui-verra-e-ti-salvera.json",
  "./songs/manda-il-tuo-spirito.json",
  "./songs/mani.json",
  "./songs/maranatha-soffio-di-dio.json",
  "./songs/maranatha-vieni-signor.json",
  "./songs/maria-porta-dell-avvento.json",
  "./songs/maria-tu-sei.json",
  "./songs/mi-arrendo-al-tuo-amore.json",
  "./songs/mi-basta-la-tua-grazia.json",
  "./songs/misericordias-domini.json",
  "./songs/musica-di-festa.json",
  "./songs/nada-te-turbe.json",
  "./songs/nel-tuo-silenzio.json",
  "./songs/noi-veniamo-a-te.json",
  "./songs/non-avere-paura.json",
  "./songs/non-cercate-tra-i-morti.json",
  "./songs/non-vivere-di-corsa.json",
  "./songs/oggi-e-un-giorno-di-festa.json",
  "./songs/ogni-mia-parola.json",
  "./songs/ora-e-tempo-di-gioia.json",
  "./songs/osanna-al-figlio-di-david.json",
  "./songs/pace-sia-pace-a-voi.json",
  "./songs/padre-maestro-e-amico.json",
  "./songs/padre-nostro-s-andrea.json",
  "./songs/padre-nostro-s-marco.json",
  "./songs/pane-del-cielo.json",
  "./songs/pane-di-vita-nuova-capo-1.json",
  "./songs/pane-di-vita.json",
  "./songs/pane-vivo-sei.json",
  "./songs/pellegrini-di-speranza-capo-3.json",
  "./songs/pietro-vai.json",
  "./songs/pim-pam.json",
  "./songs/popoli-tutti.json",
  "./songs/potente-sei-mio-signor-volendo-capo-2.json",
  "./songs/quale-gioia-e-star-con-te.json",
  "./songs/quale-gioia-salmo-121.json",
  "./songs/quelli-che-amano-te.json",
  "./songs/questa-e-la-mia-fede.json",
  "./songs/questa-notte.json",
  "./songs/qui-con-te.json",
  "./songs/rallegriamoci.json",
  "./songs/re-dei-re-capo-1.json",
  "./songs/regno-nuovo.json",
  "./songs/resta-accanto-a-me.json",
  "./songs/resta-qui-con-noi.json",
  "./songs/resto-con-te.json",
  "./songs/resurrezione.json",
  "./songs/salve-regina.json",
  "./songs/san-francesco.json",
  "./songs/santa-maria-del-cammino.json",
  "./songs/santo-classico.json",
  "./songs/santo-e-il-signore-la-tua-dimora.json",
  "./songs/santo-gen-messa-come-fuoco-vivo.json",
  "./songs/santo-gen-verde.json",
  "./songs/santo-zairese.json",
  "./songs/santo.json",
  "./songs/scusa-signore.json",
  "./songs/se-m-accogli.json",
  "./songs/se-tu-vedrai.json",
  "./songs/segni-del-tuo-amore.json",
  "./songs/segni-nuovi.json",
  "./songs/servire-e-regnare.json",
  "./songs/servo-per-amore.json",
  "./songs/siamo-venuti-per.json",
  "./songs/signore-pieta-buttazzo.json",
  "./songs/signore-pieta-ricci-la-tua-dimora.json",
  "./songs/signore-pieta-versione-2.json",
  "./songs/sono-qui-a-lodarti.json",
  "./songs/spirito-di-dio.json",
  "./songs/spirito-santo-dolce-presenza.json",
  "./songs/stai-con-me.json",
  "./songs/su-ali-d-aquila.json",
  "./songs/symbolum-77-tu-sei-la-mia-vita.json",
  "./songs/symbolum-80-oltre-le-memorie.json",
  "./songs/te-al-centro-del-mio-cuore.json",
  "./songs/testimoni-della-tua-parola-capo-2.json",
  "./songs/ti-lodero-ti-adorero-ti-cantero.json",
  "./songs/ti-lodiamo-e-ti-adoriamo.json",
  "./songs/ti-ringrazio-mio-signore.json",
  "./songs/ti-seguiro.json",
  "./songs/tu-sei-bambino-capo-2-3-4.json",
  "./songs/tu-sei-sorgente-viva.json",
  "./songs/tu-sei.json",
  "./songs/tutta-la-vita-e-un-dono.json",
  "./songs/tutto-e-possibile.json",
  "./songs/venimus-adorare-eum-emmanuel-inno-gmg-2005.json",
  "./songs/venite-applaudiamo-al-signore.json",
  "./songs/verbum-panis.json",
  "./songs/vieni-e-seguimi.json",
  "./songs/vieni-santo-spirito-di-dio.json",
  "./songs/vita-in-abbondanza.json",
  "./songs/vivere-la-vita.json",
  "./songs/vocazione.json",
  "./songs/voi-siete-di-dio.json"
];

const CORE_ASSETS = APP_ASSETS.filter(url => !url.startsWith('./songs/'));
const SONG_ASSETS = APP_ASSETS.filter(url => url.startsWith('./songs/'));
const PRECACHE_BATCH_SIZE = 8;

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

    // Prima l'app essenziale: pagina, stile, logica e indici di ricerca.
    await cacheAssetBatch(cache, CORE_ASSETS);

    // Poi i canti, pochi alla volta: evita centinaia di richieste simultanee
    // che su iPad possono lasciare una cache solo parzialmente popolata.
    for (let index = 0; index < SONG_ASSETS.length; index += PRECACHE_BATCH_SIZE) {
      await cacheAssetBatch(cache, SONG_ASSETS.slice(index, index + PRECACHE_BATCH_SIZE));
    }
  } catch (error) {
    // Una cache incompleta non deve mai diventare la versione offline attiva.
    await caches.delete(CACHE_NAME);
    throw error;
  }
}

async function missingOfflineAssets() {
  const cache = await caches.open(CACHE_NAME);
  const checks = await Promise.all(APP_ASSETS.map(async url => ({
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
    event.respondWith(
      fetch(event.request)
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
