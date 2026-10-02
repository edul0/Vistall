import { readPublicInput, publicError } from "@/lib/public-input";
import { env } from "cloudflare:workers";

const services = new Set(["revisao", "criacao", "sistema"]);

export async function POST(request: Request) {
  try {
    const input = await readPublicInput(request);
    if (typeof input.extra === "string" && input.extra.trim()) return Response.json({ ok: true });
    const service = String(input.service || "").trim();
    const business = String(input.business || "").trim();
    const website = String(input.website || "").trim();
    const notes = String(input.notes || "").trim();
    const email = String(input.email || "").trim().toLowerCase();
    if (!services.has(service) || !business || business.length > 100 || website.length > 300 || notes.length > 3000 || !email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Confira os dados informados." }, { status: 400 });
    }
    let finalWebsite = website;
    if (service === "revisao") {
      let parsed: URL;
      try { parsed = new URL(website); } catch { return Response.json({ error: "Informe a URL completa do site, começando com https://." }, { status: 400 }); }
      if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".") || parsed.username || parsed.password) {
        return Response.json({ error: "Informe um site público válido." }, { status: 400 });
      }
      finalWebsite = parsed.toString();
    }
    if (!env.DB) throw new Error("Banco indisponível");
    const existing = await env.DB.prepare("SELECT id FROM inquiries WHERE email = ? AND service = ? AND business = ? AND created_at >= datetime('now', '-10 minutes') LIMIT 1")
      .bind(email, service, business).first<{ id: string }>();
    if (existing) return Response.json({ ok: true, id: existing.id });
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO inquiries (id, service, business, website, notes, email) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, service, business, finalWebsite, notes, email).run();
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) { return publicError(error); }
}
