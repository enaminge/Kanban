import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Board from "./Board";

const column = (id: string) => within(screen.getByTestId(`column-${id}`));

describe("Board", () => {
  it("muestra las 5 columnas con los datos de ejemplo", () => {
    render(<Board />);
    for (const title of ["Backlog", "Por hacer", "En progreso", "Revisión", "Hecho"]) {
      expect(screen.getByRole("button", { name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    expect(column("todo").getByText("Diseñar pantalla de inicio")).toBeInTheDocument();
  });

  it("renombra una columna con Enter", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Backlog" }));
    const input = screen.getByLabelText("Nombre de la columna");
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");
    expect(screen.getByRole("button", { name: "Ideas" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Backlog" })).not.toBeInTheDocument();
  });

  it("Escape cancela el renombrado", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Hecho" }));
    await user.type(screen.getByLabelText("Nombre de la columna"), "xx{Escape}");
    expect(screen.getByRole("button", { name: "Hecho" })).toBeInTheDocument();
  });

  it("ignora un nombre vacío", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Revisión" }));
    await user.clear(screen.getByLabelText("Nombre de la columna"));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Revisión" })).toBeInTheDocument();
  });

  it("agrega una tarjeta a la columna correcta", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(column("review").getByRole("button", { name: /agregar tarjeta/i }));
    await user.type(screen.getByLabelText("Título de la tarjeta"), "Nueva tarea");
    await user.type(screen.getByLabelText("Detalles de la tarjeta"), "Con detalles");
    await user.click(screen.getByRole("button", { name: "Agregar" }));
    expect(column("review").getByText("Nueva tarea")).toBeInTheDocument();
    expect(column("review").getByText("Con detalles")).toBeInTheDocument();
    expect(column("review").getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByLabelText("Título de la tarjeta")).not.toBeInTheDocument();
  });

  it("no permite agregar una tarjeta sin título", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(column("done").getByRole("button", { name: /agregar tarjeta/i }));
    const submit = screen.getByRole("button", { name: "Agregar" });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Título de la tarjeta"), "   ");
    expect(submit).toBeDisabled();
  });

  it("Cancelar cierra el formulario sin agregar", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(column("done").getByRole("button", { name: /agregar tarjeta/i }));
    await user.type(screen.getByLabelText("Título de la tarjeta"), "Descartada");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByText("Descartada")).not.toBeInTheDocument();
    expect(column("done").getAllByRole("listitem")).toHaveLength(2);
  });

  it("elimina una tarjeta", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Eliminar Revisar accesibilidad" }));
    expect(screen.queryByText("Revisar accesibilidad")).not.toBeInTheDocument();
    expect(column("review").queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
  });
});
