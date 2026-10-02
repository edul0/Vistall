import assert from 'node:assert/strict';import ts from 'typescript';import {readFile} from 'node:fs/promises';
const source=ts.transpileModule(await readFile('lib/public-input.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {readPublicInput,publicError}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const req=(body,headers={})=>new Request('https://vistall.com.br/api/inquiries',{method:'POST',headers:{'content-type':'application/json',origin:'https://vistall.com.br',...headers},body});
assert.equal((await readPublicInput(req('{"email":"test@example.com"}'))).email,'test@example.com');
for(const [body,headers,status] of [['null',{},400],['[]',{},400],['{',{},400],['{"email":[]}',{},400],['{}',{origin:'https://evil.example'},403],['{}',{'content-type':'text/plain'},415],[JSON.stringify({notes:'x'.repeat(17000)}),{},413]]){await assert.rejects(()=>readPublicInput(req(body,headers)),e=>e.status===status);}
assert.equal(publicError(new Error('internal secret')).status,503);assert.ok(!(await publicError(new Error('internal secret')).text()).includes('internal secret'));
console.log('8 input validation cases and safe error response passed');