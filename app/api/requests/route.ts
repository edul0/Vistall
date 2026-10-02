import { readPublicInput, publicError } from "@/lib/public-input";
import { saveRequest } from "@/lib/request-store";

export async function POST(request: Request) {
  try {
    const input = await readPublicInput(request);
    if (typeof input.extra === "string" && input.extra.trim()) return Response.json({ ok: true });
    const business = String(input.business || "").trim();
    const website = String(input.website || "").trim();
    const email = String(input.email || "").trim().toLowerCase();
    if (!business || business.length > 100 || website.length > 300 || !email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Confira os dados informados." }, { status: 400 });
    let parsed: URL;
    try { parsed = new URL(website); } catch { return Response.json({ error: "Informe a URL completa do site, começando com https://." }, { status: 400 }); }
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".") || parsed.username || parsed.password) return Response.json({ error: "Informe um site público válido." }, { status: 400 });
    const id = await saveRequest({ business, website: parsed.toString(), email });
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    return publicError(error);
  }
}
