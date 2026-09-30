"use client";

import { useState } from "react";
import CardForm from "./CardForm";

type Props = { onAdd: (title: string, details: string) => void };

export default function AddCardForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-slate-100 hover:text-secondary"
      >
        <span className="text-lg leading-none">+</span> Agregar tarjeta
      </button>
    );
  }

  return (
    <CardForm
      submitLabel="Agregar"
      onSubmit={(title, details) => {
        onAdd(title, details);
        setOpen(false);
      }}
      onCancel={() => setOpen(false)}
    />
  );
}
