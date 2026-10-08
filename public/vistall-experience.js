(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const header = document.querySelector('header');
  const tabs = document.querySelector('.offer-tabs');
  const launch = document.querySelector('.brand-launch');
  let scrollFrame = 0;
  function indicator() {
    const active = tabs?.querySelector('[aria-selected=true]');
    if (!active) return;
    tabs.style.setProperty('--tab-x', `${active.offsetLeft}px`);
    tabs.style.setProperty('--tab-w', `${active.offsetWidth}px`);
  }
  function progress() {
    scrollFrame = 0;
    const available = document.documentElement.scrollHeight - innerHeight;
    header?.style.setProperty('--page-progress', String(available > 0 ? Math.min(1, Math.max(0, scrollY / available)) : 0));
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(progress); }, {passive:true});
  addEventListener('resize', () => { indicator(); progress(); }, {passive:true});
  tabs?.addEventListener('click', indicator);
  tabs?.addEventListener('keydown', () => requestAnimationFrame(indicator));
  document.fonts?.ready.then(indicator);
  indicator(); progress();
  const enterAnimations = new Map();
  function reveal(elements) {
    if (reduced.matches) return;
    elements.forEach((element, index) => {
      enterAnimations.get(element)?.cancel();
      const animation = element.animate([{opacity:0, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:640,delay:Math.min(index * 65,260),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
      enterAnimations.set(element, animation);
      animation.finished.catch(() => {}).finally(() => { if (enterAnimations.get(element) === animation) enterAnimations.delete(element); });
    });
  }
  function revealPanel() {
    const panel = document.querySelector('.offer-panel:not([hidden])');
    if (panel) reveal([...panel.querySelectorAll('.scene-top,.scene-site-hero,.scene-site-foot,.scene-dashboard-main>strong,.scene-status,.scene-task,.scene-review-content>strong,.scene-review-row')]);
  }
  tabs?.addEventListener('click', revealPanel);
  tabs?.addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) revealPanel(); });
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('experience-visible', entry.isIntersecting);
    if (entry.isIntersecting && !seen.has(entry.target)) {
      seen.add(entry.target);
      if (entry.target.matches('.offer-gallery')) {
        reveal([...entry.target.querySelectorAll('.offer-heading>*')]);
        revealPanel();
      }
    }
  }), {threshold:.06});
  document.querySelectorAll('.cinema-hero,.offer-gallery,.scroll-story,.launch-stage').forEach(element => observer.observe(element));
  if (launch) {
    const buttons = [...launch.querySelectorAll('button[data-direction]')];
    const status = launch.querySelector('.direction-status');
    buttons.forEach(button => button.addEventListener('click', () => {
      launch.dataset.direction = button.dataset.direction;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      status.textContent = `Direção ${button.textContent.trim()} aplicada à demonstração no site e no celular.`;
    }));
  }
  // Pointer motion only runs while an actual interaction is settling.
  const motionStops = [];
  function depth(surface, target, properties, amplitude) {
    let frame = 0, x = 0, y = 0, tx = 0, ty = 0;
    function stop() {
      cancelAnimationFrame(frame); frame = 0; x = y = tx = ty = 0;
      properties.forEach(property => target.style.removeProperty(property));
    }
    function paint() {
      frame = 0;
      if (reduced.matches || !fine.matches || document.hidden || surface.closest('.launch-is-paused')) { stop(); return; }
      x += (tx - x) * .18; y += (ty - y) * .18;
      target.style.setProperty(properties[0], `${x.toFixed(2)}${amplitude.unit}`);
      target.style.setProperty(properties[1], `${y.toFixed(2)}${amplitude.unit}`);
      if (Math.abs(tx-x) + Math.abs(ty-y) > .04) frame = requestAnimationFrame(paint);
    }
    surface.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reduced.matches || !fine.matches) return;
      const rect = surface.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1,(event.clientX - rect.left) / rect.width * 2 - 1)) * amplitude.x;
      ty = Math.max(-1, Math.min(1,(event.clientY - rect.top) / rect.height * 2 - 1)) * amplitude.y;
      if (!frame) frame = requestAnimationFrame(paint);
    }, {passive:true});
    surface.addEventListener('pointerleave', stop);
    motionStops.push(stop);
  }
  document.querySelectorAll('.service-scene').forEach(scene => depth(scene, scene, ['--scene-ry','--scene-rx'], {x:3,y:-2,unit:'deg'}));
  const stage = launch?.querySelector('.launch-stage');
  if (stage) depth(stage, stage, ['--stage-x','--stage-y'], {x:7,y:4,unit:'px'});
  document.addEventListener('visibilitychange', () => { if (document.hidden) motionStops.forEach(stop => stop()); });
  reduced.addEventListener('change', () => {
    motionStops.forEach(stop => stop());
    if (reduced.matches) { enterAnimations.forEach(animation => animation.cancel()); enterAnimations.clear(); }
  });
})();
