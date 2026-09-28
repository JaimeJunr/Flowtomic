import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type ColumnDef, DataTable } from "./data-table";

type Componente = Record<string, unknown> & { nome: string; categoria: string; versao: string };

const data: Componente[] = [
  { nome: "stats-grid", categoria: "organism", versao: "0.8.0" },
  { nome: "team-member-list", categoria: "molecule", versao: "0.9.0" },
  { nome: "button", categoria: "atom", versao: "0.7.2" },
];

const columns: ColumnDef<Componente, unknown>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "categoria", header: "Categoria" },
  { accessorKey: "versao", header: "Versão" },
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");

describe("DataTable", () => {
  it("não embrulha a tabela num card com sombra", () => {
    const { container } = render(<DataTable data={data} columns={columns} title="Componentes" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/shadow/);
  });

  it("o cabeçalho não tem fundo cinza", () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getAllByRole("rowgroup")[0].className).not.toMatch(/bg-muted/);
  });

  it("a busca tem nome acessível e filtra as linhas", () => {
    render(<DataTable data={data} columns={columns} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar..." }), {
      target: { value: "molecule" },
    });
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toHaveTextContent("team-member-list");
  });

  it("ordena pela coluna usando o teclado, não só o mouse", () => {
    render(<DataTable data={data} columns={columns} />);
    const sortByName = screen.getByRole("button", { name: /Nome/ });
    sortByName.focus();
    fireEvent.click(sortByName);
    expect(bodyRows()[0]).toHaveTextContent("button");
    expect(screen.getByRole("columnheader", { name: /Nome/ })).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
  });

  it("mostra a mensagem de vazio quando não há dados", () => {
    render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByText("Nenhum item encontrado")).toBeInTheDocument();
  });

  it("o texto das células é tinta, não cinza", () => {
    render(<DataTable data={data} columns={columns} />);
    const cell = screen.getByText("stats-grid").closest("td") as HTMLElement;
    expect(cell.className).not.toMatch(/text-muted-foreground/);
  });
});
