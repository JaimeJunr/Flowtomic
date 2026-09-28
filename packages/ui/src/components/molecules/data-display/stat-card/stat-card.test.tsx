import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { StatCard } from "./stat-card";

// SlidingNumber (via motion/react) usa IntersectionObserver para animar quando entra na tela.
// jsdom não implementa isso, então precisa de um stub mínimo só para este teste.
beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

const receita = { title: "Receita total", value: 121890, prefix: "R$ ", locale: "pt-BR" };

describe("StatCard", () => {
  describe("Título (eyebrow) sem caixa alta forçada", () => {
    it("renderiza o título em texto normal, sem uppercase/tracking", () => {
      render(<StatCard title="Receita total" value={1000} />);
      const title = screen.getByText("Receita total");
      expect(title.className).not.toMatch(/\buppercase\b/);
      expect(title.className).not.toMatch(/tracking-(wide|wider|widest)\b/);
    });

    it("mantém o título truncado em uma linha", () => {
      render(<StatCard title="Receita total" value={1000} />);
      expect(screen.getByText("Receita total").className).toMatch(/truncate/);
    });
  });

  describe("Métrica no padrão do stats-grid (DESIGN.md)", () => {
    it("o valor sai inteiro, em mono e na cor do texto, mesmo com color", () => {
      render(<StatCard {...receita} color="success" />);
      const value = screen.getByText("R$ 121.890");
      expect(value.className).toMatch(/font-mono/);
      expect(value.className).not.toMatch(/text-(primary|success|warning|error|destructive)/);
    });

    it("variação boa é verde, com seta e contexto do mês anterior", () => {
      render(<StatCard {...receita} lastMonth={105922} />);
      expect(screen.getByText("↑ 15,1%").className).toMatch(/text-success/);
      expect(screen.getByText("sobre R$ 105.922")).toBeInTheDocument();
    });

    it("quando subir é ruim (positive: false), a alta fica vermelha", () => {
      render(<StatCard title="Builds com falha" value={7} delta={40} positive={false} />);
      expect(screen.getByText("↑ 40%").className).toMatch(/text-destructive/);
    });

    it("não cresce nem ganha sombra no hover", () => {
      const { container } = render(<StatCard {...receita} />);
      expect((container.firstChild as HTMLElement).className).not.toMatch(
        /hover:(shadow|scale)|shadow-/
      );
    });
  });

  describe("Menu de ações", () => {
    it("o botão fica visível sem depender do hover e tem nome acessível", async () => {
      const onPin = vi.fn();
      render(<StatCard {...receita} showActions onPin={onPin} onAddAlert={() => {}} />);
      await userEvent.click(screen.getByRole("button", { name: "Mais opções" }));
      expect(await screen.findByRole("menuitem", { name: "Adicionar alerta" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("menuitem", { name: "Fixar no painel" }));
      expect(onPin).toHaveBeenCalledTimes(1);
    });

    it("sem showActions não há botão de ações", () => {
      render(<StatCard {...receita} />);
      expect(screen.queryByRole("button", { name: "Mais opções" })).not.toBeInTheDocument();
    });
  });
});
