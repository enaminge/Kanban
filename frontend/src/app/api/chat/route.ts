import { buildSystemPrompt, type ChatMessage } from "@/lib/chatActions";
import type { BoardState } from "@/lib/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter prueba los modelos en orden si el primero está saturado (429).
const MODELS = [
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3.5-lightning:free",
];

// Los modelos gratuitos responden 429 de forma intermitente.
const RETRY_DELAYS = [1000, 2500];

const error = (message: string, status: number) => Response.json({ error: message }, { status });

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return error("Falta la clave OPENROUTER_API_KEY en frontend/.env.local.", 500);

  const { messages, board }: { messages: ChatMessage[]; board: BoardState } = await req.json();

  let upstream: Response | undefined;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Tablero Kanban",
      },
      body: JSON.stringify({
        models: MODELS,
        messages: [{ role: "system", content: buildSystemPrompt(board) }, ...messages],
        reasoning: { enabled: false },
        temperature: 0.2,
        max_tokens: 800,
      }),
    });
    const retryable = upstream.status === 429 || upstream.status >= 500;
    if (!retryable || attempt === RETRY_DELAYS.length) break;
    await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
  }

  if (!upstream!.ok) {
    return upstream!.status === 429
      ? error("El modelo gratuito está saturado en este momento. Intenta de nuevo en unos segundos.", 429)
      : error("No pude conectarme con el modelo de IA. Intenta de nuevo en un momento.", 502);
  }

  const data = await upstream!.json();
  const text: string | undefined = data.choices?.[0]?.message?.content;
  if (!text) return error("El modelo no devolvió una respuesta. Intenta de nuevo.", 502);
  return Response.json({ text });
}
