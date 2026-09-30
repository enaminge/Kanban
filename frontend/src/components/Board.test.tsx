import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Board from "./Board";

const column = (id: string) => within(screen.getByTestId(`column-${id}`));

describe("Board", () => {
  it("muestra las 5 columnas con los datos de ejemplo", () => {
    render(<Board />);
    for (const title of ["Pendientes", "Por hacer", "En progreso", "Revisión", "Hecho"]) {
      expect(screen.getByRole("button", { name: title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    expect(column("todo").getByText("Diseñar pantalla de inicio")).toBeInTheDocument();
  });

  it("renombra una columna con Enter", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Pendientes" }));
    const input = screen.getByLabelText("Nombre de la columna");
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");
    expect(screen.getByRole("button", { name: "Ideas" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pendientes" })).not.toBeInTheDocument();
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

  it("edita el título y los detalles de una tarjeta", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Editar Revisar accesibilidad" }));
    const title = screen.getByLabelText("Título de la tarjeta");
    expect(title).toHaveValue("Revisar accesibilidad");
    await user.clear(title);
    await user.type(title, "Auditar accesibilidad");
    await user.type(screen.getByLabelText("Detalles de la tarjeta"), " Informe final.");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(column("review").getByText("Auditar accesibilidad")).toBeInTheDocument();
    expect(column("review").getByText(/navegación con teclado. Informe final./)).toBeInTheDocument();
    expect(screen.queryByText("Revisar accesibilidad")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
  });

  it("Escape cancela la edición de una tarjeta", async () => {
    const user = userEvent.setup();
    render(<Board />);
    await user.click(screen.getByRole("button", { name: "Editar Reunión de arranque" }));
    await user.type(screen.getByLabelText("Título de la tarjeta"), " xx{Escape}");
    expect(screen.getByText("Reunión de arranque")).toBeInTheDocument();
    expect(screen.queryByLabelText("Título de la tarjeta")).not.toBeInTheDocument();
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

describe("Asistente", () => {
  afterEach(() => vi.unstubAllGlobals());

  const mockChat = (body: object, ok = true) => {
    const fetchMock = vi.fn().mockResolvedValue({ ok, json: async () => body });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  const ask = async (text: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Mensaje para el asistente"), text);
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    return user;
  };

  it("aplica al tablero las acciones que devuelve el modelo", async () => {
    const fetchMock = mockChat({
      text: JSON.stringify({
        respuesta: "Moví la tarjeta a Hecho.",
        acciones: [{ tipo: "mover", tarjeta: "c6", columna: "done" }],
      }),
    });
    render(<Board />);
    await ask("Mueve Revisar accesibilidad a Hecho");

    expect(await screen.findByText("Moví la tarjeta a Hecho.")).toBeInTheDocument();
    expect(screen.getByText("1 cambio aplicado")).toBeInTheDocument();
    expect(column("done").getByText("Revisar accesibilidad")).toBeInTheDocument();
    expect(column("review").queryAllByRole("listitem")).toHaveLength(0);

    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.messages).toEqual([{ role: "user", content: "Mueve Revisar accesibilidad a Hecho" }]);
    expect(sent.board.columns).toHaveLength(5);
  });

  it("muestra el error y permite reintentar", async () => {
    mockChat({ error: "El modelo gratuito está saturado." }, false);
    render(<Board />);
    const user = await ask("Hola");
    expect(await screen.findByRole("alert")).toHaveTextContent("El modelo gratuito está saturado.");

    mockChat({ text: '{"respuesta": "Hola, ¿qué necesitas?", "acciones": []}' });
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText("Hola, ¿qué necesitas?")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
