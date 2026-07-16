# canzoniere-san-marco
Canzoniere digitale della Parrocchia San Marco di Udine
## Setlist unificate (versione reale)
- Senza login: più setlist salvate localmente sul dispositivo.
- Con login Google: setlist personali salvate in Firestore e sincronizzate.
- Al primo login per account/dispositivo viene proposta una sola importazione delle setlist locali.
- L'importazione usa ID deterministici per evitare duplicati anche se viene ripetuta.
- Pubblicare anche `firestore.rules` prima del test cloud.
