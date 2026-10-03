import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

function Paginas({ atual }: { atual: number }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="?p=1" />
        </PaginationItem>
        {[1, 2, 3].map((n) => (
          <PaginationItem key={n}>
            <PaginationLink href={`?p=${n}`} isActive={n === atual}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?p=3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

describe("Pagination", () => {
  it("a navegação e as setas têm nome em português", () => {
    render(<Paginas atual={2} />);
    expect(screen.getByRole("navigation", { name: "Paginação" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Página anterior" })).toHaveAttribute("href", "?p=1");
    expect(screen.getByRole("link", { name: "Próxima página" })).toHaveAttribute("href", "?p=3");
  });

  it("o texto visível das setas também é português", () => {
    render(<Paginas atual={2} />);
    expect(screen.getByText("Anterior")).toBeInTheDocument();
    expect(screen.getByText("Próxima")).toBeInTheDocument();
    expect(screen.queryByText(/^(Previous|Next|More pages)$/)).not.toBeInTheDocument();
  });

  it("só a página atual é marcada como atual", () => {
    render(<Paginas atual={2} />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "1" })).not.toHaveAttribute("aria-current");
  });

  it("as reticências não viram ruído para o leitor de tela", () => {
    const { container } = render(<Paginas atual={1} />);
    const ellipsis = container.querySelector('[data-slot="pagination-ellipsis"]');
    expect(ellipsis).toHaveAttribute("aria-hidden");
  });
});
