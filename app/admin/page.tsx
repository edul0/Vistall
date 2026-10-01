import { env } from "cloudflare:workers";
import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Pedidos | Vistall",
  robots: { index: false, follow: false },
};

type Order = {
  id: string;
  business: string;
  website: string;
  email: string;
  status: string;
  created_at: string;
};

type Inquiry = {
  id: string;
  service: string;
  business: string;
  website: string;
  notes: string;
  email: string;
  status: string;
  created_at: string;
};

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) {
    return (
      <main className="admin-shell admin-gate">
        <p className="admin-overline">Vistall / Área reservada</p>
        <h1>Acompanhe os pedidos.</h1>
        <p>Entre com a conta proprietária do site para visualizar as solicitações recebidas.</p>
        <a className="admin-primary" href={chatGPTSignInPath("/admin")}>Entrar com ChatGPT <span aria-hidden>↗</span></a>
      </main>
    );
  }

  const ownerEmail = env.NL_ADMIN_EMAIL?.trim().toLowerCase();
  if (!ownerEmail || user.email.trim().toLowerCase() !== ownerEmail) {
    return (
      <main className="admin-shell admin-gate">
        <p className="admin-overline">Vistall / Área reservada</p>
        <h1>Acesso restrito.</h1>
        <p>Esta página está disponível apenas para a conta proprietária.</p>
        <a href="/">Voltar ao site <span aria-hidden>↗</span></a>
      </main>
    );
  }

  if (!env.DB) throw new Error("Banco de pedidos indisponível");
  const result = await env.DB.prepare(
    "SELECT id, business, website, email, status, created_at FROM requests ORDER BY created_at DESC LIMIT 100",
  ).all<Order>();
  const orders = result.results ?? [];
  const inquiryResult = await env.DB.prepare(
    "SELECT id, service, business, website, notes, email, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 100",
  ).all<Inquiry>();
  const inquiries = inquiryResult.results ?? [];

  return (
    <main className="admin-shell">
      <div className="admin-top"><a href="/" className="admin-brand">Vistall<span>.</span></a><span>ÁREA RESERVADA</span></div>
      <div className="admin-heading"><div><p className="admin-overline">OPERAÇÃO / PEDIDOS</p><h1>Solicitações<br /><em>recebidas.</em></h1></div><p>Pedidos enviados pelo formulário do site. O pagamento deve ser conferido separadamente no Mercado Pago antes de começar o serviço.</p></div>
      <div className="admin-count"><span>01 / VISÃO GERAL</span><strong>{orders.length + inquiries.length} {(orders.length + inquiries.length) === 1 ? "pedido" : "pedidos"}</strong></div>
      {orders.length + inquiries.length === 0 ? (
        <section className="admin-empty"><span>—</span><h2>Nenhum pedido ainda.</h2><p>Quando alguém enviar o formulário, a solicitação aparecerá aqui. O pagamento não é confirmado automaticamente nesta página.</p></section>
      ) : (
        <div className="admin-list">
          {inquiries.map((inquiry) => <article className="admin-order" key={inquiry.id}>
            <div><span className="admin-label">{inquiry.service === "revisao" ? "REVISÃO" : inquiry.service === "criacao" ? "CRIAÇÃO DE SITE" : "SISTEMA WEB"}</span><h2>{inquiry.business}</h2>{inquiry.website && <span className="admin-date">{inquiry.website}</span>}{inquiry.notes && <p className="admin-date">{inquiry.notes}</p>}</div>
            <div><span className="admin-label">CONTATO</span><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a><span className="admin-date">Enviado em {new Date(inquiry.created_at + "Z").toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span></div>
            <div><span className="admin-label">STATUS INTERNO</span><span className="admin-status">{inquiry.status === "new" ? "Novo pedido" : inquiry.status}</span><span className="admin-date">ID: {inquiry.id}</span></div>
          </article>)}
          {orders.map((order) => (
          <article className="admin-order" key={order.id}>
            <div><span className="admin-label">NEGÓCIO</span><h2>{order.business}</h2><a href={order.website} target="_blank" rel="noopener noreferrer">{order.website} ↗</a></div>
            <div><span className="admin-label">CONTATO</span><a href={`mailto:${order.email}`}>{order.email}</a><span className="admin-date">Enviado em {new Date(order.created_at + "Z").toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span></div>
            <div><span className="admin-label">STATUS INTERNO</span><span className="admin-status">{order.status === "new" ? "Novo pedido" : order.status}</span><span className="admin-date">ID: {order.id}</span></div>
          </article>
        ))}</div>
      )}
      <footer className="admin-footer"><span>Vistall — gestão interna</span><span>Últimos 100 pedidos</span></footer>
    </main>
  );
}


