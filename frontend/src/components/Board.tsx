"use client";

import { useReducer, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { boardReducer, findColumnId } from "@/lib/boardReducer";
import { initialData } from "@/lib/initialData";
import Column from "./Column";
import { CardView } from "./CardItem";
import ChatPanel from "./ChatPanel";

const screenReaderInstructions = {
  draggable:
    "Para tomar una tarjeta presiona Espacio o Enter. Usa las flechas para moverla. Presiona Espacio o Enter de nuevo para soltarla, o Escape para cancelar.",
};

// Con el puntero, la columna de destino es la que está bajo el cursor. Si se decidiera por cercanía
// (closestCorners), mover la tarjeta cambia el alto de las columnas, el destino salta de una a otra
// y React corta el ciclo con "Maximum update depth exceeded". El teclado no tiene puntero y sí usa cercanía.
const collisionDetection: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : closestCorners(args);

export default function Board() {
  const [state, dispatch] = useReducer(boardReducer, initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

  // En pantallas táctiles el arrastre empieza con una pulsación larga, para no bloquear el desplazamiento.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const cardTitle = (id: UniqueIdentifier) => state.cards[String(id)].title;
  const columnTitle = (id: UniqueIdentifier) =>
    state.columns.find((c) => c.id === findColumnId(state, String(id)))!.title;

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Tomaste la tarjeta ${cardTitle(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `La tarjeta ${cardTitle(active.id)} está sobre la columna ${columnTitle(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `Soltaste la tarjeta ${cardTitle(active.id)} en la columna ${columnTitle(over.id)}.`
        : `Soltaste la tarjeta ${cardTitle(active.id)}.`,
    onDragCancel: ({ active }) => `Se canceló el movimiento de la tarjeta ${cardTitle(active.id)}.`,
  };

  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = findColumnId(state, String(active.id));
    const to = findColumnId(state, String(over.id));
    if (!from || !to || from === to) return;
    const target = state.columns.find((c) => c.id === to)!;
    const overIndex = target.cardIds.indexOf(String(over.id));
    dispatch({
      type: "moveCard",
      cardId: String(active.id),
      toColumnId: to,
      toIndex: overIndex >= 0 ? overIndex : target.cardIds.length,
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const column = state.columns.find((c) => c.id === findColumnId(state, String(active.id)))!;
    const newIndex =
      over.id === column.id ? column.cardIds.length - 1 : column.cardIds.indexOf(String(over.id));
    if (newIndex >= 0 && newIndex !== column.cardIds.indexOf(String(active.id))) {
      dispatch({ type: "moveCard", cardId: String(active.id), toColumnId: column.id, toIndex: newIndex });
    }
  };

  const total = Object.keys(state.cards).length;

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <span className="grid h-10 w-10 shrink-0 grid-cols-3 items-start gap-1 rounded-xl bg-navy p-2" aria-hidden="true">
          <span className="h-full rounded-sm bg-accent" />
          <span className="h-3/5 rounded-sm bg-primary" />
          <span className="h-4/5 rounded-sm bg-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-navy sm:text-xl">Tablero Kanban</h1>
          <p className="truncate text-xs text-muted sm:text-sm">Arrastra las tarjetas o pídeselo al asistente</p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-navy">
          {total} {total === 1 ? "tarjeta" : "tarjetas"}
        </span>
      </header>
      <div className="h-1 shrink-0 bg-gradient-to-r from-accent via-primary to-secondary" />

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
          <DndContext
            id="kanban-board"
            sensors={sensors}
            collisionDetection={collisionDetection}
            accessibility={{ announcements, screenReaderInstructions }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className="flex min-h-full w-max items-stretch gap-4 2xl:w-auto">
              {state.columns.map((column, index) => (
                <Column
                  key={column.id}
                  column={column}
                  index={index}
                  cards={column.cardIds.map((id) => state.cards[id])}
                  onRename={(title) => dispatch({ type: "renameColumn", columnId: column.id, title })}
                  onAddCard={(title, details) =>
                    dispatch({
                      type: "addCard",
                      columnId: column.id,
                      card: { id: crypto.randomUUID(), title, details },
                    })
                  }
                  onEditCard={(cardId, title, details) => dispatch({ type: "editCard", cardId, title, details })}
                  onDeleteCard={(cardId) => dispatch({ type: "deleteCard", cardId })}
                />
              ))}
            </div>
            <DragOverlay>
              {activeId ? <CardView card={state.cards[activeId]} overlay /> : null}
            </DragOverlay>
          </DndContext>
        </main>

        <ChatPanel state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
