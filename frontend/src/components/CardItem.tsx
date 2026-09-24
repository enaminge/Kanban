"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/types";

type CardViewProps = {
  card: Card;
  onDelete?: () => void;
  overlay?: boolean;
};

export function CardView({ card, onDelete, overlay }: CardViewProps) {
  return (
    <div
      className={`group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        overlay ? "rotate-2 cursor-grabbing shadow-xl ring-2 ring-primary/40" : "cursor-grab"
      }`}
    >
      <h3 className="pr-6 text-sm font-semibold text-navy">{card.title}</h3>
      {card.details && <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.details}</p>}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar ${card.title}`}
          className="absolute top-3 right-3 rounded-md p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

type CardItemProps = { card: Card; onDelete: () => void };

export default function CardItem({ card, onDelete }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    attributes: { role: "listitem", roleDescription: "tarjeta arrastrable" },
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-40" : undefined}
      data-testid={`card-${card.id}`}
      {...attributes}
      {...listeners}
    >
      <CardView card={card} onDelete={onDelete} />
    </li>
  );
}
