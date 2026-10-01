import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "site/vistall-original.html");
const output = resolve(root, "dist/server");
let html = await readFile(source, "utf8");

if (!html.includes('<form class="space-y-space-lg" id="vistall-form"') || !html.includes("</body>")) {
  throw new Error("O design original mudou; confira a integração antes de publicar.");
}

html = html.replace("<head>", `<head>
<title>Vistall | Sites, revisões e sistemas web</title>
<meta name="description" content="Estúdio independente para revisão de sites, criação de páginas e sistemas web sob medida. Atendimento remoto no Brasil." />
<meta name="google-site-verification" content="NzbgppRpooF1QSAHP1jVhn_8Oaoev9mSboFGny4C5Wk" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="canonical" href="https://vistall.com.br/" />
<noscript><style>#splash-overlay{display:none!important}</style></noscript>`);

const copyEdits = [
  ["Do ajuste cirúrgico que destrava conversões à arquitetura completa de aplicações web.", "Do ajuste pontual de uma página à criação de aplicações web para necessidades concretas."],
  ["Landing pages de alta conversão,", "Landing pages,"],
  ["Interfaces limpas, ultrarrápidas, desenhadas especificamente para o seu negócio.", "Interfaces claras e responsivas, desenhadas para o seu negócio."],
  ["Sem as mensalidades abusivas e o excesso de complexidade de softwares genéricos.", "Com escopo e condições combinados antes de começar."],
  ["Propriedade total do software construído", "Entrega e direitos definidos na proposta"],
  ["Garantia de foco cirúrgico", "Foco no escopo combinado"],
  ["Trabalhamos apenas no que move o ponteiro: legibilidade, posicionamento e taxa de conversão. Sem refações desnecessárias ou promessas vazias.", "O foco está na leitura, na apresentação e no caminho até o contato, conforme o escopo aprovado. Não há promessa de vendas ou de posições em busca."],
  ["Recebido com sucesso! Vamos examinar seu projeto e responder em até 24 horas úteis com os próximos passos.", "O envio será confirmado aqui quando o pedido for registrado."],
];
for (const [before, after] of copyEdits) {
  if (html.includes(before)) html = html.replace(before, after);
}

html = html.replace("</footer>", `<div class="max-w-7xl mx-auto px-margin md:px-margin-desktop pb-space-xl text-on-surface-variant font-body-md text-sm leading-relaxed" id="vistall-disclosure"><div class="border-t border-outline-variant/30 pt-space-md">A Vistall é um estúdio independente conduzido por uma pessoa, com apoio de ferramentas de IA e revisão humana. A revisão custa R$ 250 e cobre uma página com até três ajustes previamente combinados. Sites e sistemas recebem proposta própria. Resultados de vendas, conversão e posição no Google não são garantidos. No checkout do Mercado Pago, o vendedor é identificado como NL STORE.</div></div></footer>`);
html = html.replace("</body>", `<script src="/vistall-integration.js" defer></script>
</body>`);

const moduleText = `export const html = ${JSON.stringify(html)};\n`;
await writeFile(resolve(output, "vistall-page.js"), moduleText, "utf8");
await writeFile(resolve(output, "vistall-entry.js"), `import vinext from "./index.js";
import { html } from "./vistall-page.js";

export default {
  ...vinext,
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" && (request.method === "GET" || request.method === "HEAD")) {
      return new Response(request.method === "HEAD" ? null : html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-cache",
          "x-content-type-options": "nosniff",
          "referrer-policy": "strict-origin-when-cross-origin",
        },
      });
    }
    return vinext.fetch(request, env, ctx);
  },
};
`, "utf8");

const configPath = resolve(output, "wrangler.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
config.name = "vistall";
config.topLevelName = "vistall";
config.main = "vistall-entry.js";
config.d1_databases = [{ binding: "DB", database_name: "nl-sites-pedidos", database_id: "656b3b2e-0721-403d-a404-eec3f0e9b2c5" }];
await writeFile(configPath, JSON.stringify(config), "utf8");
console.log("Design original integrado à publicação.");
