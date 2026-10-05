import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildGradient, DEFAULT_COLORS, GradientText, resolveAngle } from "./gradient-text";

const FILL = '[data-slot="gradient-text-fill"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const fillImage = (container: HTMLElement) =>
  (container.querySelector(FILL) as HTMLElement).style.backgroundImage;

describe("GradientText", () => {
  it("renderiza o texto como texto normal, sem aria-hidden", () => {
    const { container } = render(<GradientText>Faturamento em tempo real</GradientText>);
    expect(screen.getByText("Faturamento em tempo real")).toBeVisible();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("o background-image contém as cores passadas com o ângulo de cada direção", () => {
    const colors = ["red", "blue", "green"];
    const cases = [
      ["horizontal", "90deg"],
      ["vertical", "180deg"],
      ["diagonal", "135deg"],
    ] as const;
    for (const [direction, angle] of cases) {
      const { container, unmount } = render(
        <GradientText colors={colors} direction={direction}>
          Texto
        </GradientText>
      );
      const image = fillImage(container);
      expect(image).toContain(`${angle}`);
      for (const color of colors) expect(image).toContain(color);
      unmount();
    }
  });

  it("o padrão usa só tokens do tema, sem hex nem rgb", () => {
    const { container } = render(<GradientText>Texto</GradientText>);
    const image = fillImage(container);
    expect(image).toContain("var(--primary)");
    expect(image).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(/i);
    expect(DEFAULT_COLORS.join(" ")).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(/i);
  });

  // Decisão de 05/10/2026: degradê só em tons da marca (Urucum), sem passar pela tinta do texto.
  it("o padrão vai e volta entre tons da marca", () => {
    expect(DEFAULT_COLORS).toEqual([
      "var(--primary)",
      "var(--primary-hover)",
      "var(--accent-hover)",
      "var(--primary)",
    ]);
  });

  it("recorta o degradê no texto e amplia o fundo em 300% na direção do movimento", () => {
    const { container, rerender } = render(<GradientText>Texto</GradientText>);
    const fill = container.querySelector(FILL) as HTMLElement;
    expect(fill).toHaveClass("bg-clip-text", "text-transparent");
    expect(fill.style.backgroundSize).toBe("300% 100%");
    rerender(<GradientText direction="vertical">Texto</GradientText>);
    expect(fill.style.backgroundSize).toBe("100% 300%");
  });

  it("sem bordered não há moldura; com bordered ela aparece", () => {
    const { container, rerender } = render(<GradientText>Texto</GradientText>);
    expect(container.querySelector('[data-slot="gradient-text-border"]')).toBeNull();
    rerender(<GradientText bordered>Texto</GradientText>);
    const border = container.querySelector('[data-slot="gradient-text-border"]');
    expect(border).toBeInTheDocument();
    expect(container.querySelector('[data-slot="gradient-text"]')).toHaveClass("rounded-full");
  });

  it("com movimento reduzido o degradê fica parado", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <GradientText>Texto</GradientText>
      </MotionConfig>
    );
    expect(container.querySelector('[data-slot="gradient-text"]')).toHaveAttribute(
      "data-animated",
      "false"
    );
  });

  it("anima por padrão", () => {
    const { container } = render(<GradientText>Texto</GradientText>);
    expect(container.querySelector('[data-slot="gradient-text"]')).toHaveAttribute(
      "data-animated",
      "true"
    );
  });

  it("pauseOnHover pausa no pointerenter e retoma no pointerleave", () => {
    const { container } = render(<GradientText pauseOnHover>Texto</GradientText>);
    const root = container.querySelector('[data-slot="gradient-text"]') as HTMLElement;
    expect(root).toHaveAttribute("data-paused", "false");
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-paused", "true");
    fireEvent.pointerLeave(root);
    expect(root).toHaveAttribute("data-paused", "false");
  });

  it("sem pauseOnHover o hover não pausa", () => {
    const { container } = render(<GradientText>Texto</GradientText>);
    const root = container.querySelector('[data-slot="gradient-text"]') as HTMLElement;
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-paused", "false");
  });

  it("expõe ref, className e props nativas na raiz", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <GradientText ref={ref} className="text-4xl" id="destaque">
        Texto
      </GradientText>
    );
    expect(ref.current).toHaveAttribute("data-slot", "gradient-text");
    expect(ref.current).toHaveClass("text-4xl");
    expect(ref.current).toHaveAttribute("id", "destaque");
  });

  it("menos de duas cores lança erro com o valor recebido", () => {
    expect(() => buildGradient(["red"], "horizontal")).toThrow(/received \["red"\]/);
  });

  it("resolveAngle mapeia cada direção", () => {
    expect(resolveAngle("horizontal")).toBe(90);
    expect(resolveAngle("vertical")).toBe(180);
    expect(resolveAngle("diagonal")).toBe(135);
  });
});
