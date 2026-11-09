/* Guides: single-select topic filter, deep linkable with ?topic= */
(function(){
  var root=document.querySelector('[data-guides]');if(!root)return;
  var chips=[].slice.call(root.querySelectorAll('.g-filter .chip'));
  var secs=[].slice.call(root.querySelectorAll('.g-sec'));
  var status=document.getElementById('g-status');
  var valid=chips.map(function(c){return c.dataset.topic});
  function apply(topic,push){
    if(valid.indexOf(topic)<0)topic='';
    chips.forEach(function(c){c.setAttribute('aria-pressed',String(c.dataset.topic===topic))});
    var n=0;
    secs.forEach(function(s){var on=!topic||s.dataset.topic===topic;s.hidden=!on;if(on)n+=s.querySelectorAll('li').length});
    if(status)status.textContent='Showing '+n+' guides';
    if(push){
      var u=new URL(location.href);
      if(topic)u.searchParams.set('topic',topic);else u.searchParams.delete('topic');
      history.replaceState(null,'',u.pathname+u.search+u.hash);
    }
  }
  chips.forEach(function(c){c.addEventListener('click',function(){apply(c.dataset.topic,true)})});
  apply(new URLSearchParams(location.search).get('topic')||'',false);
})();
