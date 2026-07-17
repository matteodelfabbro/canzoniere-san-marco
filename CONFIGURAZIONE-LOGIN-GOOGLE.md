# Attivazione del login Google

Il codice del sito e le regole Firestore sono gia pronti. Per rendere effettivo il login:

1. Apri Firebase Console e seleziona il progetto `canzoniere-san-marco-6130a`.
2. Vai in **Authentication** e crea il servizio, se non esiste.
3. In **Sign-in method**, attiva il provider **Google** e salva.
4. In **Settings > Authorized domains**, aggiungi `canzoniere.matteodelfabbro.it` se vuoi usare anche il dominio personalizzato.
5. Pubblica il progetto con `firebase deploy --only hosting,firestore:rules`.

Il dominio Firebase predefinito e autorizzato automaticamente; il dominio personalizzato va aggiunto separatamente.
