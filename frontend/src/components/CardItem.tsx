"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/types";
import CardForm from "./CardForm";

type CardViewProps = {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  overlay?: boolean;
};

const actionClass =
  "rounded-md p-1.5 text-muted transition pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-primary";

export function CardView({ card, onEdit, onDelete, overlay }: CardViewProps) {
  return (
    <div
      className={`group relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(3,33,71,0.06)] transition select-none hover:border-primary/40 hover:shadow-md ${
        overlay ? "rotate-2 cursor-grabbing shadow-xl ring-2 ring-primary/40" : "cursor-grab"
      }`}
    >
      <h3 className="pr-14 text-sm font-semibold text-navy">{card.title}</h3>
      {card.details && <p className="mt-1.5 text-sm leading-relaxed text-muted">{card.details}</p>}
      <div className="absolute top-2 right-2 flex">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${card.title}`}
            className={`${actionClass} hover:bg-primary/10 hover:text-primary`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M13.59 3.41a2 2 0 0 1 2.83 0l.17.17a2 2 0 0 1 0 2.83l-8.4 8.4a2 2 0 0 1-.88.51l-3.02.84a.6.6 0 0 1-.74-.74l.84-3.02a2 2 0 0 1 .51-.88l8.69-8.11Z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${card.title}`}
            className={`${actionClass} hover:bg-red-50 hover:text-red-600`}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

type CardItemProps = {
  card: Card;
  onEdit: (title: string, details: string) => void;
  onDelete: () => void;
};

export default function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: editing,
    attributes: { role: "listitem", roleDescription: "tarjeta arrastrable" },
  });

  // Mientras se edita no se pasan los listeners de arrastre, para poder escribir y seleccionar texto.
  if (editing) {
    return (
      <li ref={setNodeRef} role="listitem" data-testid={`card-${card.id}`}>
        <CardForm
          initialTitle={card.title}
          initialDetails={card.details}
          submitLabel="Guardar"
          onSubmit={(title, details) => {
            onEdit(title, details);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`touch-manipulation ${isDragging ? "opacity-40" : ""}`}
      data-testid={`card-${card.id}`}
      {...attributes}
      {...listeners}
    >
      <CardView card={card} onEdit={() => setEditing(true)} onDelete={onDelete} />
    </li>
  );
}
