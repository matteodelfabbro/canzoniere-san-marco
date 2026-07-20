# Canzoniere San Marco

Canzoniere digitale della Parrocchia San Marco di Udine, pubblicato con Firebase Hosting.

Sito: <https://canzoniere.matteodelfabbro.it>

## Struttura essenziale

- `public/`: sito pubblicato, stili, JavaScript, icone e dati dei canti;
- `public/songs/`: un file JSON per ogni canto;
- `public/data/`: indici, tag e dati di supporto alla ricerca;
- `firestore.rules`: regole per preferiti e setlist sincronizzate;
- `docs/`: appunti di revisione e documentazione tecnica;
- `firebase.json`: configurazione di Firebase Hosting.

## Lavorare senza rischi

1. Le modifiche si preparano sul branch `refactor`.
2. La beta viene pubblicata con:

   ```bash
   firebase hosting:channel:deploy refactor --project canzoniere-san-marco-6130a
   ```

3. Quando la beta va bene, si unisce `refactor` in `main` su GitHub.
4. Il branch `main` e il dominio pubblico restano la versione stabile.

Non riscrivere la cronologia Git: i commit pubblicati sono la memoria del progetto.

## Funzioni principali

- consultazione e ricerca dei canti;
- accordi, trasposizione e struttura delle sezioni;
- preferiti sincronizzati per ogni utente Google;
- una setlist locale senza login, piu setlist sincronizzate con login.

## Documentazione

- [Indice della documentazione](docs/README.md)
- [Stato e cronologia del progetto](docs/STORICO-PROGETTO.md)
- [Pubblicazione Firebase](PUBBLICAZIONE-FIREBASE.md)
- [Configurazione login Google](CONFIGURAZIONE-LOGIN-GOOGLE.md)
- [Istruzioni per le segnalazioni](ISTRUZIONI-SEGNALAZIONI-FIREBASE.md)
