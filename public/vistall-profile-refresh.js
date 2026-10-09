(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const flows = [...document.querySelectorAll('.v-flow-visual')];
  const visible = new Set();
  const sync = () => flows.forEach(flow => flow.classList.toggle('v-flow-live', visible.has(flow) && !reduced.matches && !document.hidden));
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)); sync(); },{threshold:.2});
  flows.forEach(flow => observer.observe(flow));
  reduced.addEventListener('change',sync); document.addEventListener('visibilitychange',sync);
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const projects = [...document.querySelectorAll('[data-project-category]')];
  let animations = [];
  const stop = () => { animations.forEach(animation => animation.cancel()); animations = []; };
  reduced.addEventListener('change',stop);
  filters.forEach(button => button.addEventListener('click', () => {
    stop();
    const category = button.dataset.projectFilter;
    filters.forEach(item => item.setAttribute('aria-pressed',String(item === button)));
    projects.forEach((project,index) => {
      project.hidden = category !== 'all' && project.dataset.projectCategory !== category;
      if (!project.hidden && !reduced.matches && !document.hidden) {
        animations.push(project.animate([{opacity:.5,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:420,delay:index*45,easing:'cubic-bezier(.22,1,.36,1)'}));
      }
    });
  }));
})();
