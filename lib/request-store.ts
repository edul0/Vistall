import { env } from "cloudflare:workers";

export async function saveRequest(data: { business: string; website: string; email: string }) {
  if (!env.DB) throw new Error("D1 indisponível");
  const existing = await env.DB.prepare("SELECT id FROM requests WHERE email = ? AND website = ? AND created_at >= datetime('now', '-1 day') LIMIT 1")
    .bind(data.email, data.website).first<{ id: string }>();
  if (existing) return existing.id;
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO requests (id, business, website, email) VALUES (?, ?, ?, ?)")
    .bind(id, data.business, data.website, data.email).run();
  return id;
}
