(() => {
  const canvas = document.querySelector('#portfolio-brain');
  if (!canvas) return;
  const root = canvas.closest('.v-brain-feature');
  const gl = canvas.getContext('webgl', {alpha:true,antialias:true,premultipliedAlpha:false});
  const fallback = gl ? null : canvas.getContext('2d');
  const overlay = document.createElement('canvas');
  overlay.className = 'v-brain-overlay';
  overlay.setAttribute('aria-hidden','true');
  canvas.insertAdjacentElement('afterend',overlay);
  const ctx = overlay.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const topics = [
    {title:'Design com intenção.',text:'Interfaces claras, com atenção ao visual e à experiência de quem usa.',x:-.35,y:.36,z:.55},
    {title:'Código que dá forma às ideias.',text:'Desenvolvimento web, Python, HTML e CSS aplicados aos meus projetos.',x:.45,y:.42,z:-.3},
    {title:'Automação na rotina.',text:'Power Automate, Power Apps, Make e SharePoint para conectar processos e informações.',x:.35,y:-.5,z:-.4}
  ];
  const initialYaw=1.02,initialPitch=.08;
  let width=0,height=0,yaw=initialYaw,pitch=initialPitch,zoom=1,time=0,active=false,paused=false,frame=0,last=0,selected=0,drag=null,density=1;
  let projectedTopics=[],hover=null;
  let model=null,renderModel=null,uploadModel=null,uploadTarget=null,morph=null;
  const models=[];
  const palette=['#e6522a','#f29b66','#edbd8b','#f6dfc5','#b77c57'];
  let seed=137;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  function sortCloud(cloud){
    const spread=n=>{n=(n|(n<<16))&0x030000FF;n=(n|(n<<8))&0x0300F00F;n=(n|(n<<4))&0x030C30C3;n=(n|(n<<2))&0x09249249;return n;};
    const order=Array.from({length:cloud.length/8},(_,i)=>i);
    const keys=order.map(i=>{const q=d=>Math.max(0,Math.min(255,Math.round((cloud[i*8+d]+1)*127.5)));return spread(q(0))|(spread(q(1))<<1)|(spread(q(2))<<2);});
    order.sort((a,b)=>keys[a]-keys[b]);
    const sorted=new Float32Array(cloud.length);order.forEach((id,i)=>sorted.set(cloud.subarray(id*8,id*8+8),i*8));return sorted;
  }
  // The lamp and orbital planet are local parametric surfaces. The brain uses anatomical data.
  function geometry(){
    const vertices=[],indices=[],tags=[];
    function surface(fn,rows,columns,tag,wrap=true){
      const offset=vertices.length;
      for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){vertices.push(fn(i/rows,j/columns));tags.push(tag);}
      for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
        const a=offset+i*(columns+1)+j,b=a+columns+1;
        indices.push(a,a+1,b,a+1,b+1,b);
      }
    }
    function finish(count,excludeOrbits=false){
      const normals=vertices.map(()=>[0,0,0]),areas=[];
      let sum=0;
      for(let i=0;i<indices.length;i+=3){
        const a=vertices[indices[i]],b=vertices[indices[i+1]],c=vertices[indices[i+2]];
        const u=b.map((n,d)=>n-a[d]),v=c.map((n,d)=>n-a[d]);
        const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
        for(let j=0;j<3;j++)for(let d=0;d<3;d++)normals[indices[i+j]][d]+=n[d];
        sum+=Math.hypot(...n);areas.push(sum);
      }
      normals.forEach(n=>{const length=Math.hypot(...n)||1;for(let d=0;d<3;d++)n[d]/=length;});
      const mesh=new Float32Array(vertices.length*6),cloud=new Float32Array(count*8);
      vertices.forEach((v,i)=>mesh.set([...v,...normals[i]],i*6));
      for(let i=0;i<count;i++){
        const target=random()*sum;
        let low=0,high=areas.length-1;
        while(low<high){const mid=(low+high)>>1;if(areas[mid]<target)low=mid+1;else high=mid;}
        let a=random(),b=random();if(a+b>1){a=1-a;b=1-b;}
        const weights=[1-a-b,a,b],ids=indices.slice(low*3,low*3+3),p=[0,0,0],n=[0,0,0];
        ids.forEach((id,j)=>{for(let d=0;d<3;d++){p[d]+=vertices[id][d]*weights[j];n[d]+=normals[id][d]*weights[j];}});
        const length=Math.hypot(...n)||1;
        for(let d=0;d<3;d++){n[d]/=length;p[d]+=n[d]*.004;}
        cloud.set([...p,...n,tags[ids[0]],random()],i*8);
      }
      const visible=excludeOrbits?indices.filter((_,i)=>tags[indices[Math.floor(i/3)*3]]<6):indices;
      return {mesh,indices:new Uint16Array(visible),cloud:sortCloud(cloud)};
    }
    return {surface,finish};
  }
  function lamp(){
    const g=geometry();
    const profile=[[.9,0],[.86,.15],[.73,.36],[.52,.51],[.28,.53],[.08,.46],[-.12,.31],[-.3,.23]];
    const section=t=>{
      const k=t*(profile.length-1),i=Math.min(profile.length-2,Math.floor(k)),s=k-i;
      const p0=profile[Math.max(0,i-1)],p1=profile[i],p2=profile[i+1],p3=profile[Math.min(profile.length-1,i+2)];
      return [0,1].map(d=>.5*((2*p1[d])+(-p0[d]+p2[d])*s+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*s*s+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*s*s*s));
    };
    g.surface((u,v)=>{const [y,r]=section(u),phi=v*Math.PI*2;return[r*Math.cos(phi),y,r*Math.sin(phi)];},64,64,0);
    g.surface((u,v)=>{const y=-.3-u*.37,r=.235+Math.sin(u*Math.PI*12)*.022,phi=v*Math.PI*2;return[r*Math.cos(phi),y,r*Math.sin(phi)];},54,64,3);
    g.surface((u,v)=>{const phi=v*Math.PI*2,r=.21*Math.sin(u*Math.PI/2);return[r*Math.cos(phi),-.72+.04*Math.sin(u*Math.PI/2),r*Math.sin(phi)];},12,48,3);
    // Filament placed against the inside front surface, visible as a warm zigzag.
    g.surface((u,v)=>{const y=.39-u*.6,x=Math.sin(u*Math.PI*5)*.13,phi=v*Math.PI*2;return[x+.012*Math.cos(phi),y,.45+.012*Math.sin(phi)];},80,8,4);
    return g.finish(32000);
  }
  function planet(){
    const g=geometry();
    g.surface((u,v)=>{const theta=u*Math.PI,phi=v*Math.PI*2;return[.63*Math.sin(theta)*Math.cos(phi),.63*Math.cos(theta),.63*Math.sin(theta)*Math.sin(phi)];},48,64,5);
    function orbit(radius,tilt,tag){g.surface((u,v)=>{const phi=u*Math.PI*2,tube=v*Math.PI*2,r=radius+.012*Math.cos(tube),x=r*Math.cos(phi),y=.012*Math.sin(tube),z=r*Math.sin(phi);return[x,y*Math.cos(tilt)-z*Math.sin(tilt),y*Math.sin(tilt)+z*Math.cos(tilt)];},144,8,tag);}
    orbit(.9,.42,6);orbit(1.04,-.45,7);
    [0.6,2.7,4.8].forEach((angle,i)=>{
      const tilt=i===1?-.45:.42,r=i===1?1.04:.9,c=[r*Math.cos(angle),-r*Math.sin(angle)*Math.sin(tilt),r*Math.sin(angle)*Math.cos(tilt)];
      g.surface((u,v)=>{const theta=u*Math.PI,phi=v*Math.PI*2;return[c[0]+.052*Math.sin(theta)*Math.cos(phi),c[1]+.052*Math.cos(theta),c[2]+.052*Math.sin(theta)*Math.sin(phi)];},12,16,8+i);
    });
    return g.finish(32000,true);
  }
  models[0]=lamp();models[2]=planet();model=models[0];
  const ambient=Array.from({length:26},()=>({x:random(),y:random(),phase:random()*6.28,color:palette[Math.floor(random()*palette.length)]}));
  function angle(){return yaw+(drag?0:Math.sin(time*.24)*.12);}
  function objectMotion(p,tag,object){
    if(object<1.5)return p;
    const tilt=tag>5.5?(tag>6.5&&tag<7.5||tag>8.5&&tag<9.5?-.45:.42):0;
    const a=time*(tag>7.5?.55:tag>5.5?.23:.1),cs=Math.cos(a),sn=Math.sin(a),ct=Math.cos(tilt),st=Math.sin(tilt);
    const x=p[0],y=p[1]*ct+p[2]*st,z=p[2]*ct-p[1]*st;
    const rx=x*cs+z*sn,rz=z*cs-x*sn;
    return[rx,y*ct-rz*st,y*st+rz*ct];
  }
  function movingValue(cloud,i,object,normal=false){const d=normal?3:0;return objectMotion([cloud[i+d],cloud[i+d+1],cloud[i+d+2]],cloud[i+6],object);}
  function project(point) {
    const cy=Math.cos(angle()),sy=Math.sin(angle()),cx=Math.cos(pitch),sx=Math.sin(pitch);
    const x=point.x*cy+point.z*sy,z=point.z*cy-point.x*sy,y=point.y*cx-z*sx,depth=point.y*sx+z*cx;
    const size=Math.min(width,height)*.5*zoom;
    const perspective=3.5/(3.5-depth*.35);
    return {x:width/2+x*size*perspective,y:height/2-y*size*perspective,z:depth};
  }
  function createRenderer() {
    if (!gl) return;
    const vertex=`
      precision mediump float;
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec2 aData;
      attribute vec3 aTargetPosition;
      attribute vec3 aTargetNormal;
      attribute vec2 aTargetData;
      uniform vec2 uScale;
      uniform vec2 uRotation;
      uniform float uDensity;
      uniform float uTime;
      uniform float uMode;
      uniform float uObject;
      uniform float uPrevious;
      uniform float uMorph;
      uniform vec2 uPointer;
      varying vec3 vNormal;
      varying vec2 vData;
      vec3 rotate(vec3 p){
        float cy=cos(uRotation.x),sy=sin(uRotation.x),cx=cos(uRotation.y),sx=sin(uRotation.y);
        vec3 r=vec3(p.x*cy+p.z*sy,p.y,p.z*cy-p.x*sy);
        return vec3(r.x,r.y*cx-r.z*sx,r.y*sx+r.z*cx);
      }
      vec3 motion(vec3 p,float tag,float object){
        if(object>1.5){
          float speed=.1;
          float tilt=0.0;
          if(tag>5.5){tilt=(tag>6.5&&tag<7.5||tag>8.5&&tag<9.5)?-.45:.42;speed=tag>7.5?.55:.23;}
          float a=uTime*speed,cs=cos(a),sn=sin(a),ct=cos(tilt),st=sin(tilt);
          p=vec3(p.x,p.y*ct+p.z*st,p.z*ct-p.y*st);
          p=vec3(p.x*cs+p.z*sn,p.y,p.z*cs-p.x*sn);
          p=vec3(p.x,p.y*ct-p.z*st,p.y*st+p.z*ct);
        }
        return p;
      }
      void main(){
        vec3 p=aPosition,n=aNormal;
        if(uMode>.5){
          vec3 source=motion(aPosition,aData.x,uPrevious),target=motion(aTargetPosition,aTargetData.x,uObject);
          p=mix(source,target,uMorph);
          n=mix(motion(aNormal,aData.x,uPrevious),motion(aTargetNormal,aTargetData.x,uObject),uMorph);
        }else{p=motion(p,5.0,uObject);n=motion(n,5.0,uObject);}
        vec3 r=rotate(p);
        vNormal=rotate(n);
        vData=mix(aData,aTargetData,uMorph);
        float perspective=3.5/(3.5-r.z*.35);
        vec2 screen=r.xy*uScale*perspective;
        // The pointer gently lights the surface; geometry never dissolves into a blob.
        gl_Position=vec4(screen,-r.z*.4,1.0);
        gl_PointSize=(1.8+aData.y*1.8)*uDensity;
      }`;
    const fragment=`
      precision mediump float;
      uniform float uMode;
      uniform float uSelected;
      uniform float uObject;
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec2 uResolution;
      varying vec3 vNormal;
      varying vec2 vData;
      void main(){
        vec3 n=normalize(vNormal);
        float light=max(0.0,dot(n,normalize(vec3(-.45,.75,1.0))));
        if(uMode<.5){
          vec3 base=mix(vec3(.018,.014,.012),vec3(.23,.14,.085),light*.6);
          gl_FragColor=vec4(base,.92);
        }else{
          vec2 p=gl_PointCoord;
          if(abs(p.x-.5)>(1.0-p.y)*.5)discard;
          vec3 cream=vec3(.98,.86,.7),copper=vec3(.93,.38,.17),gold=vec3(.96,.66,.34);
          vec3 color=mix(copper,cream,step(.42,vData.y));
          if(vData.x>1.5)color=mix(gold,cream,vData.y);
          if(uObject<.5){color=mix(gold,cream,vData.y*.55);if(vData.x>2.5&&vData.x<3.5)color=mix(vec3(.45,.37,.3),cream,vData.y*.5);if(vData.x>3.5)color=vec3(1.0,.7,.35);}
          if(uObject>1.5){color=mix(copper,cream,vData.y*.7);if(vData.x>5.5)color=mix(gold,cream,vData.y);}
          float emphasis=1.0-step(.1,abs(vData.x-uSelected));
          float pulse=.88+.12*sin(uTime*1.7+vData.y*18.0);
          float glow=1.0-smoothstep(0.0,85.0,distance(gl_FragCoord.xy,uPointer));
          color*=((.4+.6*light)*(.86+emphasis*.14)*pulse+glow*.22);
          if(vData.x>3.5&&uObject<.5||vData.x>5.5&&uObject>1.5)color*=1.35;
          gl_FragColor=vec4(color,1.0);
        }
      }`;
    function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error('Brain shader compilation failed');return shader;}
    const program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(`3D shader link failed: ${gl.getProgramInfoLog(program)}`);
    const uniforms={};['uScale','uRotation','uDensity','uTime','uMode','uSelected','uObject','uPrevious','uMorph','uPointer','uResolution'].forEach(name=>uniforms[name]=gl.getUniformLocation(program,name));
    const position=gl.getAttribLocation(program,'aPosition'),normal=gl.getAttribLocation(program,'aNormal'),data=gl.getAttribLocation(program,'aData');
    const targetPosition=gl.getAttribLocation(program,'aTargetPosition'),targetNormal=gl.getAttribLocation(program,'aTargetNormal'),targetData=gl.getAttribLocation(program,'aTargetData');
    const meshBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer(),cloudBuffer=gl.createBuffer(),targetBuffer=gl.createBuffer();
    uploadTarget=cloud=>{gl.bindBuffer(gl.ARRAY_BUFFER,targetBuffer);gl.bufferData(gl.ARRAY_BUFFER,cloud,gl.STATIC_DRAW);};
    uploadModel=()=>{
      gl.bindBuffer(gl.ARRAY_BUFFER,meshBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.mesh,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,model.indices,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER,cloudBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.cloud,gl.STATIC_DRAW);
      uploadTarget(model.cloud);
    };
    uploadModel();
    renderModel=()=>{
      gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
      const scale=Math.min(width,height)*zoom;
      gl.uniform2f(uniforms.uScale,scale/width,scale/height);gl.uniform2f(uniforms.uRotation,angle(),pitch);
      gl.uniform1f(uniforms.uDensity,density);gl.uniform1f(uniforms.uTime,time);gl.uniform1f(uniforms.uSelected,selected);
      gl.uniform1f(uniforms.uObject,selected);
      gl.uniform1f(uniforms.uPrevious,morph?morph.from:selected);gl.uniform1f(uniforms.uMorph,morph?morph.progress:1);
      gl.uniform2f(uniforms.uPointer,hover?hover.x*density:-1000,hover?(height-hover.y)*density:-1000);
      gl.uniform2f(uniforms.uResolution,canvas.width,canvas.height);
      gl.bindBuffer(gl.ARRAY_BUFFER,meshBuffer);gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(normal);
      gl.vertexAttribPointer(position,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);
      gl.disableVertexAttribArray(data);gl.vertexAttrib2f(data,0,0);
      [targetPosition,targetNormal,targetData].forEach(attribute=>gl.disableVertexAttribArray(attribute));
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.uniform1f(uniforms.uMode,0);
      gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
      if(!morph)gl.drawElements(gl.TRIANGLES,model.indices.length,gl.UNSIGNED_SHORT,0);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindBuffer(gl.ARRAY_BUFFER,cloudBuffer);gl.vertexAttribPointer(position,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,32,12);
      gl.enableVertexAttribArray(data);gl.vertexAttribPointer(data,2,gl.FLOAT,false,32,24);gl.uniform1f(uniforms.uMode,1);
      gl.bindBuffer(gl.ARRAY_BUFFER,targetBuffer);
      [targetPosition,targetNormal,targetData].forEach(attribute=>gl.enableVertexAttribArray(attribute));
      gl.vertexAttribPointer(targetPosition,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(targetNormal,3,gl.FLOAT,false,32,12);gl.vertexAttribPointer(targetData,2,gl.FLOAT,false,32,24);
      gl.drawArrays(gl.POINTS,0,model.cloud.length/8);
    };
  }
  function drawFallback(){
    if(!fallback||!model)return;
    fallback.clearRect(0,0,width,height);
    const cloud=[];
    for(let i=0;i<model.cloud.length;i+=32){
      const a=model.cloud;let position=movingValue(a,i,morph?morph.from:selected),normal=movingValue(a,i,morph?morph.from:selected,true);
      if(morph){const target=movingValue(morph.target,i,selected),targetNormal=movingValue(morph.target,i,selected,true);position=position.map((value,d)=>value+(target[d]-value)*morph.progress);normal=normal.map((value,d)=>value+(targetNormal[d]-value)*morph.progress);}
      const p=project({x:position[0],y:position[1],z:position[2]}),n=project({x:normal[0],y:normal[1],z:normal[2]});cloud.push({p,light:Math.max(.1,n.z),color:palette[Math.floor(a[i+7]*5)],radius:1+a[i+7]});
    }
    cloud.sort((a,b)=>a.p.z-b.p.z);
    cloud.forEach(({p,light,color,radius})=>{fallback.globalAlpha=.12+light*.85;fallback.fillStyle=color;fallback.beginPath();fallback.moveTo(p.x,p.y-radius);fallback.lineTo(p.x+radius*.8,p.y+radius*.7);fallback.lineTo(p.x-radius*.8,p.y+radius*.7);fallback.fill();});
    fallback.globalAlpha=1;
  }
  function draw() {
    if (!width || !height) return;
    ctx.clearRect(0,0,width,height);
    const halo=ctx.createRadialGradient(width/2,height/2,8,width/2,height/2,Math.min(width,height)*.48);
    halo.addColorStop(0,'#e89b4f16');halo.addColorStop(1,'#e89b4f00');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
    if(renderModel)renderModel();else drawFallback();
    ambient.forEach(point=>{const x=point.x*width,y=point.y*height+Math.sin(time*.3+point.phase)*5;ctx.globalAlpha=.13;ctx.strokeStyle=point.color;ctx.beginPath();ctx.moveTo(x,y-2);ctx.lineTo(x+1.5,y+1);ctx.lineTo(x-1.5,y+1);ctx.closePath();ctx.stroke();});
    ctx.globalAlpha=1;
    projectedTopics=[];
    projectedTopics.forEach((p,i)=>{
      const isSelected=i===selected;
      ctx.strokeStyle=isSelected?'#ef9c64':'#d8b89988';ctx.lineWidth=1;ctx.fillStyle='#211b16d9';
      ctx.beginPath();ctx.arc(p.x,p.y,isSelected?15:12,0,Math.PI*2);ctx.fill();ctx.stroke();
      if(isSelected){ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(p.x,p.y,20+Math.sin(time*2)*2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
      ctx.fillStyle=isSelected?'#ffd0a5':'#e6d0b8';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`0${i+1}`,p.x,p.y);
    });
  }
  function tick(now) {
    frame=0;
    if(!active||(!morph&&(paused||reduced.matches))||document.hidden) return;
    if(now-last>=33) {
      const delta=Math.min(.06,(now-last)/1000);last=now;if(!paused&&!reduced.matches)time+=delta;
      if(morph){
        const t=Math.min(1,(now-morph.start)/1600),progress=t*t*(3-2*t);morph.progress=progress;
        yaw=morph.yawStart+(morph.yawEnd-morph.yawStart)*progress;pitch=morph.pitchStart+(morph.pitchEnd-morph.pitchStart)*progress;
        canvas.dataset.morphProgress=progress.toFixed(2);
        if(t===1){model=models[morph.to];morph=null;if(uploadModel)uploadModel();canvas.dataset.morphing='false';}
      }
      draw();
    }
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);frame=0;last=performance.now();draw();
    if(active&&(morph||!paused&&!reduced.matches)&&!document.hidden) frame=requestAnimationFrame(tick);
  }
  function size() {
    const rect=canvas.getBoundingClientRect();density=Math.min(devicePixelRatio||1,1.5);
    width=rect.width;height=rect.height;canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
    overlay.width=canvas.width;overlay.height=canvas.height;overlay.style.width=`${width}px`;overlay.style.height=`${height}px`;overlay.style.top=`${canvas.offsetTop}px`;
    if(fallback)fallback.setTransform(density,0,0,density,0,0);
    ctx.setTransform(density,0,0,density,0,0);draw();
  }
  function choose(index) {
    if(!models[index])return;
    if(index===selected)return;
    let previous=selected;
    let source=model.cloud;
    if(morph){
      source=new Float32Array(source.length);
      for(let i=0;i<source.length;i+=8){
        const start=movingValue(morph.source,i,morph.from),end=movingValue(morph.target,i,morph.to),startNormal=movingValue(morph.source,i,morph.from,true),endNormal=movingValue(morph.target,i,morph.to,true);
        const p=start.map((value,d)=>value+(end[d]-value)*morph.progress),n=startNormal.map((value,d)=>value+(endNormal[d]-value)*morph.progress);
        source.set([...p,...n,morph.source[i+6]+(morph.target[i+6]-morph.source[i+6])*morph.progress,morph.source[i+7]],i);
      }
      previous=-1;
    }
    selected=index;
    root.querySelectorAll('[data-brain-topic]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.brainTopic)===index)));
    root.querySelector('.v-brain-detail strong').textContent=topics[index].title;
    root.querySelector('.v-brain-detail p').textContent=topics[index].text;
    canvas.dataset.object=['lamp','brain','planet'][index];
    canvas.setAttribute('aria-label',`${['Lâmpada','Cérebro','Planeta com órbitas'][index]} 3D interativo. Arraste ou use as setas para girar. Use mais e menos para aproximar ou afastar.`);
    root.querySelector('.v-brain-credit').hidden=index!==1;
    const yawEnd=index===1?initialYaw:index===0?.12:.38,pitchEnd=index===2?.16:initialPitch;
    if(reduced.matches){morph=null;model=models[index];yaw=yawEnd;pitch=pitchEnd;if(uploadModel)uploadModel();canvas.dataset.morphing='false';}
    else{
      model={...model,cloud:source};if(uploadModel)uploadModel();if(uploadTarget)uploadTarget(models[index].cloud);
      morph={source,target:models[index].cloud,from:previous,to:index,progress:0,start:performance.now(),yawStart:yaw,yawEnd,pitchStart:pitch,pitchEnd};
      canvas.dataset.morphing='true';canvas.dataset.morphProgress='0';
    }
    sync();
  }
  root.querySelectorAll('[data-brain-topic]').forEach(button=>button.addEventListener('click',()=>choose(Number(button.dataset.brainTopic))));
  const pause=root.querySelector('[data-brain-action=pause]');
  root.querySelectorAll('[data-brain-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.brainAction;
    if(action==='zoom-in') zoom=Math.min(1.28,zoom+.1);
    if(action==='zoom-out') zoom=Math.max(.7,zoom-.1);
    if(action==='reset'){yaw=selected===1?initialYaw:selected===0?.12:.38;pitch=selected===2?.16:initialPitch;zoom=1;time=0;}
    if(action==='pause'){paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Reproduzir animação 3D':'Pausar animação 3D');pause.textContent=paused?'▶':'Ⅱ';}
    sync();
  }));
  const finish=event=>{
    if(!drag || event.pointerId!==drag.id) return;
    if(!drag.moved && event.type==='pointerup') {
      const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
      const target=projectedTopics.findIndex(p=>Math.hypot(p.x-x,p.y-y)<24);
      if(target>=0) choose(target);
    }
    drag=null;canvas.classList.remove('v-dragging');
  };
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0 || !event.isPrimary) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
    canvas.setPointerCapture(event.pointerId);canvas.classList.add('v-dragging');
  });
  canvas.addEventListener('pointermove',event=>{
    if(!drag){if(event.pointerType==='mouse' && !reduced.matches){const rect=canvas.getBoundingClientRect();hover={x:event.clientX-rect.left,y:event.clientY-rect.top};if(paused)draw();}return;}
    if(event.pointerId!==drag.id) return;
    if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>5) drag.moved=true;
    yaw+=(event.clientX-drag.x)*.008;pitch=Math.max(-1.2,Math.min(1.2,pitch+(event.clientY-drag.y)*.006));
    drag.x=event.clientX;drag.y=event.clientY;draw();
  },{passive:true});
  canvas.addEventListener('pointerleave',()=>{hover=null;if(paused)draw();});
  canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);canvas.addEventListener('lostpointercapture',finish);
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','-','='].includes(event.key)) return;
    event.preventDefault();
    if(event.key==='ArrowLeft') yaw-=.16;if(event.key==='ArrowRight') yaw+=.16;
    if(event.key==='ArrowUp') pitch=Math.max(-1.2,pitch-.12);if(event.key==='ArrowDown') pitch=Math.min(1.2,pitch+.12);
    if(event.key==='Home'){yaw=selected===1?initialYaw:selected===0?.12:.38;pitch=selected===2?.16:initialPitch;zoom=1;time=0;}
    if(event.key==='+'||event.key==='=') zoom=Math.min(1.28,zoom+.1);if(event.key==='-') zoom=Math.max(.7,zoom-.1);draw();
  });
  new ResizeObserver(size).observe(canvas);
  new IntersectionObserver(entries=>{active=entries[0].isIntersecting;sync();},{threshold:.1}).observe(canvas);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();active=false;cancelAnimationFrame(frame);});
  canvas.addEventListener('webglcontextrestored',()=>{createRenderer();active=true;sync();});
  fetch('/vistall-brain-anatomy.bin').then(response=>{if(!response.ok)throw new Error('Brain model unavailable');return response.arrayBuffer();}).then(buffer=>{
    const header=new Uint32Array(buffer,0,4),vertices=header[1],indices=header[2],points=header[3];
    let offset=16;
    const mesh=new Float32Array(buffer,offset,vertices*6);offset+=mesh.byteLength;
    const faces=new Uint16Array(buffer,offset,indices);offset+=faces.byteLength;
    // Indices can leave the following floats two-byte aligned; copy before interpreting.
    const cloud=new Float32Array(buffer.slice(offset,offset+points*32));
    models[1]={mesh,indices:faces,cloud:sortCloud(cloud)};canvas.dataset.brainReady='true';root.querySelector('[data-brain-topic="1"]').disabled=false;
  }).catch(()=>{canvas.dataset.brainReady='false';root.querySelector('[data-brain-topic="1"]').disabled=true;root.querySelector('.v-brain-hint').textContent='Design e Automação disponíveis. Recarregue para carregar o cérebro.';});
  root.querySelector('[data-brain-topic="1"]').disabled=true;
  root.querySelector('.v-brain-credit').hidden=true;
  canvas.dataset.object='lamp';yaw=.12;createRenderer();
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);size();
})();
