/* Page not found: the search button puts the cursor in the header search. */
(function(){var b=document.querySelector('[data-focus-search]');if(b)b.addEventListener('click',function(){var q=document.getElementById('q');if(q)q.focus()})})();
