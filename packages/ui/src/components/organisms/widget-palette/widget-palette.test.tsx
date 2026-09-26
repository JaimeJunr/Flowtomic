import { render, screen } from "@testing-library/react";
import { TrendingUp } from "lucide-react";
import { describe, expect, it } from "vitest";
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
];

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
});
