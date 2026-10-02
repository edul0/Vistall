import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(new URL('../tools/static-build/package.json', import.meta.url));
const { parse } = require('parse5');
for (const file of ['index.html', 'sobre.html']) {
  const html = await readFile(`vercel-dist/${file}`, 'utf8');
  assert.ok(!html.includes('cdn.tailwindcss.com'));
  const visit = node => {
    for (const attr of node.attrs || []) assert.ok(!/^on[a-z]+$/.test(attr.name), 'Inline event forbidden');
    if (node.tagName === 'script') {
      const src = node.attrs.find(a => a.name === 'src');
      assert.ok(src?.value.startsWith('/'), 'Only local external scripts allowed');
      assert.equal(node.childNodes?.length, 0);
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parse(html));
}
for (const file of await readdir('vercel-dist')) {
  if (file.endsWith('.js')) new vm.Script(await readFile(`vercel-dist/${file}`, 'utf8'), {filename:file});
}
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const policy = config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
const scripts = policy.split(';').find(d => d.trim().startsWith('script-src '));
assert.equal(scripts.trim(), "script-src 'self'");
assert.ok(policy.includes("script-src-attr 'none'"));
console.log('Static security checks passed: local scripts, no inline handlers, strict script policy, valid JavaScript.');
