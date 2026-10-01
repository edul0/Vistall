import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "site/vistal-original.html");
const output = resolve(root, "vercel-dist");

let html = await readFile(source, "utf8");
if (!html.includes('<form class="space-y-space-lg" id="vistal-form"') || !html.includes("</body>")) {
  throw new Error("O design original mudou; confira a integração antes de publicar.");
}

html = html.replace("<head>", `<head>
<title>Vistal | Sites, revisões e sistemas web</title>
<meta name="description" content="Estúdio independente para revisão de sites, criação de páginas e sistemas web sob medida. Atendimento remoto no Brasil." />
<meta name="google-site-verification" content="NzbgppRpooF1QSAHP1jVhn_8Oaoev9mSboFGny4C5Wk" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="canonical" href="https://vistal.vercel.app/" />
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
  if (!html.includes(before)) throw new Error(`Trecho esperado não encontrado: ${before}`);
  html = html.replace(before, after);
}

html = html.replace("</body>", `<div class="max-w-7xl mx-auto px-margin md:px-margin-desktop pb-8 text-on-surface-variant font-body-md text-sm leading-relaxed" id="vistal-disclosure">A Vistal é um estúdio independente operado por uma pessoa. Ferramentas de IA podem apoiar o trabalho, com revisão humana. A revisão custa R$ 250 por uma página e até três ajustes combinados; sites e sistemas recebem proposta separada. Não há garantia de vendas ou posição no Google. No Mercado Pago, o vendedor aparece como NL STORE.</div>
<script src="/vistal-integration.js" defer></script>
</body>`);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "public"), output, { recursive: true });
await writeFile(resolve(output, "index.html"), html, "utf8");
console.log("Vistal preparada para publicação estática na Vercel.");
