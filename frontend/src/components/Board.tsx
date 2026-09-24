"use client";

import { useReducer, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { boardReducer, findColumnId } from "@/lib/boardReducer";
import { initialData } from "@/lib/initialData";
import Column from "./Column";
import { CardView } from "./CardItem";

export default function Board() {
  const [state, dispatch] = useReducer(boardReducer, initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-4 border-accent bg-white px-8 py-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-navy">Tablero Kanban</h1>
        <p className="mt-0.5 text-sm text-muted">Arrastra las tarjetas para actualizar su estado</p>
      </header>

      <main className="flex-1 overflow-x-auto p-8">
        <DndContext
          id="kanban-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex min-h-full gap-5">
            {state.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={column.cardIds.map((id) => state.cards[id])}
                onRename={(title) => dispatch({ type: "renameColumn", columnId: column.id, title })}
                onAddCard={(title, details) =>
                  dispatch({
                    type: "addCard",
                    columnId: column.id,
                    card: { id: crypto.randomUUID(), title, details },
                  })
                }
                onDeleteCard={(cardId) => dispatch({ type: "deleteCard", cardId })}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? <CardView card={state.cards[activeId]} overlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
