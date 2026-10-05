import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { advanceSpeed, CircularText, charAngle, hoverSpeed } from "./circular-text";

const CHAR = '[data-slot="circular-text-char"]';
const TEXT = "novo · desde 2024 · ";

const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="circular-text"]') as HTMLElement;

describe("CircularText", () => {
  it("renderiza um caractere para cada caractere do texto, inclusive espaços", () => {
    const { container } = render(<CircularText text={TEXT} />);
    expect(container.querySelectorAll(CHAR)).toHaveLength(Array.from(TEXT).length);
  });

  it("o ângulo do caractere i é i * 360 / N", () => {
    expect(charAngle(0, 12)).toBe(0);
    expect(charAngle(3, 12)).toBe(90);
    expect(charAngle(5, 8)).toBe(225);
  });

  it("aplica o ângulo de cada caractere como rotação", () => {
    const { container } = render(<CircularText text="abcd" />);
    const chars = container.querySelectorAll<HTMLElement>(CHAR);
    expect(chars[1]?.style.transform).toBe("rotate(90deg)");
    expect(chars[3]?.style.transform).toBe("rotate(270deg)");
  });

  it("é uma imagem com o nome acessível igual ao texto e esconde os caracteres", () => {
    const { container } = render(<CircularText text={TEXT} />);
    expect(screen.getByRole("img", { name: TEXT.trim() })).toBe(rootOf(container));
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("children fica fora da camada que gira", () => {
    const { container } = render(
      <CircularText text={TEXT}>
        <span data-testid="centro">selo</span>
      </CircularText>
    );
    const spinner = container.querySelector('[data-slot="circular-text-spinner"]') as HTMLElement;
    expect(spinner).toBeInTheDocument();
    expect(spinner).not.toContainElement(screen.getByTestId("centro"));
    expect(rootOf(container)).toContainElement(screen.getByTestId("centro"));
  });

  it("size define largura e altura, com 160 por padrão", () => {
    const { container, rerender } = render(<CircularText text={TEXT} />);
    expect(rootOf(container)).toHaveStyle({ width: "160px", height: "160px" });
    rerender(<CircularText text={TEXT} size={240} />);
    expect(rootOf(container)).toHaveStyle({ width: "240px", height: "240px" });
  });

  it("texto vazio lança erro com o valor recebido e o formato esperado", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<CircularText text="" />)).toThrow(
      /received "".*expected non-empty string/
    );
    spy.mockRestore();
  });

  it("gira por padrão", () => {
    const { container } = render(<CircularText text={TEXT} />);
    expect(rootOf(container)).toHaveAttribute("data-spinning", "true");
  });

  it("com movimento reduzido fica parado, mesmo com hover", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <CircularText text={TEXT} onHover="fast" />
      </MotionConfig>
    );
    const root = rootOf(container);
    expect(root).toHaveAttribute("data-spinning", "false");
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-spinning", "false");
  });

  it("onHover=pause pausa no pointerenter e retoma no pointerleave", () => {
    const { container } = render(<CircularText text={TEXT} onHover="pause" />);
    const root = rootOf(container);
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-spinning", "false");
    fireEvent.pointerLeave(root);
    expect(root).toHaveAttribute("data-spinning", "true");
  });

  it("onHover=slow e fast não pausam", () => {
    const { container } = render(<CircularText text={TEXT} onHover="slow" />);
    const root = rootOf(container);
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-spinning", "true");
  });

  it("hoverSpeed devolve o fator de cada modo e 1 fora do hover", () => {
    expect(hoverSpeed("none", true)).toBe(1);
    expect(hoverSpeed("slow", true)).toBe(0.25);
    expect(hoverSpeed("fast", true)).toBe(4);
    expect(hoverSpeed("pause", true)).toBe(0);
    expect(hoverSpeed("pause", false)).toBe(1);
  });

  it("advanceSpeed aproxima da meta sem pular nem ultrapassar", () => {
    const next = advanceSpeed(1, 4, 16);
    expect(next).toBeGreaterThan(1);
    expect(next).toBeLessThan(4);
    expect(advanceSpeed(4, 4, 16)).toBe(4);
  });

  it("expõe ref, className e props nativas na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CircularText text={TEXT} ref={ref} className="text-primary" id="selo" />);
    expect(ref.current).toHaveAttribute("data-slot", "circular-text");
    expect(ref.current).toHaveClass("text-primary");
    expect(ref.current).toHaveAttribute("id", "selo");
  });
});
