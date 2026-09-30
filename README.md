# Gestor de Proyectos Kanban

MVP de tablero Kanban: 5 columnas renombrables, tarjetas con título y detalles, arrastrar y soltar, agregar, editar y eliminar tarjetas, y un asistente de chat que maneja el tablero con instrucciones en lenguaje natural. Interfaz en español y adaptable a teléfono, tableta y escritorio. Sin persistencia. Requisitos completos en `AGENTS.md`.

Stack: Next.js, React, Tailwind CSS, dnd-kit, OpenRouter, Vitest, Playwright.

## Uso

Requiere Node.js 20 o superior.

```
cd frontend
npm install
npm run dev
```

Abrir http://localhost:3000.

Para el asistente, crear `frontend/.env.local` con una clave de OpenRouter:

```
OPENROUTER_API_KEY=...
```

## Pruebas

```
npm test                          # unitarias y de componentes (Vitest)
npx playwright install chromium   # solo la primera vez
npm run test:e2e                  # integración (Playwright)
```
