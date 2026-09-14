"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const paymentUrl = "https://mpago.la/26Q1m2a";

function Brand() {
  return <span className="brand"><Image src="/nl-symbol.svg" width={44} height={44} alt="" /><span className="brand-name"><strong>NL</strong><span>SITES</span></span></span>;
}

export default function Home() {
  const [checked, setChecked] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

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

  return <main id="inicio">
    <header className="site-header shell">
      <a href="#inicio" aria-label="NL Sites, início"><Brand /></a>
      <a className="header-link" href="#pedido">Solicitar revisão <span aria-hidden="true">↗</span></a>
    </header>

    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="edition"><span className="edition-dot" /> SERVIÇO REMOTO · BRASIL</div>
        <h1 id="hero-title">Seu site pode <em>explicar melhor</em> o que você vende.</h1>
        <p>Revisamos a página inicial do seu negócio e executamos até três ajustes combinados. Um serviço direto, com escopo claro e preço fechado.</p>
        <a className="text-link" href="#processo">Veja o que está incluído <span aria-hidden="true">↗</span></a>
      </div>
      <div className="hero-graphic" aria-hidden="true">
        <div className="graphic-top"><span>NL / ANÁLISE DE PÁGINA</span><span>01 — 03</span></div>
        <div className="browser-frame">
          <div className="browser-bar"><i /><i /><i /><span>seunegocio.com.br</span></div>
          <div className="browser-content"><div className="mock-line short"/><div className="mock-line wide"/><div className="mock-line medium"/><div className="mock-block"/><span className="pointer pointer-one">01 <b>Título</b></span><span className="pointer pointer-two">02 <b>Contato</b></span><span className="pointer pointer-three">03 <b>Celular</b></span></div>
        </div>
        <div className="graphic-bottom"><span>REVISÃO + CORREÇÕES</span><strong>R$ 250</strong></div>
      </div>
    </section>

    <section className="offer-band"><div className="shell offer-inner"><span>UMA PÁGINA</span><span>ATÉ TRÊS AJUSTES</span><span>RESUMO DO QUE MUDOU</span><strong>R$ 250</strong></div></section>

    <section className="process shell" id="processo">
      <div className="section-heading"><span className="index">01 / SERVIÇO</span><h2>O que fazemos</h2><p>Você envia o endereço da página. Conferimos conteúdo, apresentação no celular e caminho até o contato. Depois alinhamos os pontos que podem ser corrigidos.</p></div>
      <div className="steps"><article><span>01</span><h3>Revisão da página</h3><p>Identificamos problemas visíveis na página inicial e priorizamos o que faz sentido para o seu negócio.</p></article><article><span>02</span><h3>Escopo combinado</h3><p>Confirmamos até três ajustes antes de começar. A execução depende do acesso necessário ao site.</p></article><article><span>03</span><h3>Entrega registrada</h3><p>Aplicamos os ajustes aprovados e enviamos um resumo simples do que foi alterado.</p></article></div>
    </section>

    <section className="proof-section"><div className="shell proof-grid"><div className="proof-copy"><span className="index">UM EXEMPLO REALISTA</span><h2>Veja o tipo de revisão que você recebe.</h2><p>O relatório aponta o problema, explica por que ele importa e sugere uma correção objetiva. Este é um exemplo demonstrativo, não um trabalho atribuído a um cliente.</p></div><div className="sample-report"><div className="sample-top"><Brand /><span>AMOSTRA / 01</span></div><div className="sample-title"><span>REVISÃO DA PÁGINA INICIAL</span><h3>O contato está difícil de encontrar.</h3></div><div className="sample-row"><span>O QUE VIMOS</span><p>O botão de contato aparece apenas no fim da página. No celular, exige várias rolagens.</p></div><div className="sample-row"><span>AJUSTE SUGERIDO</span><p>Adicionar uma chamada para contato perto da apresentação do serviço e conferir a leitura no celular.</p></div><div className="sample-foot"><span>EXEMPLO DEMONSTRATIVO</span><span>NL / SITES</span></div></div></div></section>

    <section className="request-section" id="pedido"><div className="shell request-grid"><div className="request-copy"><span className="index">02 / PEDIDO</span><h2>Conte sobre o seu site.</h2><p>Preencha os dados para começarmos a avaliação. Após enviar, você recebe o link de pagamento seguro pelo Mercado Pago.</p><div className="price-note"><span>REVISÃO + ATÉ 3 AJUSTES</span><strong>R$ 250</strong></div></div>
      <div className="form-card">
        {state === "sent" ? <div className="success" role="status"><span className="success-icon">✓</span><h3>Pedido recebido.</h3><p>Para confirmar a contratação, conclua o pagamento de R$ 250 no Mercado Pago. No checkout, o vendedor aparece como <strong>NL STORE</strong>.</p><Button asChild className="main-button"><a href={paymentUrl} target="_blank" rel="noopener noreferrer">Ir para o pagamento <span aria-hidden="true">↗</span></a></Button><p className="fine">A execução depende da confirmação do pagamento, do escopo e do acesso necessário. Se não pudermos realizar o pedido nesse escopo, combinaremos o estorno.</p></div> : <><div className="form-heading"><span>FORMULÁRIO DE SOLICITAÇÃO</span><h3>Solicitar revisão</h3></div><form onSubmit={submit}><label htmlFor="business">Nome do negócio</label><Input id="business" name="business" required maxLength={100} autoComplete="organization" placeholder="Ex.: Café da Praça" /><label htmlFor="website">Endereço do site</label><Input id="website" name="website" required type="url" maxLength={300} placeholder="https://seusite.com.br" /><label htmlFor="email">E-mail para retorno</label><Input id="email" name="email" required type="email" maxLength={200} autoComplete="email" placeholder="voce@empresa.com.br" /><div className="trap" aria-hidden="true"><label htmlFor="extra">Deixe em branco</label><Input id="extra" name="extra" tabIndex={-1} autoComplete="off" /></div><label className="agree" htmlFor="agree"><Checkbox id="agree" checked={checked} onCheckedChange={(value) => setChecked(value === true)} /><span>Entendi que o diagnóstico inicial usa uma checagem automática e que os ajustes serão confirmados antes da execução.</span></label>{error && <p className="error" role="alert">{error}</p>}<Button type="submit" disabled={!checked || state === "sending"} className="main-button">{state === "sending" ? "Enviando…" : "Enviar solicitação"} <span aria-hidden="true">↗</span></Button></form></>}
      </div></div></section>

    <footer className="site-footer shell"><Brand /><div><p>Atendimento remoto no Brasil. Pagamentos processados pelo Mercado Pago sob o nome NL STORE. Resultados em buscas ou vendas não são garantidos.</p><p>Dados enviados são usados para avaliar e atender o pedido. Você pode solicitar informações sobre seus dados respondendo ao nosso contato.</p></div><a href="#inicio">Voltar ao topo ↑</a></footer>
  </main>;
}
