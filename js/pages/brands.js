/* Brands A to Z: built from AOF_ITEMS and AOF_LURES. Find box narrows the list; letter bar jumps. */
(function(){
  var root=document.querySelector('[data-brands]');if(!root)return;
  var counts={};
  (window.AOF_ITEMS||[]).concat(window.AOF_LURES||[]).forEach(function(p){
    var b=(p.brand||'').trim();if(b)counts[b]=(counts[b]||0)+1;
  });
  var names=Object.keys(counts).sort(function(a,b){return a.localeCompare(b,'en-AU',{sensitivity:'base'})});
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function href(b){return 'shop.html?brand='+encodeURIComponent(b)}
  function plural(n){return n+(n===1?' product':' products')}
  function letterOf(b){var c=b.charAt(0).toUpperCase();return /[A-Z]/.test(c)?c:'#'}

  // Popular: the 8 brands with the most products (ties broken A to Z)
  var pop=names.slice().sort(function(a,b){return counts[b]-counts[a]||a.localeCompare(b)}).slice(0,8);
  document.getElementById('b-pop').innerHTML=pop.map(function(b){
    return '<a class="chip" href="'+href(b)+'">'+esc(b)+'</a>'}).join('');

  var groups={},order=[];
  names.forEach(function(b){var l=letterOf(b);if(!groups[l]){groups[l]=[];order.push(l)}groups[l].push(b)});
  var list=document.getElementById('b-list');
  list.innerHTML=order.map(function(l){
    var id='letter-'+(l==='#'?'num':l);
    return '<section class="b-sec" id="'+id+'" data-l="'+l+'" aria-labelledby="h-'+id+'"><h2 id="h-'+id+'">'+l+'</h2><ul class="b-rows">'+
      groups[l].map(function(b){return '<li data-n="'+esc(b.toLowerCase())+'"><a href="'+href(b)+'"><span class="nm">'+esc(b)+'</span><span class="ct">'+plural(counts[b])+'</span></a></li>'}).join('')+
      '</ul></section>';
  }).join('');
  var bar=document.getElementById('b-letters');
  bar.innerHTML=order.map(function(l){return '<a href="#letter-'+(l==='#'?'num':l)+'" data-l="'+l+'">'+l+'</a>'}).join('');

  var q=document.getElementById('b-q'),count=document.getElementById('b-count'),empty=document.getElementById('b-empty');
  var secs=[].slice.call(list.querySelectorAll('.b-sec'));
  function norm(s){return s.toLowerCase().replace(/[^a-z0-9]/g,'')}
  function filter(){
    var v=norm(q.value),shown=0;
    secs.forEach(function(s){
      var any=0;
      [].forEach.call(s.querySelectorAll('li'),function(li){var on=!v||norm(li.dataset.n).indexOf(v)>-1;li.hidden=!on;if(on)any++});
      s.hidden=!any;shown+=any;
      var a=bar.querySelector('[data-l="'+s.dataset.l+'"]');if(a)a.hidden=!any;
    });
    count.textContent=v?(shown+' of '+names.length+' brands'):(names.length+' brands');
    empty.hidden=shown>0;
  }
  q.addEventListener('input',filter);
  root.querySelector('.b-clear').addEventListener('click',function(){q.value='';filter();q.focus()});
  // ?q= deep link for the find box
  var pq=new URLSearchParams(location.search).get('q');if(pq)q.value=pq;
  filter();
  // Re-apply the hash jump now that the sections exist
  if(location.hash&&/^#letter-/.test(location.hash)){var t=document.getElementById(location.hash.slice(1));if(t)requestAnimationFrame(function(){t.scrollIntoView({behavior:'instant'})})}
})();
