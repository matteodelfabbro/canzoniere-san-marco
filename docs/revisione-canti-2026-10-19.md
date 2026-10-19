# Revisione completa del Canzoniere — 19 ottobre 2026

**Canti controllati:** 210 su 210 (tutti i file in `public/songs/`)
**Canti modificati:** 133 (98 solo per il metadato della tonalità)
**Fonte:** il materiale già presente nel canzoniere. Il libretto `NUOVO CANZONIERE 1.pdf` copre i canti 1–160, già confrontati riga per riga nella revisione del 14 luglio. I 50 canti aggiunti dopo (#161–#211) non compaiono nel libretto: per questi il controllo è solo interno (coerenza tra strofe, ritornelli e accordi). Non sono stati aggiunti né ripresi testi da fonti esterne.

Metodo: controlli automatici su tutti i file (formato, accordi, ancoraggi, tonalità, indice, ricerca) e lettura completa di ogni canto riga per riga. Sono state applicate solo le correzioni evidenti. Varianti locali, scelte di maiuscole e punteggiatura discutibili e accordi alternativi plausibili sono elencati più sotto come dubbi.

Versioni aggiornate: `SONG_DATA_VERSION = '20261019-revisione-completa'` in `public/js/app.js`, e `?v=` di `app.js` in `public/index.html`. `CACHE_NAME` non è stato toccato. Resa controllata in locale a 375 px di larghezza.

---

## 1. Correzioni su tutto il canzoniere

| Intervento | Canti |
|---|---|
| Apostrofo tipografico `’` → `'`, come nel resto del canzoniere. La ricerca trova di nuovo, per esempio, «l'anima». | ascolta-il-mio-cuore, benedetto-tu-signore-ricci, con-te-camminero, dall-aurora-al-tramonto, dove-due-o-tre, il-tuo-amore-annuncero, manda-il-tuo-spirito, maria-tu-sei, non-cercate-tra-i-morti, pietro-vai, spirito-santo-dolce-presenza, vita-in-abbondanza |
| Accordi minori scritti `SIm`/`LAm`/`MIm`/`FA#m`/`MIm7` → `SI-`/`LA-`/`MI-`/`FA#-`/`MI-7` (stessa lunghezza, ancoraggi invariati) | agnello-di-dio, alleluia-buttazzo, cantiamo-te, come-un-prodigio, servire-e-regnare |
| Marcatore «RIT.»/«Rit.» dentro la riga di testo → tolto e sostituito dall'intestazione «Ripetere il ritornello», già usata in altri 12 canti (16 occorrenze) | alleluia-buttazzo (2), alleluia-cristo-e-risorto-veramente-capo-2-4 (2), alleluia-e-poi (1), gloria-a-te-parola-vivente (4), gloria-buttazzo (4), le-tue-mani (3) |
| Tonalità (`key`) lasciata al segnaposto «DO maggiore» → ricavata dagli accordi quando primo e ultimo accordo coincidono, oppure quando l'accordo più frequente è il primo o l'ultimo. Il campo non è mostrato nel sito. | 98 canti, elenco nell'appendice A |
| Indice `songs-index.json` riallineato ai file: `search` di 42 canti, `sub` di come-tu-mi-vuoi («Branca»; il capo facoltativo è già nel campo `capo`), titolo di maranatha-vieni-signor (anche in `songs-tags.json`) | — |

## 2. Correzioni per canto

| Canto | Correzione |
|---|---|
| alleluia-ed-oggi-ancora | Accordo malformato `SOL7-` → `SOL-7` (2 righe) |
| alleluia-la-nostra-festa | Le intestazioni consecutive «Ritornello» + «1 pennata» lasciavano vuota la sezione del ritornello (niente stile ritornello) → unite in «Ritornello - 1 pennata» |
| alza-i-tuoi-occhi-al-cielo | Strofa 3: gli accordi di «Sai che Gesù…», «i suoi prodigi…», «Senza timor…» erano slittati di una riga e «ti ama così come sei» non aveva accordi → ripresi dai versi identici della Strofa 2 |
| ascoltero-la-tua-parola-capo-2 | «la tua parola», «la parola dell'eterno» → «Parola», come nelle altre strofe |
| benedetto-tu-signore-ricci | Nelle righe con segmenti (`flowSegments`) il testo mostrato con gli accordi non aveva il punto finale presente nella riga di testo → aggiunto (8 righe) |
| chi | «Chi ad ognuno da un nido?» → «dà» (come «dà colore») |
| chiamati-per-nome | «Grano del signore Risorto» → «Signore» |
| cristo-e-risorto-veramente | «Fa che possa dire» → «Fa' che» |
| del-tuo-spirito-signore | «Signore, / È piena la terra» → «è piena», come nella ripresa |
| eccomi-salmo-39 | Sillabazioni errate «ve - ngo» → «ven - go», «mo - rte» → «mor - te» |
| ecco-il-pane | `key` FA minore → FA# minore (gli accordi sono in FA#-) |
| giovanni | «allelu - ja. / preparate una strada» → «Preparate» |
| gloria-buttazzo | «Gesù cristo» → «Gesù Cristo»; «tu figlio del Padre» → «Figlio» |
| gloria-giombini | «agnello di Dio» → «Agnello di Dio» |
| hallelujah-riadattamento-cattolico | «c'é» → «c'è»; «che da forza» → «dà»; «E' un'energia» → «È»; «vvuole» → «vuole» |
| ho-abbandonato | «il mio signor» → «Signor» |
| il-canto-del-mare | «mar Rosso» → «Mar Rosso» |
| jubilate-deo | Intestazione «Strofa 1» → «Canone», come negli altri canoni |
| la-preghiera-di-gesu-e-la-nostra | «fa che sia fedele» → «fa' che» |
| lode-a-te-o-cristo | «re di eterna gloria» → «Re»; «Il salvatore del mondo» → «Salvatore» |
| lui-verra-e-ti-salvera | Strofa 2: accordi slittati di una riga rispetto alla Strofa 1 → riallineati. Il verso «A chi ha il cuore ferito tu dirai: / “Confida in Dio,» è ora diviso in due righe come nella Strofa 1. **Le posizioni degli accordi sulle parole sono ricavate dalla Strofa 1: da controllare suonando.** Virgolette in stile LaTeX ` `` '' ` → “ ”. «lui verrà» a fine ritornello → «Lui» (2 volte) |
| mani | «fa che» → «fa' che» (5 volte) |
| maranatha-vieni-signor | Titolo «Maranathà, vieni signor» → «vieni Signor» (come nel testo); «fa di me» → «fa' di me» |
| noi-veniamo-a-te | «ti ci apri alla vita» → «tu ci apri» (come «tu ci chiami») |
| osanna-al-figlio-di-david | «al figlio di David» → «Figlio» |
| pace-sia-pace-a-voi | «un impronta» → «un'impronta» (ancoraggi riallineati) |
| padre-maestro-e-amico | «societa'» → «società» (2 volte) |
| popoli-tutti | Ritornello finale in SI: `MI7` → `MI7+`, trasposizione esatta del `RE7+` del ritornello in LA |
| se-tu-vedrai | «cespuglio fiorito alleluia» → «fiorito: alleluia», come in tutti gli altri versi |
| spirito-santo-dolce-presenza, con-te-camminero | Intestazione «Bridge» → «Ponte» |
| te-al-centro-del-mio-cuore | «ci sei solo tu.» → «Tu.», come nella Strofa 1 |
| venite-applaudiamo-al-signore | «ch' Egli» → «ch'Egli» |
| vita-in-abbondanza | Intestazione «Ritornello x2» (senza contenuto) → «Ripetere il ritornello (x2)» |
| vocazione | «Fa che ascoltando» → «Fa' che» |

I canti non citati in questa sezione non hanno correzioni a testo, accordi o struttura; 77 canti non sono stati modificati affatto.

---

## 3. Dubbi da far decidere a Matteo

### 3.1 Da decidere per primi (incidono su ciò che si suona)

- **Accordi che il sito aggancia alla parola sbagliata.** Nelle righe senza ancoraggi espliciti il sito sposta ogni accordo all'inizio della parola il cui inizio è più vicino. Se l'accordo cade sull'ultima sillaba di una parola lunga, finisce sulla parola successiva: in Abbracciami il LA di «Maranathà» appare su «Gesù». È successo **381 volte in 109 canti** (elenco completo con lo script `check2.py`, disponibile su richiesta). Correggerlo canto per canto vorrebbe dire spostare a mano centinaia di accordi. La soluzione proposta è nel codice: agganciare l'accordo alla parola che lo contiene, con lo scarto proporzionale già supportato dagli `anchors`. Non l'ho fatto perché è una modifica al sito, non ai canti.
- **popoli-tutti:** il «Ritornello finale» in LA si interrompe a metà. La seconda metà («Canto di gioia…») sta sotto «Modulazione in SI»: struttura da rivedere.
- **quelli-che-amano-te:** l'intestazione dice «+1 tono», ma gli accordi restano in RE.
- **alza-i-tuoi-occhi-al-cielo**, Strofa 3: «Al ciel salì ma vive in noi / con il suo soffio d'amor» occupa due righe (con SOL DO sulla seconda), mentre il verso corrispondente della Strofa 2 ne occupa una. Da verificare se la seconda riga va cantata in più.
- **agnello-di-dio (Come Fuoco Vivo):** la chiusa «SI SI» (maggiore) in un pezzo in RE: piccardia voluta o SI-?
- **alleluia-verbum-panis:** `LA/DO` compare più volte. DO naturale non appartiene a LA: probabilmente `LA/DO#`.
- **la-gioia** [7]: RE dove i passaggi paralleli hanno RE-.
- **tu-sei** [19]: FA, estraneo a LA maggiore, dove la riga parallela ha RE.
- **vieni-e-seguimi** [14]: c'è un LA in più all'inizio («LA LA SI- LA») rispetto alla Strofa 1.
- **vita-in-abbondanza** [24]: la riga chiude con «RE4 SI-», la parallela con «RE4 RE».
- **manda-il-tuo-spirito** [20]: il secondo ritornello ha accordi diversi dal primo (SOL/SI in più, RE4 al posto di RE).
- **musica-di-festa** [15]: SOL7+ dove la riga parallela ha SOL7.
- **il-tuo-amore-annuncero** [14]/[30]: le righe hanno solo «RE MI-», le parallele iniziano con SOL.
- **padre-maestro-e-amico**, Strofe 1 e 2: accordi diversi sulle stesse righe («RE MI- LA RE / MI- RE FA#-» contro «RE SOL LA RE / SOL LA FA#-»).
- **annunceremo-che-tu:** le tre strofe hanno numero di righe e chiusure diverse (DO RE contro RE DO).
- **hallelujah-riadattamento-cattolico** [8]: «DO RE SOL», le parallele «DO RE SOL RE».
- **benedetto-tu-signore-ricci** [42]: FA ripetuto («SOL FA FA SOL»).
- **Notazioni insolite**, da uniformare se Matteo vuole: `FA+7` (maranatha-soffio-di-dio, forse FA7+), `RE5#` e `SI4/7` (san-francesco), `SOL#°` (hai-detto-si), `SOLdim`/`SOL#+` (fammi-conoscere), `SI7/4` (fammi-conoscere), `RE7/4` (manda-il-tuo-spirito), `SOL#7/DO` (benedetto-signore-cerco-solo-te), `×2` al posto di `(x2)` (acclamate-al-signore-marolda, dall-aurora-al-tramonto).

### 3.2 Accordi mancanti o righe senza accordi

- **Sezioni ripetute con testo diverso ma senza accordi:** benedici-o-signore (2° ritornello, «vino»), devo-dire-che (2° ritornello), ho-abbandonato (Ritornello 2 e finale), il-disegno (ritornello finale), su-ali-d-aquila (ritornello finale e un verso della Strofa 4), vivere-la-vita (Ritornello 2), santo-zairese («I cieli e la terra», «Benedetto»), beati-i-misericordiosi (Ritornello «2 volte»), bisognerebbe (finale).
- **Singole righe senza accordi:** in-una-notte-come-tante (un verso per strofa), pane-di-vita (tre righe per strofa), tutta-la-vita-e-un-dono [40].
- **alleluia-ed-oggi-ancora:** una riga di accordi serve due righe di testo.
- **adeste-fideles:** la Strofa 2 riusa gli accordi allineati sulla sillabazione latina della Strofa 1, ma il testo non è sillabato.
- **Accordi che partono molto più a destra del testo:** pane-di-vita-nuova-capo-1 [21], quale-gioia-salmo-121 [1].

### 3.3 Struttura

- **Intestazioni con nomi da valutare:** «Intro» a metà canto (lui-verra-e-ti-salvera → «Modulazione»?, pane-di-vita → «Interludio»?, noi-veniamo-a-te in fondo → «Finale»?); «Gloria» sopra «Il Signore, Dio dell'universo» (santo-gen-verde); «Intro: intera strofa» (siamo-venuti-per); «Ritornello 2» che in realtà è il finale (e-l-incontro-della-vita).
- **Separatori:** sezioni spezzate da «---» senza intestazione (davanti-a-questo-amore, resto-con-te, ti-lodero-ti-adorero-ti-cantero); intestazioni seguite subito da «---» (alleluia-buttazzo «Finale», le-tue-meraviglie); «---» mancante prima di una sezione (chi, il-vascello-dell-amore, san-francesco).
- **giovane-donna:** «Ritornello» seguito subito da «Ritornello (ripetere)» con gli accordi duplicati.
- **tutto-e-possibile:** la Strofa 3 ha solo due versi. Sotto «Ripetere il ritornello (x2)» c'è una riga di accordi.
- **gloria-a-te-parola-vivente:** la Strofa 4 ripete identica la seconda riga della Strofa 3 («che in te spera»).
- **camminiamo-incontro-al-signore:** solo la Strofa 1 ha la coda «Non saremo delusi.».
- **dove-due-o-tre:** le strofe cambiano tonalità (RE, poi MI) senza segnalarlo. Lo stesso vale per **spirito-santo-dolce-presenza** (ritornello finale in SOL).
- **Indicazioni dentro le righe di testo:** «1 battuta» (benedizione-a-frate-leone, come-l-aurora-verrai), «(2 v.)» (del-tuo-spirito-signore), «(x 2)» (il-canto-del-mare), «(2 volte)» (la-canzone-dell-amicizia), «alla fine RE» in una riga di accordi (mani). In altri 30 canti «(x2)» nel testo è la convenzione corrente: per questo non li ho toccati.
- **giovanni** [5]: «deserto    :» ha i due punti staccati. Servono ad agganciare il FA# dopo «deserto», quindi li ho lasciati.

### 3.4 Testo (varianti possibili, non corrette)

- **il-vascello-dell-amore:** «un'avventura che / che si percorre»: «che» ripetuto (ripresa cantata o refuso?).
- **san-francesco** [61]: «perdonando che si trova il perdono». Nei versi paralleli c'è «È donando…», quindi forse manca «è».
- **stai-con-me** [36]: «che tu sei mio re» contro «sei il mio re» in [34].
- **chi-dara-da-bere-a-me** [26]: «Chiunque che vi beve».
- **testimoni-della-tua-parola-capo-2** [32]: «risuona già» o «risuonerà»?
- **mi-basta-la-tua-grazia:** «perché, tu sei…», con una virgola in tutte le strofe; in [32] manca «tu».
- **e-l-incontro-della-vita:** «dell'amore» contro «nell'amore».
- **bisognerebbe:** «quel che non accadrà» (finale) contro «quel che non può accadere» (ritornello).
- **io-mi-arrendo-capo-3:** «Sei una tempesta» contro «Sei tempesta».
- **pietro-vai:** «Pietro, vai,» contro «Pietro vai,».
- **re-dei-re-capo-1**, **luce-di-verita**, **il-canto-dei-3-giovani:** punti finali mancanti a fine verso.
- **eccomi-salmo-39** [31]: «Questo mio Dio, desidero» (ordine delle parole?).
- **acclamate-al-signore-frisina:** «inni di grazia» o «grazie»? Manca anche una virgola in «ci ha fatti siamo suoi».
- **venite-applaudiamo-al-signore:** «gli dei» o «gli dèi»?
- **musica-di-festa:** «Alleluja» contro «Alleluia»; «Sua» maiuscolo/minuscolo.
- **hallelujah-riadattamento-cattolico:** la virgola in «gli orizzonti e, / paura» e la Strofa 4 che non chiude con «hallelujah».
- **abbracciami** [44], **del-tuo-spirito-signore**, **la-canzone-dell-amicizia:** «spirito» minuscolo dove altrove è «Spirito».
- **Maiuscole incoerenti** (inizio verso dopo virgola, «tu/Tu» riferito a Dio, «chiesa/Chiesa», «madre/Madre», «Verbo», «Magi/Oriente», «Cielo»), da uniformare con una regola di casa: acclamate-al-signore-frisina, acqua-siamo-noi, alleluia-canto-per-cristo, alza-i-tuoi-occhi-al-cielo, astro-del-ciel, benedizione-a-frate-leone, bisognerebbe, cantiamo-te, chiamati-per-nome, come-maria, come-tu-mi-vuoi, con-voce-di-giubilo, dall-aurora-al-tramonto («Tue ali»), devo-dire-che, e-sono-solo-un-uomo-symbolum-79, ecco-il-nostro-si, ecco-il-pane, ecco-quel-che-abbiamo, giovane-donna, grandi-cose, in-una-notte-come-tante, io-mi-arrendo-capo-3, la-mia-anima-canta, la-preghiera-di-gesu-e-la-nostra, musica-di-festa, noi-veniamo-a-te, pane-vivo-sei, qui-con-te, questa-e-la-mia-fede, rallegriamoci, regno-nuovo, resurrezione, santa-maria-del-cammino, santo, santo-classico, scusa-signore, servo-per-amore, siamo-venuti-per, symbolum-77-tu-sei-la-mia-vita, testimoni-della-tua-parola-capo-2, ti-lodero-ti-adorero-ti-cantero, tu-sei, tu-sei-bambino-capo-2-3-4, tutto-e-possibile, venimus-adorare-eum-emmanuel-inno-gmg-2005, verbum-panis, gloria-a-te-parola-vivente («Cristo maestro»).
- **Titoli** dei canti aggiunti ad agosto scritti in minuscolo («Alza i tuoi occhi al cielo», «Hai detto sì»…), mentre i canti del libretto usano le iniziali maiuscole: uniformare?

### 3.5 Metadati

- **Tonalità diversa da quella suggerita dagli accordi**, valore impostato a mano e non toccato: pace-sia-pace-a-voi (MI; accordi che iniziano e finiscono in SI), annunceremo-che-tu (SOL; inizio e fine in RE), benedetto-signore-cerco-solo-te (MI; inizio LA7+, fine LA6/SI), manda-il-tuo-spirito (SOL; parte in FA e modula).
- **Tonalità rimaste «DO maggiore» e non determinabili con certezza** (prima/ultima/più frequente): acclamate-al-signore-frisina (DO/SOL/LA-), adoro-te (RE/RE-/LA), agnello-di-dio (RE/SI/LA, capo 3), alleluia-buttazzo (SOL/LA/RE), alleluia-e-poi (SOL/LA/RE), antica-eterna-danza, ascoltero-la-tua-parola-capo-2, benedetto-tu-signore-ricci, benedici-o-signore, camminiamo-incontro-al-signore, cantate-al-signore-ricci, come-un-prodigio, cristo-e-risorto-veramente, devo-dire-che, dove-due-o-tre, ecco-il-nostro-si, fammi-conoscere, gloria-a-te-parola-vivente, il-canto-dei-3-giovani, invochiamo-la-tua-presenza-capo-3, io-mi-arrendo-capo-3, la-preghiera-di-gesu-e-la-nostra, mani, maranatha-soffio-di-dio, pietro-vai, popoli-tutti, quale-gioia-e-star-con-te, qui-con-te, santo-gen-messa-come-fuoco-vivo, segni-nuovi, servo-per-amore, su-ali-d-aquila, ti-lodero-ti-adorero-ti-cantero, venimus-adorare-eum-emmanuel-inno-gmg-2005. Sono probabilmente in DO, e quindi corretti: agnello-di-dio-ricci-la-tua-dimora, ascolta-il-mio-cuore, come-fuoco-vivo, hai-detto-si, pane-del-cielo, stai-con-me, vivere-la-vita, vocazione.
- **Capo come lista** (alleluia-cristo-e-risorto-veramente [2, 4], come-tu-mi-vuoi [1, 2], tu-sei-bambino [2, 3, 4]): sembrano alternative volute.
- **dall-aurora-al-tramonto** [36]: la riga ha sia `flowSegments` sia `anchors`. Gli `anchors` non sono usati e mancano dell'ultimo MI: innocuo, ma si possono togliere.
- **revision-status.json** copre solo i canti 1–159: i canti #160–#211 non hanno uno stato di revisione.

---

## Appendice A — Tonalità impostate nei metadati (98 canti)

- abbracciami: DO maggiore → MI maggiore
- acqua-siamo-noi: DO maggiore → RE maggiore
- adesso-e-la-pienezza: DO maggiore → LA maggiore
- adeste-fideles: DO maggiore → LA maggiore
- agnello-di-dio-buttazzo-capo-3: DO maggiore → RE maggiore
- alleluia-canto-per-cristo: DO maggiore → RE maggiore
- alleluia-ed-oggi-ancora: DO maggiore → RE minore
- alleluia-passeranno-i-cieli: DO maggiore → RE maggiore
- alleluia-taize: DO maggiore → RE minore
- alleluia-verbum-panis: DO maggiore → SI minore
- andate-per-le-strade: DO maggiore → SI minore
- ave-maria: DO maggiore → RE maggiore
- beati-i-misericordiosi-inno-gmg-2016-capo-2: DO maggiore → RE maggiore
- benedizione-a-frate-leone: DO maggiore → LA maggiore
- bisognerebbe: DO maggiore → LA maggiore
- camminero-in-re: DO maggiore → RE maggiore
- cantate-al-signore-un-canto-nuovo-fallormi: DO maggiore → SOL maggiore
- cantiamo-te: DO maggiore → RE maggiore
- chi-ci-separera: DO maggiore → RE maggiore
- chi-dara-da-bere-a-me: DO maggiore → RE maggiore
- chi: DO maggiore → SOL maggiore
- chiamati-per-nome: DO maggiore → MI maggiore
- come-l-aurora-verrai: DO maggiore → RE minore
- come-maria: DO maggiore → LA minore
- con-voce-di-giubilo: DO maggiore → RE maggiore
- davanti-a-questo-amore: DO maggiore → LA maggiore
- del-tuo-spirito-signore: DO maggiore → RE maggiore
- dolce-sentire: DO maggiore → RE maggiore
- dove-troveremo-tutto-il-pane: DO maggiore → RE maggiore
- e-sono-solo-un-uomo-symbolum-79: DO maggiore → RE maggiore
- ecco-quel-che-abbiamo: DO maggiore → LA maggiore
- eccomi-salmo-39: DO maggiore → LA maggiore
- emmanuel: DO maggiore → SI maggiore
- frutto-della-nostra-terra: DO maggiore → SOL maggiore
- giovane-donna: DO maggiore → RE maggiore
- giovanni: DO maggiore → SI minore
- gloria-buttazzo: DO maggiore → SOL maggiore
- gloria-gen-verde: DO maggiore → MI maggiore
- grandi-cose: DO maggiore → SOL maggiore
- ho-abbandonato: DO maggiore → SOL maggiore
- il-canto-del-mare: DO maggiore → LA minore
- il-canto-dell-amore: DO maggiore → RE maggiore
- il-disegno: DO maggiore → LA minore
- il-giovane-ricco: DO maggiore → MI minore
- il-pane-che-ci-hai-dato: DO maggiore → RE maggiore
- il-signore-e-la-luce: DO maggiore → SOL maggiore
- il-vascello-dell-amore: DO maggiore → MI minore
- laudato-sii-signore-mio: DO maggiore → MI maggiore
- le-tue-mani: DO maggiore → RE maggiore
- le-tue-meraviglie: DO maggiore → LA minore
- lode-a-te-o-cristo: DO maggiore → MI minore
- lode-al-nome-tuo: DO maggiore → SOL maggiore
- luce-di-verita: DO maggiore → MI maggiore
- lui-m-ha-dato: DO maggiore → RE maggiore
- maria-porta-dell-avvento: DO maggiore → SOL maggiore
- mi-basta-la-tua-grazia: DO maggiore → SOL maggiore
- nel-tuo-silenzio: DO maggiore → RE maggiore
- non-avere-paura: DO maggiore → RE maggiore
- non-vivere-di-corsa: DO maggiore → RE maggiore
- ogni-mia-parola: DO maggiore → SOL maggiore
- osanna-al-figlio-di-david: DO maggiore → SOL maggiore
- padre-maestro-e-amico: DO maggiore → RE maggiore
- padre-nostro-s-andrea: DO maggiore → LA minore
- padre-nostro-s-marco: DO maggiore → MI maggiore
- pane-di-vita-nuova-capo-1: DO maggiore → RE maggiore
- pane-vivo-sei: DO maggiore → LA maggiore
- pim-pam: DO maggiore → RE maggiore
- potente-sei-mio-signor-volendo-capo-2: DO maggiore → RE maggiore
- quale-gioia-salmo-121: DO maggiore → LA maggiore
- re-dei-re-capo-1: DO maggiore → MI minore
- regno-nuovo: DO maggiore → SI maggiore
- resta-accanto-a-me: DO maggiore → RE maggiore
- resto-con-te: DO maggiore → SOL maggiore
- resurrezione: DO maggiore → RE maggiore
- salve-regina: DO maggiore → SOL maggiore
- san-francesco: DO maggiore → RE maggiore
- santo-classico: DO maggiore → SOL maggiore
- santo-gen-verde: DO maggiore → SOL maggiore
- santo-zairese: DO maggiore → MI maggiore
- santo: DO maggiore → MI maggiore
- se-tu-vedrai: DO maggiore → RE maggiore
- siamo-venuti-per: DO maggiore → SOL maggiore
- signore-pieta-buttazzo: DO maggiore → RE maggiore
- signore-pieta-versione-2: DO maggiore → LA maggiore
- sono-qui-a-lodarti: DO maggiore → RE maggiore
- spirito-di-dio: DO maggiore → RE maggiore
- symbolum-77-tu-sei-la-mia-vita: DO maggiore → MI minore
- symbolum-80-oltre-le-memorie: DO maggiore → MI minore
- te-al-centro-del-mio-cuore: DO maggiore → MI minore
- testimoni-della-tua-parola-capo-2: DO maggiore → SOL maggiore
- ti-ringrazio-mio-signore: DO maggiore → RE maggiore
- tu-sei-sorgente-viva: DO maggiore → RE maggiore
- tu-sei: DO maggiore → LA maggiore
- venite-applaudiamo-al-signore: DO maggiore → SOL maggiore
- verbum-panis: DO maggiore → MI minore
- vieni-e-seguimi: DO maggiore → LA maggiore
- vieni-santo-spirito-di-dio: DO maggiore → RE maggiore
- voi-siete-di-dio: DO maggiore → SOL maggiore
