import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

function Tabela({ selecionada = false }: { selecionada?: boolean }) {
  return (
    <Table>
      <TableCaption>Clientes ativos</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Plano</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state={selecionada ? "selected" : undefined}>
          <TableCell>Ana</TableCell>
          <TableCell>Pro</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Beto</TableCell>
          <TableCell>Free</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>2</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

describe("Table", () => {
  it("é uma tabela com legenda como nome e cabeçalhos de coluna", () => {
    render(<Tabela />);
    expect(screen.getByRole("table", { name: "Clientes ativos" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Nome" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Plano" })).toBeInTheDocument();
  });

  it("cada linha traz suas células na ordem das colunas", () => {
    render(<Tabela />);
    const linha = screen.getByRole("row", { name: /Ana/ });
    const celulas = within(linha).getAllByRole("cell");
    expect(celulas.map((c) => c.textContent)).toEqual(["Ana", "Pro"]);
  });

  it("o rodapé aparece como linha própria", () => {
    render(<Tabela />);
    expect(screen.getByRole("row", { name: /Total/ })).toBeInTheDocument();
  });

  it("linha marcada com data-state selected é repassada ao DOM", () => {
    render(<Tabela selecionada />);
    expect(screen.getByRole("row", { name: /Ana/ })).toHaveAttribute("data-state", "selected");
    expect(screen.getByRole("row", { name: /Beto/ })).not.toHaveAttribute("data-state");
  });

  it("className e ref chegam à tabela dentro do contêiner rolável", () => {
    render(
      <Table className="minha-tabela">
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const tabela = screen.getByRole("table");
    expect(tabela).toHaveClass("minha-tabela", "w-full");
    expect(tabela.parentElement).toHaveClass("overflow-x-auto");
  });

  it("não tem violações automáticas de acessibilidade", async () => {
    const { container } = render(<Tabela />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
