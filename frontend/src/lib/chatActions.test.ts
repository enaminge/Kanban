import { describe, expect, it } from "vitest";
import { buildSystemPrompt, interpret } from "./chatActions";
import type { BoardState } from "./types";

const state: BoardState = {
  columns: [
    { id: "a", title: "A", cardIds: ["1", "2"] },
    { id: "b", title: "B", cardIds: ["3"] },
  ],
  cards: {
    "1": { id: "1", title: "Uno", details: "" },
    "2": { id: "2", title: "Dos", details: "" },
    "3": { id: "3", title: "Tres", details: "" },
  },
};

const reply = (acciones: unknown[], respuesta = "Hecho") => JSON.stringify({ respuesta, acciones });
const run = (text: string) => interpret(state, text, () => "nuevo");

describe("interpret", () => {
  it("convierte cada tipo de acción", () => {
    const { reply: text, actions, skipped } = run(
      reply([
        { tipo: "agregar", columna: "b", titulo: " Nueva ", detalles: "Detalle" },
        { tipo: "mover", tarjeta: "1", columna: "b", posicion: 1 },
        { tipo: "eliminar", tarjeta: "2" },
        { tipo: "renombrar", columna: "a", titulo: "Ideas" },
      ]),
    );
    expect(text).toBe("Hecho");
    expect(skipped).toBe(0);
    expect(actions).toEqual([
      { type: "addCard", columnId: "b", card: { id: "nuevo", title: "Nueva", details: "Detalle" } },
      { type: "moveCard", cardId: "1", toColumnId: "b", toIndex: 0 },
      { type: "deleteCard", cardId: "2" },
      { type: "renameColumn", columnId: "a", title: "Ideas" },
    ]);
  });

  it("edita solo los campos indicados", () => {
    const { actions } = run(
      reply([
        { tipo: "editar", tarjeta: "1", titulo: "Uno bis" },
        { tipo: "editar", tarjeta: "3", detalles: "Con detalle" },
      ]),
    );
    expect(actions).toEqual([
      { type: "editCard", cardId: "1", title: "Uno bis", details: "" },
      { type: "editCard", cardId: "3", title: "Tres", details: "Con detalle" },
    ]);
  });

  it("sin posición mueve al final de la columna", () => {
    const { actions } = run(reply([{ tipo: "mover", tarjeta: "1", columna: "b" }]));
    expect(actions).toEqual([{ type: "moveCard", cardId: "1", toColumnId: "b", toIndex: 1 }]);
  });

  it("descarta acciones con ids inexistentes, sin título o de tipo desconocido", () => {
    const { actions, skipped } = run(
      reply([
        { tipo: "mover", tarjeta: "99", columna: "b" },
        { tipo: "mover", tarjeta: "1", columna: "zz" },
        { tipo: "agregar", columna: "a", titulo: "  " },
        { tipo: "eliminar", tarjeta: "toString" },
        { tipo: "archivar", tarjeta: "1" },
      ]),
    );
    expect(actions).toEqual([]);
    expect(skipped).toBe(5);
  });

  it("valida cada acción contra el resultado de las anteriores", () => {
    const { actions, skipped } = run(
      reply([
        { tipo: "eliminar", tarjeta: "1" },
        { tipo: "mover", tarjeta: "1", columna: "b" },
      ]),
    );
    expect(actions).toHaveLength(1);
    expect(skipped).toBe(1);
  });

  it("acepta JSON envuelto en un bloque de código", () => {
    const { reply: text, actions } = run("```json\n" + reply([{ tipo: "eliminar", tarjeta: "3" }], "Eliminada") + "\n```");
    expect(text).toBe("Eliminada");
    expect(actions).toEqual([{ type: "deleteCard", cardId: "3" }]);
  });

  it("usa el texto tal cual si no es JSON", () => {
    expect(run("Hola, ¿en qué te ayudo?")).toEqual({ reply: "Hola, ¿en qué te ayudo?", actions: [], skipped: 0 });
  });

  it("tolera que falten las acciones", () => {
    expect(run('{"respuesta": "Hay 3 tarjetas"}')).toEqual({ reply: "Hay 3 tarjetas", actions: [], skipped: 0 });
  });
});

describe("buildSystemPrompt", () => {
  it("incluye los ids y títulos del tablero", () => {
    const prompt = buildSystemPrompt(state);
    expect(prompt).toContain('{"id":"b","titulo":"B","cantidad":1,"tarjetas":[{"id":"3","titulo":"Tres","detalles":""}]}');
  });
});
