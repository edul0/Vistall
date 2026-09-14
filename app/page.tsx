"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, ArrowDown, Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const paymentUrl = "https://mpago.la/26Q1m2a";

function Brand({ large = false }: { large?: boolean }) {
  return <span className={large ? "identity identity-large" : "identity"} aria-label="NL Sites">
    <svg viewBox="0 0 103 64" fill="currentColor" aria-hidden="true">
      <path d="M4 58V9h12l25 29V9h13v49H42L17 29v29H4Z" />
      <path d="M63 9h13v36h24v13H63V9Z" />
    </svg>
    {!large && <span className="identity-word">sites<span className="identity-point">.</span></span>}
  </span>;
}

export default function Home() {
  const [checked, setChecked] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [demo, setDemo] = useState("after");
  const [openStep, setOpenStep] = useState<number | null>(0);
  const improved = demo === "after";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checked || state === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          business: String(data.get("business") || ""),
          website: String(data.get("website") || ""),
          email: String(data.get("email") || ""),
          extra: String(data.get("extra") || ""),
        }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error || "Não conseguimos receber o pedido agora.");
      }
      form.reset();
      setChecked(false);
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tente novamente em alguns minutos.");
      setState("error");
    }
  }

  const steps = [
    { title: "Um olhar atento.", text: "Revisamos a página inicial: mensagem, leitura no celular e caminho até o contato. A checagem automática ajuda a encontrar os pontos que precisam ser conferidos." },
    { title: "Três ajustes bem escolhidos.", text: "Combinamos até três correções possíveis na sua página. Você aprova o escopo e fornece o acesso necessário antes de qualquer alteração." },
    { title: "Você vê o que mudou.", text: "Aplicamos os ajustes aprovados e entregamos um resumo das alterações. O foco é melhorar a página que você já tem." },
  ];

  return <main id="inicio">
    <header className="masthead container-width">
      <a className="home-link" href="#inicio" aria-label="NL Sites, início"><Brand /></a>
      <nav aria-label="Navegação principal">
        <a href="#demonstracao">O olhar da NL</a>
        <a href="#servico">O serviço</a>
        <a href="/guia">Guia prático</a>
      </nav>
      <a className="nav-cta" href="#pedido">Vamos conversar <ArrowUpRight size={17} aria-hidden="true" /></a>
    </header>

    <section className="opening container-width" aria-labelledby="main-title">
      <div className="opening-caption"><span>REVISÃO & AJUSTES DE SITES</span><span>INDEPENDENTE. DIGITAL. BRASIL.</span></div>
      <h1 id="main-title">Pequenos ajustes.<br /><span>Outra <em>impressão.</em></span><span className="title-dot" aria-hidden="true">✳</span></h1>
      <div className="opening-bottom">
        <a href="#demonstracao" className="scroll-link"><span className="scroll-icon"><ArrowDown size={20} aria-hidden="true" /></span>É nos detalhes que<br />a diferença aparece.</a>
        <div className="opening-description"><p>Seu negócio já tem um site.<br />A NL cuida do que pode ficar melhor.</p><a href="#pedido" className="action-link">Revisar meu site <ArrowUpRight size={20} aria-hidden="true" /></a></div>
        <div className="opening-price"><span>UMA PÁGINA. ATÉ 3 AJUSTES.</span><strong>R$ 250<span> / serviço</span></strong></div>
      </div>
    </section>

    <section className="work-section" id="demonstracao">
      <div className="container-width">
        <div className="section-top"><span className="eyebrow">01 — O OLHAR DA NL</span><span className="work-disclaimer">Demonstração, não projeto de cliente.</span></div>
        <div className="work-heading"><h2>Menos ruído.<br /><em>Mais clareza.</em></h2><p>Um título que explica. Um texto que dá para ler.<br className="desktop-break" /> Um caminho fácil até o contato.</p></div>
        <div className="case-shell">
          <div className="case-toolbar"><span className="case-name"><span className="case-mini-mark">f.</span>Forma Contábil <span className="case-fiction">/ marca fictícia</span></span><ToggleGroup type="single" value={demo} onValueChange={(value) => { if (value) setDemo(value); }} aria-label="Comparar a demonstração" className="comparison-tabs"><ToggleGroupItem value="before">Original</ToggleGroupItem><ToggleGroupItem value="after">Com ajustes</ToggleGroupItem></ToggleGroup></div>
          <div className={improved ? "demo-page is-improved" : "demo-page"} aria-live="polite">
            <div className="demo-nav"><span className="demo-logo">forma<span>®</span></span><span>CONTABILIDADE CONSULTIVA</span><span className="demo-menu" aria-hidden="true">MENU <Plus size={14} /></span></div>
            <div className="demo-body">
              <div className="demo-copy"><span className="demo-kicker">PARA QUEM EMPREENDE</span><h3>Sua empresa cresce. <br />A gente cuida <br /><em>dos números.</em></h3><p>Contabilidade para pequenas empresas. Organize seus impostos e entenda os números do seu negócio.</p><span className={improved ? "demo-contact" : "demo-contact demo-contact-muted"}>Converse com um contador<ArrowUpRight size={17} aria-hidden="true" /></span></div>
              <div className="demo-side"><span className="demo-side-label">UM NEGÓCIO.<br />NOVAS POSSIBILIDADES.</span><span className="demo-letter" aria-hidden="true">f<span>.</span></span><span className="demo-side-bottom">FORMA CONTÁBIL<br />CLAREZA PARA DECIDIR.</span></div>
            </div>
            <div className="demo-bottom"><span>CONTABILIDADE · PLANEJAMENTO · GESTÃO</span><span>EXEMPLO ILUSTRATIVO</span></div>
          </div>
        </div>
        <div className="case-notes" aria-live="polite"><div><span>01</span><p><strong>Hierarquia visual</strong>{improved ? "Título em destaque e composição organizada em duas áreas." : "Título pequeno, centralizado e sem destaque sobre o restante."}</p></div><div><span>02</span><p><strong>Leitura</strong>{improved ? "Texto maior, mais contraste e espaço entre os elementos." : "Texto miúdo e pouco espaço para separar as informações."}</p></div><div><span>03</span><p><strong>Contato</strong>{improved ? "Botão com área maior e contraste para orientar o próximo passo." : "Link discreto, com pouca diferenciação do texto."}</p></div></div>
        <p className="comparison-caption">O texto é o mesmo nas duas versões. Compare a apresentação, a leitura e o destaque do contato. Exemplo demonstrativo; os ajustes de cada site são combinados após a revisão.</p>
      </div>
    </section>

    <section className="service-section container-width" id="servico">
      <div className="service-intro"><span className="eyebrow">02 — O SERVIÇO</span><h2>Não precisa<br />começar <br /><em>do zero.</em></h2><p>A NL Sites é um serviço independente de revisão e ajustes para pequenos negócios. Um olhar de fora para melhorar o que você já colocou no ar.</p></div>
      <div className="service-right"><div className="scope-line"><span>O QUE ESTÁ INCLUÍDO</span><span>01 PÁGINA / 03 AJUSTES</span></div><div className="service-steps">{steps.map((step, index) => <article className={openStep === index ? "service-step is-open" : "service-step"} key={step.title}><h3><button type="button" aria-expanded={openStep === index} aria-controls={"step-" + index} onClick={() => setOpenStep(openStep === index ? null : index)}><span className="step-number">0{index + 1}</span><span>{step.title}</span>{openStep === index ? <Minus size={20} /> : <Plus size={20} />}</button></h3><div id={"step-" + index} hidden={openStep !== index}><p>{step.text}</p></div></article>)}</div><div className="scope-note"><Check size={18} aria-hidden="true" /><p>Escopo combinado antes da execução.<br />Sem mensalidade. Sem pacote de serviços escondido.</p></div></div>
    </section>

    <section className="request-section" id="pedido"><div className="container-width request-grid">
      <div className="request-copy"><span className="eyebrow">03 — SEU SITE, AGORA</span><h2>Vamos olhar<br /><em>de perto?</em></h2><p>Envie o endereço do seu site e um e-mail de contato para iniciar o pedido.</p><div className="price-block"><strong>R$ 250</strong><span>Revisão da página inicial<br />+ até três ajustes combinados</span></div><p className="request-note">Após o envio, você recebe o link do Mercado Pago para confirmar a contratação.</p></div>
      <div className="request-form">{state === "sent" ? <div className="success" role="status"><span className="success-check"><Check size={25} /></span><h3>Recebemos seu pedido.</h3><p>Conclua o pagamento de R$ 250 pelo Mercado Pago para confirmar a contratação. O vendedor aparece como <strong>NL STORE</strong>.</p><Button asChild className="submit-button"><a href={paymentUrl} target="_blank" rel="noopener noreferrer">Ir para o pagamento <ArrowUpRight size={19} /></a></Button><p className="form-note">A execução depende do pagamento, do escopo e do acesso necessário. Se não pudermos realizar o pedido nesse escopo, combinaremos o estorno.</p></div> : <form onSubmit={submit}><div className="form-row"><label htmlFor="business"><span>01</span> Nome do negócio</label><Input id="business" name="business" required maxLength={100} autoComplete="organization" placeholder="Como sua empresa se chama?" /></div><div className="form-row"><label htmlFor="website"><span>02</span> Endereço do site</label><Input id="website" name="website" required type="url" maxLength={300} placeholder="https://seusite.com.br" /></div><div className="form-row"><label htmlFor="email"><span>03</span> Seu e-mail</label><Input id="email" name="email" required type="email" maxLength={200} autoComplete="email" placeholder="voce@empresa.com.br" /></div><div className="trap" aria-hidden="true"><label htmlFor="extra">Deixe em branco</label><Input id="extra" name="extra" tabIndex={-1} autoComplete="off" /></div><label className="agree" htmlFor="agree"><Checkbox id="agree" checked={checked} onCheckedChange={(value) => setChecked(value === true)} /><span>Entendi que a revisão começa com uma checagem automática e que os ajustes serão confirmados antes da execução.</span></label>{error && <p className="error" role="alert">{error}</p>}<Button type="submit" disabled={!checked || state === "sending"} className="submit-button">{state === "sending" ? "Enviando…" : "Enviar meu site"}<ArrowUpRight size={20} aria-hidden="true" /></Button><p className="form-note">Seus dados serão usados para avaliar e atender este pedido.</p></form>}</div>
    </div></section>

    <footer className="footer container-width"><div className="footer-top"><a href="#inicio" aria-label="NL Sites, início"><Brand /></a><p>Um olhar atento.<br />Uma presença melhor.</p><a className="back-top" href="#inicio">De volta ao início <ArrowUpRight size={18} /></a></div><div className="footer-bottom"><span>NL SITES © 2026</span><p><a href="/guia">Guia prático para sua página inicial</a> · Atendimento remoto no Brasil. Pagamento via Mercado Pago, sob o nome NL STORE. Não há garantia de resultados em vendas ou buscas. Para tratar dos seus dados, responda ao contato sobre o pedido.</p></div></footer>
  </main>;
}
