import { expect, test, type Locator, type Page } from "@playwright/test";

const column = (page: Page, id: string) => page.getByTestId(`column-${id}`);
const cardTitles = (col: Locator) => col.getByRole("listitem").locator("h3");

async function drag(page: Page, source: Locator, target: Locator, yOffset = 0) {
  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2 + yOffset, { steps: 20 });
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("carga el tablero con 5 columnas y datos de ejemplo", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Tablero Kanban", exact: true })).toBeVisible();
  await expect(page.locator("[data-testid^=column-]")).toHaveCount(5);
  await expect(page.getByRole("listitem")).toHaveCount(8);
  await expect(cardTitles(column(page, "backlog"))).toHaveText([
    "Investigar competidores",
    "Definir métricas de éxito",
  ]);
});

test("renombra una columna", async ({ page }) => {
  await page.getByRole("button", { name: "Por hacer" }).click();
  await page.getByLabel("Nombre de la columna").fill("Siguiente");
  await page.keyboard.press("Enter");
  await expect(column(page, "todo").getByRole("button", { name: "Siguiente" })).toBeVisible();
});

test("agrega una tarjeta", async ({ page }) => {
  const col = column(page, "progress");
  await col.getByRole("button", { name: /agregar tarjeta/i }).click();
  await page.getByLabel("Título de la tarjeta").fill("Escribir pruebas");
  await page.getByLabel("Detalles de la tarjeta").fill("Unitarias y e2e");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(cardTitles(col)).toHaveText(["Implementar tablero Kanban", "Escribir pruebas"]);
  await expect(col.getByText("Unitarias y e2e")).toBeVisible();
});

test("elimina una tarjeta", async ({ page }) => {
  const card = page.getByTestId("card-c7");
  await card.hover();
  await card.getByRole("button", { name: "Eliminar Configurar repositorio" }).click();
  await expect(page.getByText("Configurar repositorio")).toHaveCount(0);
  await expect(page.getByRole("listitem")).toHaveCount(7);
});

test("arrastra una tarjeta a otra columna", async ({ page }) => {
  await drag(page, page.getByTestId("card-c1"), page.getByTestId("card-c5"), 30);
  await expect(cardTitles(column(page, "progress"))).toContainText(["Investigar competidores"]);
  await expect(cardTitles(column(page, "backlog"))).toHaveText(["Definir métricas de éxito"]);
});

test("arrastra una tarjeta a una columna vacía", async ({ page }) => {
  await page.getByTestId("card-c6").hover();
  await page.getByRole("button", { name: "Eliminar Revisar accesibilidad" }).click();
  await expect(column(page, "review").getByRole("listitem")).toHaveCount(0);
  await drag(page, page.getByTestId("card-c3"), column(page, "review").getByRole("list"));
  await expect(cardTitles(column(page, "review"))).toHaveText(["Diseñar pantalla de inicio"]);
  await expect(cardTitles(column(page, "todo"))).toHaveText(["Redactar textos de onboarding"]);
});

test("reordena tarjetas dentro de una columna", async ({ page }) => {
  await drag(page, page.getByTestId("card-c7"), page.getByTestId("card-c8"), 20);
  await expect(cardTitles(column(page, "done"))).toHaveText([
    "Reunión de arranque",
    "Configurar repositorio",
  ]);
});
