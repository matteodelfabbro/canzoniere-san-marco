let songs = [];

async function loadSongs() {
  const response = await fetch('./data/songs-index.json');
  if (!response.ok) throw new Error('Impossibile caricare l’indice dei canti.');
  const songIndex = await response.json();
  songs = await Promise.all(songIndex.map(async item => {
    const songResponse = await fetch(`./${item.file}`);
    if (!songResponse.ok) throw new Error(`Impossibile caricare il canto: ${item.title}`);
    return songResponse.json();
  }));
}

async function init() {
  await loadSongs();
const tileList=document.getElementById('tileList');
const main=document.getElementById('main');
const search=document.getElementById('search');
const filterAll=document.getElementById('filterAll');
const filterFavorites=document.getElementById('filterFavorites');
const filterSetlist=document.getElementById('filterSetlist');
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
let activeIndex=0;
let listMode='all';
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
let favorites=new Set(migrateStoredSongRefs(JSON.parse(localStorage.getItem('favoriteSongs')||'[]')));
let personalSetlist=migrateStoredSongRefs(JSON.parse(localStorage.getItem('personalSetlist')||'[]'));
let personalSetlistName=localStorage.getItem('personalSetlistName')||'La mia scaletta';
localStorage.setItem('favoriteSongs',JSON.stringify([...favorites]));
localStorage.setItem('personalSetlist',JSON.stringify(personalSetlist));
let listScrollY=0;
const shiftState={};
let songFontSize=Math.min(22,Math.max(12,Number(localStorage.getItem('songFontSize'))||16));
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
function songScore(song,query){
  const q=normalizeSearch(query);
  if(!q)return 0;
  const words=q.split(/\s+/).filter(Boolean);
  const title=normalizeSearch([song.title,song.sub].filter(Boolean).join(' '));
  const body=normalizeSearch(song.search||'');
  let score=0;
  if(title===q) score+=10000;
  if(title.includes(q)) score+=5000;
  if(body.includes(q)) score+=1000;
  const titleWords=title.split(/\s+/);
  const bodyWords=body.split(/\s+/);
  let matched=0;
  words.forEach(w=>{
    if(titleWords.includes(w)){score+=1000; matched++;}
    else if(title.includes(w)){score+=300; matched++;}
    if(body.includes(w)){score+=30; matched++;}
    if(w.length>4 && bodyWords.some(x=>levenshtein(w,x)<=1)) score+=5;
  });
  if(matched===words.length) score+=500;
  return score;
}
function songMatches(song,query){
  return !normalizeSearch(query) || songScore(song,query)>=300;
}
function saveFavorites(){
  localStorage.setItem('favoriteSongs',JSON.stringify([...favorites]));
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
  if(favorites.has(id))favorites.delete(id);
  else favorites.add(id);
  saveFavorites();
  renderTiles();
  if(document.body.classList.contains('song-open')&&activeIndex===index)renderSong(index);
}
function setListMode(mode){
  listMode=mode;
  filterAll.classList.toggle('active',mode==='all');
  filterFavorites.classList.toggle('active',mode==='favorites');
  filterSetlist.classList.toggle('active',mode==='setlist');
  setlistTools.hidden=mode!=='setlist';
  renderTiles();
}
function saveSetlist(){
  localStorage.setItem('personalSetlist',JSON.stringify(personalSetlist));
}
function updateSetlistHeader(){
  setlistTitle.textContent=personalSetlistName;
  setlistCount.textContent=personalSetlist.length===1?'1 canto':`${personalSetlist.length} canti`;
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
  if(!personalSetlist.length){
    alert('La scaletta è vuota.');
    return;
  }
  const url=buildSetlistShareUrl();
  const shareData={
    title:personalSetlistName,
    text:`Scaletta: ${personalSetlistName}`,
    url
  };
  if(navigator.share){
    try{
      await navigator.share(shareData);
      return;
    }catch(error){
      if(error && error.name==='AbortError')return;
    }
  }
  try{
    await navigator.clipboard.writeText(url);
    alert('Link della scaletta copiato.');
  }catch{
    prompt('Copia questo link:',url);
  }
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

  const importedName=(params.get('nome')||'Scaletta condivisa').trim().slice(0,40);
  const accept=confirm(`Importare la scaletta "${importedName}" con ${unique.length} canti?`);
  if(accept){
    personalSetlist=unique;
    personalSetlistName=importedName||'Scaletta condivisa';
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
function encodeFormData(form){
  return new URLSearchParams(new FormData(form)).toString();
}
async function submitFeedback(event){
  event.preventDefault();
  const submitButton=feedbackForm.querySelector('[type="submit"]');
  submitButton.disabled=true;
  feedbackStatus.textContent='Invio in corso…';
  try{
    const response=await fetch('/',{
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:encodeFormData(feedbackForm)
    });
    if(!response.ok)throw new Error('Invio non riuscito');
    feedbackStatus.textContent='Grazie! La segnalazione è stata inviata.';
    setTimeout(closeFeedback,1200);
  }catch(error){
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
function showSong(i,updateHistory=true){
  if(!songs[i])return;
  const wasOpen=document.body.classList.contains('song-open');
  if(!wasOpen)listScrollY=window.scrollY;
  activeIndex=i;
  renderTiles();
  renderSong(i);
  document.body.classList.add('song-open');
  if(updateHistory){
    const method=wasOpen?'replaceState':'pushState';
    history[method]({view:'song',songId:songId(i)},'',songHash(i));
  }
  window.scrollTo({top:0,behavior:'auto'});
}
function showList(){document.body.classList.remove('song-open');renderTiles();requestAnimationFrame(()=>window.scrollTo({top:listScrollY,behavior:'auto'}))}
function backToList(){if(history.state&&history.state.view==='song')history.back();else{history.replaceState({view:'list'},'',location.pathname+location.search);showList()}}
function renderTiles(filter=search.value){
  updateSetlistHeader();
  tileList.innerHTML='';
  let any=false;
  const query=typeof filter==='string'?filter:search.value;

  let ordered;
  if(listMode==='setlist'){
    ordered=personalSetlist.map(id=>{
      const i=songIndexFromId(id);
      return {song:songs[i],i};
    }).filter(item=>item.song&&item.i>=0);
  }else{
    // Mantiene sempre l'ordine originale dell'elenco principale.
    // I preferiti vengono mostrati separatamente solo nel relativo filtro.
    ordered=songs.map((song,i)=>({song,i}));
  }

  if(query && listMode!=='setlist'){
    ordered.sort((a,b)=>songScore(b.song,query)-songScore(a.song,query));
  }

  ordered.forEach(({song,i})=>{
    if(listMode==='favorites'&&!isFavorite(i))return;
    if(!songMatches(song,query))return;
    any=true;

    const li=document.createElement('li');
    li.className='tile-row';

    const btn=document.createElement('button');
    btn.className='tile'+(i===activeIndex?' active':'');
    btn.innerHTML=`<span class="num">${pad(i)}</span><span class="tile-title">${esc(song.title)}${song.sub?`<small>${esc(song.sub)}</small>`:''}</span>`;
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
      remove.textContent='×';
      remove.title='Rimuovi dalla scaletta';
      remove.addEventListener('click',event=>{
        event.stopPropagation();
        toggleSetlist(i);
      });

      actions.append(up,down,remove);
    }else{
      const add=document.createElement('button');
      add.type='button';
      add.className='setlist-add'+(isInSetlist(i)?' active':'');
      add.textContent=isInSetlist(i)?'✓':'+';
      add.title=isInSetlist(i)?'Rimuovi dalla scaletta':'Aggiungi alla scaletta';
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

function renderSong(i){
  const song=songs[i];
  const shift=shiftState[i]||0;
  let html=`<div class="song-nav">
    <div class="command-group">
      <button class="back-list" id="backList" type="button"><span class="back-arrow" aria-hidden="true">←</span>Elenco</button>
      <div class="primary-actions">
        <button class="song-favorite${isFavorite(i)?' active':''}" id="songFavorite" type="button" aria-label="${isFavorite(i)?'Rimuovi dai preferiti':'Aggiungi ai preferiti'}" aria-pressed="${isFavorite(i)}">${isFavorite(i)?'★':'☆'}</button>
        <button class="song-setlist${isInSetlist(i)?' active':''}" id="songSetlist" type="button">${isInSetlist(i)?'✓ Scaletta':'+ Scaletta'}</button>
        <button class="lyrics-only-toggle${lyricsOnly?' active':''}" id="lyricsOnlyToggle" type="button" aria-pressed="${lyricsOnly}">${lyricsOnly?'Solo testo':'Accordi'}</button>
        <button class="feedback-trigger" id="songFeedback" type="button">Segnala</button>
      </div>
    </div>
    <div class="toolbar-controls" aria-label="Comandi canto">
      <div class="transpose-controls">
        <span class="transpose-label">Tonalità</span>
        <button class="transpose-btn" id="tDown" type="button" aria-label="Abbassa tonalità">−</button>
        <span class="transpose-value">${shift===0?'Originale':(shift>0?'+':'')+shift+' semitoni'}</span>
        <button class="transpose-btn" id="tUp" type="button" aria-label="Alza tonalità">+</button>
        ${shift!==0?'<button class="transpose-reset" id="tReset" type="button">reset</button>':'<span></span>'}
      </div>
      <span class="command-separator" aria-hidden="true"></span>
      <div class="text-controls">
        <span class="text-size-label">Testo</span>
        <button class="command-btn" id="fontDown" type="button" aria-label="Riduci testo">A−</button>
        <span class="text-size-value" id="fontValue">${songFontSize}px</span>
        <button class="command-btn" id="fontUp" type="button" aria-label="Ingrandisci testo">A+</button>
      </div>
    </div>
  </div>
  <div class="song-head"><span class="num">${pad(i)}</span><div><h2 class="song-title">${esc(song.title)}</h2>${song.sub?`<div class="song-sub">${esc(song.sub)}</div>`:''}</div></div>
  ${isInSetlist(i)?`<div class="setlist-nav">
    <button id="setlistPrev" type="button" ${setlistPosition(i)<=0?'disabled':''}>← Precedente</button>
    <span class="setlist-position">${setlistPosition(i)+1} di ${personalSetlist.length}</span>
    <button id="setlistNext" type="button" ${setlistPosition(i)>=personalSetlist.length-1?'disabled':''}>Successivo →</button>
  </div>`:''}
  <div class="sheet${lyricsOnly?' lyrics-only':''}" style="--song-font-size:${songFontSize}px">`;

  for(let lineIndex=0;lineIndex<song.lines.length;lineIndex++){
    const line=song.lines[lineIndex];
    const next=song.lines[lineIndex+1];

    if(line.t==='c' && next && next.t==='l'){
      html+=renderChordLyricPair(line.v,next.v,shift,line.anchors||null);
      lineIndex++;
      continue;
    }

    const cleanText=(line.v||'').trimStart();
    if(line.t==='c')html+=`<div class="chordline">${esc(transposeLine(cleanText,shift))}</div>`;
    else if(line.t==='l')html+=`<div class="lyricline lyrics-only-plain">${esc(cleanText)}</div>`;
    else if(line.t==='h')html+=`<div class="headline">${esc(cleanText)}</div>`;
    else html+='<div class="spacer"></div>';
  }

  main.innerHTML=html+'</div>';

  document.getElementById('backList').addEventListener('click',backToList);
  document.getElementById('songFavorite').addEventListener('click',()=>toggleFavorite(i));
  document.getElementById('songSetlist').addEventListener('click',()=>toggleSetlist(i));
  document.getElementById('songFeedback').addEventListener('click',()=>openFeedback(i));
  document.getElementById('lyricsOnlyToggle').addEventListener('click',()=>{
    lyricsOnly=!lyricsOnly;
    localStorage.setItem('lyricsOnlyMode',String(lyricsOnly));
    renderSong(i);
  });
  const prevBtn=document.getElementById('setlistPrev');
  const nextBtn=document.getElementById('setlistNext');
  if(prevBtn)prevBtn.addEventListener('click',()=>showSong(songIndexFromId(personalSetlist[setlistPosition(i)-1])));
  if(nextBtn)nextBtn.addEventListener('click',()=>showSong(songIndexFromId(personalSetlist[setlistPosition(i)+1])));
  document.getElementById('tUp').addEventListener('click',()=>{shiftState[i]=(shiftState[i]||0)+1;renderSong(i)});
  document.getElementById('tDown').addEventListener('click',()=>{shiftState[i]=(shiftState[i]||0)-1;renderSong(i)});
  const reset=document.getElementById('tReset');
  if(reset)reset.addEventListener('click',()=>{shiftState[i]=0;renderSong(i)});

  const changeFontSize=delta=>{
    songFontSize=Math.min(22,Math.max(12,songFontSize+delta));
    localStorage.setItem('songFontSize',songFontSize);
    const sheet=main.querySelector('.sheet');
    if(sheet)sheet.style.setProperty('--song-font-size',songFontSize+'px');
    const value=document.getElementById('fontValue');
    if(value)value.textContent=songFontSize+'px';
  };
  document.getElementById('fontDown').addEventListener('click',()=>changeFontSize(-1));
  document.getElementById('fontUp').addEventListener('click',()=>changeFontSize(1));
}
search.addEventListener('input',()=>renderTiles());
search.addEventListener('search',()=>renderTiles());
filterAll.addEventListener('click',()=>setListMode('all'));
filterFavorites.addEventListener('click',()=>setListMode('favorites'));
filterSetlist.addEventListener('click',()=>setListMode('setlist'));
shareSetlist.addEventListener('click',shareCurrentSetlist);
renameSetlist.addEventListener('click',()=>{
  const newName=prompt('Nome della scaletta:',personalSetlistName);
  if(newName===null)return;
  const cleanName=newName.trim().replace(/\s+/g,' ');
  if(!cleanName)return;
  personalSetlistName=cleanName.slice(0,40);
  localStorage.setItem('personalSetlistName',personalSetlistName);
  updateSetlistHeader();
});
clearSetlist.addEventListener('click',()=>{
  if(!personalSetlist.length)return;
  if(confirm('Vuoi svuotare la scaletta personale?')){
    personalSetlist=[];
    saveSetlist();
    renderTiles();
  }
});

generalFeedback.addEventListener('click',()=>openFeedback());
feedbackClose.addEventListener('click',closeFeedback);
feedbackModal.querySelectorAll('[data-close-feedback]').forEach(element=>element.addEventListener('click',closeFeedback));
feedbackForm.addEventListener('submit',submitFeedback);
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!feedbackModal.hidden)closeFeedback();
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
  });
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
    const r = await fetch("./search-suggestions.json");
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


// Blocco suggerimenti tematici ricerca
function renderThemeSuggestionsBlock(groups){
  if(!groups || !groups.length) return "";
  return `
    <div class="theme-suggestions">
      <h3>💡 Suggerimenti</h3>
      ${groups.map(g=>`
        <div class="theme-group">
          <h4>${g.title}</h4>
          ${g.songs.map(s=>`<div class="theme-song" data-song-id="${s.id}">${s.title}</div>`).join("")}
        </div>
      `).join("")}
    </div>
  `;
}
