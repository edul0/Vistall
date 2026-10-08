(() => {
  const gallery = document.querySelector('.offer-gallery');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (gallery) {
    const tabs = [...gallery.querySelectorAll('[role=tab]')];
    function select(tab) {
      tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; gallery.querySelector(`#${item.getAttribute('aria-controls')}`).hidden = !active; });
      const panel = gallery.querySelector(`#${tab.getAttribute('aria-controls')}`);
      if (!reduced.matches) panel.animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:340,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); tabs[next].focus(); select(tabs[next]); }
      });
    });
    gallery.querySelectorAll('[data-offer-contact]').forEach(link => link.addEventListener('click', () => document.querySelector(`#btn-srv-${link.dataset.offerContact}`)?.click()));
  }
  const links = [...document.querySelectorAll('header a[href^="#"]')].filter(link => link.getAttribute('href').length > 1);
  const sections = links.map(link => ({link,element:document.querySelector(link.getAttribute('href'))})).filter(item => item.element);
  let frame = 0;
  function update() {
    frame = 0;
    const threshold = Math.min(200, innerHeight * .3);
    const active = [...sections].reverse().find(item => item.element.getBoundingClientRect().top <= threshold);
    links.forEach(link => { if (active?.link === link && scrollY > 100) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  }
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, {passive:true});
  update();
})();
