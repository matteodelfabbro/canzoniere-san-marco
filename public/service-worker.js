const CACHE_NAME = 'canzoniere-come-tu-mi-vuoi-16';
const APP_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./data/songs-index.json",
  "./data/songs-tags.json",
  "./data/search-suggestions.json",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./songs/abbracciami.json",
  "./songs/accogli-i-nostri-doni.json",
  "./songs/acqua-siamo-noi.json",
  "./songs/adesso-e-la-pienezza.json",
  "./songs/adeste-fideles.json",
  "./songs/adoro-te.json",
  "./songs/agnello-di-dio.json",
  "./songs/agnello-di-dio-versione-2-capo-3.json",
  "./songs/agnello-di-dio-buttazzo-capo-3.json",
  "./songs/alleluia-buttazzo.json",
  "./songs/alleluia-canto-per-cristo.json",
  "./songs/alleluia-ed-oggi-ancora.json",
  "./songs/alleluia-la-nostra-festa.json",
  "./songs/alleluia-passeranno-i-cieli.json",
  "./songs/alleluia-taize.json",
  "./songs/alleluia-cristo-e-risorto-veramente-capo-2-4.json",
  "./songs/alleluia-verbum-panis.json",
  "./songs/alleluia-e-poi.json",
  "./songs/andate-per-le-strade.json",
  "./songs/antica-eterna-danza.json",
  "./songs/ascoltero-la-tua-parola-capo-2.json",
  "./songs/ave-maria.json",
  "./songs/beati-i-misericordiosi-inno-gmg-2016-capo-2.json",
  "./songs/benedici-o-signore.json",
  "./songs/benedizione-a-frate-leone.json",
  "./songs/bisognerebbe.json",
  "./songs/camminero-in-re.json",
  "./songs/camminiamo-incontro-al-signore.json",
  "./songs/cantate-al-signore-ricci.json",
  "./songs/cantate-al-signore-un-canto-nuovo-fallormi.json",
  "./songs/cantiamo-te.json",
  "./songs/chi.json",
  "./songs/chi-ci-separera.json",
  "./songs/chi-dara-da-bere-a-me.json",
  "./songs/chiamati-per-nome.json",
  "./songs/come-fuoco-vivo.json",
  "./songs/come-l-aurora-verrai.json",
  "./songs/come-maria.json",
  "./songs/come-tu-mi-vuoi.json",
  "./songs/come-un-prodigio.json",
  "./songs/con-voce-di-giubilo.json",
  "./songs/cristo-e-risorto-veramente.json",
  "./songs/dall-aurora-al-tramonto.json",
  "./songs/davanti-a-questo-amore.json",
  "./songs/del-tuo-spirito-signore.json",
  "./songs/devo-dire-che.json",
  "./songs/dolce-sentire.json",
  "./songs/dove-troveremo-tutto-il-pane.json",
  "./songs/e-bello-lodarti.json",
  "./songs/e-sono-solo-un-uomo-symbolum-79.json",
  "./songs/ecco-il-nostro-si.json",
  "./songs/ecco-quel-che-abbiamo.json",
  "./songs/eccomi-salmo-39.json",
  "./songs/emmanuel.json",
  "./songs/fammi-conoscere.json",
  "./songs/frutto-della-nostra-terra.json",
  "./songs/giovane-donna.json",
  "./songs/giovanni.json",
  "./songs/signore-pieta-buttazzo.json",
  "./songs/signore-pieta-versione-2.json",
  "./songs/gloria-buttazzo.json",
  "./songs/gloria-gen-verde.json",
  "./songs/gloria-a-te-parola-vivente.json",
  "./songs/grandi-cose.json",
  "./songs/ho-abbandonato.json",
  "./songs/il-canto-dei-3-giovani.json",
  "./songs/il-canto-dell-amore.json",
  "./songs/il-canto-del-mare.json",
  "./songs/il-disegno.json",
  "./songs/il-giovane-ricco.json",
  "./songs/il-pane-che-ci-hai-dato.json",
  "./songs/il-signore-e-la-luce.json",
  "./songs/il-vascello-dell-amore.json",
  "./songs/in-una-notte-come-tante.json",
  "./songs/invochiamo-la-tua-presenza-capo-3.json",
  "./songs/io-mi-arrendo-capo-3.json",
  "./songs/jesus-christ-you-are-my-life.json",
  "./songs/la-canzone-dell-amicizia.json",
  "./songs/la-gioia.json",
  "./songs/la-mia-anima-canta.json",
  "./songs/la-preghiera-di-gesu-e-la-nostra.json",
  "./songs/laudato-sii-o-mi-signore.json",
  "./songs/laudato-sii-signore-mio.json",
  "./songs/le-tue-mani.json",
  "./songs/le-tue-meraviglie.json",
  "./songs/lode-a-te-o-cristo.json",
  "./songs/lode-al-nome-tuo.json",
  "./songs/luce-di-verita.json",
  "./songs/lui-m-ha-dato.json",
  "./songs/mani.json",
  "./songs/maranatha-soffio-di-dio.json",
  "./songs/maria-porta-dell-avvento.json",
  "./songs/mi-arrendo-al-tuo-amore.json",
  "./songs/mi-basta-la-tua-grazia.json",
  "./songs/nel-tuo-silenzio.json",
  "./songs/non-avere-paura.json",
  "./songs/non-vivere-di-corsa.json",
  "./songs/oggi-e-un-giorno-di-festa.json",
  "./songs/ogni-mia-parola.json",
  "./songs/osanna-al-figlio-di-david.json",
  "./songs/padre-nostro-s-andrea.json",
  "./songs/padre-nostro-s-marco.json",
  "./songs/pane-del-cielo.json",
  "./songs/pane-di-vita-nuova-capo-1.json",
  "./songs/pane-vivo-sei.json",
  "./songs/pellegrini-di-speranza-capo-3.json",
  "./songs/pietro-vai.json",
  "./songs/pim-pam.json",
  "./songs/popoli-tutti.json",
  "./songs/potente-sei-mio-signor-volendo-capo-2.json",
  "./songs/quale-gioia-salmo-121.json",
  "./songs/quale-gioia-e-star-con-te.json",
  "./songs/qui-con-te.json",
  "./songs/re-dei-re-capo-1.json",
  "./songs/regno-nuovo.json",
  "./songs/resta-accanto-a-me.json",
  "./songs/resta-qui-con-noi.json",
  "./songs/resto-con-te.json",
  "./songs/resurrezione.json",
  "./songs/salve-regina.json",
  "./songs/san-francesco.json",
  "./songs/santa-maria-del-cammino.json",
  "./songs/santo.json",
  "./songs/santo-classico.json",
  "./songs/santo-gen-verde.json",
  "./songs/santo-gen-messa-come-fuoco-vivo.json",
  "./songs/santo-zairese.json",
  "./songs/santo-e-il-signore-la-tua-dimora.json",
  "./songs/scusa-signore.json",
  "./songs/se-m-accogli.json",
  "./songs/se-tu-vedrai.json",
  "./songs/segni-nuovi.json",
  "./songs/segni-del-tuo-amore.json",
  "./songs/servire-e-regnare.json",
  "./songs/servo-per-amore.json",
  "./songs/siamo-venuti-per.json",
  "./songs/sono-qui-a-lodarti.json",
  "./songs/spirito-di-dio.json",
  "./songs/stai-con-me.json",
  "./songs/su-ali-d-aquila.json",
  "./songs/symbolum-77-tu-sei-la-mia-vita.json",
  "./songs/symbolum-80-oltre-le-memorie.json",
  "./songs/te-al-centro-del-mio-cuore.json",
  "./songs/testimoni-della-tua-parola-capo-2.json",
  "./songs/ti-lodero-ti-adorero-ti-cantero.json",
  "./songs/ti-ringrazio-mio-signore.json",
  "./songs/ti-seguiro.json",
  "./songs/tu-sei-sorgente-viva.json",
  "./songs/tu-sei.json",
  "./songs/tu-sei-bambino-capo-2-3-4.json",
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

self.addEventListener('install', event => {
  // Promise.allSettled: se anche un solo file manca o è stato rinominato,
  // l'installazione non fallisce più per intero — vengono semplicemente
  // messi in cache tutti gli altri, e quello mancante verrà comunque
  // recuperato dalla rete al primo utilizzo (gestione nel fetch handler).
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(APP_ASSETS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Non intercettare gli URL riservati di Firebase Hosting (/__/firebase/...).
  if (new URL(event.request.url).pathname.startsWith('/__')) return;

  // Rete-prima per tutto ciò che modifichiamo spesso durante lo sviluppo
  // (dati dei canti, stile, logica): chi è online vede sempre l'ultima
  // versione pubblicata. Cache-first resta solo per icone e manifest,
  // che di fatto non cambiano quasi mai.
  const url = event.request.url;
  const isFrequentlyUpdated = url.endsWith('.json') || url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.html') || url.endsWith('/');

  if (isFrequentlyUpdated) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache prima solo per icone e manifest: non cambiano quasi mai,
    // niente da guadagnare a ricontrollarli ad ogni apertura del sito.
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }))
    );
  }
});
