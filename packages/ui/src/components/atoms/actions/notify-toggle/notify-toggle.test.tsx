import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NotifyToggle } from "./notify-toggle";
import { ringKeyframes } from "./notify-toggle-utils";

const ROOT = '[data-slot="notify-toggle"]';
const WAVE = '[data-slot="notify-toggle-wave"]';
const BADGE = '[data-slot="notify-toggle-badge"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<React.ComponentProps<typeof NotifyToggle>> = {}, reduced = false) {
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <NotifyToggle {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLButtonElement;
  return { ...view, root };
}

describe("ringKeyframes", () => {
  it("começa e termina em 0 e alterna o sinal", () => {
    const frames = ringKeyframes(17, 5, 1);
    expect(frames).toHaveLength(7);
    expect(frames[0]).toBe(0);
    expect(frames[frames.length - 1]).toBe(0);
    expect(frames[1]).toBe(17);
    expect(frames[2]).toBeLessThan(0);
    expect(frames[3]).toBeGreaterThan(0);
  });

  it("a amplitude decresce com decay 1", () => {
    const mags = ringKeyframes(20, 4, 1)
      .slice(1, -1)
      .map((v) => Math.abs(v));
    expect(mags).toEqual([20, 15, 10, 5]);
  });

  it("decay 2 deixa a segunda já pequena", () => {
    const [, first, second] = ringKeyframes(20, 4, 2);
    expect(Math.abs(second)).toBeCloseTo(20 * 0.75 ** 2);
    expect(first).toBe(20);
  });

  it("passes 0 devolve só [0]", () => {
    expect(ringKeyframes(17, 0, 1)).toEqual([0]);
  });

  it("rejeita passes inválido com o valor recebido", () => {
    expect(() => ringKeyframes(17, -1, 1)).toThrow(/received passes -1/);
  });
});

describe("NotifyToggle", () => {
  it("clique liga, chama onPressedChange e desliga de novo", () => {
    const onPressedChange = vi.fn();
    const { root } = setup({ onPressedChange });
    expect(root).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it("mantém os dois rótulos no DOM e esconde o inativo", () => {
    const { root } = setup();
    const off = root.querySelector('[data-slot="notify-toggle-label-off"]');
    const on = root.querySelector('[data-slot="notify-toggle-label-on"]');
    expect(off).toHaveTextContent("Avise-me");
    expect(on).toHaveTextContent("Você será avisado");
    expect(on).toHaveAttribute("aria-hidden", "true");
    expect(off).not.toHaveAttribute("aria-hidden");
    fireEvent.click(root);
    expect(off).toHaveAttribute("aria-hidden", "true");
    expect(on).not.toHaveAttribute("aria-hidden");
  });

  it("o nome acessível não muda entre estados", () => {
    setup();
    expect(screen.getByRole("button", { name: "Avise-me" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button", { name: "Avise-me" })).toBeInTheDocument();
  });

  it("usa aria-label quando vem", () => {
    setup({ "aria-label": "Avisar sobre o relatório" });
    expect(screen.getByRole("button", { name: "Avisar sobre o relatório" })).toBeInTheDocument();
  });

  it("anuncia o onLabel ao ligar", () => {
    const { container, root } = setup();
    const live = container.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(live).toHaveTextContent("");
    fireEvent.click(root);
    expect(live).toHaveTextContent("Você será avisado");
  });

  it("mostra o badge com count ligado e esconde desligado", () => {
    const { container, root } = setup({ count: 3 });
    expect(container.querySelector(BADGE)).toBeNull();
    fireEvent.click(root);
    expect(container.querySelector(BADGE)).toHaveTextContent("3");
    fireEvent.click(root);
    expect(container.querySelector(BADGE)).toBeNull();
  });

  it("showBadge=false nunca mostra o badge", () => {
    const { container } = setup({ count: 3, showBadge: false, defaultPressed: true });
    expect(container.querySelector(BADGE)).toBeNull();
  });

  it("não balança nem emite ondas quando pressed muda por fora", () => {
    const { container, rerender } = setup({ pressed: false });
    rerender(
      <MotionConfig reducedMotion="never">
        <NotifyToggle pressed />
      </MotionConfig>
    );
    expect(container.querySelector(WAVE)).toBeNull();
  });

  it("emite ondas ao ligar por clique", () => {
    const { container, root } = setup();
    expect(container.querySelector(WAVE)).toBeNull();
    fireEvent.click(root);
    expect(container.querySelectorAll(WAVE).length).toBeGreaterThanOrEqual(1);
  });

  it("waves=false não renderiza ondas", () => {
    const { container, root } = setup({ waves: false });
    fireEvent.click(root);
    expect(container.querySelector(WAVE)).toBeNull();
  });

  it("movimento reduzido não renderiza ondas, mas troca o estado", () => {
    const { container, root } = setup({}, true);
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(WAVE)).toBeNull();
  });

  it("emite ondas quando count aumenta estando ligado", () => {
    const { container, rerender } = setup({ defaultPressed: true, count: 1 });
    expect(container.querySelector(WAVE)).toBeNull();
    rerender(
      <MotionConfig reducedMotion="never">
        <NotifyToggle defaultPressed count={2} />
      </MotionConfig>
    );
    expect(container.querySelectorAll(WAVE).length).toBeGreaterThanOrEqual(1);
    expect(container.querySelector(BADGE)).toHaveTextContent("2");
  });

  it("disabled não alterna", () => {
    const onPressedChange = vi.fn();
    const { root } = setup({ disabled: true, onPressedChange });
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLButtonElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
  });

  it("aplica a altura de cada tamanho", () => {
    const { root } = setup({ size: "lg" });
    expect(root).toHaveClass("h-12");
  });
});
