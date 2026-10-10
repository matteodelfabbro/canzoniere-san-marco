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
        title.append(added);
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
  function rememberSong(){
    if(!document.body.classList.contains('song-open'))return;
    const id=currentSongId();
    if(!id||!songById(id))return;
    const recent=readJson(RECENT_KEY,[]).filter(item=>item!==id);
    recent.unshift(id);
    try{localStorage.setItem(RECENT_KEY,JSON.stringify(recent.slice(0,8)));}catch(error){/* spazio pieno: pazienza */}
  }

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

  /* Evento speciale in cima alla home: si mostra solo tra "from" e "until".
     Per un prossimo evento basta cambiare questi dati; id:null = canto non
     ancora nel canzoniere (resta in scaletta col solo titolo). */
  const EVENT={
    title:'Pellegrinaggio a Castelmonte',
    when:'Domenica 11 ottobre 2026 · Santa Messa',
    from:'2026-10-10T00:00:00+02:00',
    until:'2026-10-12T06:00:00+02:00',
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
  };
  function renderEvent(){
    const now=Date.now();
    if(now<Date.parse(EVENT.from)||now>Date.parse(EVENT.until))return null;
    const card=el('section','rd-ev');
    const head=el('div','rd-ev-head');
    head.append(el('div','rd-ev-kicker','Scaletta della Messa'),el('h3','',EVENT.title),el('p','',EVENT.when));
    const firstId=EVENT.songs.map(item=>item[1]).find(id=>id&&songById(id));
    if(firstId){
      const go=el('button','rd-sl-go');
      go.type='button';
      go.innerHTML=ICON_PLAY+'<span>Inizia</span>';
      go.addEventListener('click',()=>openSong(firstId));
      head.append(go);
    }
    const list=el('ol','rd-ev-list');
    EVENT.songs.forEach(([moment,id,fallback])=>{
      const song=id&&songById(id);
      const row=el(song?'button':'div','rd-ev-row'+(song?'':' is-missing'));
      if(song){
        row.type='button';
        row.addEventListener('click',()=>openSong(song.id));
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

  // In fondo a un canto della scaletta: il canto successivo, senza tornare alla home.
  function renderEventNext(){
    const now=Date.now();
    if(now<Date.parse(EVENT.from)||now>Date.parse(EVENT.until))return null;
    const steps=EVENT.songs.filter(item=>item[1]&&songById(item[1]));
    const index=steps.findIndex(item=>item[1]===currentSongId());
    if(index<0)return null;
    const box=el('nav','rd-ev-next');
    box.setAttribute('aria-label','Scaletta');
    const back=el('button','rd-ev-next-back',`${EVENT.title} · ${index+1} di ${steps.length}`);
    back.type='button';
    back.addEventListener('click',()=>{
      const header=document.querySelector('body > header');
      if(header)header.click();
    });
    box.append(back);
    const following=steps[index+1];
    if(following){
      const go=el('button','rd-ev-next-go');
      go.type='button';
      const text=el('span','rd-ev-text');
      text.append(el('small','','Prossimo · '+following[0]),el('b','',songById(following[1]).title));
      const sub=songById(following[1]).sub;
      if(sub)text.append(el('em','',sub));
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
    fakeSearch.innerHTML=ICON_SEARCH+'<span>Cerca titolo o parole…</span>';
    fakeSearch.addEventListener('click',()=>{showListView('filterAll');search.focus();});

    const today=new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'});
    box.append(fakeSearch,el('div','rd-eyebrow',today),el('h2','', 'Che cosa cantiamo oggi?'));
    const event=renderEvent();
    if(event)box.append(event);

    // Setlist attiva: è quella che il sito tiene già salvata sul dispositivo.
    const ids=readJson('personalSetlist',[]).filter(id=>songById(id));
    const name=localStorage.getItem('personalSetlistName')||'La mia Setlist';
    const card=el('section','rd-sl');
    const head=el('div','rd-sl-head');
    const icon=el('span','rd-sl-icon');
    icon.innerHTML=ICON_LIST;
    const text=el('span','rd-sl-text');
    text.append(el('b','',name),el('small','',ids.length
      ?`${ids.length} ${ids.length===1?'canto':'canti'}`
      :'Ancora vuota: aggiungi i canti con il pulsante setlist accanto al titolo.'));
    head.append(icon,text);
    if(ids.length){
      const go=el('button','rd-sl-go');
      go.type='button';
      go.innerHTML=ICON_PLAY+'<span>Inizia</span>';
      go.addEventListener('click',()=>openSong(ids[0]));
      head.append(go);
    }
    const summary=el('button','rd-sl-sum');
    summary.type='button';
    summary.append(el('span','',ids.length?ids.map(id=>songById(id).title).join('  ·  '):'Apri le setlist'));
    summary.insertAdjacentHTML('beforeend',ICON_NEXT);
    summary.addEventListener('click',()=>showListView('filterSetlist'));
    card.append(head,summary);
    box.append(card);

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

    const recent=readJson(RECENT_KEY,[]).map(songById).filter(Boolean).slice(0,3);
    if(recent.length){
      const grid=el('div','rd-recent');
      recent.forEach(song=>{
        const button=el('button');
        button.type='button';
        button.append(el('b','',song.title),el('small','',[song.sub,mainTag(song.id)].filter(Boolean).join(' · ')||' '));
        button.addEventListener('click',()=>openSong(song.id));
        grid.append(button);
      });
      box.append(el('h3','','Aperti di recente'),grid);
    }
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
  new MutationObserver(()=>{decorateTiles();if(!home.firstChild)renderHome();}).observe(tileList,{childList:true});
  decorateTiles();
  decorateSong();
  renderHome();
  updateTabbar();
})();
