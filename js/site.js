(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const qs=new URLSearchParams(location.search);
const money=n=>'$'+Number(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* bold the part of the text that matches what was typed, safely */
function hl(text,q){const t=String(text);if(!q)return esc(t);const i=t.toLowerCase().indexOf(q.toLowerCase());if(i<0)return esc(t);return esc(t.slice(0,i))+'<b>'+esc(t.slice(i,i+q.length))+'</b>'+esc(t.slice(i+q.length))}

/* one spec-unit helper: a non-breaking space between number and unit, for display only (filter values and URLs keep the raw text).
   Only ever given sizes and specs, never product names. A bare number or a model code ("2500", "SW5000-H") has no unit and is left alone. */
const unit=s=>String(s).replace(/(?<![A-Za-z0-9.]|[A-Za-z]-)(\d+(?:\.\d+)?)\s?(kg|KG|Kg|lbs?|LBS?|Lbs?|oz|OZ|mm|cm|m|g|ft|ml|L)(?![A-Za-z0-9])/g,(_,n,u)=>n+'\u00a0'+(u==='L'?u:u.toLowerCase().replace('lbs','lb')));
/* a sale is one signal: black price, the saving in red, the regular price struck in grey only where there is room (CSS hides .was on tight spots) */
const saveText=(price,was)=>{const d=Math.round((was-price)*100)/100;return 'Save $'+(Number.isInteger(d)?d:d.toFixed(2))};
const priceHTML=(price,was,room=true)=>`<span class="now">${money(price)}</span>`+(was>price?` <span class="save">${saveText(price,was)}</span>`+(room?` <s class="was"><span class="sr">Regular price </span>${money(was)}</s>`:''):'');
/* one product id everywhere, so the same product is one cart line wherever it was added from */
const productId=p=>Number.isInteger(p.id)?'item-'+p.id:'lure-'+p.name;
const pdpHref=p=>'product.html?p='+encodeURIComponent(p.slug);
window.AOFFormat={money,esc,unit,saveText,priceHTML,productId,pdpHref};

/* ---- skip link: moves focus to the main landmark without adding a history step */
document.addEventListener('click',e=>{if(!e.target.closest('.skip'))return;e.preventDefault();const m=$('main');if(m){m.focus();m.scrollIntoView()}});

/* ---- photos: a quiet box in the same slot while loading or when a photo is missing. No shimmer, no placeholder art. */
const BLANK='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E';
const imgFailed=i=>{if(i.classList.contains('img-off'))return;i.classList.add('img-off');i.classList.remove('img-ok');i.dataset.missing=i.getAttribute('src')||'';i.src=BLANK};
const imgLoaded=i=>{if(!i.classList.contains('img-off'))i.classList.add('img-ok')};
document.addEventListener('error',e=>{if(e.target.tagName==='IMG')imgFailed(e.target)},true);
document.addEventListener('load',e=>{if(e.target.tagName==='IMG')imgLoaded(e.target)},true);
$$('img').forEach(i=>{if(i.complete){if(i.naturalWidth)imgLoaded(i);else if(i.getAttribute('src'))imgFailed(i)}});

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
{const cur=location.pathname.endsWith('lures.html')?'lures':location.pathname.endsWith('shop.html')?((window.AOF_CATS||{})[qs.get('cat')]?qs.get('cat'):(qs.get('brand')||qs.get('q')||qs.get('all')?null:'terminal')):null;const li=cur&&$(`.cats>li[data-menu="${cur}"]`);if(li){li.classList.add('current');li.querySelector('button').setAttribute('aria-current','page')}}
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
const CATS=window.AOF_CATS||{};let ITEMS=[],LURES=[],PLACES=[],BRANDS=[];
/* places a search can be scoped to. Names that only group other things ("By size", "Other") never become suggestions. */
const NOT_A_PLACE=/^(by\b|shop by\b|other$|more$|misc)/i;
function hydrate(){ITEMS=window.AOF_ITEMS||[];LURES=window.AOF_LURES||[];
  PLACES=[...Object.entries(CATS).map(([k,[name]])=>({name,href:'shop.html?cat='+k,items:ITEMS.filter(i=>i.cat===k)})),{name:'Lures',href:'lures.html',items:LURES}].filter(g=>!NOT_A_PLACE.test(g.name));
  BRANDS=[...new Set([...ITEMS,...LURES].map(p=>p.brand))]}
hydrate();
/* the full product list only loads on the shop and lure pages, or the first time someone uses search */
let catLoad;window.AOFCatalogue=()=>{if(window.AOF_ITEMS)return Promise.resolve();return catLoad||(catLoad=new Promise((ok,no)=>{const s=document.createElement('script');s.src='js/catalogue.js';s.onload=()=>{hydrate();ok()};s.onerror=()=>{catLoad=null;no()};document.head.appendChild(s)}))};
const withParam=(href,k,v)=>href+(href.includes('?')?'&':'?')+k+'='+encodeURIComponent(v);
const rowsIn=(typed,raw,by,param,value)=>PLACES.map(g=>({g,n:g.items.filter(by).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,3).map(({g})=>`<a href="${withParam(g.href,param,value)}">${hl(typed,raw)} in ${esc(g.name)}</a>`);
function closeSuggest(){if(sug){sug.classList.remove('open');inp&&inp.setAttribute('aria-expanded','false')}}
function runSearch(){const raw=inp.value.trim(),q=raw.toLowerCase();
  if(!q){closeSuggest();return}
  if(!window.AOF_ITEMS){window.AOFCatalogue().then(runSearch,()=>{});return}
  const shopTerms=[];
  (window.AOF_SPECIES||[]).filter(s=>s.toLowerCase().includes(q)).slice(0,4).forEach(s=>shopTerms.push(`<a href="lures.html?species=${encodeURIComponent(s)}">${hl(s,raw)} lures</a>`));
  /* a brand keeps what was typed: the brand itself stays plain, then "daiwa in Reels" */
  const brand=BRANDS.find(b=>b.toLowerCase()===q)||(q.length>2?BRANDS.find(b=>b.toLowerCase().startsWith(q)):null);
  if(brand){shopTerms.push(`<a href="shop.html?brand=${encodeURIComponent(brand)}">${hl(brand,raw)}</a>`);shopTerms.push(...rowsIn(brand.toLowerCase()===q?raw:brand,raw,p=>p.brand===brand,'brand',brand))}
  let groupHit=null;const nameHit=(g,name)=>{if(!groupHit)groupHit={...g,label:name}};
  Object.entries(CATS).forEach(([k,[name,,types]])=>{const place=PLACES.find(g=>g.name===name);if(!place)return;
    if(name.toLowerCase().includes(q)){shopTerms.push(`<a href="shop.html?cat=${k}">${hl(name,raw)}</a>`);nameHit(place,name)}
    types.filter(t=>t.toLowerCase().includes(q)&&!NOT_A_PLACE.test(t)).forEach(t=>{const href=`shop.html?cat=${k}&type=${encodeURIComponent(t)}`;shopTerms.push(`<a href="${href}">${hl(t,raw)} <small>in ${esc(name)}</small></a>`);nameHit({href,items:place.items.filter(i=>(i.types||[i.type]).includes(t))},t)})});
  if(!groupHit&&'lures'.includes(q)&&q.length>2){shopTerms.push(`<a href="lures.html">${hl('Lures',raw)}</a>`);groupHit={...PLACES[PLACES.length-1],label:'Lures'}}
  /* a category keeps what was typed: "reels by Daiwa" */
  if(groupHit){const n={};groupHit.items.forEach(p=>{n[p.brand]=(n[p.brand]||0)+1});const shown=groupHit.label.toLowerCase()===q?raw:groupHit.label.toLowerCase();Object.entries(n).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([b])=>shopTerms.push(`<a href="${withParam(groupHit.href,'brand',b)}">${hl(shown,raw)} by ${esc(b)}</a>`))}
  /* any other words: the rows open the category with the search kept */
  const nameHas=p=>(p.brand+' '+p.name).toLowerCase().includes(q);
  if(!brand&&!groupHit)shopTerms.push(...rowsIn(raw,raw,nameHas,'q',raw).slice(0,2));
  const lureText=p=>[p.brand,p.name,...(p.species||[]),...(p.styles||[])].join(' ').toLowerCase();
  const all=[...LURES,...ITEMS].map(p=>({...p,href:pdpHref(p)}));
  const hits=all.filter(p=>(p.brand+' '+p.name).toLowerCase().includes(q)||(p.species||[]).some(s=>s.toLowerCase().includes(q))||(p.styles||[]).some(s=>s.toLowerCase().includes(q))||(p.type||'').toLowerCase().includes(q)).sort((a,b)=>((b.brand+' '+b.name).toLowerCase().includes(q))-((a.brand+' '+a.name).toLowerCase().includes(q))).slice(0,5);
  const terms=shopTerms.slice(0,7);if(LURES.some(p=>lureText(p).includes(q)))terms.push(`<a href="lures.html?q=${encodeURIComponent(raw)}">"${hl(raw,raw)}" in all lures</a>`);
  $('.terms',sug).innerHTML=terms.length?'<h3>Shop by</h3>'+terms.join(''):'';
  $('.hits',sug).innerHTML='<h3>Products</h3>'+(hits.map(p=>`<a class="hit" href="${p.href}"><img src="${p.img}" alt="" width="56" height="56" loading="lazy"><span class="n">${hl(p.name,raw)}<small>${hl(p.brand,raw)}</small></span><span class="p">${p.max&&p.max>p.price?'<small>From</small> ':''}${priceHTML(p.price,p.was,false)}</span></a>`).join('')||'<p>No matches. Try a brand or a fish.</p>');
  sug.classList.add('open');inp.setAttribute('aria-expanded','true')}
let quiet=false;
/* Enter or the magnifier opens the whole shop narrowed to what was typed */
const searchForm=$('.search form');if(searchForm&&inp)searchForm.addEventListener('submit',()=>{const v=inp.value.trim();if(v)location.href='shop.html?q='+encodeURIComponent(v);else inp.focus()});
if(inp){inp.addEventListener('input',runSearch);inp.addEventListener('focus',()=>{window.AOFCatalogue().catch(()=>{});if(!quiet&&inp.value.trim())runSearch()});
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
/* Add to cart goes busy first: a spinner covers the label, the width and accessible name stay, and it can't fire twice. */
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(!a)return;e.preventDefault();
  const onPdp=a.closest('.pdp')||a.closest('.buybar');
  /* the main button and the sticky bar are one purchase, so they share one pending lock */
  const group=onPdp?$$('.pdp [data-add],.buybar [data-add]'):[a];
  if(group.some(b=>b.dataset.lock))return;
  /* the item and quantity are fixed at the click: changing the size or quantity during the busy state can't change this purchase */
  const qty=onPdp&&$('#qty')?+$('#qty').textContent:1;const card=a.closest('.pc');const sizeB=onPdp&&$('.sizes button[aria-pressed="true"]');const thumb=onPdp&&$('.gal-thumbs button[aria-pressed="true"]');const colour=thumb?thumb.dataset.colour||'':'';
  const priceTxt=a.dataset.price||(card&&$('.pr .now',card)&&$('.pr .now',card).textContent.replace(/[^0-9.]/g,''))||($('#price')&&$('#price').textContent.replace(/[^0-9.]/g,''))||'0';
  const was=+(a.dataset.was||(sizeB&&sizeB.dataset.was)||0)||undefined;
  const name=a.dataset.name||(card&&$('h3',card)&&$('h3',card).textContent)||'Item';const img=a.dataset.img||(card&&$('img',card)&&$('img',card).getAttribute('src'))||'';
  const item={id:a.dataset.id||name,name,brand:a.dataset.brand||(card&&$('.br',card)&&$('.br',card).textContent)||'',img,price:+priceTxt,was,href:(a.dataset.href||(card&&$('h3 a',card)&&$('h3 a',card).getAttribute('href'))||(onPdp?'product.html'+location.search:'product.html'))+(sizeB?'&s='+encodeURIComponent(sizeB.textContent):'')+(thumb&&thumb.dataset.c?'&c='+thumb.dataset.c:''),option:a.dataset.option||(onPdp?[sizeB?sizeB.textContent:'',colour].filter(Boolean).join(', '):'')};if(thumb&&thumb.dataset.full)item.img=thumb.dataset.full;
  group.forEach(b=>{b.dataset.lock='1';const w=b.getBoundingClientRect().width;if(w)b.style.width=w+'px';b.setAttribute('aria-busy','true');b.setAttribute('aria-disabled','true');b.classList.add('busy')});
  setTimeout(()=>{
    AOFCart.add(item,qty);
    group.forEach(b=>{b.classList.remove('busy');b.removeAttribute('aria-busy');b.removeAttribute('aria-disabled');const txt=b.textContent;b.textContent='Added';b.classList.add('done');setTimeout(()=>{b.textContent=txt;b.classList.remove('done');b.style.width='';delete b.dataset.lock},1200)});
    if(cartN){cartN.classList.remove('pop');void cartN.offsetWidth;cartN.classList.add('pop')}
    toast.innerHTML=(img?`<img src="${img}" alt="" width="48" height="48">`:'')+`<span><b>Added to your cart</b>${esc(name)}</span>`;toast.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>toast.classList.remove('on'),3200);
  },450)});
const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');document.body.appendChild(toast);

/* ---- segmented control + home lure picker */
$$('.seg').forEach(s=>s.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',s).forEach(x=>x.setAttribute('aria-pressed',x===b));s.dispatchEvent(new CustomEvent('seg',{detail:b.dataset.v,bubbles:true}))}));
const pk=$('.pick');
if(pk){let water='',sp=new Set(),st=new Set();
  const go=$('#pick-go');const upd=()=>{const u=new URLSearchParams();if(water)u.set('water',water);if(sp.size)u.set('species',[...sp].join('|'));if(st.size)u.set('styles',[...st].join('|'));go.href='lures.html'+(u.toString()?'?'+u:'')};
  pk.addEventListener('seg',e=>{water=e.detail;upd()});
  $$('[data-sp]',pk).forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.sp;sp.has(v)?sp.delete(v):sp.add(v);b.setAttribute('aria-pressed',sp.has(v));upd()}));
  $$('[data-st]',pk).forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.st;st.has(v)?st.delete(v):st.add(v);b.setAttribute('aria-pressed',st.has(v));upd()}));upd()}

/* ---- newsletter sign-up: checks the email and says plainly that nothing was sent */
const joinF=$('#join-form');if(joinF){const em=$('#em'),jm=$('#join-msg');joinF.addEventListener('submit',()=>{const v=em.value.trim(),bad=!v?'Enter your email':/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?'':'Enter an email address like name@example.com';if(bad){em.setAttribute('aria-invalid','true');jm.textContent=bad;em.focus();return}em.removeAttribute('aria-invalid');jm.textContent='This is a concept mock-up, so nothing was sent and you haven\u2019t been signed up.'})}

/* ---- poster note */
const note=$('.note');
$$('[data-note]').forEach(p=>p.addEventListener('click',()=>{note.textContent=p.dataset.note;note.classList.add('on');setTimeout(()=>note.classList.remove('on'),5200)}));

/* ---- product page: cheapest size first, price follows the size */
['#size','.bb-size'].forEach(s=>{const e=$(s);if(e&&e.textContent)e.textContent=unit(e.textContent)});/* spacing is display only: the chip's own text is the size's stable value */
$$('.sizes button').forEach(b=>b.addEventListener('click',()=>{$$('.sizes button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#size').textContent=unit(b.textContent);if($('.bb-size'))$('.bb-size').textContent=unit(b.textContent);if(b.dataset.price){const was=+b.dataset.was||0,price=+b.dataset.price,sv=was>price?saveText(price,was):'';$('#price').textContent=money(price);$('#save').textContent=sv;$('#save').hidden=!sv;$('#was').hidden=!sv;if(sv)$('#was-v').textContent=money(was);if($('.bb-price')){$('.bb-price').textContent=money(price);$('.bb-save').textContent=sv;$('.bb-save').hidden=!sv}$('#from').textContent=b===$('.sizes button')?'Cheapest size shown first':''}}));

/* ---- product photos: the main photo opens large in a native modal dialog, so the page behind is inert and Escape closes it */
const zoom=$('#zoom'),galMain=$('.gal-main');
if(zoom&&galMain){const thumbs=$$('.gal-thumbs button'),mainImg=$('img',galMain),zi=$('#zoom-img'),zn=$('#zoom-n');let at=0;
  const photos=thumbs.map(t=>({src:t.dataset.full,alt:t.dataset.alt}));
  const setImg=(el,p)=>{el.classList.remove('img-off','img-ok');delete el.dataset.missing;el.src=p.src;el.alt=p.alt};
  const colLab=$('#colour');const showMain=n=>{at=n;setImg(mainImg,photos[n]);thumbs.forEach((t,j)=>t.setAttribute('aria-pressed',j===n));if(colLab&&thumbs[n].dataset.colour)colLab.textContent=thumbs[n].dataset.colour};
  const paint=()=>{setImg(zi,photos[at]);zn.textContent=`Photo ${at+1} of ${photos.length}`};
  const step=d=>{at=(at+d+photos.length)%photos.length;paint()};
  const one=photos.length<2;$('.zoom-prev').hidden=one;$('.zoom-next').hidden=one;zn.hidden=one;
  thumbs.forEach((t,j)=>t.addEventListener('click',()=>showMain(j)));
  galMain.addEventListener('click',()=>{paint();zoom.showModal();document.body.classList.add('locked');$('.zoom-x').focus()});
  zoom.addEventListener('close',()=>{document.body.classList.remove('locked');showMain(at);galMain.focus()});
  $('.zoom-x').addEventListener('click',()=>zoom.close());$('.zoom-prev').addEventListener('click',()=>step(-1));$('.zoom-next').addEventListener('click',()=>step(1));
  zoom.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
  zoom.addEventListener('click',e=>{if(e.target===zoom||e.target.classList.contains('zoom-stage'))zoom.close()});
  let sx=null;zoom.addEventListener('touchstart',e=>{sx=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
  zoom.addEventListener('touchend',e=>{if(sx===null||one)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)step(dx<0?1:-1)},{passive:true});
}
const buy=$('#buy'),bar=$('.buybar');if(buy&&bar&&'IntersectionObserver' in window){new IntersectionObserver(([en])=>bar.classList.toggle('hide',en.isIntersecting)).observe(buy)}
$$('[data-q]').forEach(b=>b.addEventListener('click',()=>{const q=$('#qty');q.textContent=Math.max(1,Math.min(20,+q.textContent+ +b.dataset.q))}));

/* ---- shared multi-select browser (Lure Browser and every shop category)
   OR inside a facet (tick swivels AND floats = see both), AND across facets. State lives in the URL so reload and Back keep it. */
let closeSheet=()=>{};
const grid=$('#grid');
if(grid){
  const isShop=!!$('[data-shop]');
  const PRICE=[['u10','Under $10',0,10],['10-25','$10 to $25',10,25],['25-50','$25 to $50',25,50],['50-100','$50 to $100',50,100],['100','$100 and over',100,1e9]];
  const LEN=window.AOF_LENGTHS||[];
  let D,F,label,catKey,cat;
  const brandOnly=isShop&&!CATS[qs.get('cat')]&&!qs.get('all')&&!qs.get('q')&&qs.get('brand');
  const searchOnly=isShop&&!CATS[qs.get('cat')]&&!brandOnly&&(qs.get('q')||qs.get('all'));
  if(brandOnly||searchOnly){/* a brand page or a submitted search: products from every category */
    const B=qs.get('brand');const all=[...ITEMS,...LURES.map(p=>({...p,type:'Lures'}))].filter(p=>!brandOnly||p.brand===B).sort((a,b)=>a.i-b.i);
    const names={...Object.fromEntries(Object.entries(CATS).map(([k,v])=>[k,v[0]])),lures:'Lures'};
    D=all.map(p=>({...p,kind:p.type,type:names[p.cat]||p.type}));catKey='';
    const heading=brandOnly?B:'Search results';cat=[heading,brandOnly?'Everything we have from '+B+'.':'',[...new Set(D.map(p=>p.type))]];
    document.title=heading+' | All Out Fishing';$('#cat-title').textContent=heading;$('#cat-sub').textContent=cat[1];$('#type-lab').textContent='Category';$('#type-lab2').textContent='Category';$('#size-sec').hidden=true;
    F={type:{param:'type',get:p=>[p.type],order:cat[2],chips:true},...(brandOnly?{}:{brand:{param:'brand',get:p=>[p.brand]}}),price:{param:'price',get:p=>PRICE.filter(r=>p.price>=r[2]&&p.price<r[3]).map(r=>r[0]),order:PRICE.map(r=>r[0])}};
    const bl=$('#brand-list');if(brandOnly&&bl)bl.closest('section').setAttribute('hidden','');
    label=()=>'products';
  }else if(isShop){catKey=CATS[qs.get('cat')]?qs.get('cat'):'terminal';cat=CATS[catKey];D=ITEMS.filter(p=>p.cat===catKey);
    document.title=cat[0]+' | All Out Fishing';$('#cat-title').textContent=cat[0];$('#cat-sub').textContent=cat[1];
    const sizeName=catKey==='line'?'Breaking strain':'Size';$('#size-lab').textContent=sizeName;
    F={type:{param:'type',get:p=>p.types,order:cat[2],chips:true},brand:{param:'brand',get:p=>[p.brand]},size:{param:'size',get:p=>p.facet||[],chip:'#size-chips',label:sizeName},price:{param:'price',get:p=>PRICE.filter(r=>p.price>=r[2]&&p.price<r[3]).map(r=>r[0]),order:PRICE.map(r=>r[0])}};
    if(!D.some(p=>p.facet.length))$('#size-sec').hidden=true;
    label=()=>cat[0].toLowerCase();
  }else{
    D=LURES;
    const STY=window.AOF_STYLES||[];
    const POP=['Snapper','Flathead','Australian Salmon','Trout','Bream','King George Whiting','Calamari','Mulloway'];
    const allSp=[...new Set(D.flatMap(p=>p.species))].sort();
    F={water:{param:'water',get:p=>p.water,single:true},species:{param:'species',get:p=>p.species,order:[...POP,...allSp.filter(s=>!POP.includes(s))],pop:POP},styles:{param:'styles',get:p=>p.styles,order:STY,chips:true},length:{param:'length',get:p=>LEN.filter((l,n)=>p.lenMask&1<<n).map(l=>l[0]),order:LEN.map(l=>l[0])},brand:{param:'brand',get:p=>[p.brand]},price:{param:'price',get:p=>PRICE.filter(r=>p.price>=r[2]&&p.price<r[3]).map(r=>r[0]),order:PRICE.map(r=>r[0])}};
    label=()=>'lures';
  }
  const S={};Object.entries(F).forEach(([k,f])=>{S[k]=new Set((qs.get(f.param)||'').split('|').filter(Boolean))});
  if(!isShop&&qs.get('demo')==='trout'){S.species.add('Trout');S.styles.add('Jerkbaits');S.styles.add('Surface & Topwater')}
  let sort=qs.get('sort')||'';const sortSel=$('#sort');if(sortSel)sortSel.value=sort;
  /* a search kept from a suggestion row ("tide in Reels"): narrows the list the same way the header search matches */
  let textQ=(qs.get('q')||'').trim();if(textQ&&inp)inp.value=textQ;
  const textMatch=p=>!textQ||[p.brand,p.name,p.type,p.kind,...(p.species||[]),...(p.styles||[])].filter(Boolean).join(' ').toLowerCase().includes(textQ.toLowerCase());
  const match=(p,ig)=>textMatch(p)&&Object.entries(F).every(([k,f])=>k===ig||!S[k].size||f.get(p).some(v=>S[k].has(v)));
  /* every filter count in one pass per draw, so a long category stays quick on a phone */
  let CNT={};const tally=()=>{CNT={};Object.keys(F).forEach(k=>{const c=CNT[k]={},f=F[k];D.forEach(p=>{if(match(p,k))f.get(p).forEach(v=>{c[v]=(c[v]||0)+1})})})};
  const count=(k,v)=>CNT[k][v]||0;
  const VALS={};const values=k=>{if(VALS[k])return VALS[k];const f=F[k];const has=new Set(D.flatMap(f.get));const vs=f.order||[...has].sort((a,b)=>k==='size'?sizeKey(a)-sizeKey(b):a.localeCompare(b));return VALS[k]=vs.filter(v=>has.has(v))};
  function sizeKey(v){const w={S:1,M:2,L:3,XL:4,'2XL':5,'3XL':6}[v];if(w)return 1000+w;if(/\/0$/.test(v))return -parseInt(v);const n=parseFloat(v);return /oz/.test(v)?100+n:/lb/.test(v)?n:(v==='00'?-0.5:n)}
  const priceLabel=v=>(PRICE.find(r=>r[0]===v)||[,v])[1];
  const nice=(k,v)=>k==='price'?priceLabel(v):k==='length'?(LEN.find(l=>l[0]===v)||[,v])[1]:k==='size'?unit(v):v;
  /* ticks replace the current history entry so Back leaves the list in one press; a sort change adds a step */
  function syncURL(push){const u=new URLSearchParams();if(isShop&&catKey)u.set('cat',catKey);if(brandOnly)u.set('brand',qs.get('brand'));if(searchOnly&&!textQ)u.set('all','1');Object.entries(F).forEach(([k,f])=>{if(S[k].size)u.set(f.param,[...S[k]].join('|'))});if(textQ)u.set('q',textQ);if(sort)u.set('sort',sort);if(shown>PER)u.set('p',Math.round(shown/PER));const search=u.toString();history[push?'pushState':'replaceState'](null,'',search?'?'+search:location.pathname)}
  const chip=(k,v)=>{const n=count(k,v);return `<button class="chip" type="button" data-f="${k}" data-v="${esc(v)}" aria-pressed="${S[k].has(v)}" ${!n&&!S[k].has(v)?'disabled':''}>${esc(nice(k,v))} <small>${n}</small></button>`};
  const expanded=new Set(),finds={};
  const byCount=(k,list)=>[...list].sort((a,b)=>count(k,b)-count(k,a)||a.localeCompare(b));
  /* the 8 values with the most products, then Show all. Options with no results stay, greyed out. A list is never cut to hide just one value. */
  function longList(k,vals,pop){const live=vals;if(live.length<=9)return byCount(k,live).map(v=>check(k,v,pop&&pop.includes(v))).join('');
    if(!expanded.has(k)){const top=byCount(k,live).slice(0,8);const keep=[...new Set([...top,...live.filter(v=>S[k].has(v))])];return byCount(k,keep).map(v=>check(k,v)).join('')+`<li><button type="button" class="show-all" data-more="${k}">Show all ${live.length}</button></li>`}
    const q=(finds[k]||'').toLowerCase();const all=[...live].sort((a,b)=>a.localeCompare(b));
    return (all.length>15||finds[k]?`<li class="find"><label class="sr" for="find-${k}">Find</label><input id="find-${k}" type="search" data-find="${k}" placeholder="Find a ${k==='species'?'fish':k}" value="${esc(finds[k]||'')}"></li>`:'')+all.filter(v=>v.toLowerCase().includes(q)).map(v=>check(k,v)).join('')+`<li><button type="button" class="show-all" data-less="${k}">Show fewer</button></li>`}
  const check=(k,v,pop)=>{const n=count(k,v);return `<li class="${pop?'pop':''}"><label><input type="checkbox" data-f="${k}" data-v="${esc(v)}" ${S[k].has(v)?'checked':''} ${!n&&!S[k].has(v)?'disabled':''}> ${esc(nice(k,v))}<small>${n}</small></label></li>`};
  /* 48 at a time. The URL keeps how many are showing, so reload and Back come back to the same spot. keep=true leaves the count alone. */
  const PER=48;let shown=PER*Math.max(1,parseInt(qs.get('p'))||1),lastR=[];
  const more=$('#more');
  const paintMore=()=>{if(!more)return;const n=lastR.length,left=n-shown;more.innerHTML=left>0?`<p class="more-count">Showing ${shown} of ${n}</p><button class="btn btn-ink" type="button" id="load-more">Show ${Math.min(PER,left)} more</button>`:(n>PER?`<p class="more-count">Showing all ${n}</p>`:'')};
  const NOT_STYLE=new Set(['Estuary & Freshwater','Bluewater']);
  function cardHTML(p){const range=p.max&&p.max>p.price;const wasAttr=p.was?` data-was="${p.was}"`:'';
    const href=pdpHref(p);const btn=p.opts>1?`<a class="add" href="${href}">See ${p.opts} colours</a>`:p.ns>1?`<a class="add" href="${href}">See ${p.ns} sizes</a>`:`<button class="add" type="button" data-add data-img="${p.img}" data-name="${esc(p.name)}" data-href="${href}" ${wasAttr} data-id="${esc(productId(p))}">Add to cart</button>`;
    const tags=(isShop?[p.type]:p.styles.filter(s=>!NOT_STYLE.has(s)).slice(0,2)).map(s=>`<span>${esc(s)}</span>`).join('');
    const sw=p.sw&&p.sw.length>1?`<div class="swatches" aria-hidden="true">${p.sw.map((s,j)=>`<a href="${href}&amp;c=${j}" tabindex="-1"><img src="${s}" alt="" width="26" height="26" loading="lazy" decoding="async"></a>`).join('')}${p.swx?`<span>+${p.swx}</span>`:''}</div>`:'';
    return `<article class="pc"><a class="pic" href="${href}" tabindex="-1" aria-hidden="true"><img src="${p.img}" alt="" width="400" height="400" loading="lazy" decoding="async"></a><div class="br">${esc(p.brand)}</div><h3><a href="${href}" title="${esc(p.name)}">${esc(p.name)}</a></h3><div class="tags">${tags}</div>${sw}<div class="row"><span class="pr">${range?'<small>From</small> ':''}${priceHTML(p.price,p.was)}</span>${p.inStock?'<span class="st">In stock</span>':''}</div>${btn}</article>`}
  function draw(push,keep){
    if(!keep)shown=PER;
    tally();
    const ck=isShop?'type':'styles';
    const chipRow=values(ck).map(v=>chip(ck,v)).join('');
    $(isShop?'#type-chips':'#style-chips').innerHTML=chipRow;$(isShop?'#type-sheet':'#style-sheet').innerHTML=chipRow;
    if(!isShop){$('#sp-list').innerHTML=longList('species',values('species'));
      $$('.water .seg button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v||'')===([...S.water][0]||'')))}
    if(F.brand)$('#brand-list').innerHTML=longList('brand',values('brand'));
    if(F.length&&$('#length-list'))$('#length-list').innerHTML=values('length').map(v=>check('length',v)).join('');
    $('#price-list').innerHTML=values('price').map(v=>check('price',v)).join('');
    if(F.size&&$('#size-chips'))$('#size-chips').innerHTML=values('size').map(v=>chip('size',v)).join('')||'<p class="hint">Pick a type to see sizes.</p>';
    let R=D.filter(p=>match(p));
    if(sortSel)sortSel.options[0].textContent=textQ?'Relevance':'Most popular';
    if(!sort&&textQ){const t=textQ.toLowerCase(),named=p=>(p.brand+' '+p.name).toLowerCase().includes(t);R=[...R].sort((a,b)=>named(b)-named(a))}
    if(sort==='new')R=[...R].sort((a,b)=>a.n-b.n);if(sort==='lo')R=[...R].sort((a,b)=>a.price-b.price);if(sort==='hi')R=[...R].sort((a,b)=>b.price-a.price);if(sort==='az')R=[...R].sort((a,b)=>a.name.localeCompare(b.name));
    const join=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
    const main=[...S[ck]];
    let line=R.length+' '+(main.length?join(main.map(s=>s.toLowerCase())):label());
    if(!isShop){if(S.water.size)line+=' for '+[...S.water][0].toLowerCase();if(S.species.size)line+=(S.water.size?', chasing ':' for ')+join([...S.species])}
    if(textQ)line+=` matching "${textQ}"`;
    $('#res').textContent=line;
    const act=[];Object.keys(F).forEach(k=>S[k].forEach(v=>act.push(`<button type="button" data-rm="${k}" data-v="${esc(v)}" aria-label="Remove ${esc(nice(k,v))}"><b>${esc(nice(k,v))}</b> &times;</button>`)));
    if(textQ)act.unshift(`<button type="button" data-rm="q" aria-label="Remove search ${esc(textQ)}"><b>Search: ${esc(textQ)}</b> &times;</button>`);
    if(act.length)act.push('<button type="button" class="clear" data-rm="all">Clear all</button>');
    $('#active').innerHTML=act.join('');
    lastR=R;if(shown>R.length&&R.length)shown=Math.max(PER,Math.ceil(R.length/PER)*PER);
    grid.innerHTML=R.length?R.slice(0,shown).map(cardHTML).join(''):`<div class="empty" style="grid-column:1/-1"><h2>Nothing matches all of those</h2><p>Untick a filter above, <button type="button" class="linkish" data-rm="all">clear all filters</button>, or call the shop on <a href="tel:+61352223257">03 5222 3257</a> and we'll find it for you.</p></div>`;
    paintMore();
    $('#sheet-n').textContent='Show '+R.length+' '+(isShop?'products':'lures');
    syncURL(push);
  }
  const toggle=(k,v)=>{if(F[k].single){const had=S[k].has(v);S[k].clear();if(!had)S[k].add(v)}else S[k].has(v)?S[k].delete(v):S[k].add(v)};
  document.addEventListener('change',e=>{const c=e.target.closest('input[data-f]');if(c){toggle(c.dataset.f,c.dataset.v);draw();const n=$(`input[data-f="${c.dataset.f}"][data-v="${CSS.escape(c.dataset.v)}"]`);n&&n.focus()}});
  document.addEventListener('click',e=>{const c=e.target.closest('.chip[data-f]');if(c){const k=c.dataset.f,v=c.dataset.v,inSheet=!!c.closest('.side');toggle(k,v);draw();const n=$(`${inSheet?'.side ':'.style-row '}.chip[data-f="${k}"][data-v="${CSS.escape(v)}"]`)||$(`.chip[data-f="${k}"][data-v="${CSS.escape(v)}"]`);n&&n.focus()}
    const r=e.target.closest('[data-rm]');if(r){if(r.dataset.rm==='all'){Object.values(S).forEach(s=>s.clear());textQ='';if(inp)inp.value=''}else if(r.dataset.rm==='q'){textQ='';if(inp)inp.value=''}else S[r.dataset.rm].delete(r.dataset.v);draw();($('#active button')||$('#res')).focus()}});
  document.addEventListener('click',e=>{const b=e.target.closest('#load-more');if(!b)return;const from=grid.children.length;shown+=PER;grid.insertAdjacentHTML('beforeend',lastR.slice(from,shown).map(cardHTML).join(''));paintMore();syncURL();const a=grid.children[from]&&$('h3 a',grid.children[from]);a&&a.focus({preventScroll:true})});
  document.addEventListener('click',e=>{const m=e.target.closest('[data-more]'),l=e.target.closest('[data-less]');if(m){expanded.add(m.dataset.more);draw(false,true);const f=$(`[data-find="${m.dataset.more}"]`)||$(`[data-less="${m.dataset.more}"]`);f&&f.focus()}if(l){expanded.delete(l.dataset.less);finds[l.dataset.less]='';draw(false,true);const b=$(`[data-more="${l.dataset.less}"]`);b&&b.focus()}});
  document.addEventListener('input',e=>{const f=e.target.closest('[data-find]');if(f){finds[f.dataset.find]=f.value;draw(false,true);const n=$(`[data-find="${f.dataset.find}"]`);n.focus();n.setSelectionRange(n.value.length,n.value.length)}});
  const water=$('.water');if(water)water.addEventListener('seg',e=>{S.water.clear();if(e.detail)S.water.add(e.detail);draw()});
  
  if(sortSel)sortSel.addEventListener('change',()=>{sort=sortSel.value;draw(true)});
  /* Back to an earlier sort: put the list back without adding another step */
  addEventListener('popstate',()=>{const u=new URLSearchParams(location.search);Object.entries(F).forEach(([k,f])=>{S[k]=new Set((u.get(f.param)||'').split('|').filter(Boolean))});sort=u.get('sort')||'';if(sortSel)sortSel.value=sort;textQ=(u.get('q')||'').trim();if(inp)inp.value=textQ;shown=PER*Math.max(1,parseInt(u.get('p'))||1);draw(false,true)});
  const side=$('.side'),back=$('.sheet-back'),done=$('.sheet-done'),opener=$('.filter-open');
  const bg=()=>[...document.querySelectorAll('body>*:not(main),main>*:not(.lp),.lp>div:not(.sheet-back)')];
  const openSheet=()=>{bg().forEach(x=>x.inert=true);side.classList.add('open');back.classList.add('open');done.classList.add('on');document.body.classList.add('locked');($('.sheet-x')||side).focus()};
  closeSheet=()=>{if(!side.classList.contains('open'))return;bg().forEach(x=>x.inert=false);side.classList.remove('open');back.classList.remove('open');done.classList.remove('on');document.body.classList.remove('locked');(opener.offsetParent?opener:($('#sort')||$('.style-row .chip')||opener)).focus()};
  opener.addEventListener('click',openSheet);back.addEventListener('click',closeSheet);done.addEventListener('click',closeSheet);$('.sheet-x')&&$('.sheet-x').addEventListener('click',closeSheet);
  matchMedia('(min-width:821px)').addEventListener('change',m=>{if(m.matches)closeSheet()});
  if(qs.get('sheet'))openSheet();
  /* Back from a product: same ticks and sort (the URL has them), same open lists and scroll position, restored after the list has drawn */
  const listKey=()=>'aof-list:'+location.pathname+location.search;
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  addEventListener('pagehide',()=>{try{sessionStorage.setItem(listKey(),JSON.stringify({y:scrollY,open:[...expanded]}))}catch(e){}});
  const nav=performance.getEntriesByType('navigation')[0];let saved=null;
  if(nav&&nav.type!=='navigate'){try{saved=JSON.parse(sessionStorage.getItem(listKey())||'null')}catch(e){}if(saved)(saved.open||[]).forEach(k=>expanded.add(k))}
  draw(false,true);
  if(saved){const go=()=>scrollTo({top:saved.y,behavior:'instant'});go();requestAnimationFrame(go);addEventListener('load',go,{once:true})}
}
})();
