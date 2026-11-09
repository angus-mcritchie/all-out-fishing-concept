/* Contact form: checks the fields, never sends. */
(()=>{
const f=document.getElementById('contact-form');if(!f)return;
const note=document.getElementById('c-note');
const rules=[
  ['c-name',v=>v?'':'Enter your name'],
  ['c-email',v=>!v?'Enter your email':(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?'':'Enter an email address like name@example.com')],
  ['c-msg',v=>v?'':'Enter your message'],
];
const check=(id,rule)=>{const el=document.getElementById(id),msg=rule(el.value.trim());document.getElementById(id+'-err').textContent=msg;if(msg)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');return msg?el:null};
rules.forEach(([id,rule])=>{const el=document.getElementById(id);el.addEventListener('input',()=>{if(el.getAttribute('aria-invalid'))check(id,rule)});el.addEventListener('blur',()=>{if(el.value.trim())check(id,rule)})});
f.addEventListener('submit',e=>{
  e.preventDefault();
  const bad=rules.map(([id,rule])=>check(id,rule)).filter(Boolean);
  if(bad.length){note.textContent='';bad[0].focus();return}
  note.textContent='This is a concept mock-up, so messages aren’t sent.';
});
})();
