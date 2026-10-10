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

  /* ---------- Canto: etichette e struttura ---------- */
  function shortName(heading){
    const text=heading.trim();
    const number=(text.match(/\d+/)||[''])[0];
    if(/^(ritornello|refrain)/i.test(text))return 'R'+number;
    if(/^strofa/i.test(text))return 'S'+number;
    if(/^intro/i.test(text))return 'Intro';
    if(/^(ponte|bridge)/i.test(text))return 'Ponte';
    if(/^(finale|coda|outro|conclusione)/i.test(text))return 'Fine';
    if(/^interludio/i.test(text))return 'Int'+number;
    return text.length>10?text.slice(0,9)+'…':text;
  }
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

    if(!main.querySelector('.rd-struct')){
      const nav=document.createElement('nav');
      nav.className='rd-struct';
      nav.setAttribute('aria-label','Struttura del canto');
      sheet.querySelectorAll('.song-section').forEach(section=>{
        const heading=section.querySelector('.headline, .repeat-section-title');
        const text=heading&&heading.textContent.trim();
        if(!text||section.children.length<2)return;
        const button=document.createElement('button');
        button.type='button';
        button.textContent=shortName(text);
        button.title=text;
        if(section.classList.contains('refrain-section'))button.className='refrain';
        button.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth',block:'start'}));
        nav.append(button);
      });
      if(nav.children.length>=3)sheet.insertAdjacentElement('beforebegin',nav);
      else{
        nav.hidden=true;
        sheet.insertAdjacentElement('beforebegin',nav);
      }
    }
  }

  new MutationObserver(decorateTiles).observe(tileList,{childList:true});
  new MutationObserver(decorateSong).observe(main,{childList:true});
  decorateTiles();
  decorateSong();
})();
