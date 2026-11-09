(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const qs=new URLSearchParams(location.search);
const money=n=>'$'+Number(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* bold the part of the text that matches what was typed, safely */
function hl(text,q){const t=String(text);if(!q)return esc(t);const i=t.toLowerCase().indexOf(q.toLowerCase());if(i<0)return esc(t);return esc(t.slice(0,i))+'<b>'+esc(t.slice(i,i+q.length))+'</b>'+esc(t.slice(i+q.length))}

/* ---- dispatch: 12pm Melbourne cut-off, Monday to Friday. Counts down in seconds on the day, otherwise names the next dispatch. */
const dp=$('[data-dispatch] .d-text'),dps=$('[data-dispatch] .d-short');
function melNow(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Melbourne',weekday:'short',hour:'numeric',minute:'numeric',second:'numeric',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return{day:p.weekday,h:+p.hour,m:+p.minute,s:+p.second}}
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function dispatchText(){const n=melNow();const di=DAYS.indexOf(n.day);const weekday=di>=1&&di<=5;const secs=n.h*3600+n.m*60+n.s;const cut=12*3600;
  if(weekday&&secs<cut){const left=cut-secs;const h=Math.floor(left/3600),m=Math.floor(left%3600/60),s=left%60;const c=`<b class="count">${h?h+'h ':''}${m}m ${String(s).padStart(2,'0')}s</b>`;return [`Order in ${c} for dispatch today`,`Ships today: order in ${c}`]}
  let d=(di+1)%7,label='tomorrow';while(d===0||d===6){d=(d+1)%7;label=''}
  if(!label)label=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d];
  return [`Next dispatch ${label} at 12pm`,`Next dispatch ${label} 12pm`]}
if(dp){const tick=()=>{const t=dispatchText();dp.innerHTML=t[0];if(dps)dps.innerHTML=t[1]};tick();setInterval(tick,1000)}
$$('.tz').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();b.classList.toggle('on')}));

/* ---- mega menus: hover on desktop, tap anywhere, Escape closes and returns focus */
const items=$$('.cats>li[data-menu]');let menuT;/* one shared close timer, so moving between items never closes the new menu */
const closeAll=()=>{items.forEach(i=>{i.classList.remove('open');i.querySelector('button').setAttribute('aria-expanded','false')})};
const open=i=>{closeAll();i.classList.add('open');i.querySelector('button').setAttribute('aria-expanded','true')};
const hover=matchMedia('(hover:hover) and (min-width:1025px)').matches;
items.forEach(i=>{const b=i.querySelector('button');
  b.addEventListener('click',e=>{e.stopPropagation();i.classList.contains('open')?closeAll():open(i)});
  if(hover){i.addEventListener('mouseenter',()=>{clearTimeout(menuT);open(i)});i.addEventListener('mouseleave',()=>{clearTimeout(menuT);menuT=setTimeout(closeAll,220)})}
});
const catbar=$('.catbar'),mb=$('.menu-btn');
{const cur=location.pathname.endsWith('lures.html')?'lures':location.pathname.endsWith('shop.html')?((window.AOF_CATS||{})[qs.get('cat')]?qs.get('cat'):(qs.get('brand')?null:'terminal')):null;const li=cur&&$(`.cats>li[data-menu="${cur}"]`);if(li){li.classList.add('current');li.querySelector('button').setAttribute('aria-current','page')}}
const closeDrawer=()=>{if(catbar&&catbar.classList.contains('open')){catbar.classList.remove('open');mb.setAttribute('aria-expanded','false');document.body.classList.remove('locked');mb.focus()}};
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const o=$('.cats>li.open');if(o){closeAll();o.querySelector('button').focus();return}if(sug&&sug.classList.contains('open')){closeSuggest();quiet=true;inp.focus();quiet=false;return}if($('.side.open')){closeSheet();return}closeDrawer()});
document.addEventListener('click',e=>{if(!e.target.closest('.cats'))closeAll();if(!e.target.closest('.search'))closeSuggest();if(!e.target.closest('.tz'))$$('.tz.on').forEach(x=>x.classList.remove('on'))});
if(mb)mb.addEventListener('click',e=>{e.stopPropagation();const o=catbar.classList.toggle('open');mb.setAttribute('aria-expanded',o);document.body.classList.toggle('locked',o)});
catbar&&catbar.addEventListener('click',e=>e.stopPropagation());
matchMedia('(min-width:1025px)').addEventListener('change',m=>{if(m.matches&&catbar.classList.contains('open')){catbar.classList.remove('open');mb.setAttribute('aria-expanded','false');document.body.classList.remove('locked');const f=$('.cats>li>button');f&&document.activeElement&&catbar.contains(document.activeElement)&&f.focus()}});
const dl=qs.get('menu');if(dl){const m=$(`.cats>li[data-menu="${dl}"]`);if(m){if(matchMedia('(max-width:1024px)').matches){catbar.classList.add('open')}open(m)}}

/* ---- search: suggestions with the matching text in bold */
const inp=$('.search input'),sug=$('.suggest');
if(inp&&matchMedia('(max-width:820px)').matches)inp.placeholder='Search tackle, fish or brands';
const CATS=window.AOF_CATS||{},ITEMS=window.AOF_ITEMS||[],LURES=window.AOF_LURES||[];
function closeSuggest(){if(sug){sug.classList.remove('open');inp&&inp.setAttribute('aria-expanded','false')}}
function runSearch(){const raw=inp.value.trim(),q=raw.toLowerCase();
  if(!q){closeSuggest();return}
  const shopTerms=[];
  (window.AOF_SPECIES||[]).filter(s=>s.toLowerCase().includes(q)).slice(0,4).forEach(s=>shopTerms.push(`<a href="lures.html?species=${encodeURIComponent(s)}">${hl(s,raw)} lures</a>`));
  Object.entries(CATS).forEach(([k,[name,,types]])=>{if(name.toLowerCase().includes(q))shopTerms.push(`<a href="shop.html?cat=${k}">${hl(name,raw)}</a>`);types.filter(t=>t.toLowerCase().includes(q)).forEach(t=>shopTerms.push(`<a href="shop.html?cat=${k}&type=${encodeURIComponent(t)}">${hl(t,raw)} <small>in ${esc(name)}</small></a>`))});
  const all=[...LURES.map(p=>({...p,href:'product.html'})),...ITEMS.map(p=>({...p,href:'product.html'}))];
  const hits=all.filter(p=>(p.brand+' '+p.name).toLowerCase().includes(q)||(p.species||[]).some(s=>s.toLowerCase().includes(q))||(p.styles||[]).some(s=>s.toLowerCase().includes(q))||(p.type||'').toLowerCase().includes(q)).sort((a,b)=>((b.brand+' '+b.name).toLowerCase().includes(q))-((a.brand+' '+a.name).toLowerCase().includes(q))).slice(0,5);
  $('.terms',sug).innerHTML='<h3>Shop by</h3>'+shopTerms.slice(0,6).join('')+`<a href="lures.html">"${hl(raw,raw)}" in all lures</a>`;
  $('.hits',sug).innerHTML='<h3>Products</h3>'+(hits.map(p=>`<a class="hit" href="${p.href}"><img src="${p.img}" alt="" width="56" height="56" loading="lazy"><span class="n">${hl(p.name,raw)}<small>${hl(p.brand,raw)}</small></span><span class="p">${p.max&&p.max>p.price?'<small>From</small> ':''}${money(p.price)}</span></a>`).join('')||'<p>No matches in this sample. Try a brand or a fish.</p>');
  sug.classList.add('open');inp.setAttribute('aria-expanded','true')}
let quiet=false;
if(inp){inp.addEventListener('input',runSearch);inp.addEventListener('focus',()=>{if(!quiet&&inp.value.trim())runSearch()});
  inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&sug.classList.contains('open')){const f=$('a',sug);if(f){e.preventDefault();f.focus()}}});
  sug&&sug.addEventListener('keydown',e=>{const ls=$$('a',sug),i=ls.indexOf(document.activeElement);if(e.key==='ArrowDown'&&i>-1){e.preventDefault();(ls[i+1]||ls[i]).focus()}if(e.key==='ArrowUp'&&i>-1){e.preventDefault();(i?ls[i-1]:inp).focus()}});
  if(qs.get('search')){inp.value=qs.get('search');runSearch()}}

/* ---- cart: a local count only, nothing is sent anywhere */
const cartN=$('.tools .cart .n');
/* the demo cart lives in this browser tab only (sessionStorage); nothing is sent anywhere.
   window.AOFCart: get() -> [{id,name,brand,img,price,qty,option}], set(items), add(item, qty), count(). Fires 'aof-cart' on document. */
const AOFCart=window.AOFCart={get(){try{return JSON.parse(sessionStorage.getItem('aof-cart-items')||'[]')}catch(e){return []}},
  set(items){try{sessionStorage.setItem('aof-cart-items',JSON.stringify(items))}catch(e){}showCart();document.dispatchEvent(new CustomEvent('aof-cart',{detail:items}))},
  add(item,qty=1){const items=this.get();const key=item.id+'|'+(item.option||'');const f=items.find(x=>x.id+'|'+(x.option||'')===key);if(f)f.qty=Math.min(99,f.qty+qty);else items.push({...item,qty});this.set(items)},
  count(){return this.get().reduce((n,x)=>n+x.qty,0)}};
function showCart(){const n=AOFCart.count();if(cartN){cartN.hidden=!n;cartN.textContent=n}}
showCart();
$$('.tools .cart').forEach(a=>a.setAttribute('href','cart.html'));
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(!a)return;e.preventDefault();
  const qty=(a.closest('.pdp')||a.closest('.buybar'))&&$('#qty')?+$('#qty').textContent:1;const card=a.closest('.pc');
  const priceTxt=a.dataset.price||(card&&$('.pr',card)&&$('.pr',card).textContent.replace(/[^0-9.]/g,''))||($('#price')&&$('#price').textContent.replace(/[^0-9.]/g,''))||'0';
  AOFCart.add({id:a.dataset.id||(a.dataset.name||(card&&$('h3',card).textContent)||'item'),name:a.dataset.name||(card&&$('h3',card).textContent)||'Item',brand:a.dataset.brand||(card&&$('.br',card)&&$('.br',card).textContent)||'',img:a.dataset.img||(card&&$('img',card)&&$('img',card).getAttribute('src'))||'',price:+priceTxt,src:a.dataset.src||'aof',option:a.dataset.option||($('#size')&&a.closest('.pdp,.buybar')?$('#size').textContent:'')},qty);
  const txt=a.textContent;a.textContent='Added';a.classList.add('done');setTimeout(()=>{a.textContent=txt;a.classList.remove('done')},1200);
  if(cartN){cartN.classList.remove('pop');void cartN.offsetWidth;cartN.classList.add('pop')}
  const img=a.dataset.img||(card&&$('img',card)&&$('img',card).getAttribute('src'));const name=a.dataset.name||(card&&$('h3',card)&&$('h3',card).textContent)||'Item';
  toast.innerHTML=(img?`<img src="${img}" alt="" width="48" height="48">`:'')+`<span><b>Added to your cart</b>${esc(name)}</span>`;toast.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>toast.classList.remove('on'),3200)});
const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');document.body.appendChild(toast);

/* ---- segmented control + home lure picker */
$$('.seg').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',s).forEach(x=>x.setAttribute('aria-pressed',x===b));s.dispatchEvent(new CustomEvent('seg',{detail:b.dataset.v,bubbles:true}))}));
const pk=$('.pick');
if(pk){let water='',sp=new Set(),st=new Set();
  const go=$('#pick-go');const upd=()=>{const u=new URLSearchParams();if(water)u.set('water',water);if(sp.size)u.set('species',[...sp].join('|'));if(st.size)u.set('styles',[...st].join('|'));go.href='lures.html'+(u.toString()?'?'+u:'')};
  pk.addEventListener('seg',e=>{water=e.detail;upd()});
  $$('[data-sp]',pk).forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.sp;sp.has(v)?sp.delete(v):sp.add(v);b.setAttribute('aria-pressed',sp.has(v));upd()}));
  $$('[data-st]',pk).forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.st;st.has(v)?st.delete(v):st.add(v);b.setAttribute('aria-pressed',st.has(v));upd()}));upd()}

/* ---- poster note */
const note=$('.note');
$$('[data-note]').forEach(p=>p.addEventListener('click',()=>{note.textContent=p.dataset.note;note.classList.add('on');setTimeout(()=>note.classList.remove('on'),5200)}));

/* ---- product page: cheapest size first, price follows the size */
$$('.sizes button').forEach(b=>b.addEventListener('click',()=>{$$('.sizes button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#size').textContent=b.textContent;if(b.dataset.price){$('#price').textContent=money(b.dataset.price);if($('.bb-price')){$('.bb-price').textContent=money(b.dataset.price);$('.bb-size').textContent=b.textContent}$('#from').textContent=b===$('.sizes button')?'Cheapest size shown first':''}}));
const buy=$('#buy'),bar=$('.buybar');if(buy&&bar&&'IntersectionObserver' in window){new IntersectionObserver(([en])=>bar.classList.toggle('hide',en.isIntersecting)).observe(buy)}
$$('[data-q]').forEach(b=>b.addEventListener('click',()=>{const q=$('#qty');q.textContent=Math.max(1,Math.min(20,+q.textContent+ +b.dataset.q))}));

/* ---- shared multi-select browser (Lure Browser and every shop category)
   OR inside a facet (tick swivels AND floats = see both), AND across facets. State lives in the URL so reload and Back keep it. */
let closeSheet=()=>{};
const grid=$('#grid');
if(grid){
  const isShop=!!$('[data-shop]');
  const PRICE=[['u10','Under $10',0,10],['10-25','$10 to $25',10,25],['25-50','$25 to $50',25,50],['50-100','$50 to $100',50,100],['100','$100 and over',100,1e9]];
  let D,F,label,catKey,cat;
  const brandOnly=isShop&&!CATS[qs.get('cat')]&&qs.get('brand');
  if(brandOnly){/* a brand page: everything from one brand, across every category */
    const B=qs.get('brand');const all=[...ITEMS,...LURES.map((p,i)=>({...p,cat:'lures',type:'Lures',id:'lure-'+i,max:p.price}))].filter(p=>p.brand===B);
    const names={...Object.fromEntries(Object.entries(CATS).map(([k,v])=>[k,v[0]])),lures:'Lures'};
    D=all.map(p=>({...p,type:names[p.cat]||p.type}));catKey='';cat=[B,'Everything from '+B+' in this sample.',[...new Set(D.map(p=>p.type))]];
    document.title=B+' | All Out Fishing';$('#cat-title').textContent=B;$('#cat-sub').textContent=cat[1];$('#type-lab').textContent='Category';$('#type-lab2').textContent='Category';$('#size-sec').hidden=true;
    F={type:{param:'type',get:p=>[p.type],order:cat[2],chips:true},price:{param:'price',get:p=>PRICE.filter(r=>p.price>=r[2]&&p.price<r[3]).map(r=>r[0]),order:PRICE.map(r=>r[0])}};
    const bl=$('#brand-list');bl&&bl.closest('section').setAttribute('hidden','');
    label=()=>'products';
  }else if(isShop){catKey=CATS[qs.get('cat')]?qs.get('cat'):'terminal';cat=CATS[catKey];D=ITEMS.filter(p=>p.cat===catKey);
    document.title=cat[0]+' | All Out Fishing';$('#cat-title').textContent=cat[0];$('#cat-sub').textContent=cat[1]+' Tick as many types as you like.';
    const sizeName=catKey==='line'?'Breaking strain':'Size';$('#size-lab').textContent=sizeName;
    F={type:{param:'type',get:p=>[p.type],order:cat[2],chips:true},brand:{param:'brand',get:p=>[p.brand]},size:{param:'size',get:p=>p.facet||[],chip:'#size-chips',label:sizeName},price:{param:'price',get:p=>PRICE.filter(r=>p.price>=r[2]&&p.price<r[3]).map(r=>r[0]),order:PRICE.map(r=>r[0])}};
    if(catKey==='storage')$('#size-sec').hidden=true;
    label=()=>cat[0].toLowerCase();
  }else{
    D=LURES;
    const STY=['Hardbodies','Jerkbaits','Surface & Topwater','Soft Plastics','Stickbaits','Crankbaits','Poppers','Vibes & Blades','Casting Metals','Jigs','Squid Jigs','Spoons','Spinnerbaits','Spinners'];
    const POP=['Snapper','Flathead','Australian Salmon','Trout','Bream','King George Whiting','Calamari','Mulloway'];
    const allSp=[...new Set(D.flatMap(p=>p.species))].sort();
    F={water:{param:'water',get:p=>p.water,single:true},species:{param:'species',get:p=>p.species,order:[...POP,...allSp.filter(s=>!POP.includes(s))],pop:POP},styles:{param:'styles',get:p=>p.styles,order:STY,chips:true},brand:{param:'brand',get:p=>[p.brand]},price:{param:'price',get:p=>PRICE.filter(r=>p.price>=r[2]&&p.price<r[3]).map(r=>r[0]),order:PRICE.map(r=>r[0])}};
    label=()=>'lures';
  }
  const S={};Object.entries(F).forEach(([k,f])=>{S[k]=new Set((qs.get(f.param)||'').split('|').filter(Boolean))});
  if(!isShop&&qs.get('demo')==='trout'){S.species.add('Trout');S.styles.add('Jerkbaits');S.styles.add('Surface & Topwater')}
  let sort=qs.get('sort')||'';const sortSel=$('#sort');if(sortSel)sortSel.value=sort;
  const match=(p,ig)=>Object.entries(F).every(([k,f])=>k===ig||!S[k].size||f.get(p).some(v=>S[k].has(v)));
  const count=(k,v)=>D.filter(p=>match(p,k)&&F[k].get(p).includes(v)).length;
  const values=k=>{const f=F[k];const vs=f.order||[...new Set(D.flatMap(f.get))].sort((a,b)=>k==='size'?sizeKey(a)-sizeKey(b):a.localeCompare(b));return vs.filter(v=>D.some(p=>f.get(p).includes(v)))};
  function sizeKey(v){if(/\/0$/.test(v))return -parseInt(v);const n=parseFloat(v);return /oz/.test(v)?100+n:/lb/.test(v)?n:(v==='00'?-0.5:n)}
  const priceLabel=v=>(PRICE.find(r=>r[0]===v)||[,v])[1];
  const nice=(k,v)=>k==='price'?priceLabel(v):v;
  function syncURL(){const u=new URLSearchParams();if(isShop&&catKey)u.set('cat',catKey);if(brandOnly)u.set('brand',qs.get('brand'));Object.entries(F).forEach(([k,f])=>{if(S[k].size)u.set(f.param,[...S[k]].join('|'))});if(sort)u.set('sort',sort);history.replaceState(null,'','?'+u.toString())}
  const chip=(k,v)=>{const n=count(k,v);return `<button class="chip" type="button" data-f="${k}" data-v="${esc(v)}" aria-pressed="${S[k].has(v)}" ${!n&&!S[k].has(v)?'disabled':''}>${esc(nice(k,v))} <small>${n}</small></button>`};
  const expanded=new Set(),finds={};
  function longList(k,vals,pop){const live=vals.filter(v=>count(k,v)||S[k].has(v));if(live.length<=10)return live.map(v=>check(k,v,pop&&pop.includes(v))).join('');
    if(!expanded.has(k)){const top=[...live].sort((a,b)=>count(k,b)-count(k,a)).slice(0,8);const keep=[...new Set([...top,...live.filter(v=>S[k].has(v))])];return keep.sort((a,b)=>count(k,b)-count(k,a)).map(v=>check(k,v)).join('')+`<li><button type="button" class="show-all" data-more="${k}">Show all ${live.length}</button></li>`}
    const q=(finds[k]||'').toLowerCase();const all=[...live].sort((a,b)=>a.localeCompare(b));
    return (all.length>15||finds[k]?`<li class="find"><label class="sr" for="find-${k}">Find</label><input id="find-${k}" type="search" data-find="${k}" placeholder="Find a ${k==='species'?'fish':k}" value="${esc(finds[k]||'')}"></li>`:'')+all.filter(v=>v.toLowerCase().includes(q)).map(v=>check(k,v)).join('')+`<li><button type="button" class="show-all" data-less="${k}">Show fewer</button></li>`}
  const check=(k,v,pop)=>{const n=count(k,v);return `<li class="${pop?'pop':''}"><label><input type="checkbox" data-f="${k}" data-v="${esc(v)}" ${S[k].has(v)?'checked':''} ${!n&&!S[k].has(v)?'disabled':''}> ${esc(nice(k,v))}<small>${n}</small></label></li>`};
  function draw(){
    const ck=isShop?'type':'styles';
    const chipRow=values(ck).map(v=>chip(ck,v)).join('');
    $(isShop?'#type-chips':'#style-chips').innerHTML=chipRow;$(isShop?'#type-sheet':'#style-sheet').innerHTML=chipRow;
    if(!isShop){$('#sp-list').innerHTML=longList('species',values('species'));
      $$('.water .seg button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v||'')===([...S.water][0]||'')))}
    if(F.brand)$('#brand-list').innerHTML=longList('brand',values('brand'));
    $('#price-list').innerHTML=values('price').map(v=>check('price',v)).join('');
    if(F.size&&$('#size-chips'))$('#size-chips').innerHTML=values('size').filter(v=>count('size',v)||S.size.has(v)).map(v=>chip('size',v)).join('')||'<p class="hint">Pick a type to see sizes.</p>';
    let R=D.filter(p=>match(p));
    if(sort==='lo')R=[...R].sort((a,b)=>a.price-b.price);if(sort==='hi')R=[...R].sort((a,b)=>b.price-a.price);if(sort==='az')R=[...R].sort((a,b)=>a.name.localeCompare(b.name));
    const join=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
    const main=[...S[ck]];
    let line=R.length+' '+(main.length?join(main.map(s=>s.toLowerCase())):label());
    if(!isShop){if(S.water.size)line+=' for '+[...S.water][0].toLowerCase();if(S.species.size)line+=(S.water.size?', chasing ':' for ')+join([...S.species])}
    $('#res').textContent=line;
    const act=[];Object.keys(F).forEach(k=>S[k].forEach(v=>act.push(`<button type="button" data-rm="${k}" data-v="${esc(v)}" aria-label="Remove ${esc(nice(k,v))}"><b>${esc(nice(k,v))}</b> &times;</button>`)));
    if(act.length)act.push('<button type="button" class="clear" data-rm="all">Clear all</button>');
    $('#active').innerHTML=act.join('');
    grid.innerHTML=R.length?R.map(p=>{const range=p.max&&p.max>p.price;const sizes=(p.sizes||[]).length;
      const btn=p.opts>1?`<a class="add" href="product.html">See ${p.opts} colours</a>`:sizes>1?`<a class="add" href="product.html">See ${sizes} sizes</a>`:`<button class="add" type="button" data-add data-img="${p.img}" data-name="${esc(p.name)}" data-src="${p.src||'aof'}" data-id="${p.id!==undefined?'item-'+p.id:esc(p.name)}">Add to cart</button>`;
      const tags=(isShop?[p.type]:p.styles.slice(0,2)).map(s=>`<span>${esc(s)}</span>`).join('');
      return `<article class="pc"><a class="pic" href="product.html" tabindex="-1" aria-hidden="true"><img src="${p.img}" alt="" width="400" height="400" loading="lazy"></a><div class="br">${esc(p.brand)}</div><h3><a href="product.html" title="${esc(p.name)}">${esc(p.name)}</a></h3><div class="tags">${tags}</div><div class="row"><span class="pr">${range?'<small>From</small> ':''}${money(p.price)}</span><span class="st${p.src&&p.src!=='aof'?' rrp':''}">${p.src&&p.src!=='aof'?'Maker&rsquo;s RRP':'In stock'}</span></div>${btn}</article>`}).join(''):`<div class="empty" style="grid-column:1/-1"><h2>Nothing matches all of those</h2><p>Untick a filter above, <button type="button" class="linkish" data-rm="all">clear all filters</button>, or call the shop on <a href="tel:+61352223257">03 5222 3257</a> and we'll find it for you.</p></div>`;
    $('#sheet-n').textContent='Show '+R.length+' '+(isShop?'products':'lures');
    syncURL();
  }
  const toggle=(k,v)=>{if(F[k].single){const had=S[k].has(v);S[k].clear();if(!had)S[k].add(v)}else S[k].has(v)?S[k].delete(v):S[k].add(v)};
  document.addEventListener('change',e=>{const c=e.target.closest('input[data-f]');if(c){toggle(c.dataset.f,c.dataset.v);draw();const n=$(`input[data-f="${c.dataset.f}"][data-v="${CSS.escape(c.dataset.v)}"]`);n&&n.focus()}});
  document.addEventListener('click',e=>{const c=e.target.closest('.chip[data-f]');if(c){const k=c.dataset.f,v=c.dataset.v,inSheet=!!c.closest('.side');toggle(k,v);draw();const n=$(`${inSheet?'.side ':'.style-row '}.chip[data-f="${k}"][data-v="${CSS.escape(v)}"]`)||$(`.chip[data-f="${k}"][data-v="${CSS.escape(v)}"]`);n&&n.focus()}
    const r=e.target.closest('[data-rm]');if(r){if(r.dataset.rm==='all')Object.values(S).forEach(s=>s.clear());else S[r.dataset.rm].delete(r.dataset.v);draw();($('#active button')||$('#res')).focus()}});
  document.addEventListener('click',e=>{const m=e.target.closest('[data-more]'),l=e.target.closest('[data-less]');if(m){expanded.add(m.dataset.more);draw();const f=$(`[data-find="${m.dataset.more}"]`)||$(`[data-less="${m.dataset.more}"]`);f&&f.focus()}if(l){expanded.delete(l.dataset.less);finds[l.dataset.less]='';draw();const b=$(`[data-more="${l.dataset.less}"]`);b&&b.focus()}});
  document.addEventListener('input',e=>{const f=e.target.closest('[data-find]');if(f){finds[f.dataset.find]=f.value;draw();const n=$(`[data-find="${f.dataset.find}"]`);n.focus();n.setSelectionRange(n.value.length,n.value.length)}});
  const water=$('.water');if(water)water.addEventListener('seg',e=>{S.water.clear();if(e.detail)S.water.add(e.detail);draw()});
  
  if(sortSel)sortSel.addEventListener('change',()=>{sort=sortSel.value;draw()});
  const side=$('.side'),back=$('.sheet-back'),done=$('.sheet-done'),opener=$('.filter-open');
  const bg=()=>[...document.querySelectorAll('body>*:not(main),main>*:not(.lp),.lp>div:not(.sheet-back)')];
  const openSheet=()=>{bg().forEach(x=>x.inert=true);side.classList.add('open');back.classList.add('open');done.classList.add('on');document.body.classList.add('locked');($('.sheet-x')||side).focus()};
  closeSheet=()=>{if(!side.classList.contains('open'))return;bg().forEach(x=>x.inert=false);side.classList.remove('open');back.classList.remove('open');done.classList.remove('on');document.body.classList.remove('locked');(opener.offsetParent?opener:($('#sort')||$('.style-row .chip')||opener)).focus()};
  opener.addEventListener('click',openSheet);back.addEventListener('click',closeSheet);done.addEventListener('click',closeSheet);$('.sheet-x')&&$('.sheet-x').addEventListener('click',closeSheet);
  matchMedia('(min-width:821px)').addEventListener('change',m=>{if(m.matches)closeSheet()});
  if(qs.get('sheet'))openSheet();
  draw();
}
})();
