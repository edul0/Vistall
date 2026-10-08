(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const surfaces=document.querySelectorAll('.vistall-gallery-hero,.design-service,.design-canvas');
  surfaces.forEach(surface=>{
    let frame=0,x=0,y=0,targetX=0,targetY=0,active=false;
    function stop(){cancelAnimationFrame(frame);frame=0;active=false;surface.classList.remove('light-active');}
    function paint(){
      frame=0;if(!active||reduce.matches||document.hidden)return;
      x+=(targetX-x)*.12;y+=(targetY-y)*.12;
      surface.style.setProperty('--light-x',`${x.toFixed(1)}px`);
      surface.style.setProperty('--light-y',`${y.toFixed(1)}px`);
      if(Math.abs(targetX-x)+Math.abs(targetY-y)>.2)frame=requestAnimationFrame(paint);
    }
    surface.addEventListener('pointerenter',event=>{
      if(!fine.matches||reduce.matches)return;
      const rect=surface.getBoundingClientRect();x=targetX=event.clientX-rect.left;y=targetY=event.clientY-rect.top;
      active=true;surface.classList.add('light-active');paint();
    });
    surface.addEventListener('pointermove',event=>{
      if(!active)return;
      const rect=surface.getBoundingClientRect();targetX=event.clientX-rect.left;targetY=event.clientY-rect.top;
      if(!frame)frame=requestAnimationFrame(paint);
    },{passive:true});
    surface.addEventListener('pointerleave',stop);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    reduce.addEventListener('change',stop);
  });
})();
