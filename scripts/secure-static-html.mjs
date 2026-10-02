import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(new URL('../tools/static-build/package.json', import.meta.url));
const { parse, serialize } = require('parse5');
const postcss = require('postcss');
const tailwind = require('tailwindcss');

export async function secureStaticHtml(html, output, page) {
  const configMatch = html.match(/<script id="tailwind-config">([\s\S]*?)<\/script>/);
  if (!configMatch) throw new Error(`Missing Tailwind configuration: ${page}`);
  // This configuration is trusted repository code, evaluated only during the build.
  const sandbox = { tailwind: {} };
  runInNewContext(configMatch[1], sandbox, { timeout: 1000 });
  const config = sandbox.tailwind.config;
  config.content = [{ raw: html, extension: 'html' }];
  config.plugins = [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')];
  const css = await postcss([tailwind(config)]).process('@tailwind base;@tailwind components;@tailwind utilities;', { from: undefined });
  const cssName = `${page}-${createHash('sha256').update(css.css).digest('hex').slice(0,16)}.css`;
  await writeFile(resolve(output, cssName), css.css);
  html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com[^\"]*"><\/script>/, `<link rel="stylesheet" href="/${cssName}">`).replace(configMatch[0], '');
  const doc = parse(html);
  let counter = 0;
  const handlers = [];
  const pending = [];
  let body;
  const saveScript = (code) => {
    const name = `${page}-${createHash('sha256').update(code).digest('hex').slice(0,16)}.js`;
    pending.push(writeFile(resolve(output, name), code));
    return name;
  };
  const walk = (node) => {
    if (node.tagName === 'body') body = node;
    if (node.attrs) {
      for (const attr of [...node.attrs]) {
        if (/^on[a-z]+$/.test(attr.name)) {
          const id = counter++;
          node.attrs = node.attrs.filter(a => a !== attr);
          node.attrs.push({name:`data-vistall-event-${id}`, value:''});
          handlers.push(`document.querySelector('[data-vistall-event-${id}]').addEventListener(${JSON.stringify(attr.name.slice(2))},function(event){const result=(function(event){${attr.value}\n}).call(this,event);if(result===false)event.preventDefault();});`);
        }
        if ((attr.name === 'href' || attr.name === 'src') && /^\s*javascript:/i.test(attr.value)) throw new Error('JavaScript URL forbidden');
      }
    }
    if (node.tagName === 'script') {
      const src = node.attrs.find(a => a.name === 'src');
      const type = node.attrs.find(a => a.name === 'type')?.value;
      if (src && !src.value.startsWith('/')) throw new Error(`External script forbidden: ${src.value}`);
      if (!src && (!type || type === 'text/javascript' || type === 'module')) {
        const code = (node.childNodes || []).map(n => n.value || '').join('');
        node.attrs.push({name:'src', value:`/${saveScript(code)}`});
        node.childNodes = [];
      }
    }
    for (const child of node.childNodes || []) walk(child);
    if (node.content) walk(node.content);
  };
  walk(doc);
  if (handlers.length) {
    const name = saveScript(`(()=>{const bind=()=>{${handlers.join('\n')}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();})();`);
    const node = {nodeName:'script', tagName:'script', namespaceURI:'http://www.w3.org/1999/xhtml', attrs:[{name:'src',value:`/${name}`},{name:'defer',value:''}], childNodes:[],parentNode:body};
    body.childNodes.push(node);
  }
  await Promise.all(pending);
  return serialize(doc);
}
