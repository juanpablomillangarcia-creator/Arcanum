// Server proxy for Anthropic calls. The user's API key arrives in the `x-user-api-key`
// header (kept in client state, never bundled) and is used server-side only — so the
// `anthropic-dangerous-direct-browser-access` header is NOT needed here.
// Ported error mapping + model map from arcanum-41.html (callClaude, ~line 34861).

import { NextResponse } from "next/server";

export const runtime = "edge";

const AI_API_URL = "https://api.anthropic.com/v1/messages";

export const AI_MODELS: Record<string, { id: string; name: string }> = {
  haiku: { id: "claude-haiku-4-5-20251001", name: "Haiku 4.5" },
  sonnet: { id: "claude-sonnet-4-5-20250929", name: "Sonnet 4.5" },
};

interface Body {
  systemPrompt?: string;
  userPrompt?: string;
  maxTokens?: number;
  model?: string;
  image?: { base64: string; mimeType: string };
}

function spanishError(status: number, code: string, message: string): string {
  if (code === "authentication_error") return "Clave de API inválida. Revísala en los ajustes.";
  if (code === "invalid_request_error" && message.includes("credit"))
    return "Sin créditos en tu cuenta de Anthropic. Recarga en console.anthropic.com → Billing.";
  if (code === "rate_limit_error") return "Demasiadas peticiones, espera unos segundos y vuelve a intentarlo.";
  if (code === "overloaded_error") return "Servicio sobrecargado en Anthropic. Inténtalo en un momento.";
  if (code) return `${code}: ${message}`;
  return `Error ${status}`;
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-user-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "No hay clave de API configurada" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const model = AI_MODELS[body.model ?? "haiku"]?.id ?? AI_MODELS.haiku.id;

  const content = body.image
    ? [
        { type: "image", source: { type: "base64", media_type: body.image.mimeType, data: body.image.base64 } },
        { type: "text", text: body.userPrompt ?? "" },
      ]
    : body.userPrompt ?? "";

  const payload = {
    model,
    max_tokens: body.maxTokens ?? 4096,
    system: body.systemPrompt,
    messages: [{ role: "user", content }],
  };

  let res: Response;
  try {
    res = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Error de red al conectar con Anthropic. Comprueba tu conexión." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    let code = "";
    let message = "";
    try {
      const err = await res.json();
      code = err?.error?.type ?? "";
      message = err?.error?.message ?? "";
    } catch {
      /* keep generic */
    }
    return NextResponse.json({ error: spanishError(res.status, code, message) }, { status: res.status });
  }

  const data = await res.json();
  let text = "";
  if (Array.isArray(data.content)) {
    text = data.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n");
  }
  if (!text) {
    return NextResponse.json({ error: "La IA devolvió una respuesta vacía. Inténtalo de nuevo." }, { status: 502 });
  }
  return NextResponse.json({ text, usage: data.usage });
}
