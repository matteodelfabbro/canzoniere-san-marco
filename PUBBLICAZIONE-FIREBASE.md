# Pubblicazione corretta su Firebase Hosting

Il dominio personalizzato non carica automaticamente i file del sito: dopo averlo collegato, bisogna eseguire il deploy.

## Procedura

1. Apri Terminale e spostati nella cartella estratta del progetto.
2. Accedi a Firebase, se necessario:

   ```bash
   firebase login
   ```

3. Verifica il progetto selezionato:

   ```bash
   firebase use canzoniere-san-marco-6130a
   ```

4. Pubblica Hosting e regole Firestore:

   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

5. Al termine prova prima:

   https://canzoniere-san-marco-6130a.web.app

   e poi:

   https://canzoniere.matteodelfabbro.it

## Correzione applicata

Nel precedente `firebase.json` la cartella pubblicata era impostata su `.`. Il sito si trova invece nella cartella `public`, quindi Firebase non trovava `index.html` nella posizione prevista. Ora è configurato correttamente con:

```json
"public": "public"
```
