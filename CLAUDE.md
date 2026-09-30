# CLAUDE.md

Este archivo orienta a Claude Code (claude.ai/code) al trabajar con el código de este repositorio.

Los requisitos de negocio, la paleta de colores y los estándares de codificación están en @AGENTS.md (fuente de verdad; no duplicarlos aquí). Lo más importante: MVP simple, sin funciones extra, sin persistencia, sin programación defensiva innecesaria, sin emojis y con un README mínimo.

## Comandos

Todo se ejecuta dentro de `frontend/`:

```
npm run dev                          # servidor en http://localhost:3000
npm run build                        # compilación de producción
npm run lint                         # revisión con ESLint
npm test                             # pruebas unitarias y de componentes (Vitest)
npx vitest run src/lib/boardReducer.test.ts   # un solo archivo
npx vitest run -t "nombre de la prueba"        # una sola prueba por nombre
npm run test:e2e                     # pruebas de integración (Playwright; levanta o reutiliza el servidor)
npx playwright test -g "nombre"      # una sola prueba de integración
npx playwright install chromium      # solo la primera vez
```

## Next.js 16

`frontend/AGENTS.md` (cargado por `frontend/CLAUDE.md`) advierte que esta versión de Next trae cambios incompatibles con versiones anteriores. Antes de escribir código específico de Next, hay que leer la guía correspondiente en `frontend/node_modules/next/dist/docs/`. Ese bloque lo vuelve a generar `next dev`, así que conviene guardarlo en el repositorio tal cual.

## Arquitectura

Aplicación de una sola página renderizada en el cliente: `src/app/page.tsx` solo monta `<Board />` (`"use client"`).

- **Estado:** normalizado en `src/lib/types.ts`. `BoardState` se compone de `columns` (cada una con sus `cardIds` ordenados) y `cards`, un mapa indexado por id. Todo cambio pasa por la función reductora pura `src/lib/boardReducer.ts` (`renameColumn`, `addCard`, `editCard`, `deleteCard`, `moveCard`), usada mediante `useReducer` en `Board.tsx`. Los datos de ejemplo iniciales están en `src/lib/initialData.ts`; las pruebas (unitarias y de integración) dependen de esos títulos y cantidades, así que si cambian hay que actualizar las pruebas.
- **Asistente (chat):** `ChatPanel.tsx` envía el historial y el tablero a `src/app/api/chat/route.ts`, que llama a OpenRouter (`OPENROUTER_API_KEY` en `frontend/.env.local`, modelos `:free` con respaldo y reintentos ante 429) y devuelve el texto del modelo. El modelo responde JSON `{ respuesta, acciones }`; `interpret` en `src/lib/chatActions.ts` lo valida contra el tablero (ids existentes, títulos no vacíos) y lo convierte en acciones del reductor. El prompt de sistema (`buildSystemPrompt`) vive en el mismo archivo. El chat solo usa las acciones del reductor.
- **Formulario de tarjeta:** `CardForm.tsx` sirve para agregar (`AddCardForm`) y para editar (`CardItem`). Mientras una tarjeta se edita, `CardItem` no pasa los listeners de dnd-kit, para poder escribir sin iniciar un arrastre.
- **Diseño adaptable:** desde `lg` el chat es una barra lateral derecha; por debajo es un panel inferior que se abre con el botón flotante "Asistente". Las columnas tienen ancho fijo con desplazamiento horizontal y solo se reparten el ancho desde `2xl`.
- **Arrastrar y soltar (dnd-kit):** `Board.tsx` contiene el `DndContext`, con `MouseSensor` (5 px), `TouchSensor` (pulsación larga de 200 ms, para no bloquear el desplazamiento táctil) y anuncios de accesibilidad en español. `onDragOver` mueve la tarjeta entre columnas en tiempo real; `onDragEnd` resuelve el reordenamiento dentro de la misma columna. `findColumnId` acepta tanto el id de una columna como el de una tarjeta, porque `over.id` puede ser cualquiera de los dos (las columnas vacías también reciben tarjetas). `DragOverlay` dibuja `CardView`, la vista pura de `CardItem.tsx`, separada del componente que la hace arrastrable.
- **Estilos:** Tailwind v4 sin archivo de configuración; los colores de marca se definen como variables `@theme` en `src/app/globals.css` (`accent`, `primary`, `secondary`, `navy`, `muted`) y se usan como clases (`text-navy`, `border-accent`, etc.).
- **Alias de rutas:** `@/` apunta a `src/` (definido en `tsconfig.json` y en `vitest.config.mts`).

## Pruebas

- Vitest usa jsdom y solo incluye `src/**/*.test.{ts,tsx}`. Las pruebas de integración están aparte, en `frontend/e2e/`.
- En Playwright, dnd-kit no responde a `dragTo`: usar la función auxiliar `drag` de `e2e/board.spec.ts` (`mouse.down`, `mouse.move` con `steps`, `mouse.up`, además de `scrollIntoViewIfNeeded`, porque algunas columnas quedan fuera de la pantalla). El `MouseSensor` exige 5 px de movimiento antes de activarse. Las pruebas corren a 1920x1080 para que las cinco columnas queden visibles a la vez; con menos ancho el origen del arrastre puede quedar fuera de pantalla.
- Las pruebas de integración seleccionan columnas por `data-testid="column-<id>"` y tarjetas por `role="listitem"`; hay que conservar esos atributos. Los mensajes del chat usan `data-testid="chat-user"` y `chat-assistant`.
- Las pruebas nunca llaman al modelo real: Vitest sustituye `fetch` y Playwright intercepta `**/api/chat` con `page.route`.
