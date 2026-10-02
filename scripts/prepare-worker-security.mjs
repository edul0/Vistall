import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
const helper=ts.transpileModule(await readFile('lib/public-input.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
await writeFile('dist/server/public-input.mjs',helper);
await writeFile('dist/server/security-entry.mjs',`import app from './index.js';
import {readPublicInput,publicError} from './public-input.mjs';
export default {async fetch(request,env,ctx){
 const path=new URL(request.url).pathname;
 if(path==='/api/inquiries'||path==='/api/requests'){
  if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST','Cache-Control':'no-store'}});
  try{const data=await readPublicInput(request.clone());
   const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
   const ip=request.headers.get('cf-connecting-ip')||'unknown';
   const [byEmail,byIp]=await Promise.all([env.FORM_EMAIL_RATE.limit({key:email}),env.FORM_IP_RATE.limit({key:ip})]);
   if(!byEmail.success||!byIp.success)return Response.json({error:'Muitas tentativas. Aguarde um minuto antes de tentar novamente.'},{status:429,headers:{'Retry-After':'60','Cache-Control':'no-store'}});
  }catch(error){return publicError(error);}
 }
 const response=await app.fetch(request,env,ctx);
 if(path.startsWith('/api/')){const secured=new Response(response.body,response);secured.headers.set('Cache-Control','no-store');secured.headers.set('X-Content-Type-Options','nosniff');return secured;}
 return response;
}};`);
const config=JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
config.name='vistall';config.main='security-entry.mjs';config.keep_vars=true;
config.d1_databases=[{binding:'DB',database_name:'nl-sites-pedidos',database_id:'656b3b2e-0721-403d-a404-eec3f0e9b2c5'}];
config.ratelimits=[{name:'FORM_EMAIL_RATE',namespace_id:'26100201',simple:{limit:6,period:60}},{name:'FORM_IP_RATE',namespace_id:'26100202',simple:{limit:40,period:60}}];
await writeFile('dist/server/wrangler-security.json',JSON.stringify(config,null,2));