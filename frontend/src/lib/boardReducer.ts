import type { BoardState, Card } from "./types";

export type BoardAction =
  | { type: "renameColumn"; columnId: string; title: string }
  | { type: "addCard"; columnId: string; card: Card }
  | { type: "editCard"; cardId: string; title: string; details: string }
  | { type: "deleteCard"; cardId: string }
  | { type: "moveCard"; cardId: string; toColumnId: string; toIndex: number };

export function findColumnId(state: BoardState, id: string): string | undefined {
  return state.columns.find((c) => c.id === id || c.cardIds.includes(id))?.id;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "renameColumn":
      return {
        ...state,
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, title: action.title } : c,
        ),
      };

    case "addCard":
      return {
        columns: state.columns.map((c) =>
          c.id === action.columnId ? { ...c, cardIds: [...c.cardIds, action.card.id] } : c,
        ),
        cards: { ...state.cards, [action.card.id]: action.card },
      };

    case "editCard":
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.cardId]: { id: action.cardId, title: action.title, details: action.details },
        },
      };

    case "deleteCard": {
      const cards = { ...state.cards };
      delete cards[action.cardId];
      return {
        columns: state.columns.map((c) => ({
          ...c,
          cardIds: c.cardIds.filter((id) => id !== action.cardId),
        })),
        cards,
      };
    }

    case "moveCard": {
      const columns = state.columns.map((c) => ({
        ...c,
        cardIds: c.cardIds.filter((id) => id !== action.cardId),
      }));
      const target = columns.find((c) => c.id === action.toColumnId)!;
      target.cardIds.splice(action.toIndex, 0, action.cardId);
      return { ...state, columns };
    }
  }
}
