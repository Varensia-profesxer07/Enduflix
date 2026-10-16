/* Faithful static-port of original ENDUFLIX index.php + includes/journey-panel.php.
 * The existing Supabase application continues to own authentication, lessons,
 * quiz scoring, admin approval, and media. This file changes presentation only.
 */
(()=>{
  'use strict';
  if (new URLSearchParams(location.search).get('page') && new URLSearchParams(location.search).get('page') !== 'home') return;
  const titles=['PVC คืออะไร','PVC เริ่มต้นจากอะไร','กระบวนการผลิต VCM','จาก VCM กลายเป็น PVC ได้อย่างไร','วิธีผลิต PVC Resin','เม็ดและเกรดของ PVC Resin','โครงสร้างและสมบัติของ PVC','PVC มีกี่ชนิด','สารเติมแต่งใน PVC','การผสมและการแปรรูป PVC','ผลิตภัณฑ์และการใช้งาน PVC','ความปลอดภัย สิ่งแวดล้อม และการรีไซเคิล PVC'];
  const link=(p,additional='')=>`?page=${p}${additional}`;
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const imageFor=n=>n<=2?`assets/img/lesson/ep0${n}.jpg`:`assets/img/cinema/${['factory-night','reactor-hall','pvc-products'][(n-1)%3]}.webp`;
  let rendered=false;
  function mount(){
    const root=document.getElementById('main');
    const draft=root?.querySelector('.learning-home');
    if(!draft || rendered)return;
    rendered=true;
    const loggedIn=!!document.querySelector('.account-menu');
    const currentName=loggedIn?document.querySelector('.account-menu summary')?.textContent?.trim().replace(/\s+/g,' ')||'สมาชิก':'ผู้เรียน ENDUFLIX';
    const oldCards=[...draft.querySelectorAll('.video-card')];
    const oldInfo=new Map(oldCards.map(a=>{const url=a.getAttribute('href')||a.querySelector('a')?.getAttribute('href')||'';const ep=Number(new URL(url,location.href).searchParams.get('id'));return [ep,{href:url,thumb:a.querySelector('.thumbnail img')?.getAttribute('src')||'',title:a.querySelector('h3')?.textContent||''}]}));
    for(const lesson of window.__EF_LESSONS||[]){
      if(!lesson?.episode)continue;
      const ep=Number(lesson.episode);
      if(!ep||ep>12)continue;
      const prior=oldInfo.get(ep)||{};
      const cover=typeof lesson.thumbnail_url==='string'&&/^https:\/\//.test(lesson.thumbnail_url)?lesson.thumbnail_url:prior.thumb;
      oldInfo.set(ep,{href:link('watch',`&id=${lesson.id}`),title:lesson.title||prior.title,thumb:cover||imageFor(ep),ready:!!(lesson.video_url||lesson.storage_path||ep<=2)});
    }
    const pre=link('assessment','&type=pre'),post=link('assessment','&type=post');
    const originalProgress=draft.querySelector('.progress-number')?.textContent?.replace(/[^0-9]/g,'')||'0';
    const percent=Math.max(0,Math.min(100,Number(originalProgress)||0));
    const completed=Math.round(percent*12/100);
    // Keep existing login and administration actions intact; just add navigation items.
    const nav=document.querySelector('#primaryNav');
    if(nav && !nav.querySelector('[href="?page=assessment"]')){
      const items=[['assessment','แบบทดสอบ'],['my-list','รายการของฉัน'],['history','ประวัติการรับชม'],['profile','โปรไฟล์']];
      for(const [page,text] of items){const li=document.createElement('li');li.className=['my-list','history','profile'].includes(page)?'nav-secondary':'';li.innerHTML=`<a href="${link(page)}">${text}</a>`;if(page==='assessment'&&nav.children[2])nav.insertBefore(li,nav.children[2]);else nav.appendChild(li)}
      const br=document.createElement('a');br.className='nav-search-link icon-button';br.href=link('browse');br.setAttribute('aria-label','ค้นหาบทเรียน');br.innerHTML='<i class="fas fa-magnifying-glass"></i>';document.querySelector('.nav-right')?.prepend(br);
    }
    const card=n=>{
      const info=oldInfo.get(n)||{};
      const title=info.title||titles[n-1];
      const thumb=info.thumb||imageFor(n);
      const href=info.href||link('watch',`&id=${n}`);
      const ready=info.ready??(n<=2);
      return `<article class="video-card lesson-card" data-episode="${n}"><a class="card-link" href="${escape(href)}"><div class="thumbnail lesson-cover"><img loading="lazy" src="${escape(thumb)}" alt="${escape(title)}"><span class="episode-badge">EP.${String(n).padStart(2,'0')}</span><span class="cover-number" aria-hidden="true">${String(n).padStart(2,'0')}</span><span class="cover-label">ENDUFLIX ORIGINAL</span><div class="overlay"><span class="play-icon"><i class="fas fa-${ready?'play':'arrow-right'}"></i></span></div></div><div class="card-body"><span class="lesson-topic">${n<=6?'พื้นฐานและกระบวนการผลิต':'วัสดุและการใช้งาน'}</span><h3 class="title">${escape(title)}</h3><div class="card-bottom"><span><i class="far fa-clock"></i> ${ready?'รับชมวิดีโอ':'เปิดบทเรียน / รอเพิ่มวิดีโอ'}</span><i class="fas fa-arrow-right"></i></div></div></a></article>`;
    };
    const step=(number,caption,state,icon,href)=>`<a href="${href}" class="journey-step"><span class="journey-icon"><i class="fas fa-${icon}"></i></span><div><small>${number}</small><strong>${caption}</strong><span class="journey-state">${state}</span></div></a>`;
    const shelf=(numbers,title,description,id,num)=>`<section class="curriculum-section reveal"><div class="section-heading"><div><span class="eyebrow">เส้นทางการเรียนรู้ / 0${num}</span><h2>${title}</h2><p>${description}</p></div><div class="shelf-heading-actions"><a class="text-link" href="${link('browse')}">ดูทั้งหมด <i class="fas fa-arrow-right"></i></a><div class="shelf-buttons"><button type="button" class="icon-button" data-shelf="${id}" data-direction="-1" aria-label="เลื่อนบทเรียนย้อนกลับ"><i class="fas fa-angle-left"></i></button><button type="button" class="icon-button" data-shelf="${id}" data-direction="1" aria-label="เลื่อนบทเรียนถัดไป"><i class="fas fa-angle-right"></i></button></div></div></div><div class="video-grid curriculum-grid lesson-shelf" id="${id}" tabindex="0" aria-label="เลื่อนดูบทเรียน">${numbers.map(card).join('')}</div></section>`;
    root.innerHTML=`<div class="stream-home">
    <section class="cinema-hero" id="cinemaHero" aria-label="สำรวจโลกของ PVC">
      <div class="hero-scenes" aria-hidden="true">${['factory-night','reactor-hall','pvc-products'].map((name,i)=>`<picture class="hero-scene ${i?'':'is-active'}"><source media="(max-width:700px)" srcset="assets/img/cinema/${name}-small.webp"><img src="assets/img/cinema/${name}.webp" alt="" ${i?'loading="lazy"':'fetchpriority="high"'} width="1672" height="941"></picture>`).join('')}</div>
      <div class="hero-shade" aria-hidden="true"></div><div class="tech-lines" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="container cinema-content">
        <div class="hero-topline"><span class="original-label"><b>E</b> ENDUFLIX ORIGINAL</span><span class="hero-series">โลกของพอลิเมอร์ · 12 บทเรียน</span></div>
        <p class="hero-kicker"><span class="status-dot"></span> เรียนรู้วันนี้ เข้าใจโลกอุตสาหกรรม</p>
        <h1 class="cinema-title">ENDU<span>FLIX</span><i>.</i></h1>
        <p class="cinema-subtitle">Poly(vinyl Chloride) <strong>(PVC)</strong></p>
        <h2 class="cinema-tagline">จากโมเลกุลเล็ก ๆ<br>สู่โลกที่อยู่รอบตัวเรา</h2>
        <p class="cinema-description">เปิดโลก PVC ตั้งแต่วัตถุดิบ กระบวนการผลิต<br class="desktop-break">จนถึงวัสดุที่คุณสัมผัสทุกวัน ผ่านบทเรียนที่เรียนรู้ได้ในจังหวะของคุณ</p>
        <div class="cinema-actions"><a href="${link('browse')}" class="btn btn-primary btn-lg"><i class="fas fa-play"></i> ${loggedIn?'เรียนต่อ':'เริ่มเรียน'}</a><a class="btn btn-glass btn-lg" href="${pre}"><i class="fas fa-clipboard-question"></i> ทำแบบทดสอบก่อนเรียน</a></div>
        <div class="hero-facts"><span><i class="fas fa-layer-group"></i> 12 ตอน</span><span><i class="fas fa-circle-play"></i> เรียนรู้ผ่านวิดีโอ</span><span><i class="fas fa-chart-line"></i> ติดตามผลการเรียน</span></div>
      </div>
      <div class="hero-bottom container"><span class="scene-caption" id="sceneCaption">01 / จากโรงงานสู่ชีวิตประจำวัน</span><div class="scene-controls" role="group" aria-label="ควบคุมภาพหน้าแรก"><button type="button" class="scene-toggle" id="heroPause" aria-label="พักภาพเคลื่อนไหว" aria-pressed="false"><i class="fas fa-pause"></i></button><div class="scene-dots">${[0,1,2].map(i=>`<button type="button" data-scene="${i}" aria-label="แสดงภาพที่ ${i+1}" aria-pressed="${i===0}"><span></span></button>`).join('')}</div><span class="scene-count"><b id="sceneIndex">01</b> / 03</span></div></div>
    </section>
    <div class="container home-content">
      <div class="member-welcome"><div><span class="eyebrow">พื้นที่การเรียนรู้ของคุณ</span><h2>เรียนรู้ต่อไปด้วยกัน, ${escape(currentName)}</h2></div><a href="${link(loggedIn?'profile':'login')}" class="member-chip"><img src="assets/img/default_avatar.png" alt=""><span>${loggedIn?'บัญชีของฉัน':'เข้าสู่ระบบ'} <i class="fas fa-angle-right"></i></span></a></div>
      <section class="journey-panel" data-journey aria-label="แผนการเรียนของฉัน"><div class="journey-head"><div><span class="eyebrow">ทีละบทเรียน ใกล้เป้าหมายอีกนิด</span><h2>แผนการเรียนของฉัน</h2></div><a class="text-link" href="${link('results')}">ดูผลการเรียน <i class="fas fa-arrow-up-right-from-square"></i></a></div><div class="journey-steps">
      ${step('01 / PRE-TEST','แบบทดสอบก่อนเรียน','สำรวจความรู้ก่อนเรียน','clipboard-question',pre)}
      ${step('02 / LEARN','เรียนรู้ผ่านวิดีโอ',`${completed} / 12 ตอน`,'circle-play',link('browse'))}
      ${step('03 / POST-TEST','แบบทดสอบหลังเรียน','ประเมินผลหลังเรียน','clipboard-check',post)}
      <a class="journey-step" href="${link('results')}"><span class="journey-ring" style="--progress:${percent}"><b>${percent}<small>%</small></b></span><div><small>04 / RESULTS</small><strong>ความคืบหน้าบทเรียน</strong><span class="journey-state">${loggedIn?'บันทึกผลออนไลน์':'เข้าสู่ระบบเพื่อบันทึก'}</span></div></a>
      </div><div class="progress-track" role="progressbar" aria-label="ความคืบหน้าบทเรียน" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent}%"></span></div><div class="progress-caption"><span>รับชมครบ <strong>${completed} / 12</strong> บทเรียน · เพิ่มวิดีโอได้ภายหลัง</span><span>เรียนรู้ตามจังหวะของคุณ</span></div></section>
      ${shelf([1,2,3,4,5,6],'พื้นฐานสู่กระบวนการผลิต','เริ่มต้นจาก PVC ไปจนถึงเรซิน','foundation',1)}
      ${shelf([7,8,9,10,11,12],'รู้จักวัสดุ เข้าใจการใช้งาน','เชื่อมโยงโครงสร้างกับสิ่งของรอบตัว','materials',2)}
      <section class="explore-panel reveal"><img loading="lazy" src="assets/img/cinema/reactor-hall-small.webp" alt="ภาพประกอบภายในโรงงาน"><div><span class="eyebrow">เรียนรู้ เชื่อมโยง นำไปใช้</span><h2>ความรู้ทุกตอน<br>เชื่อมถึงกัน</h2><p>สำรวจครบทั้ง 12 บทเรียน แล้วกลับมาทบทวน<br>สิ่งที่คุณได้เรียนรู้ผ่านแบบทดสอบหลังเรียน</p><a class="btn btn-glass" href="${post}">ทำแบบทดสอบหลังเรียน <i class="fas fa-arrow-right"></i></a></div><span class="explore-formula" aria-hidden="true">[CH₂—CHCl]ₙ</span></section>
    </div></div>`;
    const js=document.createElement('script');js.src='assets/js/cinema.js';document.body.appendChild(js);
  }
  const observer=new MutationObserver(()=>{if(rendered)observer.disconnect();else mount()});
  observer.observe(document.getElementById('main')||document.body,{childList:true,subtree:true});
  mount();
})();
