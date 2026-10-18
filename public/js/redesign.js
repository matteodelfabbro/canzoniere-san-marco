/* Nuova grafica 2026 (beta refactor).
   Aggiunte che lavorano solo sulla pagina già disegnata da app.js:
   filtri, etichette nell'elenco, struttura del canto.
   Non tocca dati, login, preferiti, setlist né la cache offline. */
(function(){
  if(!document.documentElement.classList.contains('rd'))return;

  const GROUPS=[
    ['Messa',['Ingresso','Atto penitenziale','Gloria','Vangelo','Offertorio','Santo','Padre nostro','Pace','Agnello di Dio','Comunione','Finale']],
    ['Tempi liturgici',['Avvento','Natale','Quaresima','Pasqua']],
    ['Temi',['Lode','Meditazione','Maria','Spirito Santo']],
    ['Sacramenti',['Battesimo','Cresima']],
    ['Altro',['Altri canti']]
  ];
  const TAG_ORDER=GROUPS.flatMap(group=>group[1]);

  const tileList=document.getElementById('tileList');
  const main=document.getElementById('main');
  const search=document.getElementById('search');
  const searchField=search&&search.closest('.search-field');
  if(!tileList||!main||!search||!searchField)return;

  const norm=value=>String(value||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
  const allSongs=()=>(typeof songs!=='undefined'&&Array.isArray(songs))?songs:[];
  const allTags=()=>(typeof songsTags!=='undefined'&&songsTags)?songsTags:{};
  const tagsOf=id=>(allTags()[id]&&allTags()[id].tags)||[];
  const mainTag=id=>{
    const tags=tagsOf(id).filter(tag=>tag!=='Altri canti');
    return tags.sort((a,b)=>TAG_ORDER.indexOf(a)-TAG_ORDER.indexOf(b))[0]||'';
  };
  const isNarrow=()=>window.matchMedia('(max-width:820px)').matches;

  function searchFor(text){
    const all=document.getElementById('filterAll');
    if(all&&!all.classList.contains('active'))all.click();
    search.value=text;
    search.dispatchEvent(new Event('input',{bubbles:true}));
  }

  /* ---------- Tema: automatico / chiaro / scuro ---------- */
  const THEME_KEY='rdTheme';
  const THEMES=[['auto','Automatico'],['light','Chiaro'],['dark','Scuro']];
  const savedTheme=()=>{try{return localStorage.getItem(THEME_KEY)||'auto';}catch(error){return 'auto';}};
  function applyTheme(theme){
    if(theme==='light'||theme==='dark')document.documentElement.dataset.theme=theme;
    else delete document.documentElement.dataset.theme;
    const dark=theme==='dark'||(theme!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content='#16233d';
    document.documentElement.classList.toggle('rd-dark',dark);
  }
  applyTheme(savedTheme());
  const menuDivider=document.querySelector('#sectionMenu .section-menu-divider');
  if(menuDivider){
    const item=document.createElement('button');
    item.type='button';
    item.className='section-menu-item section-menu-secondary rd-theme-item';
    item.setAttribute('role','menuitem');
    const label=document.createElement('span');
    label.textContent='Tema';
    const value=document.createElement('em');
    item.append(label,value);
    const show=()=>{value.textContent=THEMES.find(entry=>entry[0]===savedTheme())[1];};
    item.addEventListener('click',event=>{
      event.stopPropagation();
      const index=THEMES.findIndex(entry=>entry[0]===savedTheme());
      const next=THEMES[(index+1)%THEMES.length][0];
      try{localStorage.setItem(THEME_KEY,next);}catch(error){/* resta valido fino alla chiusura */}
      applyTheme(next);
      show();
    });
    show();
    menuDivider.insertAdjacentElement('afterend',item);
  }

  /* ---------- Filtri ---------- */
  const filters=document.createElement('div');
  filters.className='rd-filters';
  filters.innerHTML=`<button class="rd-filters-toggle" type="button" aria-expanded="false" aria-controls="rdFiltersPanel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"></path></svg><span>Filtra</span>
    </button>
    <div class="rd-filters-panel" id="rdFiltersPanel" hidden></div>`;
  searchField.insertAdjacentElement('afterend',filters);
  const filtersToggle=filters.querySelector('.rd-filters-toggle');
  const filtersPanel=filters.querySelector('.rd-filters-panel');

  function buildFilters(){
    const counts={};
    Object.values(allTags()).forEach(entry=>(entry.tags||[]).forEach(tag=>{counts[tag]=(counts[tag]||0)+1;}));
    const current=norm(search.value);
    filtersPanel.replaceChildren();
    GROUPS.forEach(([name,tags])=>{
      const present=tags.filter(tag=>counts[tag]);
      if(!present.length)return;
      const label=document.createElement('div');
      label.className='rd-filters-group';
      label.textContent=name;
      const chips=document.createElement('div');
      chips.className='rd-chips';
      present.forEach(tag=>{
        const chip=document.createElement('button');
        chip.type='button';
        chip.className='rd-chip'+(norm(tag)===current?' active':'');
        chip.append(tag);
        const count=document.createElement('em');
        count.textContent=counts[tag];
        chip.append(count);
        chip.addEventListener('click',()=>{
          const active=norm(search.value)===norm(tag);
          searchFor(active?'':tag);
          setFiltersOpen(false);
        });
        chips.append(chip);
      });
      filtersPanel.append(label,chips);
    });
  }
  function setFiltersOpen(open){
    if(open)buildFilters();
    filtersPanel.hidden=!open;
    filtersToggle.setAttribute('aria-expanded',String(open));
  }
  filtersToggle.addEventListener('click',()=>setFiltersOpen(filtersPanel.hidden));

  /* ---------- Elenco: momento accanto all'autore ---------- */
  function decorateTiles(){
    const list=allSongs();
    if(!list.length)return;
    const byKey=new Map();
    list.forEach(song=>byKey.set(song.title+'\n'+(song.sub||''),song));
    tileList.querySelectorAll('.tile-title:not([data-rd])').forEach(title=>{
      title.dataset.rd='1';
      const small=title.querySelector('small');
      const name=(title.firstChild&&title.firstChild.nodeType===3?title.firstChild.textContent:'').trim();
      const song=byKey.get(name+'\n'+(small?small.textContent:''));
      const tag=song&&mainTag(song.id);
      if(!tag)return;
      if(small)small.append(' · '+tag);
      else{
        const added=document.createElement('small');
        added.textContent=tag;
        title.insertBefore(added,title.querySelector('.tile-book-num'));
      }
    });
  }

  /* ---------- Canto: etichette ---------- */
  function currentSongId(){
    const match=location.hash.match(/^#canto\/(.+)$/);
    const fromHash=match?decodeURIComponent(match[1]):null;
    if(fromHash&&allTags()[fromHash])return fromHash;
    // Senza indirizzo del canto (o con un alias) si risale dal titolo mostrato.
    const title=(main.querySelector('.song-title')||{}).textContent||'';
    const sub=(main.querySelector('.song-sub')||{}).textContent||'';
    const same=allSongs().filter(song=>song.title===title.trim());
    if(same.length<=1)return same[0]?same[0].id:fromHash;
    const exact=same.find(song=>song.sub&&sub.trim().startsWith(song.sub.replace(/\s*·\s*Capo.*$/i,'')));
    return (exact||same[0]).id;
  }
  function decorateSong(){
    const head=main.querySelector('.song-heading-text');
    const sheet=main.querySelector('.sheet');
    if(!head||!sheet)return;

    if(!head.querySelector('.rd-tags')){
      const id=currentSongId();
      const tags=id?tagsOf(id).filter(tag=>tag!=='Altri canti'):[];
      const box=document.createElement('div');
      box.className='rd-tags';
      tags.forEach(tag=>{
        const pill=document.createElement('button');
        pill.type='button';
        pill.className='rd-tag';
        pill.textContent=tag;
        pill.title=`Mostra i canti per: ${tag}`;
        pill.addEventListener('click',()=>{
          searchFor(tag);
          if(isNarrow()){
            const back=document.getElementById('backList');
            if(back)back.click();
          }
        });
        box.append(pill);
      });
      box.hidden=!tags.length;
      head.append(box);
    }

    if(!main.querySelector('.rd-ev-next')){
      const next=renderEventNext();
      if(next)sheet.insertAdjacentElement('afterend',next);
    }
  }

  /* ---------- Home: "Che cosa cantiamo oggi?" ---------- */
  const RECENT_KEY='rdRecentSongs';
  const MASS_MOMENTS=GROUPS[0][1];
  const app=document.querySelector('.app');
  const home=document.createElement('section');
  home.id='rdHome';
  home.setAttribute('aria-label','Oggi');
  if(app)app.append(home);

  const readJson=(key,fallback)=>{
    try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback;}
    catch(error){return fallback;}
  };
  const songById=id=>allSongs().find(song=>song.id===id);
  function openSong(id){
    location.hash='#canto/'+encodeURIComponent(id);
  }
  function showListView(buttonId){
    document.body.classList.remove('rd-at-home');
    const button=document.getElementById(buttonId);
    if(button&&!button.classList.contains('active'))button.click();
    updateTabbar();
    window.scrollTo({top:0,behavior:'auto'});
  }
  // Uso personale dei canti, solo su questo dispositivo: {id:{n:aperture,t:ultima}}.
  const USE_KEY='rdSongUse';
  let countedId='';
  function rememberSong(){
    if(!document.body.classList.contains('song-open')){countedId='';return;}
    const id=currentSongId();
    if(!id||!songById(id))return;
    const recent=readJson(RECENT_KEY,[]).filter(item=>item!==id);
    recent.unshift(id);
    try{localStorage.setItem(RECENT_KEY,JSON.stringify(recent.slice(0,24)));}catch(error){/* spazio pieno: pazienza */}
    // Lo stesso canto rimasto aperto non si conta due volte.
    if(id===countedId)return;
    countedId=id;
    const use=readJson(USE_KEY,{});
    const entry=use[id]||{n:0,t:0};
    use[id]={n:entry.n+1,t:Date.now()};
    try{localStorage.setItem(USE_KEY,JSON.stringify(use));}catch(error){/* spazio pieno: pazienza */}
  }
  // "Più usati": contano le aperture, ma quelle vecchie pesano meno
  // (dimezzano ogni ~3 mesi), così sale in cima il repertorio del periodo.
  function mostUsedIds(){
    const use=readJson(USE_KEY,{});
    const now=Date.now();
    return Object.entries(use)
      .filter(([id,entry])=>songById(id)&&entry.n>=2)
      .map(([id,entry])=>[id,entry.n*Math.pow(.5,(now-entry.t)/(90*864e5))])
      .sort((a,b)=>b[1]-a[1])
      .map(([id])=>id);
  }
  // Più aperti da tutti (Firestore songStats), letti una volta per visita.
  let globalTop=null;
  let globalLoading=false;
  function loadGlobalTop(){
    if(globalTop||globalLoading||!window.firebase?.firestore)return;
    globalLoading=true;
    firebase.firestore().collection('songStats').orderBy('openCount','desc').limit(80).get()
      .then(snapshot=>{
        globalTop=snapshot.docs.map(doc=>doc.id).filter(id=>songById(id));
        if(document.body.classList.contains('rd-at-home'))renderHome();
      })
      .catch(error=>console.warn('Classifica canti non disponibile.',error))
      .finally(()=>{globalLoading=false;});
  }
  // Signore pietà, Gloria, Santo e Agnello hanno più versioni e le aperture si
  // dividono tra queste: la versione più aperta di ciascuno entra comunque.
  const ORDINARY=['Atto penitenziale','Gloria','Santo','Agnello di Dio'];
  function withOrdinary(ids,size=SHELF_SIZE){
    const tags=allTags();
    const hasTag=(id,tag)=>(tags[id]?.tags||[]).includes(tag);
    const picked=ids.slice(0,size);
    ORDINARY.forEach(tag=>{
      if(picked.some(id=>hasTag(id,tag)))return;
      const best=ids.find(id=>hasTag(id,tag));
      if(!best)return;
      // Nella top ten il posto si libera togliendo l'ultimo canto non di Messa.
      if(size===TOP_SIZE){
        for(let i=picked.length-1;i>=0;i--){
          if(!ORDINARY.some(t=>hasTag(picked[i],t))){picked.splice(i,1);break;}
        }
      }
      picked.push(best);
    });
    return picked.sort((a,b)=>ids.indexOf(a)-ids.indexOf(b));
  }
  const SHELF_KEY='rdHomeShelf';
  const SHELF_SIZE=8;
  const TOP_SIZE=10;

  function el(tag,className,text){
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  const svg=path=>`<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
  const ICON_LIST=svg('<path d="M4 6h10M4 12h7M4 18h8M18 8v6M15 11h6"></path>');
  const ICON_NEXT=svg('<path d="m9 18 6-6-6-6"></path>');
  const ICON_PLAY=svg('<path d="M7 4v16l13-8z"></path>');
  const ICON_SEARCH=svg('<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>');

  /* Scalette della parrocchia (Castelmonte, Natale, Pasqua…): archivio nella
     sezione Setlist, la più recente in alto. Per aggiungerne una basta un
     nuovo elemento in cima. "home":{from,until} la mette anche in cima alla
     home in quei giorni. id:null = canto non ancora nel canzoniere. */
  const SCALETTE=[
    {
      id:'castelmonte-2026',
      title:'Pellegrinaggio a Castelmonte',
      when:'Domenica 11 ottobre 2026',
      songs:[
        ['Ingresso','ave-maria'],
        ['Atto penitenziale','signore-pieta-versione-2'],
        ['Gloria','gloria-gen-verde'],
        ['Vangelo','alleluia-buttazzo'],
        ['Offertorio','benedizione-a-frate-leone'],
        ['Santo','santo-gen-messa-come-fuoco-vivo'],
        ['Comunione','re-dei-re-capo-1'],
        ['Finale','salve-regina']
      ]
    }
  ];
  const ACTIVE_KEY='rdScalettaAttiva';
  const scalettaById=id=>SCALETTE.find(item=>item.id===id);
  const scalettaOnHome=()=>SCALETTE.find(item=>{
    const now=Date.now();
    return item.home&&now>=Date.parse(item.home.from)&&now<=Date.parse(item.home.until);
  });
  // Si ricorda quale scaletta si sta seguendo, per il "Prossimo" in fondo ai canti.
  function followScaletta(item,songId){
    try{sessionStorage.setItem(ACTIVE_KEY,item.id);}catch(error){/* niente "Prossimo" */}
    openSong(songId);
  }
  function renderScaletta(item){
    const card=el('section','rd-ev');
    const head=el('div','rd-ev-head');
    head.append(el('div','rd-ev-kicker','Scaletta della Messa'),el('h3','',item.title),el('p','',item.when));
    const firstId=item.songs.map(entry=>entry[1]).find(id=>id&&songById(id));
    if(firstId){
      const go=el('button','rd-sl-go');
      go.type='button';
      go.innerHTML=ICON_PLAY+'<span>Inizia</span>';
      go.addEventListener('click',()=>followScaletta(item,firstId));
      head.append(go);
    }
    const list=el('ol','rd-ev-list');
    item.songs.forEach(([moment,id,fallback])=>{
      const song=id&&songById(id);
      const row=el(song?'button':'div','rd-ev-row'+(song?'':' is-missing'));
      if(song){
        row.type='button';
        row.addEventListener('click',()=>followScaletta(item,song.id));
      }
      const text=el('span','rd-ev-text');
      text.append(el('small','',moment),el('b','',song?song.title:fallback));
      const note=song?(song.sub||''):'Non ancora nel canzoniere';
      if(note)text.append(el('em','',note));
      row.append(text);
      if(song)row.insertAdjacentHTML('beforeend',ICON_NEXT);
      const li=el('li');
      li.append(row);
      list.append(li);
    });
    card.append(head,list);
    return card;
  }

  // Archivio nella sezione Setlist: una riga per scaletta, si apre al tocco.
  function renderArchive(){
    const library=document.getElementById('setlistLibrary');
    const grid=document.getElementById('cloudSetlistsList');
    if(!library||!grid||library.querySelector('.rd-arch')||!allSongs().length)return;
    const box=el('div','rd-arch');
    box.append(el('h3','rd-arch-title','Scalette della parrocchia'));
    SCALETTE.forEach(item=>{
      const details=el('details','rd-arch-item');
      const summary=el('summary');
      const text=el('span','rd-arch-text');
      text.append(el('b','',item.title),el('small','',item.when));
      summary.append(text);
      summary.insertAdjacentHTML('beforeend',ICON_NEXT);
      details.append(summary,renderScaletta(item).querySelector('.rd-ev-list'));
      box.append(details);
    });
    box.append(el('h3','rd-arch-title','Le tue setlist'));
    library.querySelector('.setlist-library-heading').after(box);
  }

  // In fondo a un canto della scaletta: il canto successivo, senza tornare alla home.
  function renderEventNext(){
    let active=null;
    try{active=scalettaById(sessionStorage.getItem(ACTIVE_KEY));}catch(error){/* nessuna */}
    active=active||scalettaOnHome();
    if(!active)return null;
    const steps=active.songs.filter(item=>item[1]&&songById(item[1]));
    const index=steps.findIndex(item=>item[1]===currentSongId());
    if(index<0)return null;
    const box=el('nav','rd-ev-next');
    box.setAttribute('aria-label','Scaletta');
    const following=steps[index+1];
    if(following){
      const go=el('button','rd-ev-next-go');
      go.type='button';
      const text=el('span','rd-ev-text');
      text.append(el('small','','Prossimo · '+following[0]),el('b','',songById(following[1]).title));
      go.append(text);
      go.insertAdjacentHTML('beforeend',ICON_NEXT);
      go.addEventListener('click',()=>{openSong(following[1]);window.scrollTo({top:0,behavior:'auto'});});
      box.append(go);
    }else{
      box.append(el('p','rd-ev-next-end','Ultimo canto della scaletta'));
    }
    return box;
  }

  function renderHome(){
    if(!allSongs().length)return;
    const box=el('div','rd-home');

    const fakeSearch=el('button','rd-home-search');
    fakeSearch.type='button';
    fakeSearch.innerHTML=ICON_SEARCH+'<span>Cerca titolo, parole o numero…</span>';
    fakeSearch.addEventListener('click',()=>{showListView('filterAll');search.focus();});

    box.append(fakeSearch);
    const event=scalettaOnHome();
    if(event)box.append(renderScaletta(event));

    // I tuoi canti: recenti / più usati da te / più aperti da tutti, in schede.
    loadGlobalTop();
    const shelves=[
      ['recenti','Recenti',readJson(RECENT_KEY,[]).slice(0,SHELF_SIZE)],
      ['tuoi','Aperti di frequente',withOrdinary(mostUsedIds())],
      ['tutti','Top ten',withOrdinary(globalTop||[],TOP_SIZE)]
    ].map(([key,label,ids])=>[key,label,ids.map(songById).filter(Boolean)])
     .filter(([,,songs])=>songs.length);
    if(shelves.length){
      let current=null;
      try{current=localStorage.getItem(SHELF_KEY);}catch(error){/* niente */}
      if(!shelves.some(([key])=>key===current))current=shelves[0][0];
      const tabs=el('div','rd-chips rd-shelf-tabs');
      tabs.setAttribute('role','tablist');
      const grid=el('div','rd-recent');
      const show=key=>{
        tabs.querySelectorAll('button').forEach(button=>{
          const on=button.dataset.key===key;
          button.classList.toggle('active',on);
          button.setAttribute('aria-selected',String(on));
        });
        const songs=shelves.find(([name])=>name===key)[2];
        grid.replaceChildren(...songs.map((song,index)=>{
          const button=el('button');
          button.type='button';
          if(key!=='recenti')button.append(el('i','',String(index+1)));
          button.append(el('b','',song.title),el('small','',[song.sub,mainTag(song.id)].filter(Boolean).join(' · ')||' '));
          button.addEventListener('click',()=>openSong(song.id));
          return button;
        }));
      };
      shelves.forEach(([key,label])=>{
        const tab=el('button','rd-chip',label);
        tab.type='button';
        tab.dataset.key=key;
        tab.setAttribute('role','tab');
        tab.addEventListener('click',()=>{
          try{localStorage.setItem(SHELF_KEY,key);}catch(error){/* niente */}
          show(key);
        });
        tabs.append(tab);
      });
      show(current);
      box.append(el('h3','','I tuoi canti'),tabs,grid);
    }

    const counts={};
    Object.values(allTags()).forEach(entry=>(entry.tags||[]).forEach(tag=>{counts[tag]=(counts[tag]||0)+1;}));
    const steps=el('div','rd-steps');
    MASS_MOMENTS.filter(tag=>counts[tag]).forEach((tag,index)=>{
      const step=el('button','rd-step');
      step.type='button';
      step.append(el('i','',String(index+1)),el('b','',tag),el('small','',String(counts[tag])));
      step.addEventListener('click',()=>{
        document.body.classList.remove('rd-at-home');
        searchFor(tag);
        updateTabbar();
        window.scrollTo({top:0,behavior:'auto'});
      });
      steps.append(step);
    });
    box.append(el('h3','','Momenti della Messa'),steps);

    home.replaceChildren(box);
  }

  /* Barra in basso (telefono e iPad verticale) */
  const tabbar=el('nav','rd-tabbar');
  tabbar.setAttribute('aria-label','Sezioni');
  const TABS=[
    ['home','Oggi',svg('<path d="m3 11 9-7 9 7v9H3z"></path><path d="M10 20v-6h4v6"></path>')],
    ['filterAll','Canti',svg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"></path><path d="M4 19V5"></path>')],
    ['filterFavorites','Preferiti',svg('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"></path>')],
    ['filterSetlist','Setlist',ICON_LIST]
  ];
  TABS.forEach(([target,label,icon])=>{
    const button=el('button');
    button.type='button';
    button.dataset.target=target;
    button.innerHTML=icon+`<span>${label}</span>`;
    button.addEventListener('click',()=>{
      if(target==='home'){
        document.body.classList.add('rd-at-home');
        renderHome();
        updateTabbar();
        window.scrollTo({top:0,behavior:'auto'});
      }else showListView(target);
    });
    tabbar.append(button);
  });
  document.body.append(tabbar);
  function updateTabbar(){
    const onHome=document.body.classList.contains('rd-at-home');
    tabbar.querySelectorAll('button').forEach(button=>{
      const target=button.dataset.target;
      const active=target==='home'?onHome:(!onHome&&document.getElementById(target)?.classList.contains('active'));
      button.classList.toggle('active',Boolean(active));
    });
  }

  // Tocco sull'intestazione: si torna alla home.
  const header=document.querySelector('body > header');
  const brand=header&&header.querySelector('h1');
  if(brand){
    brand.setAttribute('aria-label','Canzoniere San Marco, Udine: torna a Oggi');
    brand.innerHTML='<span class="rd-brand-name">Canzoniere</span><span class="rd-brand-place">Parrocchia San Marco · Udine</span>';
  }
  if(header)header.addEventListener('click',()=>{
    document.body.classList.add('rd-at-home');
    if(document.body.classList.contains('song-open')){
      const back=document.getElementById('backList');
      if(back)back.click();
    }
    renderHome();
    updateTabbar();
    window.scrollTo({top:0,behavior:'auto'});
  });

  // All'avvio senza un canto nell'indirizzo si parte dalla home.
  if(!/^#canto[/-]/.test(location.hash))document.body.classList.add('rd-at-home');
  let wasSongOpen=document.body.classList.contains('song-open');
  new MutationObserver(()=>{
    const open=document.body.classList.contains('song-open');
    if(open===wasSongOpen)return;
    wasSongOpen=open;
    if(open){
      rememberSong();
      // Se l'elenco scorre per conto suo, porta in vista il canto aperto.
      const board=document.querySelector('.board');
      const active=tileList.querySelector('.tile.active');
      if(board&&active&&getComputedStyle(board).overflowY==='auto'){
        const box=board.getBoundingClientRect();
        const row=active.getBoundingClientRect();
        const visibleBottom=Math.min(box.bottom,window.innerHeight);
        if(row.top<box.top+70||row.bottom>visibleBottom-10){
          board.scrollTop+=row.top-box.top-(visibleBottom-box.top)/2+row.height/2;
        }
      }
    }
    else{renderHome();updateTabbar();}
  }).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.getElementById('sectionMenu')?.addEventListener('click',()=>setTimeout(updateTabbar,0));

  new MutationObserver(()=>{decorateSong();rememberSong();}).observe(main,{childList:true});
  new MutationObserver(()=>{decorateTiles();if(!home.firstChild)renderHome();renderArchive();}).observe(tileList,{childList:true});
  decorateTiles();
  decorateSong();
  renderHome();
  renderArchive();
  updateTabbar();

  /* ---------- Versione nuova pubblicata: avviso "Aggiorna" ----------
     Nell'app installata non c'è il "tira per aggiornare": quando si torna
     nel canzoniere si confrontano i file ?v= della pagina con quelli
     pubblicati e, se sono cambiati, basta un tocco per ricaricare. */
  const versioned=root=>[...root.querySelectorAll('script[src],link[rel="stylesheet"][href]')]
    .map(node=>node.getAttribute('src')||node.getAttribute('href'))
    .filter(url=>/\?v=/.test(url)).sort().join(' ');
  const loadedVersion=versioned(document);
  let updateBanner=null;
  async function checkForUpdate(){
    if(updateBanner||navigator.onLine===false||document.visibilityState!=='visible')return;
    try{
      const response=await fetch('/index.html',{cache:'no-store'});
      if(!response.ok)return;
      const page=new DOMParser().parseFromString(await response.text(),'text/html');
      const published=versioned(page);
      if(!published||published===loadedVersion)return;
      updateBanner=el('div','rd-update');
      updateBanner.setAttribute('role','status');
      const reload=el('button','rd-sl-go','Aggiorna');
      reload.type='button';
      reload.addEventListener('click',()=>location.reload());
      updateBanner.append(el('span','','Nuova versione del canzoniere'),reload);
      document.body.append(updateBanner);
      // Anche in fondo, accanto al bollino offline.
      const offlineLine=document.getElementById('offlineStatus');
      if(offlineLine){
        const refresh=el('button','rd-refresh','Aggiorna');
        refresh.type='button';
        refresh.addEventListener('click',()=>location.reload());
        offlineLine.append(refresh);
      }
    }catch(error){/* offline o rete lenta: si riprova al prossimo ritorno */}
  }
  document.addEventListener('visibilitychange',checkForUpdate);
  window.addEventListener('online',checkForUpdate);
  setTimeout(checkForUpdate,4000);
})();
