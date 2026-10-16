/* Restores original educational artwork and two MP4 lessons bundled for public demonstration.
   Runs separately from the pinned Supabase bundle to keep the tested auth code unchanged. */
(() => {
  'use strict';
  const video = {1:'assets/media/ep01.mp4',2:'assets/media/ep02.mp4'};
  const images = {1:'assets/img/lesson/ep01.jpg',2:'assets/img/lesson/ep02.jpg'};
  const scenes = ['factory-night','reactor-hall','pvc-products'];
  let scheduled = false;
  function update() {
    scheduled = false;
    const root = document.getElementById('main');
    if (!root) return;
    // Lesson images are shipped from the original project; don't overwrite admin-provided HTTPS images.
    root.querySelectorAll('.lesson-card').forEach(card => {
      const badge = card.querySelector('.episode-badge');
      const ep = Number((badge?.textContent||'').match(/\d+/)?.[0]);
      const thumbnail = card.querySelector('.thumbnail');
      if (!ep || !thumbnail || thumbnail.querySelector('img')) return;
      const img = document.createElement('img');
      img.alt = `ภาพประกอบบทเรียนที่ ${ep}`;
      img.loading = 'lazy';
      img.src = images[ep] || `assets/img/cinema/${scenes[(ep - 1) % scenes.length]}.webp`;
      thumbnail.querySelector('.fa-flask-vial')?.remove();
      thumbnail.querySelector('.placeholder-grid')?.remove();
      thumbnail.prepend(img);
      if (video[ep]) {
        const label = card.querySelector('.card-bottom span');
        if (label?.textContent === 'รอเพิ่มวิดีโอ') label.textContent = 'เปิดบทเรียน';
      }
    });
    const params = new URLSearchParams(location.search);
    const ep = Number(params.get('id'));
    if (params.get('page') === 'watch' && video[ep] && !root.querySelector('video.media-player,iframe.media-player')) {
      const article = root.querySelector('.watch-grid section') || root.querySelector('.page-panel');
      const heading = article?.querySelector('h1');
      if (!article || !heading) return;
      const missing = [...article.querySelectorAll('.notice')].find(e => e.textContent.includes('ยังไม่ได้เพิ่มวิดีโอ'));
      if (missing) missing.remove();
      const originalMessage = [...article.querySelectorAll('p')].find(e => /ตัวอย่างหน้าเรียน|เข้าสู่ระบบเพื่อเปิดบทเรียน/.test(e.textContent));
      if (originalMessage) originalMessage.textContent = 'คุณสามารถรับชมวิดีโอต้นฉบับตอนนี้ได้โดยไม่ต้องเข้าสู่ระบบ';
      const player = document.createElement('video');
      player.className = 'media-player';
      player.id = 'originalLessonVideo';
      player.controls = true;
      player.preload = 'metadata';
      player.playsInline = true;
      player.poster = images[ep];
      player.src = video[ep];
      // This public file is intentionally readable to guests; watch metrics still need real Auth.
      heading.insertAdjacentElement('afterend',player);
      if (!article.querySelector('.bundled-lesson-note')) {
        const info = document.createElement('p');
        info.className = 'muted bundled-lesson-note';
        info.textContent = 'วิดีโอต้นฉบับ ENDUFLIX · ดูได้ทันที | การบันทึกความคืบหน้าและสิทธิ์สมาชิกต้องเชื่อม Supabase';
        player.insertAdjacentElement('afterend',info);
      }
    }
  }
  const observer = new MutationObserver(() => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        observer.disconnect();
        update();
        observer.observe(document.getElementById('main'),{childList:true,subtree:true});
      });
    }
  });
  const start = () => {
    const root = document.getElementById('main');
    if (!root) return;
    observer.observe(root,{childList:true,subtree:true});
    update();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
