/* Shop failure page. Try again returns to the page that failed when we know it; a real shop retries the failed request. */
(function(){var a=document.querySelector('[data-retry]');if(!a)return;a.addEventListener('click',function(e){var r=document.referrer;if(r&&r.indexOf(location.origin+'/')===0&&r!==location.href){e.preventDefault();location.href=r}})})();
