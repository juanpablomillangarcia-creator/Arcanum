// Client-side wrapper around the /api/claude proxy. The key never leaves the client
// store except as the x-user-api-key header to our own server route.

import { useAiStore } from "@/src/store/ai";
import { extractJSON } from "@/src/lib/ai/json";

export interface Usage { input_tokens: number; output_tokens: number; }
export interface AiResult { text: string; usage?: Usage; }

export interface CallOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  modelOverride?: "haiku" | "sonnet";
  image?: { base64: string; mimeType: string };
}

export async function callClaude(opts: CallOptions): Promise<AiResult> {
  const { apiKey, model } = useAiStore.getState();
  if (!apiKey.startsWith("sk-ant-")) {
    throw new Error("No hay clave de API configurada");
  }

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-api-key": apiKey },
    body: JSON.stringify({
      systemPrompt: opts.systemPrompt,
      userPrompt: opts.userPrompt,
      maxTokens: opts.maxTokens ?? 4096,
      model: opts.modelOverride ?? model,
      image: opts.image,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data as AiResult;
}

/** Convenience: call the model and parse a JSON object from the response. */
export async function callClaudeJSON<T = unknown>(opts: CallOptions): Promise<{ data: T; usage?: Usage }> {
  const { text, usage } = await callClaude(opts);
  return { data: extractJSON<T>(text), usage };
}

/** Resize an image client-side (max 1024px, JPEG 0.85) before sending to the API. */
export async function resizeImage(file: File, maxDim = 1024): Promise<{ base64: string; mimeType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const out = canvas.toDataURL("image/jpeg", 0.85);
  return { base64: out.split(",")[1], mimeType: "image/jpeg" };
}
