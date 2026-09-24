import type { BoardState } from "./types";

export const initialData: BoardState = {
  columns: [
    { id: "backlog", title: "Backlog", cardIds: ["c1", "c2"] },
    { id: "todo", title: "Por hacer", cardIds: ["c3", "c4"] },
    { id: "progress", title: "En progreso", cardIds: ["c5"] },
    { id: "review", title: "Revisión", cardIds: ["c6"] },
    { id: "done", title: "Hecho", cardIds: ["c7", "c8"] },
  ],
  cards: {
    c1: { id: "c1", title: "Investigar competidores", details: "Revisar las 5 herramientas principales y anotar fortalezas." },
    c2: { id: "c2", title: "Definir métricas de éxito", details: "Acordar KPIs para el lanzamiento del primer trimestre." },
    c3: { id: "c3", title: "Diseñar pantalla de inicio", details: "Wireframe y propuesta visual con la paleta de marca." },
    c4: { id: "c4", title: "Redactar textos de onboarding", details: "Tres pasos cortos y claros para nuevos usuarios." },
    c5: { id: "c5", title: "Implementar tablero Kanban", details: "Columnas, tarjetas y arrastrar y soltar." },
    c6: { id: "c6", title: "Revisar accesibilidad", details: "Contraste, foco visible y navegación con teclado." },
    c7: { id: "c7", title: "Configurar repositorio", details: "Estructura inicial, linter y .gitignore." },
    c8: { id: "c8", title: "Reunión de arranque", details: "Alinear objetivos y alcance del MVP con el equipo." },
  },
};
