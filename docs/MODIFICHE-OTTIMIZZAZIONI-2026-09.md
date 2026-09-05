# Documentazione Modifiche e Ottimizzazioni (Settembre 2026)

Questo documento traccia in modo dettagliato tutti gli interventi tecnici realizzati sul progetto **Canzoniere San Marco**, per consentire a te, a ChatGPT o a qualsiasi altro assistente/sviluppatore di comprendere immediatamente le modifiche apportate, modificarle o eseguire un ripristino in caso di necessità.

---

## 1. Sicurezza e Stato dei Branch Git

Prima di modificare qualsiasi riga di codice è stato creato e inviato su GitHub un branch di backup immutabile:

- **Branch di backup**: `backup-pre-modernizzazione-20260905` (allineato all'ultimo commit stabile `c0fabfc`).
- **Branch di lavoro attuale**: `refactor` (tutte le nuove modifiche sono isolate qui).
- **Branch di produzione**: `main` (alimenta il sito pubblico <https://canzoniere.matteodelfabbro.it>, intatto).

### Procedura di Ripristino (Rollback)
Se per qualsiasi motivo si desidera tornare indietro allo stato precedente:
```bash
# Per visualizzare lo stato prima di queste modifiche:
git checkout backup-pre-modernizzazione-20260905

# Per ripristinare il branch refactor al backup iniziale:
git checkout refactor
git reset --hard backup-pre-modernizzazione-20260905
```

---

## 2. Dettaglio delle Modifiche per File

### A. `public/js/app.js`
1. **Rimozione codice morto orfano (ex righe 2313–2414)**:
   - In fondo al file, dopo `init().catch(...)`, erano presenti funzioni di bozza risalenti a luglio 2026 (`filterRelevantResults`, `tagScore`, `getThemeSuggestions`, `COMMON_SEARCH_WORDS`).
   - Queste funzioni invocavano identificatori non definiti (`normalizeSearchText` e `scoreSong`), non erano collegate a nessuna parte dell'interfaccia e avrebbero provocato errori a runtime (`ReferenceError`) in caso di invocazione.
2. **Rimozione `levenshtein` inutilizzata (ex riga 504)**:
   - La funzione calcolava la distanza di Levenshtein, ma il motore di ricerca dell'app utilizza token matching e prefissi (`songScore`). Non veniva mai invocata in tutto il file.

### B. `public/service-worker.js`
1. **Automazione Precache dei Canti**:
   - In precedenza, tutti i 208 file JSON dei canti erano hardcodati riga per riga nell'array `APP_ASSETS`.
   - È stata introdotta la funzione asincrona `getSongAssetsFromIndex(cache)`: durante l'installazione e la verifica della cache offline, il Service Worker legge dinamicamente `data/songs-index.json`.
   - **Vantaggio**: Quando in futuro viene aggiunto un nuovo canto a `public/songs/` e a `songs-index.json`, il Service Worker lo scaricherà e memorizzerà automaticamente nella cache offline, senza bisogno di modificare manualmente `service-worker.js`.
2. **Supporto Font Locali**:
   - Inclusi i percorsi `./fonts/manrope-latin.woff2` e `./fonts/manrope-latin-ext.woff2` in `CORE_ASSETS`.
3. **Versione Cache**:
   - Incrementato `CACHE_NAME` a `canzoniere-offline-verificato-18` per forzare l'aggiornamento pulito della cache sui dispositivi.

### C. `public/fonts/` (Nuova cartella)
- Scaricati i file WOFF2 del font **Manrope** (font variabile 200–800) per i subset `latin` (24 KB) e `latin-ext` (15 KB).

### D. `public/css/style.css`
1. **Rimozione `@import` esterno**:
   - Rimosso `@import url('https://fonts.googleapis.com/css2?family=Manrope...');` a riga 1.
   - Gli `@import` causano waterfall di rete all'avvio del caricamento.
2. **Aggiunta `@font-face` locali**:
   - Definite le regole `@font-face` che puntano a `/fonts/manrope-latin.woff2` e `/fonts/manrope-latin-ext.woff2` con `font-display: swap`.
   - Il sito è ora **100% autonomo e identico offline**, senza dipendere dai server di Google Fonts e senza salti di layout (*layout shift*).

### E. `public/index.html`
- Aggiornati i parametri di cache-busting:
  - Stile: `/css/style.css?v=20260905-local-fonts-1`
  - Script: `/js/app.js?v=20260905-clean-search-1`

---

## 3. Tabella Riassuntiva dei File Coinvolti

| File | Azione | Descrizione |
| :--- | :---: | :--- |
| `public/fonts/manrope-latin.woff2` | **Nuovo** | Font Manrope WOFF2 (subset latino) |
| `public/fonts/manrope-latin-ext.woff2` | **Nuovo** | Font Manrope WOFF2 (subset latino esteso) |
| `public/css/style.css` | **Modificato** | Sostituito `@import` con `@font-face` locale |
| `public/js/app.js` | **Modificato** | Rimosso codice morto e funzioni non definite |
| `public/service-worker.js` | **Modificato** | Precache dinamica da indice, font in cache, v18 |
| `public/index.html` | **Modificato** | Aggiornati parametri cache-buster |
| `docs/MODIFICHE-OTTIMIZZAZIONI-2026-09.md` | **Nuovo** | Questo documento tecnico |

---

## 4. Guida Operativa per ChatGPT o Sviluppatori Futuri

### Test su canale di anteprima (senza toccare la produzione)
Per pubblicare le modifiche del branch `refactor` sul canale di anteprima Firebase:
```bash
firebase hosting:channel:deploy refactor --project canzoniere-san-marco-6130a
```
L'URL generato sarà del tipo:
`https://canzoniere-san-marco-6130a--refactor-<hash>.web.app`

### Rilascio in produzione (dopo approvazione di Matteo)
Quando Matteo confermerà che la versione beta sul canale `refactor` funziona correttamente su computer, smartphone e tablet:
```bash
# 1. Spostarsi su main
git checkout main

# 2. Unire le modifiche da refactor
git merge refactor

# 3. Inviare su GitHub
git push origin main

# 4. Pubblicare in produzione su Firebase Hosting
firebase deploy --only hosting --project canzoniere-san-marco-6130a
```
