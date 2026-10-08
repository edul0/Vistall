(() => {
  const section = document.querySelector('.brand-launch');
  if (!section) return;
  const video = section.querySelector('video');
  const button = section.querySelector('.launch-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = false, frame = 0;
  function playback() {
    const stop = paused || reduced.matches || navigator.connection?.saveData || !visible || document.hidden;
    if (stop) video.pause(); else video.play().catch(() => {});
    section.classList.toggle('launch-is-paused', paused || reduced.matches);
    button.textContent = paused ? 'Reproduzir animação' : 'Pausar animação';
    button.setAttribute('aria-pressed', String(paused));
  }
  function paint() {
    frame = 0;
    if (paused) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
    section.style.setProperty('--launch-p', String(reduced.matches ? 1 : progress));
  }
  button.addEventListener('click', () => { paused = !paused; playback(); if (!paused) paint(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playback(); }).observe(section);
  document.addEventListener('visibilitychange', playback);
  reduced.addEventListener('change', () => { playback(); paint(); });
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(paint); }, {passive:true});
  addEventListener('resize', paint, {passive:true});
  paint();
})();
