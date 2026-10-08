(() => {
  const section = document.querySelector('.scroll-story');
  if (!section) return;
  const slider = section.querySelector('#story-slider');
  const resume = section.querySelector('#story-resume');
  const compare = section.querySelector('.story-compare');
  const grip = section.querySelector('.story-grip');
  const hero = document.querySelector('.cinema-hero');
  const views = section.querySelectorAll('[data-story-view]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let manual = false, dragging = false, frame = 0;
  const clamp = n => Math.max(0, Math.min(1, n));
  function value(progress) {
    const percent = Math.round(progress * 100);
    section.style.setProperty('--story-reveal', `${progress * 100}%`);
    section.style.setProperty('--story-progress', String(progress));
    section.classList.toggle('story-complete', progress > .97);
    slider.value = String(percent);
    slider.setAttribute('aria-valuetext', `${percent} % da versão revisada`);
    views.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.storyView) === percent)));
  }
  function paint() {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const heroRect = hero?.getBoundingClientRect();
    if (!manual) {
      const top = innerWidth < 760 ? 90 : 110;
      value(reduced.matches ? .5 : clamp((top - rect.top) / (rect.height - innerHeight + top)));
    }
    if (heroRect && !reduced.matches) {
      const p = clamp(-heroRect.top / heroRect.height);
      hero.style.setProperty('--cinema-video-y', `${p * 8}px`);
      hero.style.setProperty('--cinema-video-scale', String(1 + p * .015));
    }
  }
  function queue() { if (!frame) frame = requestAnimationFrame(paint); }
  function setManual(progress) { manual = true; value(progress); resume.hidden = false; }
  addEventListener('scroll', () => {
    if (!dragging) { manual = false; resume.hidden = true; }
    queue();
  }, { passive: true });
  addEventListener('resize', queue, { passive: true });
  slider.addEventListener('input', () => setManual(Number(slider.value) / 100));
  views.forEach(button => button.addEventListener('click', () => setManual(Number(button.dataset.storyView) / 100)));
  function dragValue(event) {
    const rect = compare.getBoundingClientRect();
    setManual(clamp((event.clientX - rect.left) / rect.width));
  }
  grip.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true;
    grip.setPointerCapture(event.pointerId);
    section.classList.add('story-dragging');
    dragValue(event);
  });
  grip.addEventListener('pointermove', event => { if (dragging) dragValue(event); });
  function stopDrag() { dragging = false; section.classList.remove('story-dragging'); }
  grip.addEventListener('lostpointercapture', stopDrag);
  grip.addEventListener('pointerup', stopDrag);
  grip.addEventListener('pointercancel', stopDrag);
  resume.addEventListener('click', () => { manual = false; resume.hidden = true; queue(); });
  reduced.addEventListener('change', queue);
  queue();
})();
