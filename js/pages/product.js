/* Product page. ?p=<slug> swaps the static example for that product, before site.js wires up the sizes, photos and cart. Without it, or without JS, the example stays. */
(function(){
var q=new URLSearchParams(location.search),slug=q.get('p');if(!slug||!window.AOF_ITEMS)return;
var note=document.querySelector('.data-note');
var p=window.AOF_ITEMS.concat(window.AOF_LURES).find(function(x){return x.slug===slug});
if(!p){/* no buying controls on a product that doesn't exist */
  document.title='Product not found | All Out Fishing';
  var mn=document.querySelector('main');
  if(mn)mn.innerHTML='<nav class="crumbs" aria-label="Breadcrumb"><a class="home" href="index.html">Home</a></nav><div class="empty"><h1>We can\'t find that product</h1><p>It may have sold out or moved. <a href="shop.html?all=1">Browse everything</a>, <a href="lures.html">open the Lure Browser</a>, or call the shop on <a href="tel:+61352223257">03 5222 3257</a>.</p></div>';
  var bb=document.querySelector('.buybar');if(bb)bb.remove();
  return}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '$'+Number(n).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2})}
function save(price,was){var d=Math.round((was-price)*100)/100;return 'Save $'+(Number.isInteger(d)?d:d.toFixed(2))}
function text(s,v){var e=$(s);if(e)e.textContent=v}
var det=(window.AOF_DETAILS||[])[p.i]||[],sizes=det[0]||[],cols=det[1]||[];
var isLure=p.cat==='lures',catName=isLure?'Lures':window.AOF_CATS[p.cat][0],style=isLure?(p.styles.filter(function(s){return s!=='Bluewater'&&s!=='Estuary & Freshwater'})[0]||''):p.type;
var catHref=isLure?'lures.html':'shop.html?cat='+p.cat,subHref=isLure?(style?'lures.html?styles='+encodeURIComponent(style):''):catHref+'&type='+encodeURIComponent(p.type);
document.title=p.name+' | All Out Fishing';
var md=$('meta[name=description]');if(md)md.setAttribute('content',p.name+'. Order by 12pm on weekdays for same-day dispatch, or Click & Collect in Geelong.');
var cr=$('.crumbs');if(cr)cr.innerHTML='<a class="home" href="index.html">Home</a><span class="sep home"> / </span><a href="'+catHref+'">'+esc(catName)+'</a>'+(style?' / <a href="'+subHref+'">'+esc(style)+'</a>':'');
var br=$('.pdp-head .br');if(br)br.innerHTML='<a href="shop.html?brand='+encodeURIComponent(p.brand)+'">'+esc(p.brand)+'</a>';
text('.pdp-head h1',p.name);text('#zoom-t','Larger photo of '+p.name);
/* photos: one per colour we have a photo of, the colour they tapped on the card first */
var photos=p.sw&&p.sw.length?p.sw.map(function(u,i){return{src:u.replace('/s/','/c/'),colour:cols[i]||'',c:i}}):[{src:p.img,colour:''}];
var c=parseInt(q.get('c'),10);if(c>0&&c<photos.length)photos.unshift(photos.splice(c,1)[0]);
if(det[2])photos.push({src:p.img,colour:''});
var alt=function(x){return p.name+(x.colour?', '+x.colour:'')};
var gal=$('.gal');
if(gal)gal.innerHTML='<button class="gal-main" type="button" aria-label="Open a larger photo"><img src="'+photos[0].src+'" alt="'+esc(alt(photos[0]))+'" width="800" height="800" fetchpriority="high"></button><div class="gal-thumbs" role="group" aria-label="Photos"'+(photos.length<2?' style="display:none"':'')+'>'+photos.map(function(x,i){return '<button type="button" aria-pressed="'+(i===0)+'" data-full="'+x.src+'" data-alt="'+esc(alt(x))+'" data-colour="'+esc(x.colour)+'"'+(x.c>0?' data-c="'+x.c+'"':'')+' aria-label="Show photo '+(i+1)+' of '+photos.length+'"><img src="'+x.src+'" alt="" width="120" height="120" loading="lazy"></button>'}).join('')+'</div>';
/* colour line: only when the photos name colours */
var lab=$('#colour-lab');
if(lab){if(photos[0].colour){text('#colour',photos[0].colour);text('#colour-more',p.opts>1?p.opts+' colours':'')}else lab.hidden=true}
/* sizes: cheapest first, real price per size. No sizes known: just the price. */
/* one price model: size prices only when the live price is the cheapest size. Otherwise the live price stands and sizes are labels only. A saving belongs to the one size at the sale price. */
var now=p.price,was=p.was||0,row=$('#size-lab-row'),box=$('.sizes'),from=$('#from'),perSize=sizes.length&&sizes[0].length>1,saleTaken=false;
if(sizes.length){
  /* a cart link reopens on the size that was added */
  var pick=Math.max(0,sizes.findIndex(function(s){return s[0]===q.get('s')}));
  if(perSize){now=sizes[pick][1];was=0}
  box.innerHTML=sizes.map(function(s,i){var w='';if(perSize&&p.was&&!saleTaken&&Math.abs(s[1]-p.price)<.005){w=' data-was="'+p.was+'"';saleTaken=true;if(i===pick)was=p.was}return '<button type="button" aria-pressed="'+(i===pick)+'"'+(perSize?' data-price="'+s[1]+'"':'')+w+'>'+esc(s[0])+'</button>'}).join('');
  text('#size',sizes[pick][0]);text('.bb-size',sizes[pick][0]);
  if(from){if(!perSize||sizes.length<2||sizes[0][1]===sizes[sizes.length-1][1])from.hidden=true;else if(pick>0)from.textContent=''}
}else{if(row)row.hidden=true;if(box)box.hidden=true;if(from)from.hidden=true;text('#size','');text('.bb-size','')}
/* stock is known per listing, not per size, so don't claim it when a size has to be picked */
var st=$('.instock');if(st)st.hidden=!(p.inStock&&sizes.length<2);
text('#price',money(now));text('.bb-price',money(now));
var sv=was>now?save(now,was):'';
[['#save',sv],['.bb-save',sv]].forEach(function(x){var e=$(x[0]);if(e){e.textContent=x[1];e.hidden=!x[1]}});
var wa=$('#was');if(wa)wa.hidden=!sv;if(sv)text('#was-v',money(was));
var href='product.html?p='+encodeURIComponent(p.slug);
document.querySelectorAll('.pdp [data-add],.buybar [data-add]').forEach(function(a){a.dataset.img=p.img;a.dataset.name=p.name;a.dataset.brand=p.brand;a.dataset.id='item-'+p.id;a.dataset.href=href;delete a.dataset.price;if(p.was&&!perSize)a.dataset.was=p.was;else delete a.dataset.was});
})();
