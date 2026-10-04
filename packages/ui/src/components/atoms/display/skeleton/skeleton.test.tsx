import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { CardSkeleton, Skeleton, TableSkeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renderiza o placeholder com filhos, className e props repassados", () => {
    render(
      <Skeleton className="h-4 w-10" data-testid="sk">
        carregando
      </Skeleton>
    );
    const sk = screen.getByTestId("sk");
    expect(sk).toHaveClass("h-4", "w-10");
    expect(sk).toHaveTextContent("carregando");
  });

  it("expõe a ref do elemento", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("sozinho é enfeite: fica fora do leitor de tela e para de pulsar com movimento reduzido", () => {
    const { container } = render(<Skeleton className="h-4" />);
    const bloco = container.firstElementChild as HTMLElement;
    expect(bloco).toHaveAttribute("aria-hidden", "true");
    expect(bloco).toHaveClass("animate-pulse", "motion-reduce:animate-none");
  });

  it("com conteúdo dentro, o conteúdo continua legível pelo leitor de tela", () => {
    render(<Skeleton>Carregando projetos</Skeleton>);
    expect(screen.getByText("Carregando projetos")).not.toHaveAttribute("aria-hidden");
  });
});

describe("CardSkeleton", () => {
  it("mostra três blocos de placeholder", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("não traz texto nem papéis interativos", () => {
    const { container } = render(<CardSkeleton />);
    expect(container).toHaveTextContent("");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("TableSkeleton", () => {
  it("mostra cabeçalho mais cinco linhas de placeholder", () => {
    const { container } = render(<TableSkeleton />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("não traz texto para leitores de tela", () => {
    const { container } = render(<TableSkeleton />);
    expect(container).toHaveTextContent("");
  });
});
