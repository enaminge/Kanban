# Gestor de Proyectos Kanban

MVP de tablero Kanban: 5 columnas renombrables, tarjetas con título y detalles, arrastrar y soltar, agregar y eliminar tarjetas. Sin persistencia. Requisitos completos en `AGENTS.md`.

Stack: Next.js, React, Tailwind CSS, dnd-kit, Vitest, Playwright.

## Uso

Requiere Node.js 20 o superior.

```
cd frontend
npm install
npm run dev
```

Abrir http://localhost:3000.

## Pruebas

```
npm test                          # unitarias y de componentes (Vitest)
npx playwright install chromium   # solo la primera vez
npm run test:e2e                  # integración (Playwright)
```
