/* All Out Fishing concept: "Where are you fishing?" finder. A future idea, not for launch.
   Every fact below is sourced in _src/finder-sources.md (checked 10 Nov 2026). No bag or size limits on purpose. */
(function(){
'use strict';
var VFA_GUIDE='https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide';
var SPECIES=(window.AOF_SPECIES||[]);
function lureUrl(sp,extra){
  var u=new URLSearchParams();
  if(sp&&SPECIES.indexOf(sp)>-1)u.set('species',sp);
  if(extra)Object.keys(extra).forEach(function(k){u.set(k,extra[k]);});
  var q=u.toString();return 'lures.html'+(q?'?'+q:'');
}
function shopUrl(cat,types){return 'shop.html?cat='+cat+(types?'&type='+encodeURIComponent(types.join('|')):'');}
var SETUP='index.html#setup';

var WATERS={
'lake-eildon':{
  name:'Lake Eildon',kind:'Freshwater lake',water:'Freshwater',
  where:'About 150 km north-east of Melbourne, between Mansfield and Alexandra.',
  about:'A huge irrigation storage on the Goulburn, with over 500 km of shoreline. Thick forest on the southern shores, farmland along much of the north. It’s one of Victoria’s best big Murray cod waters, and the only Victorian reservoir where houseboats run.',
  fish:[
    {sp:'Murray Cod',how:'Troll big deep divers, swimbaits or surface lures in 4 to 10 m. Or cast big spinnerbaits and hardbodies at timber, weed edges and banks.'},
    {sp:'Yellow Belly',alt:'Golden perch',how:'Troll small crankbaits, lipless cranks or plastics at 6 to 12 m, or jig small black grubs straight down in the standing trees. Best in October and November.'},
    {sp:'Redfin',how:'Fish straight down in the standing timber with small plastics, vibes or ice jigs. Worms and small yabbies work too. Caught all year.'},
    {sp:'Trout',alt:'Brown and rainbow',how:'Troll slowly with winged lures or small floating minnows. From the bank, spin or fly-fish the edges in low light. Best from May to September.'}
  ],
  ramps:[['Dethridge Point Alliance Ramp','Embankment Rd, next to the dam wall'],['Jerusalem Creek Ramp','Jerusalem Creek Rd'],['Goughs Bay Ramps 6, 7 and 8','Bayside Bvd, Goughs Bay'],['Coller Bay Candlebark Ramp','Fraser Park Rd'],['Jamieson Boat Ramp','Mansfield-Woods Point Rd']],
  rampNote:'Some ramps sit out of the water when the lake is low. Goulburn-Murray Water lists the level each ramp needs.',
  land:[['Eildon Pondage','Below the dam wall. Stocked with trout, with a fishing pier and a wheelchair-friendly floating jetty.'],['Jerusalem Creek','Around the ramp towards the campground, if the lake isn’t too low.'],['Goughs Bay foreshore',''],['Bonnie Doon Bridge','Popular for golden perch when there’s enough water.']],
  stay:['Car-access campgrounds in Lake Eildon National Park: Candlebark, Devil Cove, Lakeside and Jerusalem Creek. Lakeside suits boats best.','Taylors Creek, Mountaineer Creek and Coopers Point are boat-in only.','Candlebark needs a booking. Some campgrounds have lost showers and water, so check Parks Victoria first.','Dogs are only allowed at Jerusalem Creek inside the national park.'],
  know:['The level moves a lot because the lake supplies irrigation water. Check it, and any blue-green algae warning, with Goulburn-Murray Water.','5 knot limit within 50 m of the shore, other boats and swimmers.','Keep out of the marked zones at the dam wall tower and spillway.','Carp can’t go back in alive.'],
  kit:[
    ['A 2-4 kg spin rod and 2500 reel. Covers redfin, yellowbelly and trout.',SETUP,'Build a setup'],
    ['A few small soft plastics and vibes for the standing timber.',lureUrl('',{water:'Freshwater',styles:'Soft Plastics|Vibes & Blades'}),'Plastics and vibes'],
    ['A couple of small floating minnows for trout.',lureUrl('Trout'),'Trout lures'],
    ['Chasing cod? Add a heavier baitcast outfit and a big spinnerbait or deep diver.',lureUrl('Murray Cod'),'Cod lures'],
    ['Braid and a fluorocarbon leader.',shopUrl('line',['Braid','Fluorocarbon']),'Line']
  ],
  links:[['VFA: Lake Eildon fishing guide','https://vfa.vic.gov.au/recreational-fishing/victorias-top-fishing-destinations/lake-eildon'],['Goulburn-Murray Water: level, ramps and algae','https://www.g-mwater.com.au/water-operations/storages/goulburn/lakeeildon'],['Parks Victoria: Lake Eildon National Park','https://www.parks.vic.gov.au/places-to-see/parks/lake-eildon-national-park']]
},
'corio-bay':{
  name:'Corio Bay',kind:'Saltwater bay',water:'Saltwater',
  where:'Geelong waterfront, on the western side of Port Phillip. Our home water.',
  about:'A working port with shipping terminals, overlooked by Geelong. It’s famous for big snapper in winter, and more fish move up the west side of Port Phillip into the bay in spring. Piers, rock walls and ramps are all close to town.',
  fish:[
    {sp:'Snapper',how:'Anchor and berley with pilchard, silver whiting or squid. On lures, try soft plastics, slow pitch jigs or weighted vibes. Pinkies hang around the pylons at Rippleside and Wangim Walk.'},
    {sp:'King George Whiting',how:'Anchor, berley and fish pipis, squid strips, mussels or worms. Try the shallows off Avalon and Kirk Point, or Rippleside from shore. Move if nothing bites in 20 minutes.'},
    {sp:'Flathead',how:'Drift with squid or cut pilchard, or cast 2.5 to 3 inch paddle-tail plastics over the mud. St Helens rock wall, Limeburners Bay and Wangim Walk.'},
    {sp:'Calamari',how:'Squid jigs in size 2.5 to 3.5, worked over weed and reef. Cunningham Pier after dark and the North Shore rocks.'},
    {sp:'Australian Salmon',how:'Keep a rod rigged with a small soft plastic or metal slug. Cunningham Pier and Rippleside.'}
  ],
  ramps:[['Limeburners Point Boat Harbour','Hearn Parade. Toilets and a fish cleaning table.'],['St Helens Boat Harbour','Swinburne St, North Geelong. Floating pontoons.'],['Grammar School Lagoon','Foreshore Rd, Corio.'],['Avalon Beach','Avalon Rd. Open to southerly winds.'],['Clifton Springs','Jetty Rd, just outside the bay on the Bellarine.']],
  rampNote:'Limeburners and St Helens are more sheltered from the wind.',
  land:[['Cunningham Pier','350 m into the bay and lit at night.'],['Rippleside Pier','Upgraded in 2019 and good for families.'],['Wangim Walk','440 m walkway at the Royal Geelong Yacht Club.'],['St Helens rock wall','Drive right up to it. Merv’s Reef, a man-made shellfish reef, is 62 m off the breakwall.'],['Griffin Gully jetty and Mackey St breakwater','Both have fishing platforms.'],['North Shore rocks','Good at low tide, and at night for big snapper in winter.']],
  stayTitle:'Bait on the way',
  stay:['Our shop is at 105 Shannon Ave, Manifold Heights. Call in for bait and a chat on the way down.'],
  know:['Big ships have right of way in the channels. Don’t anchor in a shipping channel or tie up to buoys and markers.','Watch for ships when you cross or anchor near the channels, especially in the inner harbour.'],
  kit:[
    ['A 2-4 kg spin rod and 2500 reel for the piers and drifting.',SETUP,'Build a setup'],
    ['A few 3 inch paddle-tail soft plastics and jigheads.',lureUrl('',{water:'Saltwater',styles:'Soft Plastics'}),'Soft plastics'],
    ['A couple of squid jigs, size 2.5 to 3.5.',lureUrl('Calamari'),'Squid jigs'],
    ['A metal slug for salmon.',lureUrl('Australian Salmon',{styles:'Casting Metals'}),'Metals'],
    ['Bait hooks, sinkers and swivels for pilchard and squid baits.',shopUrl('terminal',['Bait Hooks','Sinkers','Swivels & Snaps']),'Terminal tackle']
  ],
  links:[['VFA: Western Port Phillip, including Corio Bay','https://vfa.vic.gov.au/recreational-fishing/victorias-top-fishing-destinations/port-phillip/where-to-fish-port-phillip/western'],['VFA: Geelong and Bellarine','https://vfa.vic.gov.au/recreational-fishing/victorias-top-fishing-destinations/port-phillip/where-to-fish-port-phillip/geelong-and-bellarine'],['Ports Victoria: boating near shipping','https://ports.vic.gov.au/boating-and-events/']]
},
'barwon-estuary':{
  name:'Barwon River estuary',kind:'Estuary',water:'Saltwater',
  where:'From Lake Connewarre down to the sea between Barwon Heads and Ocean Grove.',
  about:'The tidal lower Barwon runs about 10 km from Lake Connewarre to the mouth. The channel is about 50 m wide and 3 to 4 m deep, getting shallow near Barwon Heads. Fish it from the bank or a boat. An early morning incoming tide is a good time.',
  fish:[
    {sp:'Bream',alt:'Black bream',how:'Best in Lake Connewarre from October to February, when the water is brackish. Most fish there come from boats.'},
    {sp:'Australian Salmon',how:'Lures and soft plastics are worth a go.'},
    {sp:'Trevally',alt:'Silver trevally',how:'Lures and soft plastics are worth a go.'},
    {sp:'Flathead',how:'Common in the estuary. Try pipis, whitebait or bass yabbies on an incoming tide.'},
    {sp:'King George Whiting',how:'Common in the estuary. Try pipis, whitebait or bass yabbies on an incoming tide.'},
    {sp:'Mulloway',how:'Here at times, not every trip.'},
    {sp:'Estuary Perch',how:'Turn up at times in Lake Connewarre.'}
  ],
  ramps:[['Guthridge Street, Ocean Grove','Two lanes, floating pontoons and a fish cleaning table.'],['River Parade, Barwon Heads','One lane and one pontoon.'],['Minah Street, Barwon Heads','Shallow crushed rock. Very small non-powered craft only.']],
  rampNote:'Big tidal range and strong current at all three. There’s no built ramp on Lake Connewarre.',
  land:[['Pelican Court and Sheepwash fishing jetties','Upgraded with new decking, handrails and rod holders.'],['Taits Point','The access point on the south side of Lake Connewarre.']],
  stay:['Barwon Coast runs Barwon Heads Caravan Park, right on the river near the mouth.','Also Riverview Family Caravan Park and Riverside Bush Camping in Ocean Grove.'],
  know:['Barwon Bluff Marine Sanctuary is next to the river mouth, and fishing is banned inside its boundaries. Check the Parks Victoria map before you fish near the mouth.','Crossing the Barwon bar is high risk, and lifejackets are compulsory. Barwon Coast suggests staying north of the bridge.','5 knot limit on the river and on Lake Connewarre.','Lake Connewarre is shallow and gets choppy in a south-westerly. Motors there are limited to 7.5 kW (10 hp).','Barwon Coast has a live camera and tide times for the bridge.'],
  kit:[
    ['A light 1-3 kg spin rod and 1000-2500 reel for bream.',SETUP,'Build a setup'],
    ['A few small soft plastics and small hardbodies.',lureUrl('Bream'),'Bream lures'],
    ['A metal slug or plastic for salmon and trevally.',lureUrl('Australian Salmon'),'Salmon lures'],
    ['Light leader, bait hooks and small sinkers for pipis and bass yabbies.',shopUrl('terminal',['Bait Hooks','Sinkers']),'Terminal tackle']
  ],
  links:[['VFA: Lower Barwon and Lake Connewarre','https://vfa.vic.gov.au/recreational-fishing/fishing-locations/inland-angling-guide/areas/barwon/barwon-angling-waters'],['Barwon Coast: boating, bar and tides','https://barwoncoast.com.au/about-the-coast/boating-and-ports-notice-to-mariners/'],['Parks Victoria: Barwon Bluff Marine Sanctuary','https://www.parks.vic.gov.au/places-to-see/parks/barwon-bluff-marine-sanctuary']]
},
'lake-purrumbete':{
  name:'Lake Purrumbete',kind:'Crater lake',water:'Freshwater',
  where:'Western District, about 15 km east of Camperdown.',
  about:'A volcanic crater lake about 2.5 km across, with clear water most of the year. The crater lakes are known for big trout and salmon, and Purrumbete has plenty of redfin too. The VFA stocks it every year.',
  fish:[
    {sp:'Trout',alt:'Brown and rainbow',how:'Troll slowly with winged lures or baitfish-style minnows, or float a mudeye near the weed beds. From the bank, Powerbait on a running sinker works well for rainbows.'},
    {sp:'Chinook Salmon',how:'Troll the thermocline in the warmer months. Or anchor, berley and fish a lightly weighted pilchard or blue bait deep.'},
    {sp:'Redfin',how:'Often out in open water, well away from structure, so a good sounder helps. Soft plastics, vibes or ice jigs, or worms on a paternoster.'}
  ],
  ramps:[['Lake Purrumbete Holiday Park','A dual-lane concrete ramp and a kayak ramp, with jetties and moorings.']],
  rampNote:'Low water stopped most boating by the end of summer 2025. Check the level before you tow.',
  land:[['Purrumbete Pit Road','Opposite the holiday park. Parking and signs, popular for fly fishing, no 4WD needed.']],
  stay:['Lake Purrumbete Holiday Park, 540 Purrumbete East Road, Koallah. Cabins and camp sites, plus bait and ice.'],
  know:['Stocked every year with brown trout, rainbow trout, Chinook salmon and brook trout.','In 2019 the VFA reported browns over 6 kg and Chinook over 8 kg.','5 knot limit on the lake, and there’s a bird sanctuary.'],
  kit:[
    ['A 2-4 kg spin rod and 2500 reel.',SETUP,'Build a setup'],
    ['Winged trolling lures and small minnows for trout and salmon.',lureUrl('Trout'),'Trout lures'],
    ['Soft plastics and vibes for redfin.',lureUrl('Redfin'),'Redfin lures'],
    ['Floats and bait hooks for mudeye under a bubble float.',shopUrl('terminal',['Floats','Bait Hooks']),'Floats and hooks']
  ],
  links:[['VFA: Lake Purrumbete facilities and stocking','https://vfa.vic.gov.au/about/news/first-class-facilities-complete-at-lake-purrumbete'],['VFA: South West and Grampians','https://vfa.vic.gov.au/recreational-fishing/victorias-top-fishing-destinations/south-west-and-grampians'],['VFA: trout and salmon rules','https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide/trout-and-salmon-regulations']]
}
};

var panel=document.getElementById('fd-panel');
if(!panel)return;
var emptyHTML=panel.innerHTML;
var cur=null,pick='';

function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function list(items){return '<ul class="fd-ul">'+items.map(function(i){return '<li>'+esc(i)+'</li>';}).join('')+'</ul>';}
function pairs(items){return '<ul class="fd-ul fd-pairs">'+items.map(function(p){return '<li><b>'+esc(p[0])+'</b>'+(p[1]?'<span>'+esc(p[1])+'</span>':'')+'</li>';}).join('')+'</ul>';}

function fishCard(f){
  var linked=SPECIES.indexOf(f.sp)>-1;
  return '<li class="fd-fish"><h4>'+esc(f.sp)+(f.alt?' <small>'+esc(f.alt)+'</small>':'')+'</h4><p>'+esc(f.how)+'</p>'+
    (linked?'<a class="btn btn-ink fd-browse" href="'+esc(lureUrl(f.sp))+'">Browse '+esc(f.sp)+' lures</a>'
           :'<a class="link fd-browse-all" href="'+esc(lureUrl('',{water:cur.water}))+'">Browse '+esc(cur.water.toLowerCase())+' lures</a>')+'</li>';
}

function catchHTML(){
  var w=cur;
  if(pick==='_kit'){
    return '<div class="fd-kit"><h4>The essentials for '+esc(w.name)+'</h4><p class="fd-sub">Just want to catch fish? Start with this and you’re covered for most of what’s here.</p><ol>'+
      w.kit.map(function(k){return '<li><span>'+esc(k[0])+'</span><a class="link" href="'+esc(k[1])+'">'+esc(k[2])+'</a></li>';}).join('')+
      '</ol><a class="btn btn-mint" href="'+esc(SETUP)+'">Build my setup</a></div>';
  }
  var fish=pick?w.fish.filter(function(f){return f.sp===pick;}):w.fish;
  return '<ul class="fd-fishes">'+fish.map(fishCard).join('')+'</ul>';
}

function render(id,focus){
  cur=WATERS[id]||null;pick='';
  document.querySelectorAll('[data-water]').forEach(function(a){
    var on=a.getAttribute('data-water')===id;
    if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
    a.classList.toggle('on',on);
  });
  if(!cur){panel.innerHTML=emptyHTML;return;}
  var w=cur;
  var chips='<button type="button" class="chip" data-pick="" aria-pressed="true">All fish here</button>'+
    w.fish.map(function(f){return '<button type="button" class="chip" data-pick="'+esc(f.sp)+'" aria-pressed="false">'+esc(f.sp)+'</button>';}).join('')+
    '<button type="button" class="chip fd-chip-kit" data-pick="_kit" aria-pressed="false">I just want to catch fish</button>';
  panel.innerHTML=
    '<header class="fd-ph on-ink"><span class="fd-kind">'+esc(w.kind)+'</span><h2 id="fd-ph">'+esc(w.name)+'</h2><p class="fd-where">'+esc(w.where)+'</p></header>'+
    '<div class="fd-body"><p class="fd-about">'+esc(w.about)+'</p>'+
    '<section class="fd-sec" aria-labelledby="fd-c"><h3 id="fd-c">What do you want to catch?</h3><div class="chips fd-chips" role="group" aria-label="Pick a fish">'+chips+'</div><div id="fd-catch">'+catchHTML()+'</div></section>'+
    '<section class="fd-sec fd-access" aria-labelledby="fd-a"><h3 id="fd-a">Getting on the water</h3><div class="fd-two"><div><h4>Boat ramps</h4>'+pairs(w.ramps)+(w.rampNote?'<p class="fd-note">'+esc(w.rampNote)+'</p>':'')+'</div><div><h4>Land-based</h4>'+pairs(w.land)+'</div></div></section>'+
    '<section class="fd-sec" aria-labelledby="fd-k"><h3 id="fd-k">Good to know</h3><div class="fd-two"><div>'+list(w.know)+'</div><div><h4>'+esc(w.stayTitle||'Camping and stays')+'</h4>'+list(w.stay)+'</div></div></section>'+
    '<section class="fd-check" aria-labelledby="fd-r"><h3 id="fd-r">Check before you go</h3><p>Rules, closures and conditions change. Bag and size limits are in the <a class="link" href="'+VFA_GUIDE+'" rel="noopener">VFA Recreational Fishing Guide</a>.</p><ul>'+
      w.links.map(function(l){return '<li><a class="link" href="'+esc(l[1])+'" rel="noopener">'+esc(l[0])+'</a></li>';}).join('')+'</ul></section></div>';
  if(focus){panel.focus({preventScroll:true});panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
}

panel.addEventListener('click',function(e){
  var b=e.target.closest('[data-pick]');if(!b||!cur)return;
  pick=b.getAttribute('data-pick');
  panel.querySelectorAll('[data-pick]').forEach(function(c){c.setAttribute('aria-pressed',String(c===b));});
  document.getElementById('fd-catch').innerHTML=catchHTML();
});

document.addEventListener('click',function(e){
  var a=e.target.closest('a[data-water]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey)return;
  e.preventDefault();var id=a.getAttribute('data-water');
  history.replaceState(null,'','?water='+id);
  render(id,true);
});

var start=new URLSearchParams(location.search).get('water');
if(start&&WATERS[start])render(start,false);
})();
