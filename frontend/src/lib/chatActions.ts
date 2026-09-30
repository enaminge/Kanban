import { boardReducer, type BoardAction } from "./boardReducer";
import type { BoardState } from "./types";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Interpretation = { reply: string; actions: BoardAction[]; skipped: number };

type RawAction = Record<string, unknown>;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function toAction(state: BoardState, raw: RawAction, newId: () => string): BoardAction | undefined {
  const columnId = text(raw.columna);
  const cardId = text(raw.tarjeta);
  const title = text(raw.titulo);
  const column = state.columns.find((c) => c.id === columnId);
  const hasCard = Object.hasOwn(state.cards, cardId);

  switch (raw.tipo) {
    case "agregar":
      if (!column || !title) return;
      return { type: "addCard", columnId, card: { id: newId(), title, details: text(raw.detalles) } };
    case "mover": {
      if (!column || !hasCard) return;
      const position = Number(raw.posicion);
      const toIndex = position >= 1 ? position - 1 : column.cardIds.length;
      return { type: "moveCard", cardId, toColumnId: columnId, toIndex };
    }
    case "editar": {
      if (!hasCard) return;
      const card = state.cards[cardId];
      const details = typeof raw.detalles === "string" ? raw.detalles.trim() : card.details;
      return { type: "editCard", cardId, title: title || card.title, details };
    }
    case "eliminar":
      if (!hasCard) return;
      return { type: "deleteCard", cardId };
    case "renombrar":
      if (!column || !title) return;
      return { type: "renameColumn", columnId, title };
  }
}

// El modelo responde con JSON ({ respuesta, acciones }); aquí se valida contra el tablero
// antes de tocar el estado, porque los ids pueden venir inventados.
export function interpret(state: BoardState, modelText: string, newId: () => string): Interpretation {
  let parsed: { respuesta?: unknown; acciones?: unknown };
  try {
    parsed = JSON.parse(modelText.slice(modelText.indexOf("{"), modelText.lastIndexOf("}") + 1));
  } catch {
    return { reply: modelText.trim(), actions: [], skipped: 0 };
  }

  const rawActions: RawAction[] = Array.isArray(parsed.acciones) ? parsed.acciones : [];
  const actions: BoardAction[] = [];
  let current = state;
  for (const raw of rawActions) {
    const action = toAction(current, raw, newId);
    if (!action) continue;
    actions.push(action);
    current = boardReducer(current, action);
  }

  return {
    reply: text(parsed.respuesta) || (actions.length ? "Listo." : "No pude interpretar la respuesta. Intenta de nuevo."),
    actions,
    skipped: rawActions.length - actions.length,
  };
}

export function buildSystemPrompt(state: BoardState): string {
  const board = state.columns.map((c) => ({
    id: c.id,
    titulo: c.title,
    cantidad: c.cardIds.length,
    tarjetas: c.cardIds.map((id) => ({ id, titulo: state.cards[id].title, detalles: state.cards[id].details })),
  }));

  return `Eres el asistente de un tablero Kanban. Respondes siempre en español, de forma breve y amable.

Estado actual del tablero (JSON):
${JSON.stringify(board)}

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni bloques de código:
{"respuesta": "mensaje corto para el usuario", "acciones": []}

Acciones disponibles (usa exactamente los id del tablero, nunca los títulos):
- {"tipo": "agregar", "columna": "<id de columna>", "titulo": "...", "detalles": "..."}
- {"tipo": "mover", "tarjeta": "<id de tarjeta>", "columna": "<id de columna destino>", "posicion": 1}  ("posicion" es opcional y empieza en 1; sin ella la tarjeta va al final)
- {"tipo": "editar", "tarjeta": "<id de tarjeta>", "titulo": "...", "detalles": "..."}  (incluye solo los campos que cambian)
- {"tipo": "eliminar", "tarjeta": "<id de tarjeta>"}
- {"tipo": "renombrar", "columna": "<id de columna>", "titulo": "nuevo nombre"}

Reglas:
- Puedes incluir varias acciones; se aplican en orden.
- Si el usuario solo pregunta algo sobre el tablero, responde con "acciones": [].
- Si la petición es ambigua (por ejemplo, varias tarjetas coinciden), pregunta antes de actuar.
- No se pueden crear ni eliminar columnas: si te lo piden, explícalo.`;
}
