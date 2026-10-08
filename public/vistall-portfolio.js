(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ease='cubic-bezier(.22,1,.36,1)';
  const animations=new Set();
  function animate(element,frames,options){
    if(reduced.matches||!element.animate)return;
    const animation=element.animate(frames,options);animations.add(animation);
    animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
  }
  const targets=document.querySelectorAll('.hero-grid>div,.profile-panel,.section-head,.stack .card,.cards .card,.timeline article,.contact-card,.badge-lanyard-swing');
  if('IntersectionObserver'in window){
    const entrance=new IntersectionObserver(entries=>{
      entries.filter(entry=>entry.isIntersecting).forEach((entry,i)=>{
        entry.target.classList.add('is-traced');
        animate(entry.target,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:Math.min(i*70,210),easing:ease,fill:'backwards'});
        entrance.unobserve(entry.target);
      });
    },{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    targets.forEach(target=>entrance.observe(target));
  }
  document.querySelectorAll('.case-detail').forEach(detail=>{
    detail.addEventListener('toggle',()=>{
      if(!detail.open)return;
      const content=detail.querySelector('.case-content');
      if(content)animate(content,[{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:ease});
    });
  });
  const nav=document.querySelector('.links');
  const links=Array.from(document.querySelectorAll('.links a[href^="#"]'));
  const marker=document.createElement('span');marker.className='nav-marker';marker.setAttribute('aria-hidden','true');
  nav?.append(marker);
  function placeMarker(){
    const current=links.find(link=>link.getAttribute('aria-current')==='location');
    if(!current||!nav){marker.style.opacity='0';return;}
    marker.style.opacity='1';marker.style.width=`${current.offsetWidth}px`;marker.style.transform=`translateX(${current.offsetLeft}px)`;
  }
  if('IntersectionObserver'in window){
    const sections=new IntersectionObserver(entries=>{
      const entry=entries.find(item=>item.isIntersecting);if(!entry)return;
      links.forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});placeMarker();
    },{rootMargin:'-15% 0px -60% 0px',threshold:0});
    document.querySelectorAll('main section[id]').forEach(section=>sections.observe(section));
  }
  if(nav)new ResizeObserver(placeMarker).observe(nav);
  document.fonts?.ready.then(placeMarker);placeMarker();
  let pending=false;
  addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{document.body.classList.toggle('has-scrolled',scrollY>15);if(scrollY<100){links.forEach(link=>link.removeAttribute('aria-current'));placeMarker();}pending=false;});},{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches){animations.forEach(animation=>animation.cancel());animations.clear();}});
})();
