'use strict';
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const hero = document.getElementById('cinemaHero');
 if (hero) {
  const scenes = [...hero.querySelectorAll('.hero-scene')];
  const dots = [...hero.querySelectorAll('[data-scene]')];
  const button = document.getElementById('heroPause');
  const film = hero.querySelector('.hero-film');
  const captions = ['01 / จากโรงงานสู่ชีวิตประจำวัน','02 / สำรวจโลกการผลิตพอลิเมอร์','03 / PVC รอบตัวคุณ'];
  let index = 0, manualPause = reduced.matches, pointerInside = false, focusInside = false, timer;
  function select(i) {
   index = (i + scenes.length) % scenes.length;
   scenes.forEach((scene,n) => scene.classList.toggle('is-active',n===index));
   dots.forEach((dot,n) => dot.setAttribute('aria-pressed',String(n===index)));
   document.getElementById('sceneCaption').textContent = captions[index];
   document.getElementById('sceneIndex').textContent = String(index+1).padStart(2,'0');
  }
  function update() {
   clearInterval(timer);
   const pause = manualPause || reduced.matches || document.hidden || pointerInside || focusInside;
   hero.classList.toggle('motion-paused',pause);
   button.setAttribute('aria-pressed',String(manualPause || reduced.matches));
   button.setAttribute('aria-label',manualPause || reduced.matches ? 'เล่นภาพเคลื่อนไหว' : 'พักภาพเคลื่อนไหว');
   button.innerHTML = '<i class="fas '+(manualPause || reduced.matches ? 'fa-play' : 'fa-pause')+'" aria-hidden="true"></i>';
   button.disabled = reduced.matches;
   if (reduced.matches) button.setAttribute('aria-label','ลดการเคลื่อนไหวตามการตั้งค่าอุปกรณ์');
   if (!pause) timer = setInterval(() => select(index+1),7500);
   if (film) {
    if (pause) film.pause();
    else if (!navigator.connection?.saveData) {
     if (!film.getAttribute('src')) { film.src=film.dataset.src; film.muted=true; film.autoplay=true; }
     film.play().catch(() => film.classList.remove('is-playing'));
    }
   }
  }
  button.addEventListener('click',() => { manualPause=!manualPause; if(!manualPause){pointerInside=false;focusInside=false;} update(); });
  dots.forEach(dot => dot.addEventListener('click',() => { select(Number(dot.dataset.scene)); manualPause=true; update(); }));
  hero.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){pointerInside=true;update();}});
  hero.addEventListener('pointerleave',()=>{pointerInside=false;update();});
  hero.addEventListener('focusin',()=>{focusInside=true;update();});
  hero.addEventListener('focusout',e=>{if(!hero.contains(e.relatedTarget)){focusInside=false;update();}});
  hero.querySelector('.scene-controls').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();select(index+(e.key==='ArrowRight'?1:-1));manualPause=true;update();}});
  if(film){film.addEventListener('playing',()=>film.classList.add('is-playing'));film.addEventListener('error',()=>film.classList.remove('is-playing'));}
  document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);update();
 }
 document.querySelectorAll('.lesson-shelf[id]').forEach(shelf=>{
  const buttons=[...document.querySelectorAll('[data-shelf="'+shelf.id+'"]')];
  const refresh=()=>buttons.forEach(button=>{button.disabled=Number(button.dataset.direction)<0?shelf.scrollLeft<5:shelf.scrollLeft+shelf.clientWidth>=shelf.scrollWidth-5;});
  const move=direction=>shelf.scrollBy({left:direction*(shelf.clientWidth*.84),behavior:reduced.matches?'instant':'smooth'});
  buttons.forEach(button=>button.addEventListener('click',()=>move(Number(button.dataset.direction))));
  shelf.addEventListener('keydown',e=>{if(e.target===shelf&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  shelf.addEventListener('scroll',refresh,{passive:true});window.addEventListener('resize',refresh);refresh();
 });
 if ('IntersectionObserver' in window && !reduced.matches) {
  const observer = new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');observer.unobserve(entry.target);}});},{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('reveal-pending');observer.observe(el);}});
 }
 document.querySelectorAll('[data-copy-code]').forEach(button=>button.addEventListener('click',async()=>{
  try {
   if(navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(button.dataset.copyCode);
   else {const area=document.createElement('textarea');area.value=button.dataset.copyCode;area.style.position='fixed';area.style.top='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error();}
   showToast('คัดลอกรหัสผู้เรียนแล้ว');
  }catch{showToast('คัดลอกไม่ได้ กรุณาเลือกรหัสแล้วคัดลอกด้วยตนเอง');}
 }));
})();
