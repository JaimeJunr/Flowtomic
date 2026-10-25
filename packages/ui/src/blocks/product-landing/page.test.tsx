import { render, screen, within } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import ProductLanding, { productLandingContent } from "./page";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("ProductLanding", () => {
  describe("Estrutura", () => {
    it("tem um h1 e um h2 por seção com título, na ordem da página", () => {
      render(<ProductLanding />);
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        productLandingContent.hero.title
      );
      const c = productLandingContent;
      const h2 = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
      expect(h2).toEqual([
        c.install.title,
        c.swap.title,
        c.comparison.title,
        c.day.title,
        c.numbers.title,
        c.upcoming.title,
        c.faq.title,
      ]);
    });

    it("expõe os landmarks banner, main e contentinfo", () => {
      render(<ProductLanding />);
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
  });

  describe("Conteúdo", () => {
    it("content customizado troca o título do hero", () => {
      render(
        <ProductLanding
          content={{
            ...productLandingContent,
            hero: { ...productLandingContent.hero, title: "Outro título" },
          }}
        />
      );
      expect(screen.getByRole("heading", { level: 1, name: "Outro título" })).toBeInTheDocument();
    });

    it("não aponta para o registry fora do ar em nenhum link", () => {
      const { container } = render(<ProductLanding />);
      const hrefs = [...container.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
      expect(hrefs.length).toBeGreaterThan(10);
      expect(hrefs.filter((h) => h?.includes("registry.flowtomic.dev"))).toEqual([]);
      expect(container.textContent).not.toContain("registry.flowtomic.dev");
    });

    it("lê as contagens do hero a partir do content", () => {
      render(<ProductLanding />);
      const hero = screen.getByRole("heading", { level: 1 }).closest("section") as HTMLElement;
      const strip = within(hero).getByLabelText("Tamanho da biblioteca");
      expect(strip).toHaveTextContent("155");
      expect(strip).toHaveTextContent("organisms");
    });
  });

  describe("Hero", () => {
    it("tem exatamente uma ação sólida", () => {
      render(<ProductLanding />);
      const hero = screen.getByRole("heading", { level: 1 }).closest("section") as HTMLElement;
      const solid = [...hero.querySelectorAll("a, button")].filter((el) =>
        el.className.includes("bg-primary")
      );
      expect(solid).toHaveLength(1);
      expect(solid[0]).toHaveTextContent("Começar");
      expect(within(hero).getByRole("link", { name: /Ver no GitHub/ })).toBeInTheDocument();
    });
  });
});
