# Attivazione segnalazioni gratuite con Cloud Firestore

1. Apri Firebase Console > **Firestore Database** > **Crea database**.
2. Scegli una località europea e crea il database in modalità produzione.
3. Dal Terminale, nella cartella del progetto, esegui:

   ```bash
   firebase deploy --only firestore:rules,hosting
   ```

4. Le segnalazioni appariranno in **Firestore Database > Dati > segnalazioni**.

Il sito può soltanto creare nuove segnalazioni. I visitatori non possono leggerle, modificarle o cancellarle.
Non sono necessarie Cloud Functions, piano Blaze o carta di credito.
