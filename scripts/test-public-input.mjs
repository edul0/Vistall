import assert from 'node:assert/strict';import ts from 'typescript';import {readFile} from 'node:fs/promises';
const source=ts.transpileModule(await readFile('lib/public-input.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {readPublicInput,publicError}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const req=(body,headers={})=>new Request('https://vistall.com.br/api/inquiries',{method:'POST',headers:{'content-type':'application/json',origin:'https://vistall.com.br',...headers},body});
assert.equal((await readPublicInput(req('{"email":"test@example.com"}'))).email,'test@example.com');
for(const [body,headers,status] of [['null',{},400],['[]',{},400],['{',{},400],['{"email":[]}',{},400],['{}',{origin:'https://evil.example'},403],['{}',{'content-type':'text/plain'},415],[JSON.stringify({notes:'x'.repeat(17000)}),{},413]]){await assert.rejects(()=>readPublicInput(req(body,headers)),e=>e.status===status);}
assert.equal(publicError(new Error('internal secret')).status,503);assert.ok(!(await publicError(new Error('internal secret')).text()).includes('internal secret'));
console.log('8 input validation cases and safe error response passed');
// Verify the generated edge guard before deploying (run prepare-worker-security first).
let wrapper=await readFile('dist/server/security-entry.mjs','utf8');
wrapper=wrapper.replace("import app from './index.js';","const app={fetch:async()=>new Response('ok')};").replace("import {readPublicInput,publicError} from './public-input.mjs';",`const {readPublicInput,publicError}=await import('data:text/javascript;base64,${Buffer.from(source).toString('base64')}');`);
const guard=(await import('data:text/javascript;base64,'+Buffer.from(wrapper).toString('base64'))).default;
const blocked=await guard.fetch(req('{"email":"test@example.com"}'),{FORM_EMAIL_RATE:{limit:async()=>({success:false})},FORM_IP_RATE:{limit:async()=>({success:true})}},{});
assert.equal(blocked.status,429);assert.equal(blocked.headers.get('Retry-After'),'60');
const allowed=await guard.fetch(req('{"email":"test@example.com"}'),{FORM_EMAIL_RATE:{limit:async()=>({success:true})},FORM_IP_RATE:{limit:async()=>({success:true})}},{});
assert.equal(allowed.status,200);assert.equal(allowed.headers.get('Cache-Control'),'no-store');
console.log('Edge guard: rate rejection and allowed response passed');