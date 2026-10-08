(() => {
  const header = document.querySelector('.portfolio .top');
  const menu = header?.querySelector('.portfolio-menu');
  if (menu) {
    function close(focus = false) { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded','false'); if (focus) menu.focus(); }
    menu.addEventListener('click',() => { const open = header.classList.toggle('menu-open'); menu.setAttribute('aria-expanded',String(open)); });
    header.querySelectorAll('.links a').forEach(link => link.addEventListener('click',() => close()));
    addEventListener('keydown',event => { if (event.key === 'Escape' && header.classList.contains('menu-open')) close(true); });
    document.addEventListener('pointerdown',event => { if (!header.contains(event.target)) close(); });
    matchMedia('(min-width:761px)').addEventListener('change',() => close());
  }
  const badge = document.querySelector('#dev-badge');
  function badgeFaces() {
    const flipped = document.querySelector('#badge-inner')?.classList.contains('flipped');
    badge?.querySelector('.badge-front')?.setAttribute('aria-hidden',String(flipped));
    badge?.querySelector('.badge-back')?.setAttribute('aria-hidden',String(!flipped));
  }
  badge?.addEventListener('click',badgeFaces); badgeFaces();
  const hero = document.querySelector('.portfolio .hero');
  const film = hero?.querySelector('video');
  if (film) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    function playback() { if (!visible || reduced.matches || document.hidden || navigator.connection?.saveData) film.pause(); else film.play().catch(() => {}); }
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; playback(); }).observe(hero);
    reduced.addEventListener('change',playback); document.addEventListener('visibilitychange',playback);
  }
})();
