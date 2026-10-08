(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const ease = 'cubic-bezier(.25,.46,.45,.94)';
  function enter(element, delay = 0, distance = 8) {
    if (reduced.matches || !element.animate) return;
    const animation = element.animate([
      {opacity:0,transform:`translateY(${distance}px)`},
      {opacity:1,transform:'translateY(0)'}
    ], {duration:520,delay,easing:ease,fill:'backwards'});
    running.add(animation);
    animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  }
  const hero = document.querySelector('.vistall-gallery-hero');
  if (hero) {
    const title = hero.querySelector('h1');
    title?.querySelectorAll(':scope > span').forEach((line,i)=>enter(line,60+i*80,8));
    if(hero.querySelector('.design-hero-grid')){
      hero.querySelectorAll('.design-intro,.design-actions,.design-note').forEach((part,i)=>enter(part,160+i*60,6));
      const illustration=hero.querySelector('.design-canvas');
      if(illustration)enter(illustration,100,8);
    }else{
      const bottom = hero.querySelector('.grid');
      if(bottom) Array.from(bottom.children).forEach((part,i)=>enter(part,180+i*60,8));
    }
  }
  const targets = document.querySelectorAll('#modelos .service-card-interactive,#modelos > div > .flex,#olhar h2,#olhar #case-preview-container,#olhar [onclick^="highlightPillar"],#servico li,#contato .reveal-init,footer > div > .grid > div');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>{
      const visible = entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
      visible.forEach((entry,i)=>{enter(entry.target,Math.min(i*65,195));observer.unobserve(entry.target);});
    },{threshold:.06,rootMargin:'0px 0px -24px 0px'});
    targets.forEach(element=>observer.observe(element));
  }
  const header = document.querySelector('header');
  let pending = false;
  function updateHeader(){header?.classList.toggle('is-scrolled',scrollY>24);if(scrollY<100)header?.querySelectorAll('[aria-current="location"]').forEach(link=>link.removeAttribute('aria-current'));pending=false;}
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(updateHeader);}},{passive:true});
  updateHeader();
  const links = Array.from(document.querySelectorAll('header a[href^="#"]')).filter(link=>link.getAttribute('href').length>1);
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries=>{
      const entry = entries.find(item=>item.isIntersecting);
      if(!entry)return;
      links.forEach(link=>{if(link.getAttribute('href')===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    },{rootMargin:'-15% 0px -65% 0px',threshold:0});
    sections.forEach(section=>navObserver.observe(section));
  }
  // Small crossfade on the before/after preview; no layout movement.
  const preview = document.querySelector('#preview-stage');
  document.querySelectorAll('#toggle-original-btn,#toggle-refined-btn').forEach(button=>button.addEventListener('click',()=>{
    if(!preview||reduced.matches)return;
    const animation=preview.animate([{opacity:.65},{opacity:1}],{duration:280,easing:ease});
    running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  }));
  // Scroll-linked composition. Geometry reads are batched before style writes.
  const scrollItems = [
    ...Array.from(document.querySelectorAll('.design-service')).map(element=>({element,type:'service'})),
    ...Array.from(document.querySelectorAll('#case-preview-container')).map(element=>({element,type:'preview'}))
  ];
  let scrollFrame=0;
  const clamp=value=>Math.min(1,Math.max(0,value));
  function renderScroll(){
    scrollFrame=0;
    if(reduced.matches){
      hero?.style.removeProperty('--hero-shift');
      hero?.style.removeProperty('--hero-copy-shift');
      scrollItems.forEach(({element})=>{element.style.removeProperty('--scroll-y');element.style.removeProperty('--scroll-scale');});
      return;
    }
    const height=innerHeight;
    const heroRect=hero?.getBoundingClientRect();
    const geometry=scrollItems.map(item=>({...item,rect:item.element.getBoundingClientRect()}));
    const small=innerWidth<760;
    if(heroRect){
      const progress=clamp(-heroRect.top/heroRect.height);
      hero.style.setProperty('--hero-shift',`${(progress*(small?4:12)).toFixed(2)}px`);
      hero.style.setProperty('--hero-copy-shift',`${(-progress*(small?2:6)).toFixed(2)}px`);
    }
    geometry.forEach(({element,type,rect})=>{
      if(rect.bottom<0||rect.top>height+80)return;
      const progress=clamp((height*.92-rect.top)/(height*.55));
      const eased=progress*progress*(3-2*progress);
      element.style.setProperty('--scroll-y',`${((1-eased)*(small?4:8)).toFixed(2)}px`);
      if(type==='preview')element.style.setProperty('--scroll-scale',( .975+.025*eased).toFixed(4));
    });
  }
  function queueScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(renderScroll);}
  addEventListener('scroll',queueScroll,{passive:true});
  addEventListener('resize',queueScroll,{passive:true});
  document.fonts?.ready.then(queueScroll);
  queueScroll();
  reduced.addEventListener('change',()=>{if(reduced.matches){running.forEach(animation=>animation.cancel());running.clear();}queueScroll();});
})();
