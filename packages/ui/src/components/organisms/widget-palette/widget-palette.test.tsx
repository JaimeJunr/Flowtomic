import { DndContext } from "@dnd-kit/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { TrendingUp } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import type { WidgetPaletteItem } from "./widget-palette";
import { WidgetPalette } from "./widget-palette";

const widgets: WidgetPaletteItem[] = [
  {
    id: "stats",
    type: "stats",
    name: "Estatísticas",
    description: "Exibe métricas e estatísticas",
    icon: TrendingUp,
    defaultSize: { w: 4, h: 2 },
  },
  {
    id: "table",
    type: "table",
    name: "Tabela",
    description: "Exibe dados em formato tabular",
    icon: TrendingUp,
    defaultSize: { w: 6, h: 4 },
  },
  {
    id: "full",
    type: "full",
    name: "Painel completo",
    description: "Ocupa a largura inteira do dashboard",
    icon: TrendingUp,
    defaultSize: { w: 12, h: 6 },
  },
  {
    id: "kpi",
    type: "kpi",
    name: "Indicador",
    description: "Um número em destaque",
    icon: TrendingUp,
    defaultSize: { w: 3, h: 2 },
  },
  {
    id: "trend",
    type: "trend",
    name: "Tendência",
    description: "Evolução ao longo do tempo",
    icon: TrendingUp,
    defaultSize: { w: 8, h: 3 },
  },
];

// O jsdom não preenche isPrimary no PointerEvent e o PointerSensor do dnd-kit descarta o toque sem ele
function pressionarPonteiro(alvo: HTMLElement) {
  const evento = new PointerEvent("pointerdown", {
    bubbles: true,
    button: 0,
    clientX: 0,
    clientY: 0,
  });
  Object.defineProperty(evento, "isPrimary", { value: true });
  fireEvent(alvo, evento);
}

describe("WidgetPalette", () => {
  describe("Tamanho em palavra humana, não em jargão de grid", () => {
    it("nunca mostra o formato interno w × h", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    });

    it("largura 6 de 12 vira 'metade da largura' e 12 vira 'largura inteira'", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      expect(screen.getByText("metade da largura")).toBeInTheDocument();
      expect(screen.getByText("largura inteira")).toBeInTheDocument();
    });
  });

  describe("Lista densa, sem cartão repetido", () => {
    it("não mostra o rodapé com contagem de widgets", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      expect(screen.queryByText(/\d+ widgets? dispon[íi]ve/i)).not.toBeInTheDocument();
    });

    it("cada widget é uma linha, não um cartão com borda própria", () => {
      const { container } = render(<WidgetPalette isOpen widgets={widgets} />);
      expect(container.querySelectorAll(".border-2").length).toBe(0);
      expect(screen.getByText("Estatísticas")).toBeInTheDocument();
      expect(screen.getByText("Tabela")).toBeInTheDocument();
    });
  });

  describe("Estado vazio", () => {
    it("diz por que a lista está vazia, não 'Nenhum widget disponível'", () => {
      render(<WidgetPalette isOpen widgets={[]} />);
      expect(screen.getByText("Todos os widgets já estão no painel.")).toBeInTheDocument();
      expect(screen.queryByText("Nenhum widget disponível")).not.toBeInTheDocument();
    });
  });

  describe("Largura em palavras para cada faixa de tamanho", () => {
    it("largura 3 e 4 viram 'um terço da largura'", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      // stats (w=4) e kpi (w=3)
      expect(screen.getAllByText("um terço da largura")).toHaveLength(2);
    });

    it("largura 8 vira 'dois terços da largura'", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      expect(screen.getByText("dois terços da largura")).toBeInTheDocument();
    });
  });

  describe("Abertura e cabeçalho", () => {
    it("fechada, não renderiza nada", () => {
      const { container } = render(<WidgetPalette isOpen={false} widgets={widgets} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("usa o título e a descrição padrão em português", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      expect(screen.getByRole("heading", { name: "Widgets Disponíveis" })).toBeInTheDocument();
      expect(screen.getByText("Arraste widgets para adicionar ao dashboard")).toBeInTheDocument();
    });

    it("mostra título e descrição customizados no lugar dos padrões", () => {
      render(
        <WidgetPalette
          isOpen
          widgets={widgets}
          title="Adicionar ao painel"
          description="Escolha o que mostrar"
        />
      );
      expect(screen.getByRole("heading", { name: "Adicionar ao painel" })).toBeInTheDocument();
      expect(screen.getByText("Escolha o que mostrar")).toBeInTheDocument();
      expect(screen.queryByText("Widgets Disponíveis")).not.toBeInTheDocument();
    });

    it("aceita classe extra no contêiner sem perder o posicionamento fixo", () => {
      const { container } = render(<WidgetPalette isOpen widgets={widgets} className="w-96" />);
      expect(container.firstElementChild).toHaveClass("w-96", "fixed");
    });
  });

  describe("Fechar", () => {
    it("sem onClose, não oferece o botão de fechar", () => {
      render(<WidgetPalette isOpen widgets={widgets} />);
      expect(screen.queryByRole("button", { name: "Fechar paleta" })).not.toBeInTheDocument();
    });

    it("com onClose, o botão 'Fechar paleta' chama o callback ao clicar", async () => {
      const onClose = vi.fn();
      render(<WidgetPalette isOpen widgets={widgets} onClose={onClose} />);

      await userEvent.setup().click(screen.getByRole("button", { name: "Fechar paleta" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("o botão de fechar também responde ao teclado", async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<WidgetPalette isOpen widgets={widgets} onClose={onClose} />);

      await user.tab();
      expect(screen.getByRole("button", { name: "Fechar paleta" })).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Arrastar um widget", () => {
    it("enquanto arrasta, a linha acompanha o ponteiro e fica translúcida", async () => {
      render(
        <DndContext>
          <WidgetPalette isOpen widgets={widgets} />
        </DndContext>
      );
      const linha = screen.getByRole("button", { name: /Tabela/ });

      expect(linha.style.transform).toBe("");

      pressionarPonteiro(linha);
      await act(async () => {
        fireEvent.pointerMove(linha, { clientX: 20, clientY: 0 });
      });
      await act(async () => {
        fireEvent.pointerMove(linha, { clientX: 60, clientY: 30 });
      });

      expect(linha.style.transform).toBe("translate3d(60px, 30px, 0)");
      expect(linha).toHaveClass("opacity-50");
    });

    it("ao soltar, a linha volta ao lugar e deixa de ficar translúcida", async () => {
      render(
        <DndContext>
          <WidgetPalette isOpen widgets={widgets} />
        </DndContext>
      );
      const linha = screen.getByRole("button", { name: /Tabela/ });

      pressionarPonteiro(linha);
      await act(async () => {
        fireEvent.pointerMove(linha, { clientX: 20, clientY: 0 });
      });
      await act(async () => {
        fireEvent.pointerUp(linha, { clientX: 20, clientY: 0 });
      });

      expect(linha.style.transform).toBe("");
      expect(linha).not.toHaveClass("opacity-50");
    });

    it("cada widget da lista é um item arrastável com nome acessível", () => {
      render(
        <DndContext>
          <WidgetPalette isOpen widgets={widgets} />
        </DndContext>
      );
      expect(screen.getByRole("button", { name: /Estatísticas/ })).toHaveAttribute(
        "aria-roledescription"
      );
      expect(screen.getAllByRole("button")).toHaveLength(widgets.length);
    });
  });

  describe("Acessibilidade", () => {
    it("não tem violações de acessibilidade", async () => {
      const { container } = render(
        <DndContext>
          <WidgetPalette isOpen widgets={widgets} onClose={() => {}} />
        </DndContext>
      );

      const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
      expect(results.violations).toEqual([]);
    });
  });
});
