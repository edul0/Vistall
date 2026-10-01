import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Como melhorar a página inicial de um pequeno negócio | Vistall",
  description: "Um checklist simples para revisar mensagem, leitura no celular e caminho até o contato na página inicial do seu negócio.",
};

const points = [
  {
    number: "01",
    title: "Diga o que você faz logo no início.",
    body: "Quem chega ao site precisa entender o serviço, a região atendida e para quem ele serve. Um título bonito, mas genérico, pode deixar essas respostas escondidas. Leia a primeira tela e pergunte: alguém que não conhece a empresa entenderia a oferta?",
    example: "Em vez de “cuidamos do que importa”, experimente “Banho e tosa em Curitiba, com horários por agendamento”.",
  },
  {
    number: "02",
    title: "Confira a leitura no celular.",
    body: "Abra sua página em um telefone. Veja se a fonte tem tamanho confortável, se há contraste entre texto e fundo e se uma imagem grande empurra as informações principais para muito abaixo. Não é preciso refazer o site inteiro para corrigir a ordem dos elementos.",
    example: "Teste sem ampliar a tela: você consegue ler o primeiro parágrafo e identificar o serviço?",
  },
  {
    number: "03",
    title: "Mostre o próximo passo.",
    body: "Depois de entender o serviço, a pessoa deve encontrar como falar com a empresa. Um botão de contato claro, um telefone tocável ou um formulário curto ajudam a orientar a visita. Confirme também se o destino do botão funciona.",
    example: "Se o objetivo é marcar horário, use uma chamada como “Agendar atendimento” perto da apresentação do serviço.",
  },
];

export default function GuidePage() {
  return (
    <main className="guide-shell">
      <header className="guide-top"><a href="/" className="admin-brand" aria-label="Vistall, início">Vistall<span>.</span></a><a href="/#contato">Pedir uma revisão <ArrowUpRight size={17} aria-hidden="true" /></a></header>
      <div className="guide-hero"><p className="admin-overline">GUIA PRÁTICO / PEQUENOS NEGÓCIOS</p><h1>Seu site já existe.<br /><em>O que ajustar primeiro?</em></h1><p>Três verificações que você pode fazer hoje na página inicial. Elas ajudam a encontrar pontos de melhoria sem depender de uma análise técnica complexa.</p></div>
      <div className="guide-index"><span>LEITURA RÁPIDA</span><span>03 PONTOS PARA CONFERIR</span></div>
      <div className="guide-points">{points.map((point) => <section className="guide-point" key={point.number}><span className="guide-number">{point.number}</span><div><h2>{point.title}</h2><p>{point.body}</p><div className="guide-example"><span>EXEMPLO PRÁTICO</span><p>{point.example}</p></div></div></section>)}</div>
      <section className="guide-end"><span className="admin-overline">PRÓXIMO PASSO</span><h2>Quer um olhar de fora<br /><em>na sua página?</em></h2><p>Faça primeiro uma autoavaliação gratuita de cinco perguntas. Se quiser ajuda na execução, a Vistall combina até três ajustes possíveis na página inicial por R$ 250.</p><a href="/avaliar">Fazer a autoavaliação <ArrowUpRight size={19} aria-hidden="true" /></a></section>
      <footer className="guide-footer"><a href="/">Vistall</a><span>Revisão e ajustes de sites · Brasil</span></footer>
    </main>
  );
}


