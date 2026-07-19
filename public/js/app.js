let songs = [];
let songsTags = {};
let searchSuggestionConfig = {};

const LEGACY_BOOK_NUMBERS=Object.freeze({
  'accogli-i-nostri-doni':1,
  'acqua-siamo-noi':2,
  'adesso-e-la-pienezza':3,
  'agnello-di-dio':6,
  'adoro-te':7,
  'alleluia-canto-per-cristo':8,
  'alleluia-ed-oggi-ancora':9,
  'alleluia-la-nostra-festa':13,
  'alleluia-passeranno-i-cieli':15,
  'alleluia-taize':20,
  'andate-per-le-strade':25,
  'alleluia-verbum-panis':26,
  'antica-eterna-danza':27,
  'ave-maria':28,
  'benedici-o-signore':29,
  'benedizione-a-frate-leone':33,
  'camminero-in-re':36,
  'bisognerebbe':37,
  'camminiamo-incontro-al-signore':43,
  'cantate-al-signore-ricci':44,
  'cantate-al-signore-un-canto-nuovo-fallormi':46,
  'cantiamo-te':51,
  'chi':53,
  'chi-ci-separera':54,
  'chi-dara-da-bere-a-me':55,
  'come-fuoco-vivo':57,
  'come-l-aurora-verrai':59,
  'come-maria':60,
  'davanti-a-questo-amore':64,
  'dall-aurora-al-tramonto':65,
  'del-tuo-spirito-signore':67,
  'con-voce-di-giubilo':68,
  'devo-dire-che':69,
  'dolce-sentire':71,
  'dove-troveremo-tutto-il-pane':72,
  'e-sono-solo-un-uomo-symbolum-79':73,
  'e-bello-lodarti':74,
  'ecco-il-nostro-si':76,
  'ho-abbandonato':80,
  'il-canto-dei-3-giovani':81,
  'il-canto-dell-amore':82,
  'il-disegno':84,
  'il-giovane-ricco':85,
  'il-pane-che-ci-hai-dato':86,
  'il-signore-e-la-luce':89,
  'il-vascello-dell-amore':92,
  'jesus-christ-you-are-my-life':102,
  'la-canzone-dell-amicizia':103,
  'la-gioia':104,
  'la-mia-anima-canta':106,
  'la-preghiera-di-gesu-e-la-nostra':108,
  'laudato-sii-o-mi-signore':109,
  'laudato-sii-signore-mio':110,
  'le-tue-meraviglie':113,
  'lode-a-te-o-cristo':118,
  'luce-di-verita':120,
  'lui-m-ha-dato':121,
  'mani':122,
  'maria-porta-dell-avvento':124,
  'nel-tuo-silenzio':131,
  'non-avere-paura':136,
  'non-vivere-di-corsa':137,
  'oggi-e-un-giorno-di-festa':140,
  'ogni-mia-parola':141,
  'padre-nostro-s-andrea':147,
  'pane-del-cielo':149,
  'pietro-vai':154,
  'popoli-tutti':156,
  'quale-gioia-salmo-121':161,
  'qui-con-te':165,
  'regno-nuovo':167,
  'resta-accanto-a-me':168,
  'resta-qui-con-noi':170,
  'resurrezione':171,
  'salve-regina':174,
  'san-francesco':176,
  'santa-maria-del-cammino':177,
  'santo-classico':178,
  'santo':179,
  'santo-gen-messa-come-fuoco-vivo':180,
  'santo-gen-verde':181,
  'santo-zairese':183,
  'se-tu-vedrai':185,
  'scusa-signore':186,
  'segni-nuovi':187,
  'se-m-accogli':188,
  'servo-per-amore':190,
  'spirito-di-dio':195,
  'symbolum-77-tu-sei-la-mia-vita':198,
  'symbolum-80-oltre-le-memorie':200,
  'te-al-centro-del-mio-cuore':204,
  'ti-ringrazio-mio-signore':208,
  'su-ali-d-aquila':212,
  'ti-seguiro':218,
  'tu-sei-sorgente-viva':220,
  'venimus-adorare-eum-emmanuel-inno-gmg-2005':221,
  'venite-applaudiamo-al-signore':224,
  'verbum-panis':228,
  'vieni-e-seguimi':229,
  'vivere-la-vita':230,
});

function legacyBookNumber(song){
  return song&&LEGACY_BOOK_NUMBERS[song.id]||null;
}


async function loadSongs() {
  const response = await fetch('./data/songs-index.json');
  if (!response.ok) throw new Error('Impossibile caricare l’indice dei canti.');
  const songIndex = await response.json();
  const songResults = await Promise.allSettled(
    songIndex.map(async item => {
      const songResponse = await fetch(`./${item.file}`);

      if (!songResponse.ok) {
        throw new Error(
          `${item.title}: file non disponibile (${songResponse.status})`
        );
      }

      try {
        return await songResponse.json();
      } catch (error) {
        throw new Error(`${item.title}: JSON non valido`, { cause: error });
      }
    })
  );

  songs = songResults
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);

  const failedSongs = songResults
    .map((result, index) => ({ result, item: songIndex[index] }))
    .filter(({ result }) => result.status === 'rejected');

  failedSongs.forEach(({ result, item }) => {
    console.error(
      `Canto saltato: ${item.title} (${item.file})`,
      result.reason
    );
  });

  if (!songs.length) {
    throw new Error('Nessun canto è stato caricato correttamente.');
  }

  if (failedSongs.length) {
    console.warn(
      `${failedSongs.length} canto/i non caricati. Gli altri restano disponibili.`
    );
  }

  try{
    const [tagsResponse,suggestionsResponse]=await Promise.all([
      fetch('./data/songs-tags.json'),
      fetch('./data/search-suggestions.json')
    ]);
    if(tagsResponse.ok)songsTags=await tagsResponse.json();
    if(suggestionsResponse.ok)searchSuggestionConfig=await suggestionsResponse.json();
  }catch(error){
    console.warn('Suggerimenti tematici non disponibili.',error);
    songsTags={};
    searchSuggestionConfig={};
  }
}

async function init() {
  await loadSongs();
const tileList=document.getElementById('tileList');
const tileListHome=document.getElementById('tileListHome');
const main=document.getElementById('main');
const search=document.getElementById('search');
const searchClear=document.getElementById('searchClear');
const tagSuggestions=document.getElementById('tagSuggestions');
const filterAll=document.getElementById('filterAll');
const filterFavorites=document.getElementById('filterFavorites');
const filterSetlist=document.getElementById('filterSetlist');
const sectionCurrent=document.getElementById('sectionCurrent');
const sectionMenuToggle=document.getElementById('sectionMenuToggle');
const sectionMenu=document.getElementById('sectionMenu');
const sectionSwitcher=document.getElementById('sectionSwitcher');
const menuInstall=document.getElementById('menuInstall');
const menuFeedback=document.getElementById('menuFeedback');
const menuLogin=document.getElementById('menuLogin');
const menuLogout=document.getElementById('menuLogout');
const menuGreeting=document.getElementById('menuGreeting');
const setlistLibrary=document.getElementById('setlistLibrary');
const setlistLibraryTitle=document.getElementById('setlistLibraryTitle');
const cloudSetlistsList=document.getElementById('cloudSetlistsList');
const cloudSetlistsStatus=document.getElementById('cloudSetlistsStatus');
const newSetlistButton=document.getElementById('newSetlistButton');
const saveCurrentCloudSetlist=document.getElementById('saveCurrentCloudSetlist');
const setlistTools=document.getElementById('setlistTools');
const setlistTitle=document.getElementById('setlistTitle');
const setlistCount=document.getElementById('setlistCount');
const shareSetlist=document.getElementById('shareSetlist');
const renameSetlist=document.getElementById('renameSetlist');
const clearSetlist=document.getElementById('clearSetlist');
const feedbackModal=document.getElementById('feedbackModal');
const feedbackForm=document.getElementById('feedbackForm');
const feedbackClose=document.getElementById('feedbackClose');
const feedbackIntro=document.getElementById('feedbackIntro');
const feedbackSong=document.getElementById('feedbackSong');
const feedbackSongId=document.getElementById('feedbackSongId');
const feedbackPage=document.getElementById('feedbackPage');
const feedbackDevice=document.getElementById('feedbackDevice');
const feedbackStatus=document.getElementById('feedbackStatus');
const generalFeedback=document.getElementById('generalFeedback');
const installBanner=document.getElementById('installBanner');
const installBannerAction=document.getElementById('installBannerAction');
const installBannerClose=document.getElementById('installBannerClose');
const installBannerIos=document.getElementById('installBannerIos');
let deferredInstallPrompt=null;
let activeIndex=0;
let listMode='all';
let currentUser=null;
let auth=null;
let googleProvider=null;
let db=null;
let activeCloudSetlistId=null;
let activeLocalSetlistId=localStorage.getItem('activeLocalSetlistId')||null;
let cloudSyncTimer=null;
let favoriteCloudUnsubscribe=null;
let screenWakeLock=null;
let screenWakeLockRequestPending=false;
let lecternMode=false;
let lecternControlsTimer=null;
let newSetlistBusy=false;
const LOCAL_SETLIST_DEMO=false;
const LOCAL_SETLISTS_KEY='localSetlistsV1';
const LOCAL_SETLISTS_BACKUP_KEY='localSetlistsBeforeSingleSetlistV1';
const GUEST_FAVORITES_KEY='favoriteSongs';

function firstNameFromUser(user){
  const fullName=String(user?.displayName||'').trim();
  if(fullName)return fullName.split(/\s+/)[0];
  const emailName=String(user?.email||'').split('@')[0].trim();
  return emailName||'utente';
}

async function renderAuthMenu(user){
  if(favoriteCloudUnsubscribe){
    favoriteCloudUnsubscribe();
    favoriteCloudUnsubscribe=null;
  }
  currentUser=user||null;
  const loggedIn=Boolean(currentUser);
  menuGreeting.hidden=!loggedIn;
  menuLogout.hidden=!loggedIn;
  menuLogin.hidden=loggedIn;
  if(loggedIn){
    const firstName=firstNameFromUser(currentUser);
    menuGreeting.textContent=`Ciao ${firstName}!`;
    activeCloudSetlistId=localStorage.getItem(`activeCloudSetlistId:${currentUser.uid}`)||null;
    await loadCloudFavorites();
    await maybeMigrateLocalSetlists();
  }else{
    activeCloudSetlistId=null;
    favorites=new Set(readStoredFavorites(GUEST_FAVORITES_KEY));
    ensureActiveLocalSetlist();
  }
  if(listMode==='setlist')updateSetlistSectionTitle();
  updateSetlistLibraryVisibility();
  setlistTools.hidden=true;
}

function initFirebaseAuth(){
  if(!window.firebase?.auth){
    console.warn('Firebase Authentication non disponibile in questo ambiente.');
    renderAuthMenu(null);
    return;
  }
  auth=firebase.auth();
  if(window.firebase?.firestore)db=firebase.firestore();
  googleProvider=new firebase.auth.GoogleAuthProvider();
  auth.languageCode='it';
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(error=>{
    console.warn('Persistenza login non impostata.',error);
  });
  auth.onAuthStateChanged(user=>{renderAuthMenu(user).catch(error=>console.error('Aggiornamento account non riuscito.',error));});
  auth.getRedirectResult().catch(error=>{
    console.error('Errore nel rientro dal login Google.',error);
    if(error?.code!=='auth/no-auth-event')alert('Non è stato possibile completare l’accesso con Google.');
  });
}

async function loginWithGoogle(){
  if(!auth||!googleProvider){
    alert('Il login Google è disponibile nella versione pubblicata su Firebase Hosting.');
    return;
  }
  try{
    await auth.signInWithPopup(googleProvider);
  }catch(error){
    if(error?.code==='auth/popup-blocked'){
      await auth.signInWithRedirect(googleProvider);
      return;
    }
    if(error?.code==='auth/popup-closed-by-user'||error?.code==='auth/cancelled-popup-request')return;
    console.error('Errore durante il login Google.',error);
    alert('Non è stato possibile accedere con Google. Riprova.');
  }
}

async function logoutFromGoogle(){
  if(!auth)return;
  try{
    await auth.signOut();
  }catch(error){
    console.error('Errore durante la disconnessione.',error);
    alert('Non è stato possibile uscire dall’account. Riprova.');
  }
}

function migrateStoredSongRefs(raw){
  const refs=Array.isArray(raw)?raw:[];
  const ids=[];
  refs.forEach(ref=>{
    if(typeof ref==='string' && songs.some(song=>song.id===ref)){
      ids.push(ref);
    }else if(Number.isInteger(ref) && songs[ref]){
      ids.push(songs[ref].id);
    }
  });
  return [...new Set(ids)];
}
function readStoredFavorites(key){
  try{return migrateStoredSongRefs(JSON.parse(localStorage.getItem(key)||'[]'));}
  catch(error){return [];}
}
function currentFavoritesStorageKey(){
  return currentUser?`favoriteSongs:${currentUser.uid}`:GUEST_FAVORITES_KEY;
}
let favorites=new Set(readStoredFavorites(GUEST_FAVORITES_KEY));
function makeLocalSetlistId(){return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;}
function readLocalSetlists(){
  try{
    const parsed=JSON.parse(localStorage.getItem(LOCAL_SETLISTS_KEY)||'[]');
    if(Array.isArray(parsed)&&parsed.length){
      if(parsed.length>1&&!localStorage.getItem(LOCAL_SETLISTS_BACKUP_KEY)){
        localStorage.setItem(LOCAL_SETLISTS_BACKUP_KEY,JSON.stringify(parsed));
      }
      const activeId=localStorage.getItem('activeLocalSetlistId');
      const item=parsed.find(entry=>entry.id===activeId)||parsed[0];
      return [{
        id:String(item.id||makeLocalSetlistId()),
        name:String(item.name||'La mia Setlist').slice(0,40),
        songs:migrateStoredSongRefs(item.songs||[]),
        updatedAt:Number(item.updatedAt)||Date.now()
      }];
    }
  }catch(error){console.warn('Setlist locali non leggibili.',error);}
  const legacySongs=migrateStoredSongRefs(JSON.parse(localStorage.getItem('personalSetlist')||'[]'));
  const legacyName=(localStorage.getItem('personalSetlistName')||'La mia Setlist').replace('La mia scaletta','La mia Setlist');
  return [{id:makeLocalSetlistId(),name:legacyName.slice(0,40),songs:legacySongs,updatedAt:Date.now()}];
}
let localSetlists=readLocalSetlists();
function writeLocalSetlists(){localStorage.setItem(LOCAL_SETLISTS_KEY,JSON.stringify(localSetlists));}
function ensureActiveLocalSetlist(){
  if(!localSetlists.length)localSetlists=[{id:makeLocalSetlistId(),name:'La mia Setlist',songs:[],updatedAt:Date.now()}];
  let active=localSetlists.find(item=>item.id===activeLocalSetlistId)||localSetlists[0];
  activeLocalSetlistId=active.id;
  localStorage.setItem('activeLocalSetlistId',activeLocalSetlistId);
  personalSetlist=active.songs.slice();
  personalSetlistName=active.name;
  writeLocalSetlists();
}
let personalSetlist=[];
let personalSetlistName='La mia Setlist';
ensureActiveLocalSetlist();
localStorage.setItem(GUEST_FAVORITES_KEY,JSON.stringify([...favorites]));
localStorage.setItem('personalSetlist',JSON.stringify(personalSetlist));
localStorage.setItem('personalSetlistName',personalSetlistName);
renderAuthMenu(null).catch(console.error);
initFirebaseAuth();

function showCreatedCloudSetlist(item){
  if(!item?.id)return;
  activeCloudSetlistId=item.id;
  if(currentUser)localStorage.setItem(`activeCloudSetlistId:${currentUser.uid}`,item.id);
  personalSetlistName=(item.name||'Nuova setlist').slice(0,40);
  personalSetlist=[];
  localStorage.setItem('personalSetlistName',personalSetlistName);
  localStorage.setItem('personalSetlist','[]');
  renderCloudSetlistRow({id:item.id,name:personalSetlistName,songs:[],local:false});
  openCloudSetlist({id:item.id,name:personalSetlistName,songs:[],local:false},{rerender:false});
}
window.addEventListener('cloud-setlist-created',event=>showCreatedCloudSetlist(event.detail));
if(window.__pendingCloudSetlist){
  showCreatedCloudSetlist(window.__pendingCloudSetlist);
  delete window.__pendingCloudSetlist;
}
let listScrollY=0;
const shiftState={};
const ipadPortraitView=window.matchMedia('(orientation:portrait) and (min-width:700px) and (max-width:1100px)');
const savedSongFontSize=Number(localStorage.getItem('songFontSize'))||0;
const upgradeIpadFont=ipadPortraitView.matches
  && savedSongFontSize===16
  && localStorage.getItem('ipadPortraitFontV1')!=='done';
let songFontSize=Math.min(24,Math.max(12,upgradeIpadFont?18:(savedSongFontSize||(ipadPortraitView.matches?18:16))));
if(upgradeIpadFont){
  localStorage.setItem('songFontSize',String(songFontSize));
  localStorage.setItem('ipadPortraitFontV1','done');
}
let lyricsOnly=localStorage.getItem('lyricsOnlyMode')==='true';
function pad(n){return String(n+1).padStart(2,'0')}
function normalizeSearch(value){
  return String(value||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}
function levenshtein(a,b){
  const row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let prev=row[0]; row[0]=i;
    for(let j=1;j<=b.length;j++){
      const old=row[j];
      row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=old;
    }
  }
  return row[b.length];
}
function textTokens(value){
  return normalizeSearch(value).split(/\s+/).filter(Boolean);
}

function tokenMatches(queryToken,targetToken){
  if(!queryToken||!targetToken)return false;
  if(targetToken.startsWith(queryToken))return true;
  return queryToken.length>=4 && targetToken.includes(queryToken);
}

function allQueryTokensMatch(query,text){
  const queryTokens=textTokens(query);
  if(!queryTokens.length)return true;
  const targetTokens=textTokens(text);
  return queryTokens.every(queryToken=>
    targetTokens.some(targetToken=>tokenMatches(queryToken,targetToken))
  );
}

function songScore(song,query){
  const q=normalizeSearch(query);
  if(!q)return 0;

  const title=normalizeSearch(song.title||'');
  const subtitle=normalizeSearch(song.sub||'');
  const titleTokens=textTokens(title);
  const subtitleTokens=textTokens(subtitle);
  const queryTokens=textTokens(q);
  let score=0;

  if(title===q)score+=20000;
  if(title.startsWith(q))score+=12000;
  if(title.includes(q))score+=7000;
  if(subtitle.startsWith(q))score+=3500;
  if(subtitle.includes(q))score+=2200;

  queryTokens.forEach(token=>{
    if(titleTokens.includes(token))score+=2500;
    else if(titleTokens.some(word=>word.startsWith(token)))score+=1800;
    else if(token.length>=4&&titleTokens.some(word=>word.includes(token)))score+=900;

    if(subtitleTokens.includes(token))score+=700;
    else if(subtitleTokens.some(word=>word.startsWith(token)))score+=450;
    else if(token.length>=4&&subtitleTokens.some(word=>word.includes(token)))score+=200;
  });

  if(allQueryTokensMatch(q,title))score+=3000;
  else if(allQueryTokensMatch(q,[title,subtitle].filter(Boolean).join(' ')))score+=1200;

  return score;
}

function songMatches(song,query){
  const q=normalizeSearch(query);
  if(!q)return true;
  return allQueryTokensMatch(q,[song.title,song.sub].filter(Boolean).join(' '));
}

function songTitleMatches(song,query){
  return songMatches(song,query);
}
function saveFavoritesLocally(){
  localStorage.setItem(currentFavoritesStorageKey(),JSON.stringify([...favorites]));
}
function favoriteIds(){return [...favorites].slice(0,500);}
async function syncCloudFavorite(id,enabled){
  if(!currentUser||!db)return;
  try{
    const operation=enabled
      ?firebase.firestore.FieldValue.arrayUnion(id)
      :firebase.firestore.FieldValue.arrayRemove(id);
    await db.collection('userPreferences').doc(currentUser.uid).set({
      favoriteSongIds:operation,
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
  }catch(error){
    console.warn('Sincronizzazione preferito non riuscita.',error);
  }
}
function startCloudFavoritesListener(userId){
  if(!db||!userId)return;
  favoriteCloudUnsubscribe=db.collection('userPreferences').doc(userId).onSnapshot(snapshot=>{
    if(currentUser?.uid!==userId||!snapshot.exists)return;
    favorites=new Set(migrateStoredSongRefs(snapshot.data()?.favoriteSongIds||[]));
    saveFavoritesLocally();
    renderTiles();
    if(document.body.classList.contains('song-open'))renderSong(activeIndex);
  },error=>{
    console.warn('Aggiornamento preferiti in tempo reale non riuscito.',error);
  });
}
async function loadCloudFavorites(){
  if(!currentUser||!db)return;
  const userId=currentUser.uid;
  const guestIds=readStoredFavorites(GUEST_FAVORITES_KEY);
  const cachedIds=readStoredFavorites(`favoriteSongs:${currentUser.uid}`);
  const migrationIds=guestIds;
  try{
    const ref=db.collection('userPreferences').doc(userId);
    const snapshot=await ref.get();
    const cloudIds=snapshot.exists?migrateStoredSongRefs(snapshot.data()?.favoriteSongIds||[]):[];
    const guestIdsToMerge=migrationIds
      .filter(id=>!cloudIds.includes(id))
      .slice(0,Math.max(0,500-cloudIds.length));
    const initialIds=snapshot.exists
      ?[...cloudIds,...guestIdsToMerge]
      :[...new Set([...cachedIds,...migrationIds])].slice(0,500);
    favorites=new Set(initialIds);
    saveFavoritesLocally();
    if(!snapshot.exists){
      await ref.set({
        favoriteSongIds:favoriteIds().length
          ?firebase.firestore.FieldValue.arrayUnion(...favoriteIds())
          :[],
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }else if(guestIdsToMerge.length){
      await ref.set({
        favoriteSongIds:firebase.firestore.FieldValue.arrayUnion(...guestIdsToMerge),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }
    localStorage.setItem(GUEST_FAVORITES_KEY,'[]');
    startCloudFavoritesListener(userId);
    renderTiles();
    if(document.body.classList.contains('song-open'))renderSong(activeIndex);
  }catch(error){
    console.warn('Caricamento preferiti online non riuscito.',error);
  }
}
function songId(index){
  return songs[index]?.id;
}
function isFavorite(index){
  return favorites.has(songId(index));
}
function toggleFavorite(index){
  const id=songId(index);
  if(!id)return;
  const enabled=!favorites.has(id);
  if(enabled&&favorites.size>=500){
    alert('Hai raggiunto il limite massimo di 500 preferiti.');
    return;
  }
  if(enabled)favorites.add(id);
  else favorites.delete(id);
  saveFavoritesLocally();
  void syncCloudFavorite(id,enabled);
  renderTiles();
  if(document.body.classList.contains('song-open')&&activeIndex===index)renderSong(index);
}
function closeSectionMenu(){
  sectionMenu.hidden=true;
  sectionMenuToggle.setAttribute('aria-expanded','false');
}
function toggleSectionMenu(){
  const willOpen=sectionMenu.hidden;
  sectionMenu.hidden=!willOpen;
  sectionMenuToggle.setAttribute('aria-expanded',String(willOpen));
  if(willOpen){
    const activeItem=sectionMenu.querySelector('.section-menu-item.active');
    if(activeItem)activeItem.focus();
  }
}
function updateSetlistSectionTitle(){
  const loggedName=currentUser?firstNameFromUser(currentUser):(LOCAL_SETLIST_DEMO?'Matteo':'');
  const label=loggedName?`SETLIST DI ${loggedName.toUpperCase()}`:'SETLIST';
  sectionCurrent.innerHTML=`${label} <svg class="section-menu-setlist-icon setlist-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 6h10M4 12h7M4 18h8"></path>
    <path d="M18 8v6M15 11h6"></path>
  </svg>`;
}
function setListMode(mode){
  listMode=mode;
  filterAll.classList.toggle('active',mode==='all');
  filterFavorites.classList.toggle('active',mode==='favorites');
  filterSetlist.classList.toggle('active',mode==='setlist');
  if(mode==='favorites')sectionCurrent.innerHTML='PREFERITI ★';
  else if(mode==='setlist')updateSetlistSectionTitle();
  else sectionCurrent.innerHTML='TUTTI I CANTI';
  const isSetlistMode=mode==='setlist';
  if(!isSetlistMode)placeTileListInDefaultPosition();
  search.hidden=isSetlistMode;
  tagSuggestions.hidden=isSetlistMode;
  setlistTools.hidden=true;
  updateSetlistLibraryVisibility();
  closeSectionMenu();
  renderTiles();
}
function placeTileListInDefaultPosition(){
  if(tileListHome)tileListHome.after(tileList);
  tileList.classList.remove('setlist-song-list');
}
function placeTileListUnderSetlist(card){
  card.after(tileList);
  tileList.classList.add('setlist-song-list');
}
function saveSetlist(){
  localStorage.setItem('personalSetlist',JSON.stringify(personalSetlist));
  localStorage.setItem('personalSetlistName',personalSetlistName);
  if(currentUser){
    scheduleCloudSetlistSync();
  }else{
    const index=localSetlists.findIndex(item=>item.id===activeLocalSetlistId);
    const record={id:activeLocalSetlistId||makeLocalSetlistId(),name:personalSetlistName.slice(0,40),songs:personalSetlist.slice(0,250),updatedAt:Date.now()};
    if(index>=0)localSetlists[index]=record;else localSetlists.unshift(record);
    activeLocalSetlistId=record.id;
    localStorage.setItem('activeLocalSetlistId',record.id);
    writeLocalSetlists();
    if(listMode==='setlist')loadCloudSetlists();
  }
}
function updateSetlistHeader(){
  setlistTitle.textContent=personalSetlistName;
  setlistCount.textContent=personalSetlist.length===1?'1 canto':`${personalSetlist.length} canti`;
}
function cloudSetlistPayload(){
  return {
    ownerUid:currentUser.uid,
    ownerName:firstNameFromUser(currentUser),
    name:personalSetlistName.slice(0,40),
    songs:personalSetlist.slice(0,250),
    visibility:'link',
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  };
}
function scheduleCloudSetlistSync(){
  if(!activeCloudSetlistId||!currentUser||!db)return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer=setTimeout(async()=>{
    try{
      await db.collection('setlists').doc(activeCloudSetlistId).update(cloudSetlistPayload());
    }catch(error){
      console.warn('Sincronizzazione setlist non riuscita.',error);
    }
  },500);
}
async function saveCurrentSetlistToCloud({forceNew=false}={}){
  if(!currentUser||!db){
    alert('Accedi con Google per salvare le setlist online.');
    return null;
  }
  if(!personalSetlist.length){
    alert('La Setlist è vuota.');
    return null;
  }
  try{
    let ref;
    if(activeCloudSetlistId && !forceNew){
      ref=db.collection('setlists').doc(activeCloudSetlistId);
      await ref.set(cloudSetlistPayload(),{merge:true});
    }else{
      ref=await db.collection('setlists').add({
        ...cloudSetlistPayload(),
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      activeCloudSetlistId=ref.id;
      localStorage.setItem(`activeCloudSetlistId:${currentUser.uid}`,activeCloudSetlistId);
    }
    return ref.id;
  }catch(error){
    console.error('Salvataggio setlist online non riuscito.',error);
    alert('Non è stato possibile salvare la setlist online. Controlla le regole Firestore.');
    return null;
  }
}
function buildCloudSetlistShareUrl(id){
  const url=new URL(window.location.href);
  url.search='';
  url.hash='';
  url.searchParams.set('setlist',id);
  return url.toString();
}
async function shareUrl(title,url){
  const data={title,text:`Setlist: ${title}`,url};
  if(navigator.share){
    try{await navigator.share(data);return;}catch(error){if(error?.name==='AbortError')return;}
  }
  try{await navigator.clipboard.writeText(url);alert('Link della Setlist copiato.');}
  catch{prompt('Copia questo link:',url);}
}
function updateSetlistLibraryVisibility(){
  if(!setlistLibrary)return;
  const show=listMode==='setlist';
  setlistLibrary.hidden=!show;
  if(!show)placeTileListInDefaultPosition();
  const hasCloudSetlists=Boolean(currentUser&&db);
  newSetlistButton.hidden=!hasCloudSetlists;
  setlistLibraryTitle.textContent=hasCloudSetlists?'Le mie setlist':'La mia setlist';
  if(show)loadCloudSetlists();
}
function setCloudStatus(message){cloudSetlistsStatus.textContent=message||'';}
async function loadCloudSetlists(){
  cloudSetlistsList.innerHTML='';
  setCloudStatus('');
  if(!currentUser||!db){
    ensureActiveLocalSetlist();
    renderCloudSetlistRow({...localSetlists[0],local:true});
    return;
  }
  setCloudStatus('Caricamento…');
  try{
    const snapshot=await db.collection('setlists').where('ownerUid','==',currentUser.uid).get();
    const docs=snapshot.docs.map(doc=>({id:doc.id,...doc.data(),local:false}));
    docs.sort((a,b)=>{
      const at=a.updatedAt?.toMillis?.()||0, bt=b.updatedAt?.toMillis?.()||0;
      return bt-at;
    });
    if(!activeCloudSetlistId&&docs.length){
      activeCloudSetlistId=docs[0].id;
      localStorage.setItem(`activeCloudSetlistId:${currentUser.uid}`,activeCloudSetlistId);
      openCloudSetlist(docs[0],{rerender:false});
    }
    setCloudStatus(docs.length?'':'Non hai ancora setlist.');
    docs.forEach(item=>renderCloudSetlistRow(item));
  }catch(error){
    console.error('Lettura setlist online non riuscita.',error);
    setCloudStatus('Non è stato possibile caricare le setlist.');
  }
}
async function maybeMigrateLocalSetlists(){
  if(!currentUser||!db||!localSetlists.length)return;
  const importable=localSetlists.filter(item=>migrateStoredSongRefs(item.songs||[]).length);
  if(!importable.length)return;
  const legacyKey=`setlistsMigrated:${currentUser.uid}`;
  const markerKey=`setlistsMigrationHandled:${currentUser.uid}`;
  const signature=JSON.stringify(importable.map(item=>({
    id:item.id,
    name:item.name,
    songs:migrateStoredSongRefs(item.songs||[]),
    updatedAt:item.updatedAt
  })));
  if(localStorage.getItem(markerKey)===signature)return;
  if(localStorage.getItem(legacyKey)==='done'){
    localStorage.setItem(markerKey,signature);
    return;
  }
  const count=importable.length;
  const accepted=confirm(`Ho trovato ${count} ${count===1?'setlist salvata':'setlist salvate'} su questo dispositivo. Vuoi aggiunger${count===1?'la':'le'} alle Setlist di ${firstNameFromUser(currentUser)}?`);
  if(!accepted){
    localStorage.setItem(markerKey,signature);
    return;
  }
  try{
    for(const item of importable){
      const safeId=`import-${currentUser.uid}-${item.id}`.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,1400);
      await db.collection('setlists').doc(safeId).set({
        ownerUid:currentUser.uid,
        ownerName:firstNameFromUser(currentUser),
        name:item.name.slice(0,40),
        songs:item.songs.slice(0,250),
        visibility:'link',
        createdAt:firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:firebase.firestore.FieldValue.serverTimestamp()
      },{merge:true});
    }
    localStorage.setItem(legacyKey,'done');
    localStorage.setItem(markerKey,signature);
    activeCloudSetlistId=`import-${currentUser.uid}-${importable[0].id}`.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,1400);
    localStorage.setItem(`activeCloudSetlistId:${currentUser.uid}`,activeCloudSetlistId);
  }catch(error){
    console.error('Importazione setlist locali non riuscita.',error);
    alert('Non è stato possibile importare le setlist locali. Riprova più tardi.');
  }
}
function renderCloudSetlistRow(item){
  const card=document.createElement('article');
  card.className='setlist-library-card';
  card.dataset.setlistId=item.id;
  card._setlistItem=item;
  if((item.local&&activeLocalSetlistId===item.id)||(!item.local&&activeCloudSetlistId===item.id))card.classList.add('active');
  card.tabIndex=0;
  card.setAttribute('role','button');
  card.setAttribute('aria-label',`Apri ${item.name||'Setlist senza nome'}`);

  const info=document.createElement('div');
  info.className='setlist-library-info';
  const title=document.createElement('strong');
  title.textContent=item.name||'Setlist senza nome';
  const count=document.createElement('span');
  const n=Array.isArray(item.songs)?item.songs.length:0;
  count.textContent=n===1?'1 canto':`${n} canti`;
  info.append(title,count);

  const actions=document.createElement('div');
  actions.className='setlist-card-icon-actions';
  const icons={
    share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M5 12v7h14v-7"/></svg>',
    rename:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/></svg>',
    duplicate:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    delete:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 13h10l1-13"/><path d="M10 11v5M14 11v5"/></svg>'
  };
  const makeIconButton=(label,icon,handler,kind='')=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='setlist-card-icon-button';
    if(kind)button.classList.add(kind);
    button.setAttribute('aria-label',label);
    button.title=label;
    button.innerHTML=icons[icon];
    button.addEventListener('click',event=>{
      event.stopPropagation();
      handler();
    });
    return button;
  };
  actions.append(
    makeIconButton('Condividi','share',()=>item.local?shareLocalSetlist(item):shareUrl(item.name||'Setlist',buildCloudSetlistShareUrl(item.id))),
    makeIconButton('Rinomina','rename',()=>item.local?renameLocalSetlist(item):renameCloudSetlist(item))
  );
  if(!item.local){
    actions.append(
      makeIconButton('Duplica','duplicate',()=>duplicateCloudSetlist(item)),
      makeIconButton('Elimina','delete',()=>deleteCloudSetlist(item),'danger')
    );
  }
  actions.addEventListener('click',event=>event.stopPropagation());

  const open=()=>openCloudSetlist(item);
  card.addEventListener('click',open);
  card.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}
  });
  card.append(info,actions);
  cloudSetlistsList.append(card);
  if(card.classList.contains('active'))placeTileListUnderSetlist(card);
}
function showActiveSetlistCard(id){
  const cards=[...cloudSetlistsList.querySelectorAll('.setlist-library-card')];
  const activeCard=cards.find(card=>card.dataset.setlistId===id);
  cards.forEach(card=>card.classList.toggle('active',card===activeCard));
  if(activeCard)placeTileListUnderSetlist(activeCard);
}
function updateSetlistCardName(id,name){
  const card=cloudSetlistsList.querySelector(`.setlist-library-card[data-setlist-id="${id}"]`);
  if(!card)return;
  const title=card.querySelector('.setlist-library-info strong');
  if(title)title.textContent=name;
  card.setAttribute('aria-label',`Apri ${name}`);
}
function openCloudSetlist(item,{rerender=true}={}){
  const ids=migrateStoredSongRefs(item.songs||[]);
  personalSetlist=ids;
  personalSetlistName=(item.name||'Setlist').slice(0,40);
  if(item.local){
    activeLocalSetlistId=item.id;
    localStorage.setItem('activeLocalSetlistId',activeLocalSetlistId);
  }else{
    activeCloudSetlistId=item.id;
    if(currentUser)localStorage.setItem(`activeCloudSetlistId:${currentUser.uid}`,activeCloudSetlistId);
  }
  localStorage.setItem('personalSetlistName',personalSetlistName);
  localStorage.setItem('personalSetlist',JSON.stringify(personalSetlist));
  updateSetlistHeader();
  showActiveSetlistCard(item.id);
  renderTiles();
  // Le setlist sono gia' sullo schermo: non ricreare l'elenco ad ogni tocco.
  // Evita il breve vuoto visibile mentre Firestore risponde.
  if(rerender&&listMode!=='setlist')loadCloudSetlists();
}
function renameLocalSetlist(item){
  const name=prompt('Nuovo nome:',item.name||'');
  if(name===null)return;
  const clean=name.trim().replace(/\s+/g,' ').slice(0,40);
  if(!clean)return;
  const target=localSetlists.find(entry=>entry.id===item.id);if(!target)return;
  target.name=clean;target.updatedAt=Date.now();
  if(activeLocalSetlistId===item.id){personalSetlistName=clean;localStorage.setItem('personalSetlistName',clean);}
  writeLocalSetlists();loadCloudSetlists();
}
function duplicateLocalSetlist(item){
  const copy={id:makeLocalSetlistId(),name:`Copia di ${item.name||'Setlist'}`.slice(0,40),songs:migrateStoredSongRefs(item.songs||[]),updatedAt:Date.now()};
  localSetlists.unshift(copy);writeLocalSetlists();loadCloudSetlists();
}
function deleteLocalSetlist(item){
  if(!confirm(`Eliminare “${item.name||'questa setlist'}”?`))return;
  localSetlists=localSetlists.filter(entry=>entry.id!==item.id);
  if(!localSetlists.length)localSetlists=[{id:makeLocalSetlistId(),name:'La mia Setlist',songs:[],updatedAt:Date.now()}];
  if(activeLocalSetlistId===item.id){activeLocalSetlistId=localSetlists[0].id;ensureActiveLocalSetlist();renderTiles();}
  writeLocalSetlists();loadCloudSetlists();
}
async function shareLocalSetlist(item){
  const url=new URL(window.location.href);url.search='';url.hash='';
  url.searchParams.set('scaletta',migrateStoredSongRefs(item.songs||[]).join(','));
  url.searchParams.set('nome',item.name||'Setlist');
  await shareUrl(item.name||'Setlist',url.toString());
}
async function renameCloudSetlist(item){
  const name=prompt('Nuovo nome:',item.name||'');
  if(name===null)return;
  const clean=name.trim().replace(/\s+/g,' ').slice(0,40);
  if(!clean)return;
  try{
    await db.collection('setlists').doc(item.id).update({name:clean,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    if(activeCloudSetlistId===item.id){personalSetlistName=clean;localStorage.setItem('personalSetlistName',clean);updateSetlistHeader();}
    updateSetlistCardName(item.id,clean);
  }catch(error){console.error(error);alert('Rinomina non riuscita.');}
}
async function duplicateCloudSetlist(item){
  try{
    await db.collection('setlists').add({
      ownerUid:currentUser.uid,
      ownerName:firstNameFromUser(currentUser),
      name:`Copia di ${item.name||'Setlist'}`.slice(0,40),
      songs:migrateStoredSongRefs(item.songs||[]).slice(0,250),
      visibility:'link',
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    loadCloudSetlists();
  }catch(error){console.error(error);alert('Duplicazione non riuscita.');}
}
async function deleteCloudSetlist(item){
  if(!confirm(`Eliminare “${item.name||'questa setlist'}”?`))return;
  const cards=[...cloudSetlistsList.querySelectorAll('.setlist-library-card')];
  const card=cards.find(entry=>entry.dataset.setlistId===item.id);
  const index=cards.indexOf(card);
  const nextCard=cards[index+1]||cards[index-1]||null;
  const nextItem=nextCard?nextCard._setlistItem:null;
  try{
    await db.collection('setlists').doc(item.id).delete();
    if(card)card.remove();
    if(activeCloudSetlistId!==item.id)return;
    if(nextItem){
      openCloudSetlist(nextItem,{rerender:false});
      return;
    }
    activeCloudSetlistId=null;
    if(currentUser)localStorage.removeItem(`activeCloudSetlistId:${currentUser.uid}`);
    personalSetlist=[];
    personalSetlistName='La mia Setlist';
    localStorage.setItem('personalSetlist','[]');
    localStorage.setItem('personalSetlistName',personalSetlistName);
    updateSetlistHeader();
    placeTileListInDefaultPosition();
    renderTiles();
    setCloudStatus('Non hai ancora setlist.');
  }catch(error){console.error(error);alert('Eliminazione non riuscita.');}
}
async function importCloudSetlistFromUrl(){
  const params=new URLSearchParams(window.location.search);
  const id=params.get('setlist');
  if(!id||!db)return;
  try{
    const doc=await db.collection('setlists').doc(id).get();
    if(!doc.exists){alert('La setlist condivisa non esiste più.');return;}
    const item={id:doc.id,...doc.data()};
    const ids=migrateStoredSongRefs(item.songs||[]);
    if(!ids.length)return;
    if(confirm(`Aprire la Setlist “${item.name||'condivisa'}” con ${ids.length} canti?`)){
      personalSetlist=ids;
      personalSetlistName=(item.name||'Setlist condivisa').slice(0,40);
      localStorage.setItem('personalSetlist',JSON.stringify(personalSetlist));
      localStorage.setItem('personalSetlistName',personalSetlistName);
      if(currentUser?.uid===item.ownerUid){activeCloudSetlistId=id;localStorage.setItem(`activeCloudSetlistId:${currentUser.uid}`,id);}
      else{activeCloudSetlistId=null;}
      setListMode('setlist');
    }
  }catch(error){console.error('Apertura setlist condivisa non riuscita.',error);alert('Non è stato possibile aprire la setlist condivisa.');}
  finally{
    const clean=new URL(window.location.href);clean.searchParams.delete('setlist');
    history.replaceState({},'',clean.pathname+clean.search+clean.hash);
  }
}
function buildSetlistShareUrl(){
  const url=new URL(window.location.href);
  url.search='';
  url.hash='';
  url.searchParams.set('scaletta',personalSetlist.join(','));
  url.searchParams.set('nome',personalSetlistName);
  return url.toString();
}
async function shareCurrentSetlist(){
  if(!personalSetlist.length){alert('La Setlist è vuota.');return;}
  if(currentUser&&db){
    const id=await saveCurrentSetlistToCloud();
    if(id){await shareUrl(personalSetlistName,buildCloudSetlistShareUrl(id));return;}
  }
  await shareUrl(personalSetlistName,buildSetlistShareUrl());
}
function importSetlistFromUrl(){
  const params=new URLSearchParams(window.location.search);
  if(!params.has('scaletta'))return;
  const imported=params.get('scaletta')
    .split(',')
    .map(value=>decodeURIComponent(value.trim()))
    .filter(id=>songs.some(song=>song.id===id));
  const unique=[...new Set(imported)];
  if(!unique.length)return;

  const importedName=(params.get('nome')||'Setlist condivisa').trim().slice(0,40);
  const accept=confirm(`Importare la Setlist "${importedName}" con ${unique.length} canti?`);
  if(accept){
    personalSetlist=unique;
    personalSetlistName=importedName||'Setlist condivisa';
    saveSetlist();
    localStorage.setItem('personalSetlistName',personalSetlistName);
    setListMode('setlist');
  }

  // Clean the URL after handling so reloading does not ask again.
  const cleanUrl=new URL(window.location.href);
  cleanUrl.searchParams.delete('scaletta');
  cleanUrl.searchParams.delete('nome');
  history.replaceState({},'',cleanUrl.pathname+cleanUrl.search+cleanUrl.hash);
}
function isInSetlist(index){
  return personalSetlist.includes(songId(index));
}
function toggleSetlist(index){
  const id=songId(index);
  if(!id)return;
  if(isInSetlist(index))personalSetlist=personalSetlist.filter(item=>item!==id);
  else personalSetlist.push(id);
  saveSetlist();
  renderTiles();
  if(document.body.classList.contains('song-open')&&activeIndex===index)renderSong(index);
}
function moveSetlistItem(index,direction){
  const pos=personalSetlist.indexOf(songId(index));
  const target=pos+direction;
  if(pos<0||target<0||target>=personalSetlist.length)return;
  [personalSetlist[pos],personalSetlist[target]]=[personalSetlist[target],personalSetlist[pos]];
  saveSetlist();
  renderTiles();
}
function setlistPosition(index){
  return personalSetlist.indexOf(songId(index));
}
function songIndexFromId(id){
  return songs.findIndex(song=>song.id===id);
}
function openFeedback(index=null){
  feedbackForm.reset();
  feedbackStatus.textContent='';
  const song=Number.isInteger(index)?songs[index]:null;
  feedbackSong.value=song?song.title+(song.sub?` — ${song.sub}`:''):'Segnalazione generale';
  feedbackSongId.value=song?song.id:'';
  feedbackPage.value=window.location.href;
  feedbackDevice.value=navigator.userAgent;
  feedbackIntro.textContent=song
    ?`Segnalazione relativa a “${song.title}${song.sub?` — ${song.sub}`:''}”.`
    :'Segnala un problema generale o proponi un miglioramento.';
  feedbackModal.hidden=false;
  document.body.style.overflow='hidden';
  setTimeout(()=>feedbackForm.querySelector('select')?.focus(),0);
}
function closeFeedback(){
  feedbackModal.hidden=true;
  document.body.style.overflow='';
}
async function submitFeedback(event){
  event.preventDefault();
  const submitButton=feedbackForm.querySelector('[type="submit"]');
  submitButton.disabled=true;
  feedbackStatus.textContent='Invio in corso…';

  try{
    if(typeof firebase==='undefined'||!firebase.firestore){
      throw new Error('Firebase non disponibile');
    }

    const formData=new FormData(feedbackForm);
    const payload={
      tipo:String(formData.get('tipo')||'').trim(),
      descrizione:String(formData.get('descrizione')||'').trim(),
      canto:String(formData.get('canto')||'').trim(),
      canto_id:String(formData.get('canto_id')||'').trim(),
      pagina:String(formData.get('pagina')||'').slice(0,500),
      dispositivo:String(formData.get('dispositivo')||'').slice(0,500),
      contatto:String(formData.get('contatto')||'').trim(),
      stato:'nuova',
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    };

    if(!payload.tipo||!payload.descrizione){
      throw new Error('Campi obbligatori mancanti');
    }

    await firebase.firestore().collection('segnalazioni').add(payload);
    feedbackStatus.textContent='Grazie! La segnalazione è stata inviata.';
    feedbackForm.reset();
    setTimeout(closeFeedback,1200);
  }catch(error){
    console.error('Errore invio segnalazione:',error);
    feedbackStatus.textContent='Non sono riuscita a inviare. Controlla la connessione e riprova.';
  }finally{
    submitButton.disabled=false;
  }
}
const NOTES=['DO','DO#','RE','RE#','MI','FA','FA#','SOL','SOL#','LA','LA#','SI'];
const NOTE_INDEX={'DO':0,'DO#':1,'REB':1,'RE':2,'RE#':3,'MIB':3,'MI':4,'FAB':4,'FA':5,'FA#':6,'SOLB':6,'SOL':7,'SOL#':8,'LAB':8,'LA':9,'LA#':10,'SIB':10,'SI':11,'DOB':11};
const ROOT_RE=/^([([{]*)(DO|RE|MI|FA|SOL|LA|SI)(#|[Bb])?([A-Za-z0-9+\-]*)([)\]}]*)$/;
function transposeSingle(tok,shift){const m=tok.match(ROOT_RE);if(!m)return tok;const[,pre,root,acc,suffix,post]=m;const idx=NOTE_INDEX[root+(acc?acc.toUpperCase():'')];if(idx===undefined)return tok;return pre+NOTES[((idx+shift)%12+12)%12]+suffix+post}
function transposeToken(tok,shift){return tok.includes('/')?tok.split('/').map(p=>transposeSingle(p,shift)).join('/'):transposeSingle(tok,shift)}
function transposeLine(text,shift){
  if(!shift)return text;
  return text.replace(/(\S+)(\s*)/g,(full,tok,gap)=>{
    const moved=transposeToken(tok,shift);
    if(!gap)return moved;
    const gapLength=Math.max(1,gap.length+tok.length-moved.length);
    return moved+' '.repeat(gapLength);
  });
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function songHash(index){
  const id=songId(index);
  return id?`#canto/${encodeURIComponent(id)}`:'';
}
function songIndexFromHash(){
  const idMatch=location.hash.match(/^#canto\/([^/?#]+)$/);
  if(idMatch){
    const id=decodeURIComponent(idMatch[1]);
    const index=songIndexFromId(id);
    return index>=0?index:null;
  }

  // Compatibilità con i vecchi collegamenti numerici, per esempio #canto-23.
  const legacyMatch=location.hash.match(/^#canto-(\d+)$/);
  if(!legacyMatch)return null;
  const legacyIndex=Number(legacyMatch[1])-1;
  return legacyIndex>=0&&legacyIndex<songs.length?legacyIndex:null;
}
function updateWakeLockIndicator(){
  const indicator=document.getElementById('screenAwakeIndicator');
  if(!indicator)return;
  const active=Boolean(screenWakeLock&&!screenWakeLock.released);
  indicator.hidden=!active;
  indicator.textContent=active?'● Schermo attivo':'';
}
async function requestScreenWakeLock(){
  if(!document.body.classList.contains('song-open')||document.visibilityState!=='visible')return;
  if(!navigator.wakeLock?.request)return;
  if(screenWakeLockRequestPending)return;
  if(screenWakeLock&&!screenWakeLock.released){
    updateWakeLockIndicator();
    return;
  }
  screenWakeLockRequestPending=true;
  try{
    const lock=await navigator.wakeLock.request('screen');
    if(!document.body.classList.contains('song-open')||document.visibilityState!=='visible'){
      await lock.release();
      return;
    }
    screenWakeLock=lock;
    lock.addEventListener('release',()=>{
      if(screenWakeLock===lock)screenWakeLock=null;
      updateWakeLockIndicator();
    });
    updateWakeLockIndicator();
  }catch(error){
    screenWakeLock=null;
    updateWakeLockIndicator();
    console.warn('Schermo sempre acceso non disponibile.',error);
  }finally{
    screenWakeLockRequestPending=false;
  }
}
async function releaseScreenWakeLock(){
  const lock=screenWakeLock;
  screenWakeLock=null;
  updateWakeLockIndicator();
  if(lock&&!lock.released){
    try{await lock.release();}
    catch(error){console.warn('Rilascio blocco schermo non riuscito.',error);}
  }
}
function setLecternControlsVisible(visible,{autoHide=true}={}){
  clearTimeout(lecternControlsTimer);
  document.body.classList.toggle('lectern-controls-visible',lecternMode&&visible);
  if(lecternMode&&visible&&autoHide){
    lecternControlsTimer=setTimeout(()=>{
      document.body.classList.remove('lectern-controls-visible');
    },4000);
  }
}
function setLecternMode(enabled){
  lecternMode=Boolean(enabled);
  document.body.classList.toggle('lectern-mode',lecternMode);
  if(lecternMode){
    setLecternControlsVisible(true);
    window.scrollTo({top:0,behavior:'auto'});
  }else{
    setLecternControlsVisible(false,{autoHide:false});
  }
  const button=document.getElementById('lecternToggle');
  if(button){
    button.classList.toggle('active',lecternMode);
    button.setAttribute('aria-pressed',String(lecternMode));
    button.querySelector('span').textContent=lecternMode?'Esci da Leggio':'Leggio';
  }
}
async function trackSongOpen(id){
  if(!db||!id||!window.firebase?.firestore)return;
  const ref=db.collection('songStats').doc(id);
  try{
    await db.runTransaction(async transaction=>{
      const snapshot=await transaction.get(ref);
      const timestamp=firebase.firestore.FieldValue.serverTimestamp();
      if(snapshot.exists){
        const currentCount=Number(snapshot.data()?.openCount)||0;
        transaction.update(ref,{
          openCount:currentCount+1,
          lastOpenedAt:timestamp
        });
      }else{
        transaction.set(ref,{
          songId:id,
          openCount:1,
          createdAt:timestamp,
          lastOpenedAt:timestamp
        });
      }
    });
  }catch(error){
    console.warn('Conteggio apertura canto non riuscito.',error);
  }
}
function showSong(i,updateHistory=true){
  if(!songs[i])return;
  const wasOpen=document.body.classList.contains('song-open');
  const previousSongId=wasOpen?songId(activeIndex):null;
  const openedSongId=songId(i);
  if(!wasOpen)listScrollY=window.scrollY;
  activeIndex=i;
  renderTiles();
  renderSong(i);
  document.body.classList.add('song-open');
  void requestScreenWakeLock();
  if(!wasOpen||previousSongId!==openedSongId)void trackSongOpen(openedSongId);
  if(updateHistory){
    const method=wasOpen?'replaceState':'pushState';
    history[method]({view:'song',songId:songId(i)},'',songHash(i));
  }
  window.scrollTo({top:0,behavior:'auto'});
}
function showList(){
  setLecternMode(false);
  document.body.classList.remove('song-open');
  void releaseScreenWakeLock();
  renderTiles();
  requestAnimationFrame(()=>window.scrollTo({top:listScrollY,behavior:'auto'}));
}
function backToList(){if(history.state&&history.state.view==='song')history.back();else{history.replaceState({view:'list'},'',location.pathname+location.search);showList()}}

const CATEGORY_ALIASES={
  'Ingresso':['ingresso','canto d ingresso','canti d ingresso'],
  'Atto penitenziale':['atto penitenziale','penitenziale'],
  'Gloria':['gloria'],
  'Vangelo':['vangelo','canto al vangelo','canti al vangelo','alleluia'],
  'Offertorio':['offertorio','offerta','presentazione dei doni'],
  'Santo':['santo'],
  'Padre nostro':['padre nostro'],
  'Agnello di Dio':['agnello di dio'],
  'Comunione':['comunione','eucaristia','eucaristico','eucaristici'],
  'Finale':['finale','canto finale','canti finali'],
  'Avvento':['avvento','tempo di avvento'],
  'Natale':['natale','natalizio','periodo natalizio','tempo di natale'],
  'Quaresima':['quaresima','quaresimale','tempo di quaresima'],
  'Pasqua':['pasqua','pasquale','tempo di pasqua','risurrezione'],
  'Spirito Santo':['spirito santo','spirito','pentecoste'],
  'Cresima':['cresima','cresime'],
  'Maria':['maria','mariano','mariani','canti mariani'],
  'Lode':['lode','canti di lode'],
  'Meditazione':['meditazione','meditativo','meditativi','canti di meditazione'],
  'Battesimo':['battesimo','battesimi'],
  'Altri canti':['altri canti']
};

function categoryTagFromQuery(query){
  const normalized=normalizeSearch(query);
  if(!normalized)return null;

  const simplified=normalized
    .split(/\s+/)
    .filter(word=>!['canto','canti','per','il','lo','la','i','gli','le','di','del','della','tempo','periodo'].includes(word))
    .join(' ')
    .trim();

  if(simplified.length<3)return null;

  const matches=[];

  for(const [tag,aliases] of Object.entries(CATEGORY_ALIASES)){
    const normalizedAliases=aliases.map(normalizeSearch);
    const exact=normalizedAliases.some(alias=>alias===simplified);
    const prefix=normalizedAliases.some(alias=>
      alias.startsWith(simplified) ||
      alias.split(/\s+/).some(word=>word.startsWith(simplified))
    );

    if(exact)matches.push({tag,score:10000});
    else if(prefix)matches.push({
      tag,
      score:Math.max(...normalizedAliases.map(alias=>
        alias.startsWith(simplified)?5000-simplified.length:
        alias.split(/\s+/).some(word=>word.startsWith(simplified))?3000-simplified.length:0
      ))
    });
  }

  matches.sort((a,b)=>b.score-a.score||a.tag.localeCompare(b.tag,'it'));
  return matches[0]?.tag||null;
}

function renderCategorySuggestions(query){
  tagSuggestions.replaceChildren();

  if(listMode!=='all')return false;

  const tag=categoryTagFromQuery(query);
  if(!tag)return false;

  const configEntry=Object.entries(searchSuggestionConfig)
    .find(([,item])=>normalizeSearch(item.tag)===normalizeSearch(tag));

  const title=configEntry?.[0]||`Canti per ${tag}`;
  const description=configEntry?.[1]?.description||'Suggerimenti dal canzoniere';

  const taggedIds=new Set(
    Object.entries(songsTags)
      .filter(([,entry])=>(entry.tags||[]).some(value=>normalizeSearch(value)===normalizeSearch(tag)))
      .map(([id])=>id)
  );

  const matches=songs
    .map((song,index)=>({song,index}))
    .filter(({song})=>taggedIds.has(song.id));

  if(!matches.length)return false;

  const section=document.createElement('section');
  section.className='category-suggestions';
  section.setAttribute('aria-label',title);

  const heading=document.createElement('h2');
  heading.className='category-suggestions-title';
  heading.textContent=title;

  const note=document.createElement('p');
  note.className='category-suggestions-description';
  note.textContent=description;

  const list=document.createElement('div');
  list.className='category-suggestions-list';

  matches.forEach(({song,index})=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='category-suggestion-song';
    if(index===activeIndex)button.classList.add('active');

    button.innerHTML=`
  <span class="tile-title">
    ${esc(song.title)}
    ${song.sub ? `<small>${esc(song.sub)}</small>` : ''}
  </span>
`;

    button.addEventListener('click',()=>showSong(index));
    list.appendChild(button);
  });

  section.append(heading,note,list);
  tagSuggestions.appendChild(section);
  return true;
}

const EASTER_EGG_SEARCHES=new Set([
  'il canto piu bello',
  'chiara braidotti',
  'don christian'
].map(normalizeSearch));

function easterEggSongId(query){
  return EASTER_EGG_SEARCHES.has(normalizeSearch(query))
    ? 'verbum-panis'
    : null;
}

function renderTiles(filter=search.value){
  updateSetlistHeader();
  tileList.hidden=false;
  tileList.innerHTML='';
  let any=false;
  const query=listMode==='setlist'?'':(typeof filter==='string'?filter:search.value);
  const easterSongId=easterEggSongId(query);
  const easterEggActive=Boolean(easterSongId);
  const hasCategorySuggestions=easterEggActive
    ? false
    : renderCategorySuggestions(query);

  let ordered;
  if(easterEggActive){
    ordered=songs
      .map((song,i)=>({song,i}))
      .filter(({song})=>song.id===easterSongId);
  }else if(listMode==='setlist'){
    ordered=personalSetlist.map(id=>{
      const i=songIndexFromId(id);
      return {song:songs[i],i};
    }).filter(item=>item.song&&item.i>=0);
  }else{
    // Mantiene sempre l'ordine originale dell'elenco principale.
    // I preferiti vengono mostrati separatamente solo nel relativo filtro.
    ordered=songs.map((song,i)=>({song,i}));
  }

  if(query && listMode!=='setlist' && !easterEggActive){
    ordered.sort((a,b)=>songScore(b.song,query)-songScore(a.song,query));
  }

  ordered.forEach(({song,i})=>{
    if(!easterEggActive && listMode==='favorites'&&!isFavorite(i))return;
    if(!easterEggActive && !songTitleMatches(song,query))return;
    any=true;

    const li=document.createElement('li');
    li.className='tile-row';

    const btn=document.createElement('button');
    btn.className='tile'+(i===activeIndex?' active':'');
    btn.innerHTML=`<span class="num" aria-hidden="true"></span><span class="tile-title">${esc(song.title)}${song.sub?`<small>${esc(song.sub)}</small>`:''}</span>`;
    btn.addEventListener('click',()=>showSong(i));

    const actions=document.createElement('div');
    actions.className='tile-actions';

    if(listMode==='setlist'){
      const pos=setlistPosition(i);

      const up=document.createElement('button');
      up.type='button';
      up.className='setlist-order';
      up.textContent='↑';
      up.title='Sposta su';
      up.disabled=pos<=0;
      up.addEventListener('click',event=>{
        event.stopPropagation();
        moveSetlistItem(i,-1);
      });

      const down=document.createElement('button');
      down.type='button';
      down.className='setlist-order';
      down.textContent='↓';
      down.title='Sposta giù';
      down.disabled=pos===personalSetlist.length-1;
      down.addEventListener('click',event=>{
        event.stopPropagation();
        moveSetlistItem(i,1);
      });

      const remove=document.createElement('button');
      remove.type='button';
      remove.className='setlist-add active';
      remove.innerHTML=`<svg class="setlist-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h10M4 12h7M4 18h8"></path>
        <path d="m15 15 2 2 4-5"></path>
      </svg>`;
      remove.title='Rimuovi dalla Setlist';
      remove.setAttribute('aria-label',remove.title);
      remove.addEventListener('click',event=>{
        event.stopPropagation();
        toggleSetlist(i);
      });

      actions.append(up,down,remove);
    }else{
      const add=document.createElement('button');
      add.type='button';
      add.className='setlist-add'+(isInSetlist(i)?' active':'');
      add.innerHTML=isInSetlist(i)
        ? `<svg class="setlist-icon" viewBox="0 0 24 24" aria-hidden="true">
             <path d="M4 6h10M4 12h7M4 18h8"></path>
             <path d="m15 15 2 2 4-5"></path>
           </svg>`
        : `<svg class="setlist-icon" viewBox="0 0 24 24" aria-hidden="true">
             <path d="M4 6h10M4 12h7M4 18h8"></path>
             <path d="M18 8v6M15 11h6"></path>
           </svg>`;
      add.title=isInSetlist(i)?'Rimuovi dalla Setlist':'Aggiungi alla Setlist';
      add.setAttribute('aria-label',add.title);
      add.setAttribute('aria-pressed',String(isInSetlist(i)));
      add.addEventListener('click',event=>{
        event.stopPropagation();
        toggleSetlist(i);
      });

      const fav=document.createElement('button');
      fav.type='button';
      fav.className='favorite-btn'+(isFavorite(i)?' active':'');
      fav.setAttribute('aria-label',isFavorite(i)?'Rimuovi dai preferiti':'Aggiungi ai preferiti');
      fav.setAttribute('aria-pressed',String(isFavorite(i)));
      fav.textContent=isFavorite(i)?'★':'☆';
      fav.addEventListener('click',event=>{
        event.stopPropagation();
        toggleFavorite(i);
      });

      actions.append(add,fav);
    }

    li.append(btn,actions);
    tileList.appendChild(li);
  });

  if(!any){
    if(hasCategorySuggestions && listMode==='all'){
      tileList.innerHTML='';
      return;
    }
    const message=listMode==='favorites'
      ?'Nessun canto preferito.'
      :listMode==='setlist'
        ?'La scaletta è vuota. Aggiungi i canti con il pulsante +.'
        :'Nessun canto trovato.';
    tileList.innerHTML=`<p class="empty-note">${message}</p>`;
  }
}

function splitLongSegment(chordPart,lyricPart,maxChars=28){
  const width=Math.max(chordPart.length,lyricPart.length);
  if(width<=maxChars)return [{chord:chordPart,lyric:lyricPart,cols:Math.max(1,width)}];

  const chunks=[];
  let remaining=lyricPart;
  let first=true;

  while(remaining.length>maxChars){
    let cut=remaining.lastIndexOf(' ',maxChars);
    if(cut<8)cut=maxChars;
    const piece=remaining.slice(0,cut).replace(/\s+$/,'');
    chunks.push({
      chord:first?chordPart:'',
      lyric:piece,
      cols:Math.max(1,(first?chordPart.length:0),piece.length)
    });
    remaining=remaining.slice(cut).replace(/^\s+/,'');
    first=false;
  }

  chunks.push({
    chord:first?chordPart:'',
    lyric:remaining,
    cols:Math.max(1,(first?chordPart.length:0),remaining.length)
  });
  return chunks;
}

function renderChordLyricPair(chordText,lyricText,shift,explicitAnchors=null){
  const rawChord=chordText||'';
  const rawLyric=lyricText||'';

  // Rimuove soltanto il rientro comune alle due righe.
  // In questo modo resta intatto lo scarto relativo: se il primo accordo
  // deve iniziare sopra una parola interna, non viene spostato a inizio riga.
  const chordIndent=(rawChord.match(/^\s*/)||[''])[0].length;
  const lyricIndent=(rawLyric.match(/^\s*/)||[''])[0].length;
  const commonIndent=Math.min(chordIndent,lyricIndent);

  const chord=transposeLine(rawChord.slice(commonIndent),shift);
  const lyric=rawLyric.slice(commonIndent);
  const chordMatches=[...chord.matchAll(/\S+/g)];
  const lyricWords=[...lyric.matchAll(/\S+/g)];

  if(Array.isArray(explicitAnchors) && explicitAnchors.length){
    const words=[...lyric.matchAll(/\S+/g)].map(match=>match[0]);
    const anchorsByWord=new Map();

    explicitAnchors.forEach(anchor=>{
      const wordIndex=Number(anchor.word);
      if(!Number.isInteger(wordIndex) || wordIndex<0 || wordIndex>=words.length)return;

      const entry={
        chord:transposeLine(String(anchor.chord||''),shift),
        offset:Math.max(0,Math.min(1,Number(anchor.offset)||0))
      };

      if(!anchorsByWord.has(wordIndex))anchorsByWord.set(wordIndex,[]);
      anchorsByWord.get(wordIndex).push(entry);
    });

    const renderedWords=words.map((word,index)=>{
      const anchors=anchorsByWord.get(index)||[];
      const chordHtml=anchors.map(anchor=>{
        const pct=anchor.offset*100;
        const align=anchor.align||(
          anchor.offset===0?'left':
          anchor.offset===1?'right':
          'center'
        );
        const translate=align==='center'?-50:(align==='right'?-100:0);
        return `<span class="explicit-chord explicit-chord-${align}" style="left:${pct}%;transform:translateX(${translate}%);">${esc(anchor.chord)}</span>`;
      }).join('');

      return `<span class="explicit-word">${chordHtml}<span class="explicit-lyric">${esc(word)}</span></span>`;
    }).join(' ');

    return `<div class="explicit-music-row">${renderedWords}</div><div class="lyrics-only-line">${esc(lyric)}</div>`;
  }

  if(!chordMatches.length){
    return `<div class="lyricline">${esc(lyric)}</div>`;
  }

  if(!lyricWords.length){
    return `<div class="chordline">${esc(chord)}</div>`;
  }

  // Aggancia ogni accordo all'inizio della parola più vicina.
  // In questo modo un font proporzionale non spezza più parole come
  // "tuoi", "eternità", "anima" o "nostro".
  const anchors=[];
  chordMatches.forEach(match=>{
    let nearestWord=0;
    let bestDistance=Infinity;

    lyricWords.forEach((word,index)=>{
      const distance=Math.abs(word.index-match.index);
      if(distance<bestDistance){
        bestDistance=distance;
        nearestWord=index;
      }
    });

    const existing=anchors.find(anchor=>anchor.wordIndex===nearestWord);
    if(existing){
      existing.chord+=` ${match[0]}`;
    }else{
      anchors.push({
        wordIndex:nearestWord,
        chord:match[0]
      });
    }
  });

  anchors.sort((a,b)=>a.wordIndex-b.wordIndex);

  // Se il primo accordo non cade sulla prima parola, crea comunque
  // un segmento iniziale senza accordo.
  if(anchors[0].wordIndex>0){
    anchors.unshift({wordIndex:0,chord:''});
  }

  const pieces=anchors.map((anchor,index)=>{
    const nextWordIndex=index+1<anchors.length
      ?anchors[index+1].wordIndex
      :lyricWords.length;

    const words=lyricWords
      .slice(anchor.wordIndex,nextWordIndex)
      .map(word=>word[0]);

    return {
      chord:anchor.chord,
      lyric:words.join(' ')
    };
  }).filter(piece=>piece.lyric||piece.chord);

  return `<div class="music-row word-anchored">${pieces.map(piece=>
    `<div class="music-segment"><div class="segment-chord">${esc(piece.chord)}</div><div class="segment-lyric">${esc(piece.lyric)}</div></div>`
  ).join('')}</div><div class="lyrics-only-line">${esc(lyric)}</div>`;
}


function applyTabletSongColumns(){
  const sheet=main.querySelector('.sheet');
  if(!sheet)return;

  sheet.classList.remove('tablet-two-columns');

  const tabletPortrait=window.matchMedia(
    '(orientation:portrait) and (min-width:760px) and (max-width:1100px)'
  ).matches;

  if(!tabletPortrait)return;

  requestAnimationFrame(()=>{
    sheet.classList.remove('tablet-two-columns');

    const availableHeight=Math.max(
      520,
      window.innerHeight-sheet.getBoundingClientRect().top-28
    );
    const contentHeight=sheet.scrollHeight;
    const sectionCount=sheet.querySelectorAll('.song-section').length;

    if(sectionCount>=5 && contentHeight>availableHeight*1.08){
      sheet.classList.add('tablet-two-columns');
    }
  });
}

function renderSong(i){
  const song=songs[i];
  const shift=shiftState[i]||0;
  let html=`<div class="song-nav">
    <div class="song-nav-main">
      <button class="back-list" id="backList" type="button"><span class="back-arrow" aria-hidden="true">←</span>Elenco</button>
      <button class="lyrics-only-toggle song-view-toggle${lyricsOnly?' active':''}" id="lyricsOnlyToggle" type="button" aria-pressed="${lyricsOnly}">
        <svg class="song-view-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 5h12M6 10h12M6 15h8M6 20h8"></path>
          ${lyricsOnly?'<path d="m16 17 2 2 3-4"></path>':''}
        </svg>
        <span>${lyricsOnly?'Accordi':'Solo testo'}</span>
      </button>
      <button class="lectern-toggle song-view-toggle${lecternMode?' active':''}" id="lecternToggle" type="button" aria-pressed="${lecternMode}">
        <svg class="song-view-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"></path>
        </svg>
        <span>${lecternMode?'Esci da Leggio':'Leggio'}</span>
      </button>
      <span class="screen-awake-indicator" id="screenAwakeIndicator" hidden aria-live="polite"></span>
    </div>
    <div class="toolbar-controls" aria-label="Comandi canto">
      <div class="transpose-controls" aria-label="Tonalità">
        <button class="transpose-btn" id="tDown" type="button" aria-label="Abbassa tonalità">−</button>
        <span class="transpose-value${shift===0?' is-original':''}" aria-label="${shift===0?'Tonalità originale':`${shift>0?'Alzata':'Abbassata'} di ${Math.abs(shift)} semitoni`}">${shift===0?'Tonalità':(shift>0?'+':'')+shift}</span>
        <button class="transpose-btn" id="tUp" type="button" aria-label="Alza tonalità">+</button>
      </div>
      <div class="text-controls" aria-label="Dimensione del testo">
        <button class="command-btn font-control-btn" id="fontDown" type="button" aria-label="Riduci testo"><span class="font-control-a">A</span><span class="font-control-sign">−</span></button>
        <span class="text-size-value" id="fontValue">${songFontSize}px</span>
        <button class="command-btn font-control-btn" id="fontUp" type="button" aria-label="Ingrandisci testo"><span class="font-control-a">A</span><span class="font-control-sign">+</span></button>
      </div>
    </div>
  </div>
  <button class="lectern-controls-handle" id="lecternControlsToggle" type="button" aria-label="Mostra i comandi del canto">•••</button>
  <div class="song-head">
    <div class="song-heading-text">
      <h2 class="song-title">${esc(song.title)}</h2>
      ${(song.sub||legacyBookNumber(song))?`<div class="song-sub">${song.sub?esc(song.sub):''}${song.sub&&legacyBookNumber(song)?' · ':''}${legacyBookNumber(song)?`n. ${legacyBookNumber(song)}`:''}</div>`:''}
    </div>
    <div class="song-title-actions" aria-label="Azioni sul canto">
      <button class="song-favorite${isFavorite(i)?' active':''}" id="songFavorite" type="button" aria-label="${isFavorite(i)?'Rimuovi dai preferiti':'Aggiungi ai preferiti'}" aria-pressed="${isFavorite(i)}">${isFavorite(i)?'★':'☆'}</button>
      <button class="song-setlist${isInSetlist(i)?' active':''}" id="songSetlist" type="button" aria-label="${isInSetlist(i)?'Rimuovi dalla Setlist':'Aggiungi alla Setlist'}">
        ${isInSetlist(i)
          ? `<svg class="setlist-icon" viewBox="0 0 24 24" aria-hidden="true">
               <path d="M4 6h10M4 12h7M4 18h8"></path>
               <path d="m15 15 2 2 4-5"></path>
             </svg>`
          : `<svg class="setlist-icon" viewBox="0 0 24 24" aria-hidden="true">
               <path d="M4 6h10M4 12h7M4 18h8"></path>
               <path d="M18 8v6M15 11h6"></path>
             </svg>`}
      </button>
    </div>
  </div>
  ${isInSetlist(i)?`<div class="setlist-nav">
    <button id="setlistPrev" type="button" ${setlistPosition(i)<=0?'disabled':''}>← Precedente</button>
    <span class="setlist-position">${setlistPosition(i)+1} di ${personalSetlist.length}</span>
    <button id="setlistNext" type="button" ${setlistPosition(i)>=personalSetlist.length-1?'disabled':''}>Successivo →</button>
  </div>`:''}
  <div class="sheet${lyricsOnly?' lyrics-only':''}" style="--song-font-size:${songFontSize}px">`;

  let songSectionOpen=false;

  const openSongSection=()=>{
    if(songSectionOpen)html+='</section>';
    html+='<section class="song-section">';
    songSectionOpen=true;
  };

  for(let lineIndex=0;lineIndex<song.lines.length;lineIndex++){
    const line=song.lines[lineIndex];
    const next=song.lines[lineIndex+1];

    if(line.t==='h'){
      openSongSection();
      const cleanText=(line.v||'').trimStart();
      html+=`<div class="headline">${esc(cleanText)}</div>`;
      continue;
    }

    if(!songSectionOpen){
      html+='<section class="song-section">';
      songSectionOpen=true;
    }

    if(line.t==='c' && next && next.t==='l'){
      html+=renderChordLyricPair(line.v,next.v,shift,line.anchors||null);
      lineIndex++;
      continue;
    }

    const cleanText=(line.v||'').trimStart();
    if(line.t==='c'){
      const chordText=esc(transposeLine(cleanText,shift));
      const chordHtml=line.accent==='gold-bars'
        ?chordText.replace(/\|/g,'<span class="measure-bar">|</span>')
        :chordText;
      html+=`<div class="chordline standalone-chord">${chordHtml}</div>`;
    }
    else if(line.t==='l')html+=`<div class="lyricline lyrics-only-plain">${esc(cleanText)}</div>`;
    else html+='<div class="spacer"></div>';
  }

  if(songSectionOpen)html+='</section>';

  main.innerHTML=html+`</div>
  <div class="song-feedback-footer">
    <button class="feedback-trigger" id="songFeedback" type="button">Segnala un errore</button>
  </div>`;

  document.getElementById('backList').addEventListener('click',backToList);
  document.getElementById('songFavorite').addEventListener('click',()=>toggleFavorite(i));
  document.getElementById('songSetlist').addEventListener('click',()=>toggleSetlist(i));
  applyTabletSongColumns();
  document.getElementById('songFeedback').addEventListener('click',()=>openFeedback(i));
  document.getElementById('lyricsOnlyToggle').addEventListener('click',()=>{
    lyricsOnly=!lyricsOnly;
    localStorage.setItem('lyricsOnlyMode',String(lyricsOnly));
    renderSong(i);
  });
  document.getElementById('lecternToggle').addEventListener('click',event=>{
    event.stopPropagation();
    setLecternMode(!lecternMode);
  });
  document.getElementById('lecternControlsToggle').addEventListener('click',event=>{
    event.stopPropagation();
    setLecternControlsVisible(!document.body.classList.contains('lectern-controls-visible'));
  });
  const songNav=main.querySelector('.song-nav');
  if(songNav)songNav.addEventListener('pointerdown',()=>{
    if(lecternMode)setLecternControlsVisible(true);
  });
  const sheet=main.querySelector('.sheet');
  if(sheet)sheet.addEventListener('click',()=>{
    if(lecternMode)setLecternControlsVisible(true);
  });
  const prevBtn=document.getElementById('setlistPrev');
  const nextBtn=document.getElementById('setlistNext');
  if(prevBtn)prevBtn.addEventListener('click',()=>showSong(songIndexFromId(personalSetlist[setlistPosition(i)-1])));
  if(nextBtn)nextBtn.addEventListener('click',()=>showSong(songIndexFromId(personalSetlist[setlistPosition(i)+1])));
  document.getElementById('tUp').addEventListener('click',()=>{shiftState[i]=(shiftState[i]||0)+1;renderSong(i)});
  document.getElementById('tDown').addEventListener('click',()=>{shiftState[i]=(shiftState[i]||0)-1;renderSong(i)});

  const changeFontSize=delta=>{
    songFontSize=Math.min(24,Math.max(12,songFontSize+delta));
    localStorage.setItem('songFontSize',songFontSize);
    const sheet=main.querySelector('.sheet');
    if(sheet)sheet.style.setProperty('--song-font-size',songFontSize+'px');
    const value=document.getElementById('fontValue');
    if(value)value.textContent=songFontSize+'px';
    applyTabletSongColumns();
  };
  document.getElementById('fontDown').addEventListener('click',()=>changeFontSize(-1));
  document.getElementById('fontUp').addEventListener('click',()=>changeFontSize(1));
  updateWakeLockIndicator();
}
window.addEventListener('resize',applyTabletSongColumns);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&document.body.classList.contains('song-open')){
    void requestScreenWakeLock();
  }
});
document.addEventListener('pointerdown',()=>{
  if(document.body.classList.contains('song-open')&&(!screenWakeLock||screenWakeLock.released)){
    void requestScreenWakeLock();
  }
},{passive:true});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&lecternMode)setLecternMode(false);
});
function updateSearchClear(){searchClear.hidden=!search.value}
search.addEventListener('input',()=>{updateSearchClear();renderTiles()});
search.addEventListener('search',()=>{updateSearchClear();renderTiles()});
searchClear.addEventListener('click',()=>{
  search.value='';
  updateSearchClear();
  renderTiles();
  search.focus();
});
updateSearchClear();
filterAll.addEventListener('click',()=>setListMode('all'));
filterFavorites.addEventListener('click',()=>setListMode('favorites'));
filterSetlist.addEventListener('click',()=>setListMode('setlist'));
sectionMenuToggle.addEventListener('click',toggleSectionMenu);
sectionMenu.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    closeSectionMenu();
    sectionMenuToggle.focus();
  }
});
document.addEventListener('click',event=>{
  if(!sectionSwitcher.contains(event.target))closeSectionMenu();
});
menuFeedback.addEventListener('click',()=>{
  closeSectionMenu();
  generalFeedback.click();
});
menuLogin.addEventListener('click',async()=>{
  closeSectionMenu();
  await loginWithGoogle();
});
menuLogout.addEventListener('click',async()=>{
  closeSectionMenu();
  await logoutFromGoogle();
});
menuInstall.addEventListener('click',()=>{
  closeSectionMenu();
  if(installBannerAction && !installBannerAction.hidden){
    installBannerAction.click();
  }else if(installBanner && !installBanner.hidden){
    installBanner.scrollIntoView({behavior:'smooth',block:'nearest'});
  }else{
    alert('Il Canzoniere è già installato oppure l’installazione non è disponibile da questo dispositivo.');
  }
});
shareSetlist.addEventListener('click',shareCurrentSetlist);
renameSetlist.addEventListener('click',()=>{
  const newName=prompt('Nome della Setlist:',personalSetlistName);
  if(newName===null)return;
  const cleanName=newName.trim().replace(/\s+/g,' ');
  if(!cleanName)return;
  personalSetlistName=cleanName.slice(0,40);
  localStorage.setItem('personalSetlistName',personalSetlistName);
  updateSetlistHeader();
  scheduleCloudSetlistSync();
});
clearSetlist.addEventListener('click',()=>{
  if(!personalSetlist.length)return;
  if(confirm('Vuoi svuotare la Setlist personale?')){
    personalSetlist=[];
    saveSetlist();
    renderTiles();
  }
});

saveCurrentCloudSetlist.addEventListener('click',async()=>{
  if(LOCAL_SETLIST_DEMO && !currentUser){
    alert('Anteprima grafica locale: il salvataggio reale funziona nella preview Firebase dopo il login.');
    return;
  }
  const id=await saveCurrentSetlistToCloud({forceNew:true});
  if(id){setCloudStatus('Setlist salvata online.');loadCloudSetlists();}
});

function isStandaloneApp(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
}
function isMobileOrTablet(){
  return window.matchMedia('(max-width: 1100px)').matches && window.matchMedia('(pointer: coarse)').matches;
}
function isIosDevice(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
}
function installBannerDismissedRecently(){
  const dismissedAt=Number(localStorage.getItem('installBannerDismissedAt')||0);
  return dismissedAt && Date.now()-dismissedAt < 7*24*60*60*1000;
}
function canShowInstallBanner(){
  return isMobileOrTablet() && !isStandaloneApp() && !installBannerDismissedRecently();
}
function showInstallBanner(){
  if(canShowInstallBanner()) installBanner.hidden=false;
}
function hideInstallBanner(){
  installBanner.hidden=true;
}

window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  showInstallBanner();
});
window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  localStorage.removeItem('installBannerDismissedAt');
  hideInstallBanner();
});

installBannerClose.addEventListener('click',()=>{
  localStorage.setItem('installBannerDismissedAt',String(Date.now()));
  hideInstallBanner();
});
installBannerAction.addEventListener('click',async()=>{
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    return;
  }
  if(isIosDevice()){
    installBannerIos.hidden=false;
    installBannerAction.hidden=true;
  }
});

if(isIosDevice()) showInstallBanner();

generalFeedback.addEventListener('click',()=>openFeedback());
feedbackClose.addEventListener('click',closeFeedback);
feedbackModal.querySelectorAll('[data-close-feedback]').forEach(element=>element.addEventListener('click',closeFeedback));
feedbackForm.addEventListener('submit',submitFeedback);
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!feedbackModal.hidden)closeFeedback();
});

if ('serviceWorker' in navigator) {
  if (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
  ) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  } else {
    navigator.serviceWorker.register('/service-worker.js');
  }
}

window.addEventListener('popstate',()=>{const index=songIndexFromHash();if(index===null)showList();else showSong(index,false)});
const initialSong=songIndexFromHash();
if(initialSong===null){
  history.replaceState({view:'list'},'',location.pathname+location.search);
  renderTiles();
  renderSong(0);
}else{
  const openedFromLegacyHash=/^#canto-\d+$/.test(location.hash);
  history.replaceState({view:'song',songId:songId(initialSong)},'',songHash(initialSong));
  showSong(initialSong,false);
  if(openedFromLegacyHash){
    history.replaceState({view:'song',songId:songId(initialSong)},'',songHash(initialSong));
  }
}
importSetlistFromUrl();
setTimeout(importCloudSetlistFromUrl,0);
}

init().catch(error => {
  console.error(error);
  const main = document.getElementById('main');
  if (main) main.innerHTML = `<p role="alert">Errore nel caricamento del canzoniere. Ricarica la pagina.</p>`;
});


const COMMON_SEARCH_WORDS = new Set([
  "canto","amore","luce","vita","dio","signore",
  "cuore","gesu","maria","padre","spirito"
]);

function filterRelevantResults(results, query){
  const words = normalizeSearchText(query).split(" ").filter(Boolean);
  return results.filter(song=>{
    const score = scoreSong(song, query);
    if(score >= 100) return true;
    // evita risultati generati solo da parole molto comuni
    const meaningful = words.filter(w=>w.length>3 && !COMMON_SEARCH_WORDS.has(w));
    if(meaningful.length && meaningful.some(w =>
      normalizeSearchText((song.title||"")+" "+(song.search||"")+" "+(song.text||"")).includes(w)
    )) return score >= 40;
    return false;
  }).slice(0,10);
}


let songsTagsCache = null;

async function getSongTags(){
  if(songsTagsCache) return songsTagsCache;
  try{
    const response = await fetch("./data/songs-tags.json");
    songsTagsCache = await response.json();
  }catch(e){
    songsTagsCache = {};
  }
  return songsTagsCache;
}

function tagScore(song, query, tagsData){
  const data = tagsData?.[song.id];
  if(!data || !data.tags) return 0;
  const q = normalizeSearchText(query);
  let score = 0;
  data.tags.forEach(tag=>{
    const n = normalizeSearchText(tag);
    if(n === q) score += 300;
    else if(n.includes(q) || q.includes(n)) score += 100;
  });
  return score;
}


function renderTagSuggestions(suggestions){
  if(!suggestions || !suggestions.length) return "";
  return `
    <section class="tag-suggestions">
      <h3>💡 Suggerimenti</h3>
      ${suggestions.map(s=>`
        <div class="tag-group">
          <h4>${s.icon||""} ${s.title}</h4>
          ${s.songs.map(song=>`
            <button class="search-song-result" data-song-id="${song.id}">
              ${song.title}
            </button>
          `).join("")}
        </div>
      `).join("")}
    </section>`;
}


let searchSuggestionsCache = null;

async function loadSearchSuggestions(){
  if(searchSuggestionsCache) return searchSuggestionsCache;
  try{
    const r = await fetch("./data/search-suggestions.json");
    searchSuggestionsCache = await r.json();
  }catch(e){
    searchSuggestionsCache = {};
  }
  return searchSuggestionsCache;
}

async function getThemeSuggestions(query, songs){
  const q = normalizeSearchText(query);
  if(!q) return [];

  const config = await loadSearchSuggestions();
  const found = [];

  Object.entries(config).forEach(([title, item])=>{
    const tag = normalizeSearchText(item.tag);
    if(tag.includes(q) || q.includes(tag)){
      found.push({
        title,
        description: item.description,
        songs: songs.filter(s =>
          normalizeSearchText(JSON.stringify(s)).includes(tag)
        ).slice(0,5)
      });
    }
  });

  return found.filter(x=>x.songs.length);
}
