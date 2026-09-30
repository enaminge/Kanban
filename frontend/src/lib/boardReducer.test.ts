import { describe, expect, it } from "vitest";
import { boardReducer, findColumnId } from "./boardReducer";
import type { BoardState } from "./types";

const makeState = (): BoardState => ({
  columns: [
    { id: "a", title: "A", cardIds: ["1", "2", "3"] },
    { id: "b", title: "B", cardIds: ["4"] },
    { id: "c", title: "C", cardIds: [] },
  ],
  cards: {
    "1": { id: "1", title: "Uno", details: "" },
    "2": { id: "2", title: "Dos", details: "" },
    "3": { id: "3", title: "Tres", details: "" },
    "4": { id: "4", title: "Cuatro", details: "" },
  },
});

const ids = (s: BoardState, col: string) => s.columns.find((c) => c.id === col)!.cardIds;

describe("renameColumn", () => {
  it("renombra solo la columna indicada", () => {
    const s = boardReducer(makeState(), { type: "renameColumn", columnId: "b", title: "Nueva" });
    expect(s.columns.map((c) => c.title)).toEqual(["A", "Nueva", "C"]);
  });
});

describe("addCard", () => {
  it("agrega la tarjeta al final de la columna", () => {
    const s = boardReducer(makeState(), {
      type: "addCard",
      columnId: "c",
      card: { id: "9", title: "Nueva", details: "Detalle" },
    });
    expect(ids(s, "c")).toEqual(["9"]);
    expect(s.cards["9"]).toEqual({ id: "9", title: "Nueva", details: "Detalle" });
  });
});

describe("editCard", () => {
  it("cambia el título y los detalles sin mover la tarjeta", () => {
    const s = boardReducer(makeState(), { type: "editCard", cardId: "2", title: "Nuevo", details: "Detalle" });
    expect(s.cards["2"]).toEqual({ id: "2", title: "Nuevo", details: "Detalle" });
    expect(ids(s, "a")).toEqual(["1", "2", "3"]);
  });
});

describe("deleteCard", () => {
  it("quita la tarjeta de su columna y del mapa", () => {
    const s = boardReducer(makeState(), { type: "deleteCard", cardId: "2" });
    expect(ids(s, "a")).toEqual(["1", "3"]);
    expect(s.cards["2"]).toBeUndefined();
  });
});

describe("moveCard", () => {
  it("reordena hacia abajo dentro de la misma columna", () => {
    const s = boardReducer(makeState(), { type: "moveCard", cardId: "1", toColumnId: "a", toIndex: 2 });
    expect(ids(s, "a")).toEqual(["2", "3", "1"]);
  });

  it("reordena hacia arriba dentro de la misma columna", () => {
    const s = boardReducer(makeState(), { type: "moveCard", cardId: "3", toColumnId: "a", toIndex: 0 });
    expect(ids(s, "a")).toEqual(["3", "1", "2"]);
  });

  it("mueve a otra columna en la posición indicada", () => {
    const s = boardReducer(makeState(), { type: "moveCard", cardId: "2", toColumnId: "b", toIndex: 0 });
    expect(ids(s, "a")).toEqual(["1", "3"]);
    expect(ids(s, "b")).toEqual(["2", "4"]);
  });

  it("mueve a una columna vacía", () => {
    const s = boardReducer(makeState(), { type: "moveCard", cardId: "4", toColumnId: "c", toIndex: 0 });
    expect(ids(s, "b")).toEqual([]);
    expect(ids(s, "c")).toEqual(["4"]);
  });

  it("un índice mayor que el largo inserta al final", () => {
    const s = boardReducer(makeState(), { type: "moveCard", cardId: "1", toColumnId: "b", toIndex: 99 });
    expect(ids(s, "b")).toEqual(["4", "1"]);
  });
});

describe("inmutabilidad", () => {
  it("no muta el estado original", () => {
    const original = makeState();
    const snapshot = structuredClone(original);
    boardReducer(original, { type: "renameColumn", columnId: "a", title: "X" });
    boardReducer(original, { type: "addCard", columnId: "a", card: { id: "9", title: "N", details: "" } });
    boardReducer(original, { type: "editCard", cardId: "1", title: "E", details: "" });
    boardReducer(original, { type: "deleteCard", cardId: "1" });
    boardReducer(original, { type: "moveCard", cardId: "1", toColumnId: "b", toIndex: 0 });
    expect(original).toEqual(snapshot);
  });
});

describe("findColumnId", () => {
  it("encuentra la columna de una tarjeta o de un id de columna", () => {
    const s = makeState();
    expect(findColumnId(s, "4")).toBe("b");
    expect(findColumnId(s, "c")).toBe("c");
    expect(findColumnId(s, "nope")).toBeUndefined();
  });
});
