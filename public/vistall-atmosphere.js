/* Local WebGL atmosphere inspired by the supplied ShaderGradient plane settings.
   No remote scripts, HDR downloads, tracking, or dependencies. */
(() => {
  const canvas = document.querySelector('[data-vistall-atmosphere]');
  if (!canvas) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const gl = canvas.getContext('webgl', { alpha:false, antialias:false, powerPreference:'low-power' });
  if (!gl) return;
  const vs = 'attribute vec2 p; varying vec2 uv; void main(){ uv=p*.5+.5; gl_Position=vec4(p,0.,1.); }';
  const fs = `precision mediump float;
    varying vec2 uv; uniform float time; uniform float aspect;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){
      vec2 q=(uv-.5)*vec2(aspect,1.);
      float t=time*.4;
      mat2 turn=mat2(.643,-.766,.766,.643);
      q=turn*q;
      float fold=q.y+sin(q.x*1.3+t*.23)*.48+sin(q.x*2.7-t*.16)*.2;
      float wave=sin(fold*5.5+t*.18)*.5+.5;
      float crest=pow(wave,3.);
      vec3 base=vec3(.106,.11,.102);
      vec3 orange=vec3(.902,.322,.165);
      vec3 sand=vec3(.859,.729,.584);
      vec3 warm=mix(orange,sand,smoothstep(.55,1.,wave));
      float area=smoothstep(.15,.95,uv.x);
      vec3 col=mix(base,warm,crest*area*.66);
      col+= (hash(gl_FragCoord.xy)-.5)*.014;
      gl_FragColor=vec4(col,1.);
    }`;
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;};
  const v=compile(gl.VERTEX_SHADER,vs), f=compile(gl.FRAGMENT_SHADER,fs);
  if(!v||!f)return;
  const program=gl.createProgram();gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const clock=gl.getUniformLocation(program,'time'), ratio=gl.getUniformLocation(program,'aspect');
  let visible=true, raf=0, last=0, lost=false;
  function size(){const r=canvas.getBoundingClientRect();const density=Math.min(devicePixelRatio||1,innerWidth<760?.75:1);canvas.width=Math.max(1,Math.round(r.width*density));canvas.height=Math.max(1,Math.round(r.height*density));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(ratio,canvas.width/canvas.height);}
  function draw(t){raf=0;if(lost||!visible||document.hidden||reduced.matches)return;if(t-last>=33){last=t;gl.uniform1f(clock,t*.001);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}raf=requestAnimationFrame(draw);}
  function resume(){cancelAnimationFrame(raf);raf=0;if(!lost&&visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(draw);}
  new ResizeObserver(()=>{size();resume();}).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(canvas);
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(raf);canvas.style.display='none';});
  size();resume();
})();
