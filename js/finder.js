/* All Out Fishing concept: "Where are you fishing?" finder. A future idea, not for launch.
   Data: js/finder-data.js, built by _src/finder-data.py from VFA stocking records and OpenStreetMap.
   No bag or size limits and no "what's biting" claims, on purpose. Sources: _src/finder-sources.md. */
(function(){
'use strict';
var root=document.getElementById('finder');if(!root)return;
var SHOP=[-38.142,144.339];
var LEAFLET='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
var CLUSTER='https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/';
var VFA_GUIDE='https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide';
var PAGE=20;
var AOF_SP=window.AOF_SPECIES||[];
var CATS=window.AOF_CATS||{};
var OPT={'australian-salmon':1,'bream':1,'brown-trout':1,'flathead':1,'king-george-whiting':1,'snapper':1,'southern-calamari':1};
var CHIP_LABEL={'Yellow Belly':'Yellowbelly','Murray Cod':'Murray cod','Estuary Perch':'Estuary perch','King George Whiting':'KG whiting','Australian Salmon':'Salmon'};
var TYPE_LABEL={lake:'Lake',river:'River',estuary:'Estuary',bay:'Bay'};

var D,W,BY={},SP,GROUPS=[],state={q:'',chip:'',sort:'near',me:null,shown:PAGE,open:null};
var map,cluster,markers={},rampLayer,mapOk=false;
var $=function(s,el){return (el||document).querySelector(s);};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function load(src,isCss){return new Promise(function(ok,no){var el=document.createElement(isCss?'link':'script');if(isCss){el.rel='stylesheet';el.href=src;}else{el.src=src;}el.onload=ok;el.onerror=no;document.head.appendChild(el);setTimeout(function(){no(new Error('timeout'));},12000);});}
function km(a,b){var r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r,h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)*Math.sin(dn/2);return 12742*Math.asin(Math.sqrt(h));}
function big(n){return n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'M':n>=1e4?Math.round(n/1e3)+'k':n.toLocaleString('en-AU');}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function ym(s){if(!s)return '';var p=s.split('-');return MON[+p[1]-1]+' '+p[0];}
function lureUrl(sp){return AOF_SP.indexOf(sp)>-1?'lures.html?species='+encodeURIComponent(sp):'lures.html';}
function shopUrl(cat,type){var has=!!(CATS[cat]&&CATS[cat][2].indexOf(type)>-1);return 'shop.html?cat='+cat+(type&&has?'&type='+encodeURIComponent(type):'');}
function group(vfa){var m=SP[vfa]||{};return m.lure||m.label||vfa;}
function photo(key){return key?(OPT[key]?'assets/opt/sp-'+key+'.webp':'assets/species/'+key+'.jpg'):'';}
function compass(a,b){var d=Math.atan2((b[1]-a[1])*Math.cos(a[0]*Math.PI/180),b[0]-a[0])*180/Math.PI;return ['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(((d+360)%360)/45)%8];}
function total(w){return w.s.reduce(function(a,s){return a+s[1];},0);}
function last(w){return w.s.reduce(function(a,s){return s[2]>a?s[2]:a;},'');}
function dist(w){return state.me?Math.round(km(state.me,[w.la,w.lo])):w.g;}
function thumb(w,px){return w.p?w.p.u.replace(/\/960px-/,'/'+px+'px-'):'';}
function salt(w){return w.t==='bay'||!!w.src;}

/* ---------- start */
var dataSrc=(document.currentScript&&document.currentScript.src||'js/finder.js').replace(/finder\.js(\?.*)?$/,'finder-data.js');
load(dataSrc).then(init,function(){$('#fd-list').innerHTML='<li class="fd-none">The water list didn&rsquo;t load. Try refreshing.</li>';});

function init(){
  D=window.AOF_FINDER;W=D.waters;SP=D.species;
  W.forEach(function(w){BY[w.id]=w;w._g={};w.s.forEach(function(s){w._g[group(s[0])]=1;});});
  var counts={};W.forEach(function(w){Object.keys(w._g).forEach(function(g){counts[g]=(counts[g]||0)+1;});});
  GROUPS=Object.keys(counts).filter(function(g){return AOF_SP.indexOf(g)>-1;}).sort(function(a,b){return counts[b]-counts[a];});
  $('#fd-sub').textContent=D.meta.waters+' Victorian waters, '+D.meta.stocked+' with VFA stocking records. Tap one.';
  $('#fd-src').innerHTML='Stocking: <a href="'+esc(D.meta.vfaDb)+'" rel="noopener">Victorian Fisheries Authority stocking database</a>, '+D.meta.stockFrom+' to '+ym(D.meta.stockTo.slice(0,7))+', &copy; State of Victoria. Ramps and jetties: &copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors. Downloaded '+esc(D.meta.built.split('-').reverse().join('/'))+'.';
  var p=new URLSearchParams(location.search);
  var sp=p.get('species');if(sp&&counts[sp])state.chip=sp;
  chips();list();
  var w=p.get('water');if(w&&BY[w])open(w,false);
  bind();
  loadMap();
}

/* ---------- chips, search, sort */
function chips(){
  var el=$('#fd-chips');
  el.innerHTML='<span class="fd-chips-lab">Show me</span>'+GROUPS.map(function(g){return '<button type="button" class="fd-chip" data-chip="'+esc(g)+'" aria-pressed="'+(state.chip===g)+'">'+esc(CHIP_LABEL[g]||g)+'</button>';}).join('');
  var go=$('#fd-go');
  if(state.chip&&AOF_SP.indexOf(state.chip)>-1){go.hidden=false;go.innerHTML='<a class="btn btn-mint" href="'+lureUrl(state.chip)+'">Browse '+esc(CHIP_LABEL[state.chip]||state.chip)+' lures</a>';}
  else{go.hidden=true;go.innerHTML='';}
}
function filtered(){
  var q=state.q.trim().toLowerCase();
  var out=W.filter(function(w){
    if(state.chip&&!w._g[state.chip])return false;
    if(q&&(w.n+' '+(w.v||'')+' '+w.r).toLowerCase().indexOf(q)<0)return false;
    return true;
  });
  out.sort(state.sort==='most'?function(a,b){return total(b)-total(a);}:function(a,b){return dist(a)-dist(b);});
  return out;
}
function rowSpecies(w){
  var g=Object.keys(w._g).map(function(k){return CHIP_LABEL[k]||k;});
  return g.slice(0,3).join(', ')+(g.length>3?' +'+(g.length-3):'');
}
function list(){
  var f=filtered(),el=$('#fd-list');
  $('#fd-count').textContent=f.length+(f.length===1?' water':' waters')+(state.chip?' with '+(CHIP_LABEL[state.chip]||state.chip).toLowerCase():'');
  el.innerHTML=f.slice(0,state.shown).map(function(w){
    return '<li><a href="finder.html?water='+w.id+'" data-water="'+w.id+'"'+(state.open===w.id?' aria-current="true"':'')+'>'+(w.p?'<img class="fd-ico fd-thumb" src="'+esc(thumb(w,120))+'" alt="" width="34" height="34" loading="lazy">':'<span class="fd-ico fd-ico-'+w.t+'" aria-hidden="true"></span>')+'<span class="fd-row"><span class="fd-name">'+esc(w.n)+'</span><span class="fd-meta">'+esc(rowSpecies(w))+'</span></span><span class="fd-km">'+dist(w)+'<small>km</small></span></a></li>';
  }).join('')||'<li class="fd-none">No waters match. Try another name or fish.</li>';
  var ph=f.filter(function(w){return w.p;}),strip=$('#fd-strip');
  strip.hidden=!ph.length;
  strip.innerHTML=ph.length?'<ul>'+ph.slice(0,12).map(function(w){return '<li><a href="finder.html?water='+w.id+'" data-water="'+w.id+'"><img src="'+esc(thumb(w,330))+'" alt="" width="330" height="186" loading="lazy"><span class="fd-strip-n">'+esc(w.n)+'</span><span class="fd-strip-k">'+dist(w)+' km</span></a></li>';}).join('')+'</ul>':'';
  var more=$('#fd-more');more.hidden=f.length<=state.shown;more.textContent='Show '+Math.min(PAGE,f.length-state.shown)+' more';
  if(mapOk)paint(f);
}
function bind(){
  var t;$('#fd-q').addEventListener('input',function(e){clearTimeout(t);t=setTimeout(function(){state.q=e.target.value;state.shown=PAGE;if(state.open){close(true);history.replaceState(null,'','finder.html');}list();},120);});
  root.addEventListener('click',function(e){
    var c=e.target.closest('[data-chip]');if(c){var v=c.dataset.chip;state.chip=state.chip===v?'':v;state.shown=PAGE;if(state.open){close(true);history.replaceState(null,'','finder.html');}chips();list();fit();var nc=$('[data-chip="'+v+'"]');if(nc)nc.focus();return;}
    var s=e.target.closest('[data-sort]');if(s){sortBy(s.dataset.sort);return;}
    var a=e.target.closest('a[data-water]');if(a&&!e.metaKey&&!e.ctrlKey){e.preventDefault();open(a.dataset.water,true);return;}
    if(e.target.closest('#fd-more')){state.shown+=PAGE;list();return;}
    if(e.target.closest('[data-close]')){close();return;}
    var k=e.target.closest('[data-kit]');if(k){var box=$('#fd-kit'),on=k.getAttribute('aria-expanded')!=='true';k.setAttribute('aria-expanded',on);box.hidden=!on;if(on)box.scrollIntoView({block:'nearest',behavior:'smooth'});}
  });
  addEventListener('popstate',function(){var w=new URLSearchParams(location.search).get('water');if(w&&BY[w])open(w,false);else close(true);});
}
function sortBy(k){
  if(k==='me'&&!state.me){
    if(!navigator.geolocation){note('Location isn&rsquo;t available in this browser.');return;}
    var b=$('[data-sort="me"]');b.textContent='Finding you…';
    navigator.geolocation.getCurrentPosition(function(p){state.me=[p.coords.latitude,p.coords.longitude];b.textContent='Near me';setSort('me');},function(){b.textContent='Near me';note('Couldn&rsquo;t get your location. Sorted by distance from the shop.');},{timeout:10000,maximumAge:600000});
    return;
  }
  if(k==='near')state.me=null;
  setSort(k);
}
function setSort(k){state.sort=k==='most'?'most':'near';root.querySelectorAll('[data-sort]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sort===k);});state.shown=PAGE;list();}
function note(h){var n=document.querySelector('.note');if(n){n.innerHTML=h;n.classList.add('on');setTimeout(function(){n.classList.remove('on');},3500);}}

/* ---------- water panel */
var FISH='<svg viewBox="0 0 120 48" aria-hidden="true"><path d="M8 24c14-15 38-20 62-16 12 2 22 8 30 16-8 8-18 14-30 16-24 4-48-1-62-16zm92 0 16-14v28z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="26" cy="21" r="3" fill="currentColor"/></svg>';
function speciesCards(w){
  var seen={};
  return w.s.map(function(s){
    var m=SP[s[0]]||{label:s[0]},img=photo(m.photo),lure=m.lure&&AOF_SP.indexOf(m.lure)>-1?m.lure:null;
    var stat=s[1]?'<span class="fd-sp-stat"><b>'+big(s[1])+'</b> stocked'+(s[2]?' &middot; last '+ym(s[2]):'')+'</span>':'<span class="fd-sp-stat">In the VFA guide</span>';
    var link=lure&&!seen[lure]?'<a class="fd-sp-go" href="'+lureUrl(lure)+'">Browse '+esc(CHIP_LABEL[lure]||lure)+' lures</a>':'';
    if(lure)seen[lure]=1;
    var pic=img?'<img src="'+img+'" alt="One of the crew holding a '+esc(m.label.toLowerCase())+'" width="640" height="480" loading="lazy">':'<span class="fd-sp-blank">'+FISH+'</span>';
    return '<li class="fd-sp'+(img?'':' fd-sp-name')+'"><div class="fd-sp-pic">'+pic+'<span class="fd-sp-tag">'+esc(m.label)+'</span></div>'+stat+link+'</li>';
  }).join('');
}
function kit(w){
  var g=w._g,saltw=salt(w),cod=g['Murray Cod'],trout=g.Trout&&Object.keys(g).length===1;
  var items=saltw?[
    ['rods','2 to 4 kg spin rod',shopUrl('rods','Spinning Rod')],['reels','2500 to 4000 spin reel',shopUrl('reels','Spinning Reel')],['line','Braid and leader',shopUrl('line','Braid')],['terminal','Sinkers and bait hooks',shopUrl('terminal','Sinker')],['lures',AOF_SP.indexOf(Object.keys(g)[0])>-1?'Lures for '+(CHIP_LABEL[Object.keys(g)[0]]||Object.keys(g)[0]).toLowerCase():'Lures for this water',lureUrl(Object.keys(g)[0])]
  ]:cod?[
    ['rods','Baitcast or heavy spin rod',shopUrl('rods','Baitcast Rods')],['reels','Baitcast reel',shopUrl('reels','Baitcast Reels')],['line','30 to 50 lb braid',shopUrl('line','Braid')],['lures','Cod lures',lureUrl('Murray Cod')],['terminal','Snaps for quick lure changes',shopUrl('terminal','Swivels & Snaps')]
  ]:trout?[
    ['rods','Light spin rod',shopUrl('rods','Spinning Rod')],['reels','1000 to 2500 spin reel',shopUrl('reels','Spinning Reel')],['line','Light braid and leader',shopUrl('line','Leader')],['lures','Trout lures',lureUrl('Trout')],['terminal','Floats, hooks and sinkers for bait',shopUrl('terminal','Floats')]
  ]:[
    ['rods','2 to 4 kg spin rod',shopUrl('rods','Spinning Rod')],['reels','2500 spin reel',shopUrl('reels','Spinning Reel')],['line','Braid and leader',shopUrl('line','Braid')],['lures',AOF_SP.indexOf(Object.keys(g)[0])>-1?'Lures for '+(CHIP_LABEL[Object.keys(g)[0]]||Object.keys(g)[0]).toLowerCase():'Lures for this water',lureUrl(Object.keys(g)[0])],['terminal','Sinkers and hooks',shopUrl('terminal','Sinker')]
  ];
  return '<ul class="fd-kit-list">'+items.map(function(i){return '<li><a href="'+i[2]+'"><img src="assets/tiles/'+i[0]+'.webp" alt="" width="640" height="480" loading="lazy"><span>'+esc(i[1])+'</span></a></li>';}).join('')+'</ul><p class="fd-kit-foot">Not sure? <a href="index.html#setup">Build a setup</a> or call <a href="tel:+61352223257">03 5222 3257</a>.</p>';
}
function hero(w){
  if(w.p)return '<figure class="fd-hero"><img src="'+esc(w.p.u)+'" alt="'+esc(w.n)+'" width="960" height="540"><figcaption><a href="'+esc(w.p.h)+'" rel="noopener">Photo: '+esc(w.p.a||'Wikimedia Commons')+', '+esc(w.p.l)+'</a></figcaption></figure>';
  if(mapOk)return '';
  // No photo and no live map: a little map made of OpenStreetMap tiles, centred on the water.
  var z=11,n=Math.pow(2,z),x=(w.lo+180)/360*n,r=w.la*Math.PI/180,y=(1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*n;
  var tx=Math.floor(x)-2,ty=Math.floor(y)-2,ox=(x-tx)/4,oy=(y-ty)/4,t='';
  for(var j=0;j<4;j++)for(var i=0;i<4;i++)t+='<img src="https://tile.openstreetmap.org/'+z+'/'+(tx+i)+'/'+(ty+j)+'.png" alt="" width="256" height="256" loading="lazy">';
  // The tile block is twice the frame's width; the frame is 16:9, so the block is 32/9 frames tall.
  return '<figure class="fd-hero fd-tiles" aria-hidden="true"><div class="fd-tiles-in" style="left:'+(50-ox*200).toFixed(2)+'%;top:'+(50-oy*200*16/9).toFixed(2)+'%">'+t+'</div><span class="fd-hero-pin"></span><figcaption>&copy; OpenStreetMap contributors</figcaption></figure>';
}
function open(id,push){
  var w=BY[id];if(!w)return;state.open=id;
  var panel=$('#fd-panel'),tot=total(w),ls=last(w);
  var ramps=w.b.length?'<ul class="fd-ramps">'+w.b.map(function(b){return '<li><a href="https://www.openstreetmap.org/?mlat='+b[2]+'&amp;mlon='+b[3]+'#map=16/'+b[2]+'/'+b[3]+'" rel="noopener"><span class="fd-ramp-ico" aria-hidden="true"></span><span>'+(b[0]?esc(b[0]):'Boat ramp <small>'+compass([w.la,w.lo],[b[2],b[3]])+'</small>')+'</span><b>'+(b[1]<.5?'Here':b[1]+' km')+'</b></a></li>';}).join('')+'</ul>':'<p class="fd-quiet">No mapped ramps within 15 km.</p>';
  var shore=w.k[0]?'<p class="fd-shore"><b>'+w.k[0]+'</b> jett'+(w.k[0]===1?'y or fishing spot':'ies and fishing spots')+' within 5 km'+(w.k[1].length?': '+w.k[1].map(function(s){return esc(s[0]);}).join(', '):'')+'</p>':'<p class="fd-quiet">No mapped jetties or fishing spots within 5 km.</p>';
  var dirs='https://www.google.com/maps/dir/?api=1&amp;destination='+w.la+','+w.lo;
  panel.innerHTML='<div class="fd-p-top"><button type="button" class="fd-back" data-close>All waters</button><a class="fd-dirs" href="'+dirs+'" rel="noopener">Directions</a></div>'+hero(w)+
    '<div class="fd-p-head"><span class="fd-type">'+TYPE_LABEL[w.t]+'</span><h2>'+esc(w.n)+'</h2><p>'+esc(w.r)+' &middot; '+dist(w)+' km from '+(state.me?'you':'the shop')+'</p></div>'+
    (salt(w)?'<p class="fd-quiet fd-salt">Not stocked. Fish from the <a href="'+esc(w.src)+'" rel="noopener">VFA fishing guide</a>.</p>':
    '<dl class="fd-stats"><div><dt>Fish stocked since '+D.meta.stockFrom+'</dt><dd>'+big(tot)+'</dd></div><div><dt>Last stocked</dt><dd>'+ym(ls)+'</dd></div><div><dt>Species</dt><dd>'+w.s.length+'</dd></div></dl>')+
    '<button type="button" class="btn btn-mint fd-kit-btn" data-kit aria-expanded="false" aria-controls="fd-kit">Just give me the essentials</button><div class="fd-kit" id="fd-kit" hidden>'+kit(w)+'</div>'+
    '<h3 class="fd-h">'+(salt(w)?'Fish here':'Stocked here')+'</h3><ul class="fd-sps">'+speciesCards(w)+'</ul>'+
    (w.b.length||w.k[0]?'<div class="fd-access"><div><h3 class="fd-h">Nearest boat ramps</h3>'+ramps+'<p class="fd-quiet">Mapped ramps closest to this water. Check they launch onto it.</p></div><div><h3 class="fd-h">From the bank</h3>'+shore+'</div></div>':'<p class="fd-quiet fd-none-mapped">No boat ramps or jetties mapped nearby.</p>')+
    '<p class="fd-p-src">'+(w.v?'VFA name: '+esc(w.v)+'. ':'')+'<a href="'+VFA_GUIDE+'" rel="noopener">Check the rules</a> before you go.</p>';
  panel.hidden=false;$('#fd-results').hidden=true;
  if(push!==false)history.pushState(null,'','finder.html?water='+id+(state.chip?'&species='+encodeURIComponent(state.chip):''));
  else if(push===false&&!/water=/.test(location.search))history.replaceState(null,'','finder.html?water='+id);
  document.title=w.n+' | Where are you fishing? | All Out Fishing';
  if(mapOk)focus(w);
  if(push!==false){panel.focus({preventScroll:true});if(innerWidth<900)(mapOk?$('#fd-map'):panel).scrollIntoView({behavior:'smooth',block:'start'});else if(panel.getBoundingClientRect().top<0)panel.scrollIntoView({behavior:'smooth',block:'start'});}
}
function close(fromPop){
  var id=state.open;state.open=null;$('#fd-panel').hidden=true;$('#fd-results').hidden=false;
  if(!fromPop)history.pushState(null,'','finder.html'+(state.chip?'?species='+encodeURIComponent(state.chip):''));
  document.title='Where are you fishing? | All Out Fishing';
  list();if(rampLayer)rampLayer.clearLayers();fit();
  var a=!fromPop&&id&&$('#fd-list a[data-water="'+id+'"]');if(a)a.focus();
}

/* ---------- map */
function loadMap(){
  Promise.all([load(LEAFLET+'leaflet.min.css',true),load(LEAFLET+'leaflet.min.js')])
  .then(function(){return Promise.all([load(CLUSTER+'MarkerCluster.min.css',true),load(CLUSTER+'leaflet.markercluster.min.js')]);})
  .then(makeMap).catch(function(){var m=$('#fd-map');m.classList.add('fd-map-off');m.innerHTML='<p class="fd-map-msg">The map didn&rsquo;t load. Use the list.</p>';});
}
function makeMap(){
  var el=$('#fd-map');el.innerHTML='';
  map=L.map(el,{zoomSnap:.5,scrollWheelZoom:false,attributionControl:true});vic();
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
  el.addEventListener('click',function(){map.scrollWheelZoom.enable();},{once:true});
  cluster=L.markerClusterGroup({showCoverageOnHover:false,maxClusterRadius:44,spiderfyOnMaxZoom:true,
    iconCreateFunction:function(c){var n=c.getChildCount();return L.divIcon({html:'<span>'+n+'</span>',className:'fd-clu'+(n>20?' fd-clu-l':''),iconSize:n>20?[46,46]:[38,38]});}});
  W.forEach(function(w){
    var m=L.marker([w.la,w.lo],{icon:L.divIcon({className:'fd-pin fd-pin-'+(salt(w)?'salt':'fresh'),iconSize:[22,22]}),title:w.n,alt:w.n,keyboard:false});
    m.on('click',function(){open(w.id,true);});
    m.bindTooltip(esc(w.n),{direction:'top',offset:[0,-10]});
    markers[w.id]=m;
  });
  map.addLayer(cluster);
  rampLayer=L.layerGroup().addTo(map);
  mapOk=true;paint(filtered());
  var mk=L.marker(SHOP,{icon:L.divIcon({className:'fd-shop',html:'<span>Shop</span>',iconSize:[46,22]}),keyboard:false,zIndexOffset:1000}).addTo(map);
  mk.bindTooltip('All Out Fishing, 105 Shannon Ave',{direction:'top'});
  if(state.open)open(state.open,false);else fit();
}
function paint(f){
  cluster.clearLayers();
  cluster.addLayers(f.map(function(w){return markers[w.id];}));
  Object.keys(markers).forEach(function(id){var e=markers[id].getElement();if(e)e.classList.toggle('on',id===state.open);});
}
function fit(){
  if(!mapOk||state.open)return;
  var f=filtered();
  if(f.length&&f.length<W.length)map.fitBounds(L.latLngBounds(f.map(function(w){return [w.la,w.lo];})).pad(.15),{maxZoom:10});
  else vic();
}
function vic(){map.fitBounds(L.latLngBounds(W.map(function(w){return [w.la,w.lo];})),{padding:[16,16]});}
function focus(w){
  rampLayer.clearLayers();
  w.b.forEach(function(b){L.marker([b[2],b[3]],{icon:L.divIcon({className:'fd-rampm',iconSize:[16,16]}),keyboard:false,title:b[0]||'Boat ramp'}).bindTooltip(esc(b[0]||'Boat ramp')).addTo(rampLayer);});
  var pts=[[w.la,w.lo]].concat(w.b.map(function(b){return [b[2],b[3]];}));
  var m=markers[w.id];
  if(!cluster.hasLayer(m))cluster.addLayer(m);
  map.fitBounds(L.latLngBounds(pts).pad(.35),{maxZoom:12});
  setTimeout(function(){Object.keys(markers).forEach(function(id){var e=markers[id].getElement();if(e)e.classList.toggle('on',id===w.id);});},450);
}
})();
