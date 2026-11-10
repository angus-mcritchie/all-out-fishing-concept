/* Cart page. The demo cart lives in sessionStorage via window.AOFCart (js/site.js); nothing is sent anywhere. */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const C=window.AOFCart;if(!C)return;
const money=n=>'$'+Number(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const F=window.AOFFormat;
const keyOf=x=>x.id+'|'+(x.option||'');
const list=$('#cart-lines'),full=$('#cart-full'),empty=$('#cart-empty'),bar=$('#cart-bar'),live=$('#cart-live'),msg=$('#ck-msg');

/* ?demo=1 seeds three real lines when the cart is empty: a Daiwa reel, a lure and a float */
if(new URLSearchParams(location.search).get('demo')==='1'&&!C.get().length)window.AOFCatalogue().then(()=>{
  const items=window.AOF_ITEMS||[],lures=window.AOF_LURES||[];
  const reel=items.find(x=>x.cat==='reels'&&x.brand==='Daiwa');
  const lure=lures[0];
  const flt=items.find(x=>x.cat==='terminal'&&x.type==='Float');
  const seed=[];
  const fmt=window.AOFFormat;
  if(reel)seed.push({id:fmt.productId(reel),href:fmt.pdpHref(reel),name:reel.name,brand:reel.brand,img:reel.img,price:reel.price,qty:1,option:''});
  if(lure)seed.push({id:fmt.productId(lure),href:fmt.pdpHref(lure),name:lure.name,brand:lure.brand,img:lure.img,price:lure.price,was:lure.was,qty:2,option:''});
  if(flt)seed.push({id:fmt.productId(flt),href:fmt.pdpHref(flt),name:flt.name,brand:flt.brand,img:flt.img,price:flt.price,qty:4,option:''});
  C.set(seed);
});

const totals=items=>({n:items.reduce((a,x)=>a+x.qty,0),sum:items.reduce((a,x)=>a+x.price*x.qty,0)});
const itemsWord=n=>n+(n===1?' item':' items');

function line(x,i){
  const k=esc(keyOf(x)),nm=esc(x.name);
  return `<li class="line" data-key="${k}">
  <a class="l-pic" href="${esc(x.href||'product.html')}" tabindex="-1" aria-hidden="true"><img src="${esc(x.img)}" alt="" width="200" height="200"></a>
  <div class="l-info">${x.brand?`<p class="l-br">${esc(x.brand)}</p>`:''}<h3 class="l-name"><a href="${esc(x.href||'product.html')}">${nm}</a></h3>${x.option?`<p class="l-opt">${esc(F.unit(x.option))}</p>`:''}<p class="l-each"><span class="now">${money(x.price)}</span> each${x.was>x.price?` <span class="save">${F.saveText(x.price,x.was)}</span> <s class="was"><span class="sr">Regular price </span>${money(x.was)}</s>`:''}</p></div>
  <div class="l-ctl"><div class="step" role="group" aria-label="Quantity of ${nm}"><button type="button" data-dec aria-label="Decrease quantity of ${nm}"${x.qty<=1?' disabled':''}>&minus;</button><output aria-label="Quantity">${x.qty}</output><button type="button" data-inc aria-label="Increase quantity of ${nm}"${x.qty>=99?' disabled':''}>+</button></div><button type="button" class="l-rm" data-rm>Remove<span class="sr"> ${nm}</span></button></div>
  <p class="l-tot"><span class="sr">Line total </span>${money(x.price*x.qty)}</p>
</li>`}

function render(){
  const items=C.get(),t=totals(items);
  $('#cart-count').textContent=items.length?itemsWord(t.n):'';
  full.hidden=!items.length;empty.hidden=!!items.length;
  if(!items.length){list.innerHTML='';syncBar();return}
  list.innerHTML=items.map(line).join('');
  $('#sum-sub').textContent=money(t.sum);$('#sum-total').textContent=money(t.sum);$('#bar-total').textContent=money(t.sum);
  syncBar();
}

function say(s){live.textContent='';setTimeout(()=>{live.textContent=s},60)}

list.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const li=b.closest('.line'),key=li.dataset.key;
  const items=C.get(),i=items.findIndex(x=>keyOf(x)===key);if(i<0)return;
  if(b.matches('[data-rm]')){
    const gone=items.splice(i,1)[0];C.set(items);
    const t=totals(items);
    if(!items.length){say(`Removed ${gone.name}. Your cart is empty.`);$('#empty-h').focus();return}
    say(`Removed ${gone.name}. ${itemsWord(t.n)}, total ${money(t.sum)}.`);
    const next=list.querySelectorAll('.line')[Math.min(i,items.length-1)];next&&next.querySelector('.l-name a').focus();
    return}
  const d=b.matches('[data-inc]')?1:b.matches('[data-dec]')?-1:0;if(!d)return;
  items[i].qty=Math.max(1,Math.min(99,items[i].qty+d));C.set(items);
  const t=totals(items);say(`${items[i].name}, quantity ${items[i].qty}. Total ${money(t.sum)}.`);
  /* keep focus on the same button, or its partner if this one is now disabled */
  const nl=list.querySelector(`.line[data-key="${CSS.escape(key)}"]`);if(nl){let f=nl.querySelector(d>0?'[data-inc]':'[data-dec]');if(f.disabled)f=nl.querySelector(d>0?'[data-dec]':'[data-inc]');f.focus()}
});

/* aof-cart fires from C.set(); re-render on any change, including from another script */
document.addEventListener('aof-cart',render);

/* Checkout is a mock: show the inline note, never submit */
document.addEventListener('click',e=>{if(!e.target.closest('[data-checkout]'))return;e.preventDefault();
  msg.hidden=false;msg.classList.remove('flash');void msg.offsetWidth;msg.classList.add('flash');
  if(e.target.closest('#cart-bar'))msg.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  msg.focus({preventScroll:true});
});

/* phones: a sticky total + Checkout bar while the summary's own button is off screen */
let summaryVisible=true;
function syncBar(){bar.hidden=!(matchMedia('(max-width:820px)').matches&&!summaryVisible&&!full.hidden);document.body.classList.toggle('has-cart-bar',!bar.hidden)}
if('IntersectionObserver' in window){new IntersectionObserver(es=>{summaryVisible=es[0].isIntersecting;syncBar()}).observe($('.cart-sum .sum-go'))}
matchMedia('(max-width:820px)').addEventListener('change',syncBar);

/* ---- delivery options. At most one label each: Free, then Fastest, then Cheapest. Never promise a date; prices come from checkout. */
const OPTIONS=[{id:'collect',name:'Click &amp; Collect, Geelong shop',when:'Usually ready within an hour during store hours',free:true},{id:'standard',name:'Standard delivery',when:'Arrives 2 to 7 business days after dispatch'},{id:'express',name:'Express delivery',when:'Arrives 1 to 3 business days after dispatch',fastest:true}];
const labelOf=o=>o.free?'Free':o.fastest?'Fastest':o.cheapest?'Cheapest':'';
const shipBox=$('#ship-opts'),sumDel=$('#sum-del');
if(shipBox){
  shipBox.insertAdjacentHTML('beforeend',OPTIONS.map(o=>{const l=labelOf(o);return `<label class="ship-opt"><input type="radio" name="ship" value="${o.id}"${o.id==='standard'?' checked':''}><span class="so-main"><span class="so-name">${o.name}${l?` <em class="so-tag">${l}</em>`:''}</span><span class="so-date">${o.when}</span></span><span class="so-price">${o.free?'':'Priced at checkout'}</span></label>`}).join(''));
  shipBox.addEventListener('change',()=>{const v=shipBox.querySelector('input:checked').value;sumDel.textContent=v==='collect'?'Free':'Priced at checkout'});
  const pf=$('#post-form'),pc=$('#post-code'),perr=$('#post-err'),pnote=$('#post-note');
  const checkPost=()=>{const v=pc.value.trim(),msg=!v?'Enter your postcode':/^\d{4}$/.test(v)?'':'Enter a 4-digit postcode';perr.textContent=msg;if(msg)pc.setAttribute('aria-invalid','true');else pc.removeAttribute('aria-invalid');return !msg};
  pc.addEventListener('input',()=>{if(pc.getAttribute('aria-invalid'))checkPost()});
  pf.addEventListener('submit',e=>{e.preventDefault();if(!checkPost()){pnote.textContent='';pc.focus();return}pnote.textContent=`Delivery to ${pc.value.trim()} is priced at checkout.`});
}

render();
})();
