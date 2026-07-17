(function(){
  const button=document.getElementById('newSetlistButton');
  if(!button)return;

  button.addEventListener('click',async()=>{
    const firebaseApi=window.firebase;
    const user=firebaseApi?.auth?.().currentUser;
    const database=firebaseApi?.firestore?.();
    if(!user||!database){
      alert('Accedi con Google per creare più setlist.');
      return;
    }

    const existing=document.querySelectorAll('#cloudSetlistsList .setlist-library-card').length;
    const name=existing?`Nuova setlist ${existing+1}`:'Nuova setlist';
    const originalLabel=button.textContent;
    button.disabled=true;
    button.textContent='Creazione…';
    try{
      const ref=await database.collection('setlists').add({
        ownerUid:user.uid,
        ownerName:(String(user.displayName||'').trim().split(/\s+/)[0]||String(user.email||'').split('@')[0]||'utente'),
        name,
        songs:[],
        visibility:'link',
        createdAt:firebaseApi.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebaseApi.firestore.FieldValue.serverTimestamp()
      });
      const item={id:ref.id,name};
      window.__pendingCloudSetlist=item;
      window.dispatchEvent(new CustomEvent('cloud-setlist-created',{detail:item}));
      delete window.__pendingCloudSetlist;
    }catch(error){
      console.error('Creazione setlist non riuscita.',error);
      alert('Creazione della setlist non riuscita. Riprova tra poco.');
    }finally{
      button.disabled=false;
      button.textContent=originalLabel;
    }
  });
})();
