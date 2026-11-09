(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const qs=new URLSearchParams(location.search);
const money=n=>'$'+Number(n).toFixed(2);

/* dispatch countdown: next 12pm Melbourne cut-off, weekdays */
const cd=$('[data-count]');
if(cd){const tick=()=>{const now=new Date();const t=new Date(now);t.setHours(12,0,0,0);if(now>=t)t.setDate(t.getDate()+1);while([0,6].includes(t.getDay()))t.setDate(t.getDate()+1);const m=Math.floor((t-now)/60000);cd.textContent=Math.floor(m/60)+'h '+(m%60)+'m'};tick();setInterval(tick,30000)}

/* mega menus: hover on desktop, tap anywhere */
const items=$$('.cats>li[data-menu]');
const closeAll=()=>{items.forEach(i=>{i.classList.remove('open');i.querySelector('button').setAttribute('aria-expanded','false')})};
const open=i=>{closeAll();i.classList.add('open');i.querySelector('button').setAttribute('aria-expanded','true')};
const hover=matchMedia('(hover:hover) and (min-width:821px)').matches;
items.forEach(i=>{const b=i.querySelector('button');
  b.addEventListener('click',e=>{e.stopPropagation();i.classList.contains('open')?closeAll():open(i)});
  if(hover){let t;i.addEventListener('mouseenter',()=>{clearTimeout(t);open(i)});i.addEventListener('mouseleave',()=>{t=setTimeout(closeAll,180)})}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll();closeSuggest();closeSheet()}});
document.addEventListener('click',e=>{if(!e.target.closest('.cats'))closeAll();if(!e.target.closest('.search'))closeSuggest()});
const dl=qs.get('menu');if(dl){const m=$(`.cats>li[data-menu="${dl}"]`);if(m){if(innerWidth<=820)$('.catbar').classList.add('open');open(m)}}

/* phone menu */
const mb=$('.menu-btn');if(mb)mb.addEventListener('click',e=>{e.stopPropagation();const o=$('.catbar').classList.toggle('open');mb.setAttribute('aria-expanded',o)});
$('.catbar')&&$('.catbar').addEventListener('click',e=>e.stopPropagation());

/* search with real product suggestions */
const inp=$('.search input'),sug=$('.suggest');
if(inp&&innerWidth<=820)inp.placeholder='Search tackle, fish or brands';
function closeSuggest(){sug&&sug.classList.remove('open')}
function runSearch(){const q=inp.value.trim().toLowerCase();const D=window.AOF_LURES||[];const X=Object.values(window.AOF_EXTRA||{}).flat();
  if(!q){closeSuggest();return}
  const hits=[...D,...X].filter(p=>(p.brand+' '+p.name).toLowerCase().includes(q)||p.species.some(s=>s.toLowerCase().includes(q))||p.styles.some(s=>s.toLowerCase().includes(q))).slice(0,4);
  const sp=(window.AOF_SPECIES||[]).filter(s=>s.toLowerCase().includes(q)).slice(0,3);
  $('.terms',sug).innerHTML='<h3>Shop by</h3>'+sp.map(s=>`<a href="lures.html?species=${encodeURIComponent(s)}"><b>${s}</b> lures</a>`).join('')+`<a href="lures.html"><b>${inp.value.trim()}</b> in all lures</a><a href="#">Setup Builder for <b>${inp.value.trim()}</b></a>`;
  $('.hits',sug).innerHTML='<h3>Products</h3>'+(hits.map(p=>`<a class="hit" href="product.html"><img src="${p.img}" alt="" width="56" height="56" loading="lazy"><span class="n">${p.name}<small>${p.brand}</small></span><span class="p">${money(p.price)}</span></a>`).join('')||'<p>No matches in this sample. Try a brand or a fish.</p>');
  sug.classList.add('open')}
if(inp){inp.addEventListener('input',runSearch);inp.addEventListener('focus',runSearch);if(qs.get('search')){inp.value=qs.get('search');runSearch()}}

/* add to cart feedback */
const cartN=$('.tools .cart .n');let cart=0;
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(!a)return;e.preventDefault();cart++;if(cartN){cartN.hidden=false;cartN.textContent=cart}
  const txt=a.textContent;a.textContent='Added';a.classList.add('done');setTimeout(()=>{a.textContent=txt;a.classList.remove('done')},1200)});

/* segmented control + home lure picker */
$$('.seg').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',s).forEach(x=>x.setAttribute('aria-pressed',x===b));s.dispatchEvent(new CustomEvent('seg',{detail:b.dataset.v,bubbles:true}))}));
const pk=$('.pick');
if(pk){let water='',sp=new Set(),st=new Set();
  const go=$('#pick-go');const upd=()=>{const u=new URLSearchParams();if(water)u.set('water',water);if(sp.size)u.set('species',[...sp].join('|'));if(st.size)u.set('styles',[...st].join('|'));go.href='lures.html?'+u};
  pk.addEventListener('seg',e=>{water=e.detail;upd()});
  $$('[data-sp]',pk).forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.sp;sp.has(v)?sp.delete(v):sp.add(v);b.setAttribute('aria-pressed',sp.has(v));upd()}));
  $$('[data-st]',pk).forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.st;st.has(v)?st.delete(v):st.add(v);b.setAttribute('aria-pressed',st.has(v));upd()}));upd()}

/* poster note */
const pos=$('.poster'),note=$('.note');if(pos)pos.addEventListener('click',()=>{note.classList.add('on');setTimeout(()=>note.classList.remove('on'),5200)});

/* lure browser */
const grid=$('#grid');
let closeSheet=()=>{};
if(grid){
  const D=window.AOF_LURES;
  const STY=['Hardbodies','Jerkbaits','Surface & Topwater','Soft Plastics','Stickbaits','Crankbaits','Poppers','Vibes & Blades','Casting Metals','Jigs','Squid Jigs','Spoons','Spinnerbaits','Spinners'];
  const POP=['Snapper','Flathead','Australian Salmon','Trout','Bream','King George Whiting','Calamari','Mulloway'];
  const allSp=[...new Set(D.flatMap(p=>p.species))].sort();
  const others=allSp.filter(s=>!POP.includes(s));
  const S={water:'',species:new Set(),styles:new Set()};
  const demo=qs.get('demo')==='trout';
  if(demo){S.species.add('Trout');S.styles.add('Jerkbaits');S.styles.add('Surface & Topwater')}
  if(qs.get('water'))S.water=qs.get('water');
  (qs.get('species')||'').split('|').filter(Boolean).forEach(s=>S.species.add(s));
  (qs.get('styles')||'').split('|').filter(Boolean).forEach(s=>S.styles.add(s));
  const match=(p,ig)=>(ig==='water'||!S.water||p.water.includes(S.water))&&(ig==='species'||!S.species.size||p.species.some(x=>S.species.has(x)))&&(ig==='styles'||!S.styles.size||p.styles.some(x=>S.styles.has(x)));
  const listSp=$('#sp-list'),listSp2=$('#style-sheet'),rowSt=$('#style-chips');
  const spFilter=$('#sp-find');
  function draw(){
    const q=(spFilter.value||'').toLowerCase();
    const pool=D.filter(p=>match(p,'species'));
    const li=s=>{const n=pool.filter(p=>p.species.includes(s)).length;return `<li class="${POP.includes(s)?'pop':''}"><label><input type="checkbox" data-sp="${s}" ${S.species.has(s)?'checked':''}> ${s}<small>${n}</small></label></li>`};
    listSp.innerHTML=[...POP,...others].filter(s=>s.toLowerCase().includes(q)).map(li).join('');
    const pool2=D.filter(p=>match(p,'styles'));
    const chip=s=>{const n=pool2.filter(p=>p.styles.includes(s)).length;return `<button class="chip" type="button" data-st="${s}" aria-pressed="${S.styles.has(s)}">${s} <small>${n}</small></button>`};
    rowSt.innerHTML=STY.map(chip).join('');
    listSp2.innerHTML=STY.map(chip).join('');
    const R=D.filter(p=>match(p));
    const join=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
    const st=[...S.styles],sp=[...S.species];
    let line=R.length+' '+(st.length?join(st.map(s=>s.toLowerCase())):'lures');
    if(S.water)line+=' for '+S.water.toLowerCase();
    if(sp.length)line+=(S.water?', chasing ':' for ')+join(sp.map(s=>s.replace(/^[A-Z](?=[a-z]+( |$))/,c=>c)));
    $('#res').textContent=line;
    const act=[];
    if(S.water)act.push(`<button type="button" data-rm="water:${S.water}"><b>${S.water}</b> ✕</button>`);
    sp.forEach(s=>act.push(`<button type="button" data-rm="species:${s}"><b>${s}</b> ✕</button>`));
    st.forEach(s=>act.push(`<button type="button" data-rm="styles:${s}"><b>${s}</b> ✕</button>`));
    if(act.length)act.push('<button type="button" class="clear" data-rm="all">Clear all</button>');
    $('#active').innerHTML=act.join('');
    grid.innerHTML=R.length?R.slice(0,48).map(p=>`<article class="pc"><a class="pic" href="product.html"><img src="${p.img}" alt="${p.name}" width="400" height="400" loading="lazy"></a><div class="br">${p.brand}</div><h3><a href="product.html">${p.name}</a></h3><div class="tags">${p.styles.slice(0,2).map(s=>`<span>${s}</span>`).join('')}</div><div class="row"><span class="pr">${money(p.price)}</span><span class="st">In stock</span></div>${p.opts>1?`<a class="add" href="product.html" style="display:grid;place-items:center;text-decoration:none">Choose from ${p.opts} colours</a>`:`<button class="add" type="button" data-add>Add to cart</button>`}</article>`).join(''):'<div class="empty" style="grid-column:1/-1"><strong>Nothing in this sample matches.</strong><br>Remove a filter above, or call the shop on (03) 5222 3257 and we will find it for you.</div>';
    $$('.seg button',$('.water')).forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v||'')===S.water));
    $('#sheet-n').textContent='Show '+R.length+' lures';
  }
  document.addEventListener('change',e=>{const c=e.target.closest('[data-sp]');if(c&&c.matches('input')){c.checked?S.species.add(c.dataset.sp):S.species.delete(c.dataset.sp);draw()}});
  document.addEventListener('click',e=>{const c=e.target.closest('.chip[data-st]');if(c){const v=c.dataset.st;S.styles.has(v)?S.styles.delete(v):S.styles.add(v);draw()}
    const r=e.target.closest('[data-rm]');if(r){const v=r.dataset.rm;if(v==='all'){S.water='';S.species.clear();S.styles.clear()}else{const i=v.indexOf(':'),k=v.slice(0,i),x=v.slice(i+1);k==='water'?S.water='':S[k].delete(x)}draw()}});
  $('.water').addEventListener('seg',e=>{S.water=e.detail;draw()});
  spFilter.addEventListener('input',draw);
  const side=$('.side'),back=$('.sheet-back'),done=$('.sheet-done');
  const openSheet=()=>{side.classList.add('open');back.classList.add('open');done.classList.add('on')};
  closeSheet=()=>{side.classList.remove('open');back.classList.remove('open');done.classList.remove('on')};
  $('.filter-open').addEventListener('click',openSheet);back.addEventListener('click',closeSheet);done.addEventListener('click',closeSheet);
  if(qs.get('sheet'))openSheet();
  draw();
}
$$('.sizes button').forEach(b=>b.addEventListener('click',()=>{$$('.sizes button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#size').textContent=b.textContent}));
})();
