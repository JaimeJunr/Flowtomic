import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PullSendButton } from "./pull-send-button";
import { bandWidth, burst, isLoaded, resistPull } from "./pull-send-button-utils";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const PARTICLE = '[data-slot="pull-send-button-particle"]';

function setup(props: Partial<React.ComponentProps<typeof PullSendButton>> = {}, reduced = false) {
  const onSend = vi.fn();
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <PullSendButton onSend={onSend} {...props} />
    </MotionConfig>
  );
  return { ...view, onSend, button: screen.getByRole("button", { name: "Enviar" }) };
}

function pull(button: HTMLElement, dx: number, dy = 0) {
  fireEvent.pointerDown(button, { clientX: 100, clientY: 100, pointerId: 1, button: 0 });
  fireEvent.pointerMove(button, { clientX: 100 + dx, clientY: 100 + dy, pointerId: 1 });
  fireEvent.pointerUp(button, { clientX: 100 + dx, clientY: 100 + dy, pointerId: 1 });
}

describe("funções puras", () => {
  it("resistPull: perto é quase linear", () => {
    const { distance } = resistPull(10, 0, 140, "any");
    expect(distance).toBeGreaterThan(9.5);
    expect(distance).toBeLessThanOrEqual(10);
  });

  it("resistPull: longe nunca passa de maxPull", () => {
    const { distance } = resistPull(5000, 5000, 140, "any");
    expect(distance).toBeLessThanOrEqual(140);
    expect(distance).toBeGreaterThan(130);
  });

  it("resistPull: o eixo reduz o outro componente a 15%", () => {
    const free = resistPull(40, 40, 1000, "any");
    const horizontal = resistPull(40, 40, 1000, "horizontal");
    expect(horizontal.y / horizontal.x).toBeCloseTo(0.15);
    expect(free.y / free.x).toBeCloseTo(1);
    const vertical = resistPull(40, 40, 1000, "vertical");
    expect(vertical.x / vertical.y).toBeCloseTo(0.15);
  });

  it("resistPull: puxão nulo fica parado e maxPull inválido lança com o valor", () => {
    expect(resistPull(0, 0, 140, "any")).toEqual({ x: 0, y: 0, distance: 0 });
    expect(() => resistPull(1, 1, 0, "any")).toThrow("received maxPull 0");
  });

  it("bandWidth diminui com a distância e tem mínimo de 1px", () => {
    expect(bandWidth(0, 140)).toBeGreaterThan(bandWidth(70, 140));
    expect(bandWidth(140, 140)).toBe(1);
    expect(bandWidth(9999, 140)).toBe(1);
    expect(() => bandWidth(1, -5)).toThrow("received maxPull -5");
  });

  it("isLoaded vale a partir de armAt", () => {
    expect(isLoaded(47.9, 48)).toBe(false);
    expect(isLoaded(48, 48)).toBe(true);
  });

  it("burst: quantidade, ângulos no cone e alcance", () => {
    const values = [0, 1, 0.5];
    let i = 0;
    const rng = () => values[i++ % values.length];
    const items = burst(6, -90, 60, 100, rng);
    expect(items).toHaveLength(6);
    for (const item of items) {
      expect(item.angle).toBeGreaterThanOrEqual(-120);
      expect(item.angle).toBeLessThanOrEqual(-60);
      expect(item.distance).toBeGreaterThanOrEqual(50);
      expect(item.distance).toBeLessThanOrEqual(100);
    }
    expect(items[0].angle).toBe(-120);
  });

  it("burst: 0 partículas é vazio e contagem inválida lança com o valor", () => {
    expect(burst(0, 0, 60, 100, Math.random)).toEqual([]);
    expect(() => burst(-1, 0, 60, 100, Math.random)).toThrow("received count -1");
  });
});

describe("PullSendButton", () => {
  it("renderiza botão com data-slot na raiz e rótulo padrão", () => {
    const { container, button } = setup();
    expect(button).toHaveAttribute("type", "button");
    const root = container.querySelector('[data-slot="pull-send-button"]');
    expect(root).toHaveAttribute("data-loaded", "false");
    expect(root).toContainElement(button);
  });

  it("clique envia", async () => {
    const { onSend, button } = setup();
    await userEvent.click(button);
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("tapSends=false não envia no clique, mas Enter envia", async () => {
    const { onSend, button } = setup({ tapSends: false });
    await userEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("arrasto além de armAt envia uma vez e cria partículas", () => {
    const { onSend, button, container } = setup({ particles: 5 });
    pull(button, 100);
    fireEvent.click(button);
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll(PARTICLE)).toHaveLength(5);
  });

  it("arrasto antes de armAt não envia nem solta partículas", () => {
    const { onSend, button, container } = setup();
    pull(button, 20);
    fireEvent.click(button);
    expect(onSend).not.toHaveBeenCalled();
    expect(container.querySelectorAll(PARTICLE)).toHaveLength(0);
  });

  it("particles=0 envia sem partículas", () => {
    const { onSend, button, container } = setup({ particles: 0 });
    pull(button, 100);
    expect(onSend).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll(PARTICLE)).toHaveLength(0);
  });

  it("marca data-loaded enquanto o puxão passa de armAt", () => {
    const { button, container } = setup();
    fireEvent.pointerDown(button, { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(button, { clientX: 0, clientY: 120, pointerId: 1 });
    const root = container.querySelector('[data-slot="pull-send-button"]');
    expect(root).toHaveAttribute("data-loaded", "true");
    expect(container.querySelector('[data-slot="pull-send-button-band"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="pull-send-button-arc"]')).toBeInTheDocument();
    fireEvent.pointerUp(button, { clientX: 0, clientY: 120, pointerId: 1 });
    expect(root).toHaveAttribute("data-loaded", "false");
  });

  it("axis horizontal ignora puxão vertical (não carrega)", () => {
    const { onSend, button } = setup({ axis: "horizontal" });
    pull(button, 0, 100);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disabled ignora clique e arrasto", async () => {
    const { onSend, button } = setup({ disabled: true });
    await userEvent.click(button);
    pull(button, 100);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("movimento reduzido: clique envia sem partículas e arrasto não envia", async () => {
    const { onSend, button, container } = setup({}, true);
    await userEvent.click(button);
    expect(onSend).toHaveBeenCalledTimes(1);
    pull(button, 100);
    expect(container.querySelectorAll(PARTICLE)).toHaveLength(0);
  });

  it("repassa ref ao botão, className e aria-label", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <PullSendButton ref={ref} onSend={() => {}} className="extra" aria-label="Mandar">
        x
      </PullSendButton>
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Mandar" }));
    expect(ref.current).toHaveClass("extra");
  });

  it("limpa as partículas depois do voo", () => {
    vi.useFakeTimers();
    const { button, container } = setup({ particles: 3 });
    pull(button, 100);
    expect(container.querySelectorAll(PARTICLE)).toHaveLength(3);
    act(() => void vi.advanceTimersByTime(2000));
    expect(container.querySelectorAll(PARTICLE)).toHaveLength(0);
    vi.useRealTimers();
  });
});
