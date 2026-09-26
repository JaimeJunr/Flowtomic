import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
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
});
