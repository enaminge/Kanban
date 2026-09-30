"use client";

import { useEffect, useRef, useState, type Dispatch, type FormEvent } from "react";
import type { BoardAction } from "@/lib/boardReducer";
import { interpret, type ChatMessage } from "@/lib/chatActions";
import type { BoardState } from "@/lib/types";

type Message = ChatMessage & { note?: string };

type Props = { state: BoardState; dispatch: Dispatch<BoardAction> };

const SUGGESTIONS = [
  "Agrega una tarjeta \"Preparar demo\" en Por hacer",
  "Mueve \"Revisar accesibilidad\" a Hecho",
  "¿Qué tarjetas están en progreso?",
];

const GENERIC_ERROR = "No se pudo contactar al asistente. Revisa tu conexión e intenta de nuevo.";

function changesNote(applied: number, skipped: number) {
  const parts = [];
  if (applied) parts.push(applied === 1 ? "1 cambio aplicado" : `${applied} cambios aplicados`);
  if (skipped) parts.push(skipped === 1 ? "1 cambio no se pudo aplicar" : `${skipped} cambios no se pudieron aplicar`);
  return parts.join(" · ") || undefined;
}

export default function ChatPanel({ state, dispatch }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current!;
    list.scrollTop = list.scrollHeight;
  }, [messages, loading, error]);

  const request = async (history: Message[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-10).map(({ role, content }) => ({ role, content })),
          board: state,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      const { reply, actions, skipped } = interpret(state, data.text, () => crypto.randomUUID());
      actions.forEach(dispatch);
      setMessages([...history, { role: "assistant", content: reply, note: changesNote(actions.length, skipped) }]);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const send = (content: string) => {
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");
    request(history);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) send(input.trim());
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed right-4 bottom-4 z-30 items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-secondary/30 transition hover:bg-secondary/90 lg:hidden ${
          open ? "hidden" : "flex"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M3.5 4A1.5 1.5 0 0 0 2 5.5v7A1.5 1.5 0 0 0 3.5 14H5v2.5a.5.5 0 0 0 .82.38L9.28 14h7.22a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 16.5 4h-13Z" />
        </svg>
        Asistente
      </button>

      <aside
        aria-label="Asistente del tablero"
        className={`fixed inset-x-0 bottom-0 z-40 h-[78dvh] flex-col rounded-t-3xl border-slate-200 bg-white shadow-[0_-12px_40px_rgba(3,33,71,0.18)] lg:static lg:z-auto lg:flex lg:h-auto lg:w-96 lg:shrink-0 lg:rounded-none lg:border-l lg:shadow-none ${
          open ? "flex" : "hidden"
        }`}
      >
        <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M10 1.5l1.9 4.6 4.6 1.9-4.6 1.9L10 14.5 8.1 9.9 3.5 8l4.6-1.9L10 1.5Zm5.5 11 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-navy">Asistente</h2>
            <p className="truncate text-xs text-muted">Maneja el tablero escribiendo lo que necesitas</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar asistente"
            className="rounded-lg p-2 text-muted transition hover:bg-slate-100 hover:text-navy lg:hidden"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </header>

        <div ref={listRef} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="my-auto space-y-3">
              <p className="text-sm leading-relaxed text-muted">
                Puedo agregar, editar, mover y eliminar tarjetas, renombrar columnas o responder preguntas sobre el tablero.
              </p>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => send(suggestion)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm text-navy transition hover:border-primary hover:bg-primary/5"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={i}
              data-testid={`chat-${message.role}`}
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "self-end rounded-br-md bg-navy text-white"
                  : "self-start rounded-bl-md bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
              {message.note && (
                <span className="mt-1.5 block border-t border-slate-200 pt-1.5 text-xs font-medium text-primary">
                  {message.note}
                </span>
              )}
            </div>
          ))}

          {loading && <p className="self-start text-sm text-muted">Pensando...</p>}

          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
              <button
                type="button"
                onClick={() => request(messages)}
                className="mt-1 block font-semibold underline underline-offset-2"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe una instrucción..."
            aria-label="Mensaje para el asistente"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar
          </button>
        </form>
      </aside>
    </>
  );
}
