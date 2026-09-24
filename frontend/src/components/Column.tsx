"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column as ColumnType } from "@/lib/types";
import CardItem from "./CardItem";
import AddCardForm from "./AddCardForm";

type Props = {
  column: ColumnType;
  cards: Card[];
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

export default function Column({ column, cards, onRename, onAddCard, onDeleteCard }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);

  const commit = () => {
    if (draft.trim()) onRename(draft.trim());
    setEditing(false);
  };

  return (
    <section
      data-testid={`column-${column.id}`}
      className="flex min-w-72 flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/70"
    >
      <div className="h-1 rounded-t-2xl bg-accent" />
      <header className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label="Nombre de la columna"
            className="w-full rounded-md border border-primary bg-white px-2 py-1 text-sm font-semibold text-navy outline-none ring-2 ring-primary/20"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(column.title);
              setEditing(true);
            }}
            title="Renombrar columna"
            className="truncate rounded-md px-2 py-1 text-left text-sm font-semibold tracking-wide text-navy uppercase transition hover:bg-white"
          >
            {column.title}
          </button>
        )}
        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-muted">
          {cards.length}
        </span>
      </header>

      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={`flex min-h-24 flex-1 flex-col gap-3 rounded-xl px-3 pb-3 transition-colors ${
            isOver ? "bg-primary/5" : ""
          }`}
        >
          {cards.map((card) => (
            <CardItem key={card.id} card={card} onDelete={() => onDeleteCard(card.id)} />
          ))}
        </ul>
      </SortableContext>

      <div className="px-3 pb-3">
        <AddCardForm onAdd={onAddCard} />
      </div>
    </section>
  );
}
