// flip counter: days until Eurovision Asia (Bangkok, Nov 14 2026, 8:30 a.m. Eastern), then until the Grand Final, May 15 2027, 3 p.m. Eastern
(function(){
  const now=new Date(),ASIA=new Date('2026-11-14T13:30:00Z'),GF=new Date('2027-05-15T19:00:00Z');
  const asia=now<ASIA;
  const days=Math.max(0,(asia?Math.floor:Math.ceil)(((asia?ASIA:GF)-now)/864e5));
  const gfDays=Math.max(0,Math.ceil((GF-now)/864e5));
  if(asia)document.querySelectorAll('.count').forEach(c=>{c.setAttribute('aria-label','Days to Eurovision Asia');const l=c.querySelector(':scope>span');if(l)l.innerHTML='days to<br>Eurovision Asia'});
  document.querySelectorAll('[data-digits]').forEach(D=>{
    const t=String(days).padStart(asia?2:3,'0');
    D.innerHTML=[...t].map(()=>'<span>0</span>').join('');
    [...D.children].forEach((s,i)=>{let n=0;const stop=10+i*6;const iv=setInterval(()=>{s.textContent=n>=stop?t[i]:(Math.random()*10|0);if(n++>=stop)clearInterval(iv)},55)});
  });
  document.querySelectorAll('[data-days]').forEach(e=>e.textContent=gfDays);
})();
// press page: countdown to Eurovision Asia; the block removes itself after the show
(function(){
  const el=document.querySelector('[data-asia]');if(!el)return;
  const T=new Date('2026-11-14T13:30:00Z');
  function tick(){let ms=T-new Date();if(ms<-4*36e5){el.remove();return}ms=Math.max(0,ms);
    const v={d:Math.floor(ms/864e5),h:Math.floor(ms%864e5/36e5),m:Math.floor(ms%36e5/6e4)};
    for(const k in v){const b=el.querySelector('[data-cd="'+k+'"]');if(b)b.textContent=String(v[k]).padStart(2,'0')}}
  tick();setInterval(tick,20000);
})();
// mobile menu
document.querySelector('.menu-btn')?.addEventListener('click',e=>{const o=document.body.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)});
// scroll reveal
(function(){
  const els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  els.forEach(e=>io.observe(e));
})();
// table of contents: highlight the section you're reading
(function(){
  const links=[...document.querySelectorAll('.toc a')];if(!links.length)return;
  const secs=links.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const on=()=>{let cur=secs[0];secs.forEach(s=>{if(s.getBoundingClientRect().top<160)cur=s});links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+cur.id))};
  addEventListener('scroll',on,{passive:true});on();
})();
// credential: the badge fills in as you type
document.querySelectorAll('.cred').forEach(c=>{
  const n=c.querySelector('[name=name]'),s=c.querySelector('[name=state]'),bn=c.querySelector('[data-b=name]'),bs=c.querySelector('[data-b=state]');
  n&&n.addEventListener('input',()=>bn.textContent=n.value.trim()||'Your Name');
  s&&s.addEventListener('change',()=>bs.textContent=s.value||'Your state');
});
// prototype only: forms don't send anything
// Forms post to Netlify Forms. "newsletter" sign-ups go on to beehiiv through Zapier.
// Delegated, so the guest release form (decrypted after the passcode) works too.
(function(){
  const LIVE=/(^|\.)americandelegation\.com$|\.netlify\.app$|^localhost$|^127\./.test(location.hostname);
  function stamp(f){const s=f.querySelector('.ok-stamp');const dt=f.querySelector('[data-today]');if(dt)dt.textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}).toUpperCase().replace('SEPT','SEP');if(!s||!s.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const cols=['#F5313C','#F8F4E8','#0397F8','#C69731'];
    setTimeout(()=>{for(let i=0;i<14;i++){const p=document.createElement('i');p.className='ok-bit';p.style.background=cols[i%4];p.style.left=(s.offsetLeft+s.offsetWidth/2)+'px';p.style.top=(s.offsetTop+s.offsetHeight/2)+'px';s.parentElement.appendChild(p);
      const a=Math.random()*6.283,d=40+Math.random()*40;
      p.animate([{transform:'translate(-50%,-50%) rotate(0)',opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d+30}px)) rotate(${Math.random()*600-300}deg)`,opacity:0}],
        {duration:700+Math.random()*300,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'}).onfinish=()=>p.remove()}},240)}
  document.addEventListener('submit',e=>{
    const f=e.target;if(!f.querySelector('input[name="form-name"]'))return;
    e.preventDefault();if(f.classList.contains('sending'))return;
    f.classList.remove('failed');f.classList.add('sending');const btn=f.querySelector('button[type=submit],button:not([type])');if(btn)btn.disabled=true;
    const data=new FormData(f),email=(data.get('email')||'').toString(),first=(data.get('first_name')||data.get('name')||'').toString().split(' ')[0];
    const done=()=>{const b=f.querySelector('.ok-body');if(b&&b.dataset.t&&email){b.textContent=b.dataset.t.replace('[email]',email).replace('[first]',first||'friend')}
      if(f.classList.contains('form'))f.style.minHeight=f.offsetHeight+'px';f.classList.remove('sending');f.classList.add('sent');f.reset();const ok=f.querySelector('.ok');if(ok){ok.focus({preventScroll:true});ok.scrollIntoView({block:'nearest',behavior:'smooth'})}stamp(f)};
    const fail=()=>{f.classList.remove('sending');f.classList.add('failed');if(btn)btn.disabled=false};
    if(!LIVE){setTimeout(done,500);return}   // prototype preview: show the confirmation without sending
    fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()})
      .then(r=>{if(!r.ok)throw r.status;done()}).catch(fail);
  });
})();

// guest release: the release text and signing form are encrypted with the passcode (AES-GCM, key from PBKDF2-SHA256)
(function(){
  var gate=document.getElementById('gate'),box=document.getElementById('locked');if(!gate||!box)return;
  var KEY='ad-release-code';
  function b64(s){return Uint8Array.from(atob(s),function(c){return c.charCodeAt(0)})}
  function norm(v){return(v||'').trim().toLowerCase().replace(/\s+/g,'')}
  function unlock(code){
    if(!window.crypto||!crypto.subtle)return Promise.reject();
    var enc=new TextEncoder();
    return crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveKey'])
      .then(function(base){return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(box.dataset.salt),iterations:200000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt'])})
      .then(function(key){return crypto.subtle.decrypt({name:'AES-GCM',iv:b64(box.dataset.iv)},key,b64(box.dataset.ct))})
      .then(function(buf){box.innerHTML=new TextDecoder().decode(buf);gate.hidden=true;
        var l=document.getElementById('gate-lede');if(l)l.textContent='The short agreement every guest signs before an episode goes out. Read it, then sign at the bottom.';
        try{sessionStorage.setItem(KEY,code)}catch(e){}});
  }
  try{var saved=sessionStorage.getItem(KEY);if(saved)unlock(saved).catch(function(){})}catch(e){}
  gate.addEventListener('submit',function(e){e.preventDefault();gate.classList.remove('failed');var b=gate.querySelector('button');b.disabled=true;
    unlock(norm(gate.querySelector('input').value)).catch(function(){gate.classList.add('failed')}).then(function(){b.disabled=false})});
})();

// listen chooser
document.querySelectorAll('.listen').forEach(l=>{const b=l.querySelector('button');
  b.addEventListener('click',e=>{e.stopPropagation();const o=l.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  document.addEventListener('click',()=>{l.classList.remove('open');b.setAttribute('aria-expanded',false)})});
// song facts flip into place like a departures board when they scroll into view
(function(){
  const board=document.querySelector('[data-flipboard]');if(!board)return;
  const D='0123456789',A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cells=[...board.querySelectorAll('b')].map(b=>{const t=b.textContent;b.innerHTML=[...t].map(ch=>'<i class="fl">'+ch+'</i>').join('');return b});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const run=()=>cells.forEach((b,bi)=>[...b.children].forEach((s,i)=>{const ch=s.textContent;if(!/[0-9A-Za-z]/.test(ch))return;
    const pool=/[0-9]/.test(ch)?D:A,low=ch===ch.toLowerCase()&&/[a-z]/.test(ch);let n=0;const stop=3+Math.min(i,5)+bi;
    const iv=setInterval(()=>{if(n++>=stop){s.textContent=ch;clearInterval(iv);return}const r=pool[Math.random()*pool.length|0];s.textContent=low?r.toLowerCase():r},32)}));
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();run()}},{threshold:.15});io.observe(board);
})();

// verdicts: tap Reveal and the five tests flip over one by one, then the stamp lands
(function(){
  const rows=[...document.querySelectorAll('.vrow')];if(!rows.length)return;
  const sym={pass:'✓',fail:'✗',split:'½'};
  function reveal(r,delay){if(r.classList.contains('shown')||r.dataset.busy)return;r.dataset.busy=1;
    const chips=[...r.querySelectorAll('.chips li')];
    chips.forEach((li,i)=>setTimeout(()=>{li.classList.add('on');li.querySelector('b').textContent=sym[li.dataset.r]},delay+i*260));
    setTimeout(()=>{r.querySelector('.vscore span').textContent=r.dataset.score;const st=r.querySelector('.stamp'),v=r.dataset.verdict;
      st.innerHTML=stampSVG(v,r.dataset.place||'');st.setAttribute('aria-label',v);
      st.className='stamp'+(v==='Honorary Classic'?' honorary':v==='Not a Classic'?' not':'');r.classList.add('shown')},delay+chips.length*260+250)}
  // the same stamp as the episode art: double border, a label, the big word and the place
  function stampSVG(v,place){const top=v==='Honorary Classic'?'HONORARY':v==='Not a Classic'?'NOT A':'OFFICIAL POSITION';
    return '<svg viewBox="0 0 240 110" aria-hidden="true"><defs><filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.4 1.7"/><feComposite in="SourceGraphic" operator="in"/></filter></defs>'+
      '<g filter="url(#ink)" fill="currentColor" stroke="currentColor"><rect x="3" y="3" width="234" height="104" rx="7" fill="none" stroke-width="5.3"/><rect x="11" y="11" width="218" height="88" rx="4.5" fill="none" stroke-width="1.7"/>'+
      '<text x="120" y="33" text-anchor="middle" stroke="none" font-family="AD Sans,Arial,sans-serif" font-weight="800" font-size="11.5" letter-spacing="'+(top.length>8?3.2:6)+'">'+top+'</text>'+
      '<text x="120" y="72" text-anchor="middle" stroke="none" font-family="AD Title,Arial,sans-serif" font-weight="800" font-size="40" letter-spacing="1">CLASSIC</text>'+
      '<text x="120" y="92" text-anchor="middle" stroke="none" font-family="AD Sans,Arial,sans-serif" font-weight="800" font-size="12.5" letter-spacing="2.8">'+place.toUpperCase()+'</text></g></svg>'}
  rows.forEach(r=>r.querySelector('.slot .btn').addEventListener('click',()=>reveal(r,0)));
  const all=document.getElementById('revealall');all&&all.addEventListener('click',()=>rows.forEach((r,i)=>reveal(r,i*700)));
})();

// share a statement: the phone's share sheet where there is one, otherwise copy the link
document.querySelectorAll('.share').forEach(b=>b.addEventListener('click',async()=>{
  const data={title:b.dataset.share,url:b.dataset.url};
  try{if(navigator.share){await navigator.share(data);return}}catch(e){return}
  try{await navigator.clipboard.writeText(data.url);const t=b.textContent;b.textContent='Link copied';setTimeout(()=>b.textContent=t,1800)}catch(e){}
}));

// every page opens at the top unless the link points to a section
try{history.scrollRestoration='manual'}catch(e){}
if(!location.hash)window.scrollTo(0,0);
// hero titles shrink to fit their column at any window size
(function(){
  const hs=[...document.querySelectorAll('h1')].filter(h=>h.querySelector('.ln'));if(!hs.length)return;
  const fit=()=>hs.forEach(h=>{h.style.fontSize='';const base=parseFloat(getComputedStyle(h).fontSize);let s=base;
    const over=()=>[...h.querySelectorAll('.ln')].some(l=>l.scrollWidth>l.clientWidth+1);
    while(over()&&s>base*.6){s-=2;h.style.fontSize=s+'px'}});
  fit();document.fonts&&document.fonts.ready.then(fit);let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(fit,120)});
})();
// tapping a country card on a phone opens its pop-up; tapping elsewhere closes it
document.querySelectorAll('.has-pop').forEach(li=>li.addEventListener('click',e=>{if(e.target.closest('a'))return;li.focus()}));

// a link like contact.html?topic=press#form opens the contact form with that topic picked
(function(){const t=new URLSearchParams(location.search).get('topic'),s=document.getElementById('f-topic');if(t&&s&&[...s.options].some(o=>o.value===t))s.value=t})();
