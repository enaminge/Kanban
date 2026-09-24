"use client";

import { useState, type FormEvent } from "react";

type Props = { onAdd: (title: string, details: string) => void };

export default function AddCardForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const close = () => {
    setOpen(false);
    setTitle("");
    setDetails("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), details.trim());
    close();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-white hover:text-secondary"
      >
        <span className="text-lg leading-none">+</span> Agregar tarjeta
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        aria-label="Título de la tarjeta"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Detalles"
        aria-label="Detalles de la tarjeta"
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={close}
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
