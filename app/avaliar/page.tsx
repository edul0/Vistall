"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowLeft, RotateCcw } from "lucide-react";

type Answer = "yes" | "no" | "unsure";

const questions = [
  { title: "A primeira tela diz claramente o que seu negócio oferece?", detail: "Imagine alguém que nunca ouviu falar da empresa abrindo o site no celular.", tip: "Apresente o serviço, o público ou a região atendida logo no começo, em uma frase direta." },
  { title: "O texto principal é confortável de ler no celular?", detail: "Confira tamanho da fonte, contraste e espaço entre os blocos.", tip: "Aumente a legibilidade do texto essencial e evite colocá-lo sobre imagens que dificultem a leitura." },
  { title: "O caminho para contato aparece sem procurar muito?", detail: "Pode ser um botão, telefone, WhatsApp ou formulário curto.", tip: "Aproxime a chamada de contato da explicação do serviço e dê a ela um nome específico." },
  { title: "O botão de contato abre o destino correto?", detail: "Teste o toque no seu próprio telefone, inclusive em links de mensagem e chamada.", tip: "Corrija links quebrados e confirme se o canal aberto é o que sua equipe realmente atende." },
  { title: "A página deixa claro qual é o próximo passo?", detail: "Por exemplo: agendar, pedir orçamento, conhecer serviços ou escolher uma unidade.", tip: "Escolha uma ação principal por trecho da página e use um convite que descreva o resultado do clique." },
] as const;

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(questions.length).fill(null));
  const [finished, setFinished] = useState(false);
  const answered = answers.filter(Boolean).length;
  const weak = questions.filter((_, index) => answers[index] !== "yes");

  function select(index: number, value: Answer) {
    setAnswers((current) => current.map((answer, i) => i === index ? value : answer));
  }

  function reset() {
    setAnswers(Array(questions.length).fill(null));
    setFinished(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <main className="assess-shell">
    <header className="guide-top"><a href="/" className="admin-brand" aria-label="Vistall, início">Vistall<span>.</span></a><a href="/">Voltar ao site <ArrowUpRight size={17} aria-hidden="true" /></a></header>
    <section className="assess-hero"><p className="admin-overline">AUTOAVALIAÇÃO / 5 PERGUNTAS</p><h1>Um primeiro olhar<br /><em>para o seu site.</em></h1><p>Abra sua página inicial no celular e responda ao que você consegue verificar. Este roteiro mostra pontos para revisar; ele não examina seu site automaticamente.</p></section>
    {!finished ? <>
      <div className="assess-progress"><span>SEU PROGRESSO</span><strong>{String(answered).padStart(2, "0")} / 05</strong></div>
      <div className="assess-questions">{questions.map((question, index) => <fieldset className="assess-question" key={question.title}><legend><span>{String(index + 1).padStart(2, "0")}</span>{question.title}</legend><p>{question.detail}</p><div className="assess-options" role="group" aria-label={`Resposta à pergunta ${index + 1}`}>{[["yes", "Sim"], ["no", "Não"], ["unsure", "Não sei"]].map(([value, label]) => <button key={value} type="button" aria-pressed={answers[index] === value} onClick={() => select(index, value as Answer)}>{label}</button>)}</div></fieldset>)}</div>
      <div className="assess-action"><p>As respostas ficam apenas nesta página do seu navegador e não são enviadas à Vistall.</p><button type="button" disabled={answered < questions.length} onClick={() => { setFinished(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Ver meus pontos de revisão <ArrowUpRight size={19} aria-hidden="true" /></button></div>
    </> : <section className="assess-result" aria-live="polite"><div className="assess-result-top"><span className="admin-overline">SEU ROTEIRO DE REVISÃO</span><button type="button" onClick={reset}><RotateCcw size={15} aria-hidden="true" /> Refazer</button></div><h2>{weak.length === 0 ? "Você conferiu os cinco pontos." : `${weak.length} ${weak.length === 1 ? "ponto merece" : "pontos merecem"} outro olhar.`}</h2><p className="assess-result-lead">{weak.length === 0 ? "Se quiser uma opinião externa, podemos revisar sua página e combinar ajustes específicos." : "Comece pelos itens abaixo. A resposta “não sei” também indica algo que vale testar na página real."}</p>{weak.length > 0 && <div className="assess-tips">{weak.map((question) => <article key={question.title}><span>{String(questions.indexOf(question) + 1).padStart(2, "0")}</span><div><h3>{question.title}</h3><p>{question.tip}</p></div></article>)}</div>}<div className="assess-offer"><div><span className="admin-overline">UM OLHAR PROFISSIONAL</span><p>A Vistall revisa uma página e combina até três ajustes possíveis por R$ 250, após confirmar o escopo e o acesso.</p></div><a href="/#pedido">Pedir uma revisão <ArrowUpRight size={19} aria-hidden="true" /></a></div></section>}
    <footer className="guide-footer"><a href="/guia"><ArrowLeft size={14} aria-hidden="true" /> Ler o guia prático</a><span>Vistall · Brasil</span></footer>
  </main>;
}


