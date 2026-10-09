import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GlitchText, glitchCuts, LAYER_SEEDS, toClipPath } from "./glitch-text";

const LAYER = '[data-slot="glitch-text-layer"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const layersOf = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>(LAYER)];
const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="glitch-text"]') as HTMLElement;

describe("GlitchText", () => {
  it("o texto é acessível uma vez e há 2 camadas aria-hidden", () => {
    const { container } = render(<GlitchText>Conciliação</GlitchText>);
    expect(screen.getAllByText("Conciliação")).toHaveLength(3);
    const layers = layersOf(container);
    expect(layers).toHaveLength(2);
    for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.queryAllByText("Conciliação").filter((n) => !n.closest("[aria-hidden]"))
    ).toHaveLength(1);
  });

  it("as camadas usam as cores dos tokens por padrão", () => {
    const { container } = render(<GlitchText>Saldo</GlitchText>);
    const [a, b] = layersOf(container);
    expect(a).toHaveClass("text-primary");
    expect(b).toHaveClass("text-info");
  });

  it("chromatic=false não usa a cor dos tokens nas camadas", () => {
    const { container } = render(<GlitchText chromatic={false}>Saldo</GlitchText>);
    for (const layer of layersOf(container)) {
      expect(layer.className).not.toMatch(/primary|info/);
      expect(layer).toHaveClass("text-current");
    }
  });

  it("trigger=hover: camadas ocultas até pointerenter e focus", () => {
    const { container } = render(<GlitchText trigger="hover">Saldo</GlitchText>);
    const root = rootOf(container);
    const active = () => layersOf(container).map((l) => l.getAttribute("data-active"));
    expect(active()).toEqual(["false", "false"]);
    fireEvent.pointerEnter(root);
    expect(active()).toEqual(["true", "true"]);
    fireEvent.pointerLeave(root);
    expect(active()).toEqual(["false", "false"]);
    fireEvent.focus(root);
    expect(active()).toEqual(["true", "true"]);
    fireEvent.blur(root);
    expect(active()).toEqual(["false", "false"]);
  });

  it("trigger=always mantém as camadas ativas", () => {
    const { container } = render(<GlitchText>Saldo</GlitchText>);
    expect(layersOf(container).map((l) => l.getAttribute("data-active"))).toEqual(["true", "true"]);
  });

  it("com movimento reduzido não há camadas", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <GlitchText>Saldo</GlitchText>
      </MotionConfig>
    );
    expect(layersOf(container)).toHaveLength(0);
    expect(screen.getByText("Saldo")).toBeInTheDocument();
  });

  it("glitchCuts é determinística e varia com a semente", () => {
    expect(glitchCuts(1)).toEqual(glitchCuts(1));
    expect(glitchCuts(1)).not.toEqual(glitchCuts(2));
    expect(glitchCuts(1)).toHaveLength(12);
  });

  it("glitchCuts: ~25% dos quadros visíveis, em rajada, com faixas de 4% a 22%", () => {
    for (const seed of [1, 2, 11, 29, 77]) {
      const cuts = glitchCuts(seed);
      const visible = cuts.flatMap((cut, index) => (cut ? [index] : []));
      expect(visible.length / cuts.length).toBeCloseTo(0.25, 1);
      // Rajada contínua: os quadros visíveis são vizinhos.
      expect(visible[visible.length - 1] - visible[0]).toBe(visible.length - 1);
      for (const [top, bottom] of cuts.filter((cut) => cut !== null)) {
        const height = 100 - top - bottom;
        expect(top).toBeGreaterThanOrEqual(0);
        expect(bottom).toBeGreaterThanOrEqual(0);
        expect(height).toBeGreaterThanOrEqual(4);
        expect(height).toBeLessThanOrEqual(22);
      }
    }
  });

  it("as duas camadas compartilham a janela da rajada (3 de 12), com faixas diferentes", () => {
    const [first, second] = LAYER_SEEDS.map((seed) => glitchCuts(seed));
    const visible = (cuts: typeof first) => cuts.flatMap((cut, index) => (cut ? [index] : []));
    expect(visible(first)).toEqual(visible(second));
    expect(visible(first)).toHaveLength(3);
    expect(first).not.toEqual(second);
  });

  it("toClipPath monta o inset", () => {
    expect(toClipPath([10, 20])).toBe("inset(10% 0 20% 0)");
    expect(toClipPath(null)).toBe("inset(0% 0 100% 0)");
  });

  it("expõe ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <GlitchText ref={ref} className="text-primary" id="alvo">
        Saldo
      </GlitchText>
    );
    expect(ref.current).toHaveAttribute("data-slot", "glitch-text");
    expect(ref.current).toHaveClass("text-primary", "relative", "inline-block");
    expect(ref.current).toHaveAttribute("id", "alvo");
  });
});
