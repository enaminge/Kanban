"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Card, Column as ColumnType } from "@/lib/types";
import CardItem from "./CardItem";
import AddCardForm from "./AddCardForm";

type Props = {
  column: ColumnType;
  index: number;
  cards: Card[];
  onRename: (title: string) => void;
  onAddCard: (title: string, details: string) => void;
  onEditCard: (cardId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
};

const DOTS = ["bg-muted", "bg-primary", "bg-accent", "bg-secondary", "bg-navy"];

export default function Column({ column, index, cards, onRename, onAddCard, onEditCard, onDeleteCard }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);

  const commit = () => {
    if (draft.trim()) onRename(draft.trim());
    setEditing(false);
  };

  return (
    <section
      ref={setNodeRef}
      data-testid={`column-${column.id}`}
      className="flex w-[80vw] max-w-72 shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-white/60 2xl:w-auto 2xl:max-w-none 2xl:min-w-56 2xl:flex-1"
    >
      <header className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span className={`ml-1 h-2.5 w-2.5 shrink-0 rounded-full ${DOTS[index]}`} aria-hidden="true" />
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
            className="min-w-0 flex-1 rounded-md border border-primary bg-white px-2 py-1 text-sm font-semibold text-navy outline-none ring-2 ring-primary/20"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(column.title);
              setEditing(true);
            }}
            title="Renombrar columna"
            className="min-w-0 flex-1 truncate rounded-md px-1.5 py-1 text-left text-sm font-semibold text-navy transition hover:bg-slate-100"
          >
            {column.title}
          </button>
        )}
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
          {cards.length}
        </span>
      </header>

      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        <ul
          className={`mx-1.5 flex min-h-24 flex-1 flex-col gap-2.5 rounded-xl p-1.5 transition-colors ${
            isOver ? "bg-primary/10" : ""
          }`}
        >
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={(title, details) => onEditCard(card.id, title, details)}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
        </ul>
      </SortableContext>

      <div className="px-3 pt-1 pb-3">
        <AddCardForm onAdd={onAddCard} />
      </div>
    </section>
  );
}
