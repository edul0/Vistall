(() => {
  // The simple local preview server serves the HTML file without production rewrites.
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    document.querySelectorAll('a[href="/sobre"]').forEach(link => link.setAttribute('href', '/sobre.html'));
  }
  const scenes = document.querySelectorAll('.v-workbench-visual, .project-visual');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  const sync = () => scenes.forEach(scene => scene.classList.toggle('v-motion-live', visible.has(scene) && !reduced.matches && !document.hidden));
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)); sync(); }, {threshold:.15});
  scenes.forEach(scene => observer.observe(scene));
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  const workbench = document.querySelector('.v-workbench');
  if (workbench) {
    const titles = ['Sua ideia.', 'Uma direção.', 'Pronto para usar.'];
    const subtitles = ['Em movimento.', 'Com identidade.', 'Com clareza.'];
    const labels = ['Contexto · Objetivo · Público', 'Visual · Conteúdo · Tecnologia', 'Navegação · Mobile · Revisão'];
    const buttons = [...document.querySelectorAll('[data-process-stage]')];
    const transitions = new Map();
    reduced.addEventListener('change', () => {
      if (reduced.matches) { transitions.forEach(animation => animation.cancel()); transitions.clear(); }
    });
    const select = button => {
      const index = Number(button.dataset.processStage);
      const changed = workbench.dataset.stage !== String(index);
      const devices = [...workbench.querySelectorAll('.v-wireframe, .v-phone')];
      const previous = changed ? devices.map(device => device.getBoundingClientRect()) : [];
      devices.forEach(device => transitions.get(device)?.cancel());
      workbench.dataset.stage = String(index);
      if (changed && !reduced.matches && !document.hidden) {
        devices.forEach((device, i) => {
          const next = device.getBoundingClientRect();
          const x = previous[i].left - next.left;
          const y = previous[i].top - next.top;
          const animation = device.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});
          transitions.set(device, animation);
          animation.finished.catch(() => {}).finally(() => { if (transitions.get(device) === animation) transitions.delete(device); });
        });
      }
      workbench.querySelectorAll('.v-wireframe strong, .v-phone-screen strong').forEach(title => {
        transitions.get(title)?.cancel();
        title.replaceChildren(document.createTextNode(titles[index]), document.createElement('br'));
        const em = document.createElement('em'); em.textContent = subtitles[index]; title.append(em);
        if (changed && !reduced.matches && !document.hidden) {
          const animation = title.animate([{opacity:.35,translate:'0 6px'},{opacity:1,translate:'0 0'}], {duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
          transitions.set(title, animation);
          animation.finished.catch(() => {}).finally(() => { if (transitions.get(title) === animation) transitions.delete(title); });
        }
      });
      workbench.querySelector('.v-orbit-label').textContent = labels[index];
      document.querySelectorAll('[data-process-stage]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      workbench.querySelectorAll('.v-process-step').forEach((step,i) => step.classList.toggle('is-selected', i === index));
      const status = document.querySelector('.v-process-status');
      if (status) status.textContent = `${button.textContent} — ${workbench.querySelectorAll('.v-process-step h3')[index].textContent}`;
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', event => {
        const key = event.key;
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
        event.preventDefault();
        const next = key === 'Home' ? 0 : key === 'End' ? buttons.length - 1 : (index + (key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus(); select(buttons[next]);
      });
    });
    if (buttons[0]) select(buttons[0]);
  }
  // One frame per pointer update, only for a visible scene on a fine pointer.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  scenes.forEach(scene => {
    let frame = 0;
    let position;
    const stop = () => {
      cancelAnimationFrame(frame); frame = 0;
      scene.style.removeProperty('--light-x'); scene.style.removeProperty('--light-y');
      scene.classList.remove('v-pointer-active');
    };
    scene.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches || document.hidden || !visible.has(scene)) return;
      const rect = scene.getBoundingClientRect();
      position = {x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100};
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        scene.style.setProperty('--light-x', `${position.x}%`);
        scene.style.setProperty('--light-y', `${position.y}%`);
        scene.classList.add('v-pointer-active');
      });
    }, {passive:true});
    scene.addEventListener('pointerleave', stop);
    reduced.addEventListener('change', stop);
    document.addEventListener('visibilitychange', stop);
  });
})();
