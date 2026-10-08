(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-visible',entry.isIntersecting)),{threshold:.1});
  document.querySelectorAll('.project-visual,.badge-lanyard-swing').forEach(element => visible.observe(element));
  const badgeFilm = document.querySelector('.badge-film video');
  if (badgeFilm) {
    let showing = false;
    const playback = () => { if (showing && !reduced.matches && !document.hidden && !navigator.connection?.saveData) badgeFilm.play().catch(() => {}); else badgeFilm.pause(); };
    new IntersectionObserver(entries => { showing = entries[0].isIntersecting; playback(); }).observe(badgeFilm);
    document.addEventListener('visibilitychange',playback); reduced.addEventListener('change',playback);
  }
  const canvas = document.querySelector('#portfolio-orb');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const button = document.querySelector('.orb-pause');
  const fine = matchMedia('(pointer:fine)');
  let active = false, paused = false, frame = 0, width = 0, height = 0, time = 0, last = 0, px = 0, py = 0;
  const points = Array.from({length:360},(_,i) => {
    const y = 1 - 2 * (i+.5) / 360;
    const radius = Math.sqrt(1-y*y), angle = i * 2.39996323;
    return {x:Math.cos(angle)*radius,y,z:Math.sin(angle)*radius};
  });
  function draw() {
    context.clearRect(0,0,width,height);
    const radius = Math.min(width,height)*.39;
    const yaw = time*.16+px*.14, pitch = -.18+Math.sin(time*.12)*.08+py*.1;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    points.forEach((point,index) => {
      const x = point.x*cy + point.z*sy, z = point.z*cy-point.x*sy;
      const y = point.y*cx-z*sx, depth = point.y*sx+z*cx;
      const perspective = 2.8/(2.8-depth*.4);
      const front = (depth+1)/2;
      context.globalAlpha = .18 + front*.7;
      context.fillStyle = index%7 === 0 ? '#e9b18b' : '#ead7c0';
      context.beginPath();context.arc(width/2+x*radius*perspective,height/2+y*radius*perspective,.55+front*.85,0,Math.PI*2);context.fill();
    });
    context.globalAlpha = 1;
  }
  function tick(now) {
    frame = 0;
    if (!active || paused || reduced.matches || document.hidden) return;
    if (now-last >= 40) { time += Math.min(.05,(now-last)/1000); last = now; draw(); }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = performance.now();
    draw();
    if (active && !paused && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function size() {
    const rect = canvas.getBoundingClientRect(), density = Math.min(devicePixelRatio || 1,1.5);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width*density); canvas.height = Math.round(height*density);
    context.setTransform(density,0,0,density,0,0); draw();
  }
  new ResizeObserver(size).observe(canvas);
  new IntersectionObserver(entries => { active = entries[0].isIntersecting; sync(); }).observe(canvas);
  canvas.addEventListener('pointermove',event => { if (fine.matches && !reduced.matches) { const rect=canvas.getBoundingClientRect(); px=(event.clientX-rect.left)/rect.width*2-1; py=(event.clientY-rect.top)/rect.height*2-1; } },{passive:true});
  canvas.addEventListener('pointerleave',() => { px=py=0; });
  button?.addEventListener('click',() => { paused=!paused; button.setAttribute('aria-pressed',String(paused)); button.setAttribute('aria-label',paused?'Reproduzir esfera de partículas':'Pausar esfera de partículas'); button.textContent=paused?'▶':'Ⅱ'; sync(); });
  document.addEventListener('visibilitychange',sync); reduced.addEventListener('change',sync); size();
})();
