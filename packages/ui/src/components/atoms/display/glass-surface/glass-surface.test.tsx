import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { GlassSurface, type GlassSurfaceProps } from "./glass-surface";

const ROOT = '[data-slot="glass-surface"]';

function setup(props: GlassSurfaceProps = {}) {
  const view = render(<GlassSurface {...props}>Carteiras</GlassSurface>);
  const root = view.container.querySelector(ROOT) as HTMLElement;
  return { ...view, root };
}

describe("GlassSurface", () => {
  it("renderiza os filhos dentro do conteúdo", () => {
    const { root } = setup();
    const content = root.querySelector('[data-slot="glass-surface-content"]');
    expect(content).toHaveTextContent("Carteiras");
    expect(content).toHaveClass("relative", "z-10");
  });

  it("cai no modo fallback no jsdom e aplica o vidro fosco", () => {
    const { root } = setup({ blur: 8, saturation: 1.4 });
    expect(root).toHaveAttribute("data-mode", "fallback");
    expect(root).toHaveClass("bg-background/40", "shadow-inner");
    expect(root.style.backdropFilter).toContain("blur(8px)");
    expect(root.style.backdropFilter).not.toContain("url(");
  });

  it("monta o filtro com três feDisplacementMap nas escalas certas", () => {
    const { container } = setup({ distortion: -100, chroma: 5 });
    const filter = container.querySelector('[data-slot="glass-surface-filter"]') as SVGElement;
    expect(filter).toHaveAttribute("aria-hidden", "true");
    const scales = [...filter.querySelectorAll("feDisplacementMap")].map((el) =>
      el.getAttribute("scale")
    );
    expect(scales).toEqual(["-100", "-95", "-90"]);
    expect(filter.querySelector("feBlend")).toHaveAttribute("mode", "screen");
  });

  it("gera id de filtro sem dois-pontos", () => {
    const { container } = setup();
    const id = container.querySelector("filter")?.getAttribute("id") ?? "";
    expect(id).not.toBe("");
    expect(id).not.toContain(":");
  });

  it("vira frost em opacidade do véu e radius em border-radius", () => {
    const { root } = setup({ frost: 0.3, radius: 32 });
    const frost = root.querySelector('[data-slot="glass-surface-frost"]') as HTMLElement;
    expect(frost.style.opacity).toBe("0.3");
    expect(frost).toHaveClass("pointer-events-none");
    expect(root.style.borderRadius).toBe("32px");
  });

  it("expõe ref, className e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "barra" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "isolate", "overflow-hidden");
    expect(root).toHaveAttribute("id", "barra");
  });
});
