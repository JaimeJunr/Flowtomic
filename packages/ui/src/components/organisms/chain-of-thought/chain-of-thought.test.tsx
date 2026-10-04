import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "./chain-of-thought";

describe("ChainOfThoughtHeader", () => {
  describe("Rótulo padrão em pt-BR", () => {
    it("mostra 'Cadeia de raciocínio' quando nenhum texto é passado", () => {
      render(
        <ChainOfThought>
          <ChainOfThoughtHeader />
        </ChainOfThought>
      );
      expect(screen.getByText("Cadeia de raciocínio")).toBeInTheDocument();
    });

    it("mostra o texto customizado no lugar do padrão", () => {
      render(
        <ChainOfThought>
          <ChainOfThoughtHeader>Raciocínio do agente</ChainOfThoughtHeader>
        </ChainOfThought>
      );
      expect(screen.getByText("Raciocínio do agente")).toBeInTheDocument();
      expect(screen.queryByText("Cadeia de raciocínio")).not.toBeInTheDocument();
    });
  });
});

function Raciocinio({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <ChainOfThought open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <ChainOfThoughtHeader />
      <ChainOfThoughtContent>
        <ChainOfThoughtStep label="Buscando fundos" />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

describe("ChainOfThought", () => {
  describe("Abrir e fechar", () => {
    it("começa fechado por padrão e esconde o conteúdo", () => {
      render(<Raciocinio />);
      expect(screen.getByRole("button", { name: "Cadeia de raciocínio" })).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.queryByText("Buscando fundos")).not.toBeInTheDocument();
    });

    it("com defaultOpen, começa aberto e mostra o conteúdo", () => {
      render(<Raciocinio defaultOpen />);
      expect(screen.getByRole("button", { name: "Cadeia de raciocínio" })).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByText("Buscando fundos")).toBeInTheDocument();
    });

    it("abre o conteúdo ao clicar no cabeçalho e avisa onOpenChange", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(<Raciocinio onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole("button", { name: "Cadeia de raciocínio" }));
      expect(screen.getByText("Buscando fundos")).toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("fecha de novo ao clicar outra vez no cabeçalho", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      render(<Raciocinio defaultOpen onOpenChange={onOpenChange} />);
      const cabecalho = screen.getByRole("button", { name: "Cadeia de raciocínio" });

      await user.click(cabecalho);
      expect(cabecalho).toHaveAttribute("aria-expanded", "false");
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("alterna pelo teclado com Enter", async () => {
      const user = userEvent.setup();
      render(<Raciocinio />);
      await user.tab();
      expect(screen.getByRole("button", { name: "Cadeia de raciocínio" })).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(screen.getByText("Buscando fundos")).toBeInTheDocument();
    });

    it("modo controlado: só muda quando a prop open muda, e o clique apenas avisa", async () => {
      const onOpenChange = vi.fn();
      const user = userEvent.setup();
      const { rerender } = render(<Raciocinio open={false} onOpenChange={onOpenChange} />);

      await user.click(screen.getByRole("button", { name: "Cadeia de raciocínio" }));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByText("Buscando fundos")).not.toBeInTheDocument();

      rerender(<Raciocinio open onOpenChange={onOpenChange} />);
      expect(screen.getByText("Buscando fundos")).toBeInTheDocument();
    });
  });

  describe("Uso fora do contexto", () => {
    it("o cabeçalho sem ChainOfThought em volta lança erro explicando o problema", () => {
      const erroConsole = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<ChainOfThoughtHeader />)).toThrow(
        "ChainOfThought components must be used within ChainOfThought"
      );
      erroConsole.mockRestore();
    });
  });

  describe("Passo", () => {
    it("mostra o rótulo e a descrição do passo", () => {
      render(<ChainOfThoughtStep label="Analisando carteira" description="3 fundos encontrados" />);
      expect(screen.getByText("Analisando carteira")).toBeInTheDocument();
      expect(screen.getByText("3 fundos encontrados")).toBeInTheDocument();
    });

    it("sem descrição, não renderiza o bloco de descrição", () => {
      render(<ChainOfThoughtStep label="Analisando carteira" data-testid="passo" />);
      expect(screen.getByTestId("passo").querySelectorAll(".text-xs")).toHaveLength(0);
    });

    it("renderiza os filhos dentro do passo", () => {
      render(
        <ChainOfThoughtStep label="Pesquisando">
          <p>detalhe extra</p>
        </ChainOfThoughtStep>
      );
      expect(screen.getByText("detalhe extra")).toBeInTheDocument();
    });

    it.each([
      ["complete", "text-muted-foreground"],
      ["active", "text-foreground"],
      ["pending", "text-muted-foreground/50"],
    ] as const)("status %s aplica o estilo %s", (status, classe) => {
      render(<ChainOfThoughtStep label="Passo" status={status} data-testid="passo" />);
      expect(screen.getByTestId("passo")).toHaveClass(classe);
    });

    it("sem status, o passo é tratado como concluído", () => {
      render(<ChainOfThoughtStep label="Passo" data-testid="passo" />);
      expect(screen.getByTestId("passo")).toHaveClass("text-muted-foreground");
    });

    it("usa o ícone customizado no lugar do ponto padrão", () => {
      const { container } = render(<ChainOfThoughtStep label="Passo" icon={SearchIcon} />);
      expect(container.querySelector("svg.lucide-search")).toBeInTheDocument();
      expect(container.querySelector("svg.lucide-dot")).not.toBeInTheDocument();
    });

    it("sem ícone, usa o ponto padrão", () => {
      const { container } = render(<ChainOfThoughtStep label="Passo" />);
      expect(container.querySelector("svg.lucide-dot")).toBeInTheDocument();
    });
  });

  describe("Resultados de busca", () => {
    it("agrupa e mostra cada resultado como selo", () => {
      render(
        <ChainOfThoughtSearchResults data-testid="resultados">
          <ChainOfThoughtSearchResult>cvm.gov.br</ChainOfThoughtSearchResult>
          <ChainOfThoughtSearchResult>anbima.com.br</ChainOfThoughtSearchResult>
        </ChainOfThoughtSearchResults>
      );
      expect(screen.getByTestId("resultados")).toHaveTextContent("cvm.gov.br");
      expect(screen.getByText("anbima.com.br")).toBeInTheDocument();
    });
  });

  describe("Imagem", () => {
    it("mostra a imagem com a legenda", () => {
      render(
        <ChainOfThoughtImage caption="Gráfico de rentabilidade">
          <img src="/grafico.png" alt="Rentabilidade acumulada" />
        </ChainOfThoughtImage>
      );
      expect(screen.getByRole("img", { name: "Rentabilidade acumulada" })).toBeInTheDocument();
      expect(screen.getByText("Gráfico de rentabilidade")).toBeInTheDocument();
    });

    it("sem legenda, não renderiza parágrafo de legenda", () => {
      render(
        <ChainOfThoughtImage>
          <img src="/grafico.png" alt="Rentabilidade acumulada" />
        </ChainOfThoughtImage>
      );
      expect(screen.queryByText(/./, { selector: "p" })).not.toBeInTheDocument();
    });
  });
});
