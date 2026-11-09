/* Cart page. The demo cart lives in sessionStorage via window.AOFCart (js/site.js); nothing is sent anywhere. */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const C=window.AOFCart;if(!C)return;
const money=n=>'$'+Number(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keyOf=x=>x.id+'|'+(x.option||'');
const list=$('#cart-lines'),full=$('#cart-full'),empty=$('#cart-empty'),bar=$('#cart-bar'),live=$('#cart-live'),msg=$('#ck-msg');

/* ?demo=1 seeds three real lines when the cart is empty: a Daiwa reel, a lure and a Jarvis Walker float */
if(new URLSearchParams(location.search).get('demo')==='1'&&!C.get().length){
  const items=window.AOF_ITEMS||[],lures=window.AOF_LURES||[];
  const reel=items.find(x=>x.cat==='reels'&&x.name==='Daiwa Aird LT')||items.find(x=>x.cat==='reels'&&x.brand==='Daiwa');
  const lure=lures.find(x=>x.name==='Daiwa Double Clutch 95SP')||lures[0];
  const flt=items.find(x=>x.brand==='Jarvis Walker'&&x.type==='Floats');
  const seed=[];
  if(reel)seed.push({id:'item-'+reel.id,name:reel.name,brand:reel.brand,img:reel.img,price:reel.price,qty:1,option:''});
  if(lure)seed.push({id:'lure-'+lure.name,name:lure.name,brand:lure.brand,img:lure.img,price:lure.price,qty:2,option:''});
  if(flt)seed.push({id:'item-'+flt.id,name:flt.name,brand:flt.brand,img:flt.img,price:flt.price,qty:4,option:'',src:flt.src});
  C.set(seed);
}

const totals=items=>({n:items.reduce((a,x)=>a+x.qty,0),sum:items.reduce((a,x)=>a+x.price*x.qty,0)});
const itemsWord=n=>n+(n===1?' item':' items');

function line(x,i){
  const k=esc(keyOf(x)),nm=esc(x.name);
  return `<li class="line" data-key="${k}">
  <a class="l-pic" href="product.html" tabindex="-1" aria-hidden="true"><img src="${esc(x.img)}" alt="" width="200" height="200"></a>
  <div class="l-info">${x.brand?`<p class="l-br">${esc(x.brand)}</p>`:''}<h3 class="l-name"><a href="product.html">${nm}</a></h3>${x.option?`<p class="l-opt">${esc(x.option)}</p>`:''}<p class="l-each">${money(x.price)} each${x.src&&x.src!=='aof'?' <span class="l-rrp">(maker&rsquo;s RRP, sample)</span>':''}</p></div>
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

render();
})();
