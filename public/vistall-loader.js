(() => {
  const overlay = document.querySelector('#splash-overlay');
  if (!overlay) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const surfaces = [...document.querySelectorAll('body>header,body>main,body>footer')];
  const previousInert = new Map(surfaces.map(element => [element,element.inert]));
  let timer, openedAt = 0, previousFocus, generation = 0;
  const storageKey = 'vistall-intro-seen-v2';
  function dismiss() {
    generation++;
    clearTimeout(timer);
    overlay.classList.add('splash-hidden');
    overlay.setAttribute('aria-hidden','true');
    overlay.inert = true;
    surfaces.forEach(element => { element.inert = previousInert.get(element); });
    if (overlay.contains(document.activeElement)) previousFocus?.focus({preventScroll:true});
    try { sessionStorage.setItem(storageKey,'1'); } catch {}
  }
  function open(replay = false) {
    const current = ++generation;
    clearTimeout(timer);
    previousFocus = document.activeElement;
    openedAt = performance.now();
    overlay.classList.remove('splash-hidden');
    overlay.removeAttribute('aria-hidden');
    overlay.inert = false;
    surfaces.forEach(element => { element.inert = true; });
    if (replay) overlay.querySelector('.loader-skip').focus({preventScroll:true});
    const limit = replay ? 1400 : 800;
    timer = setTimeout(dismiss, limit);
    if (!replay) Promise.race([document.fonts?.ready || Promise.resolve(),new Promise(resolve => setTimeout(resolve,limit))]).then(() => {
      if (current !== generation) return;
      clearTimeout(timer);
      timer = setTimeout(dismiss, reduced.matches ? 0 : Math.max(0,420 - (performance.now()-openedAt)));
    });
  }
  overlay.querySelector('.loader-skip')?.addEventListener('click',dismiss);
  addEventListener('keydown',event => { if (event.key === 'Escape') dismiss(); });
  document.querySelectorAll('[data-replay-intro]').forEach(button => button.addEventListener('click',() => open(true)));
  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === '1'; } catch {}
  if (seen || location.hash) dismiss(); else open();
})();
