# Stato e cronologia del progetto

## Situazione attuale

- Repository: `matteodelfabbro/canzoniere-san-marco`
- Progetto Firebase: `canzoniere-san-marco-6130a`
- Sito pubblico: <https://canzoniere.matteodelfabbro.it>
- Branch stabile: `main`
- Branch di prova: `refactor`

## Regola di pubblicazione

1. Preparare e controllare ogni novita su `refactor`.
2. Pubblicare la beta nel canale Firebase `refactor`.
3. Provare il sito da computer e telefono.
4. Unire il branch `refactor` in `main` soltanto dopo l'approvazione.

## Cosa conserva Git

Git mantiene gia la cronologia completa: ogni commit registra data, autore, file modificati e messaggio. I commit meno descrittivi dei primi giorni restano comunque utili come archivio; non vanno riscritti, per non creare problemi al repository gia condiviso e pubblicato.

Per consultare i cambiamenti importanti usare GitHub, sezione **Commits**, oppure:

```bash
git log --oneline --decorate
```

## Tappe principali

- Conversione del canzoniere in dati JSON, con un file per canto.
- Revisione progressiva di testo, accordi, sottotitoli e sezioni.
- Ricerca per testo e tag liturgici.
- Setlist locale per chi non accede e setlist personali con login Google.
- Sincronizzazione in Firestore di setlist e preferiti per utente.
- Pubblicazione Firebase con beta su `refactor` e versione stabile su `main`.

## Pulizia effettuata il 20 luglio 2026

- Verificati `main` e `refactor`: sono allineati e senza modifiche pendenti.
- Confermato che i file di sistema macOS e la cache Firebase sono ignorati da Git.
- Aggiunti un README centrale e un indice della documentazione.

## Interventi di modernizzazione e ottimizzazione del 5 settembre 2026

- Eseguito backup preventivo su branch GitHub `backup-pre-modernizzazione-20260905`.
- Scaricati localmente i font Manrope in `public/fonts/` e rimossa la dipendenza esterna da Google Fonts via `@import`, ottenendo una resa identica sia online che offline al 100%.
- Automatizzato il precache dei canti nel Service Worker tramite lettura dinamica di `data/songs-index.json`.
- Rimosso codice morto/orfano e non definito in coda ad `app.js` e la funzione `levenshtein` non utilizzata.
- Tutti i dettagli tecnici e la guida di rollback sono documentati in `docs/MODIFICHE-OTTIMIZZAZIONI-2026-09.md`.

