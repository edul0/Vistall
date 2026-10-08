(() => {
  const hero=document.querySelector('.cinema-hero'),video=document.querySelector('.cinema-video'),button=document.querySelector('.cinema-pause');
  if(!hero||!video||!button)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let manualPause=false,visible=true,queued=false;
  const saveData=navigator.connection?.saveData===true;
  function playback(){
    const paused=manualPause||reduced.matches||saveData;
    button.textContent=paused?'▶ Reproduzir fundo':'Ⅱ Pausar fundo';
    button.setAttribute('aria-pressed',String(paused));
    if(paused||!visible||document.hidden)video.pause();else video.play().catch(()=>{button.textContent='▶ Reproduzir fundo';});
  }
  button.addEventListener('click',()=>{manualPause=!manualPause;playback();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();}).observe(hero);
  document.addEventListener('visibilitychange',playback);reduced.addEventListener('change',playback);
  function scroll(){queued=false;const rect=hero.getBoundingClientRect();document.body.classList.toggle('cinema-light-nav',rect.bottom<130);if(!reduced.matches)hero.style.setProperty('--cinema-turn',`${Math.min(1,Math.max(0,-rect.top/rect.height))*12}deg`);}
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(scroll);}},{passive:true});
  addEventListener('resize',scroll,{passive:true});scroll();playback();
})();
