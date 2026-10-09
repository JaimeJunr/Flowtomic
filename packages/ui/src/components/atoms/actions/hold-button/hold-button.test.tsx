import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fillClipPath, HoldButton, holdProgress, releaseProgress } from "./hold-button";

const ROOT = '[data-slot="hold-button"]';
const WAVE = '[data-slot="hold-button-wave"]';

class FakeCompletionHandler {
  calls = 0;
  handle = () => {
    this.calls += 1;
  };
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function setup(props: Partial<React.ComponentProps<typeof HoldButton>> = {}) {
  const handler = new FakeCompletionHandler();
  const view = render(
    <MotionConfig reducedMotion="never">
      <HoldButton doneLabel="Conciliação excluída" onHoldComplete={handler.handle} {...props}>
        Segure para excluir a conciliação
      </HoldButton>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLButtonElement;
  return { ...view, root, handler };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "Date",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("holdProgress cresce linear e fica limitado em 0..1", () => {
    expect(holdProgress(0, 1000)).toBe(0);
    expect(holdProgress(500, 1000)).toBe(0.5);
    expect(holdProgress(5000, 1000)).toBe(1);
    expect(holdProgress(-10, 1000)).toBe(0);
  });

  it("holdProgress continua de onde o líquido estava", () => {
    expect(holdProgress(250, 1000, 0.5)).toBe(0.75);
  });

  it("releaseProgress volta de from até 0 com ease-out", () => {
    expect(releaseProgress(0.8, 0, 200)).toBeCloseTo(0.8);
    expect(releaseProgress(0.8, 200, 200)).toBe(0);
    expect(releaseProgress(0.8, 100, 200)).toBeLessThan(0.4);
  });

  it("fillClipPath recorta por direção", () => {
    expect(fillClipPath(0.25, "right")).toBe("inset(0 75% 0 0)");
    expect(fillClipPath(0.25, "up")).toBe("inset(75% 0 0 0)");
    expect(fillClipPath(1, "right")).toBe("inset(0 0% 0 0)");
  });

  it("holdProgress rejeita holdMs inválido com o valor recebido", () => {
    expect(() => holdProgress(10, 0)).toThrow("received holdMs 0");
  });
});

describe("HoldButton", () => {
  it("segurar por holdMs chama onHoldComplete uma vez e vai para done", () => {
    const { root, handler } = setup({ holdMs: 1000 });
    fireEvent.pointerDown(root, { button: 0 });
    expect(root).toHaveAttribute("data-state", "holding");
    expect(root).toHaveAttribute("aria-busy", "true");
    advance(1200);
    expect(handler.calls).toBe(1);
    expect(root).toHaveAttribute("data-state", "done");
    advance(500);
    expect(handler.calls).toBe(1);
  });

  it("soltar na metade não chama e volta a idle", () => {
    const { root, handler } = setup({ holdMs: 1000 });
    fireEvent.pointerDown(root, { button: 0 });
    advance(500);
    fireEvent.pointerUp(root);
    advance(400);
    expect(handler.calls).toBe(0);
    expect(root).toHaveAttribute("data-state", "idle");
    const fill = root.querySelector('[data-slot="hold-button-fill-label"]') as HTMLElement;
    expect(fill.style.clipPath).toBe("inset(0 100% 0 0)");
  });

  it("botão secundário do mouse não segura", () => {
    const { root } = setup();
    fireEvent.pointerDown(root, { button: 2 });
    expect(root).toHaveAttribute("data-state", "idle");
  });

  it("clique rápido mostra a dica e não chama", () => {
    const { root, handler } = setup({ tapHint: "Segure para confirmar" });
    fireEvent.pointerDown(root, { button: 0 });
    advance(100);
    fireEvent.pointerUp(root);
    expect(screen.getByText("Segure para confirmar")).toBeInTheDocument();
    expect(handler.calls).toBe(0);
    advance(1600);
    expect(screen.queryByText("Segure para confirmar")).not.toBeInTheDocument();
  });

  it("Espaço segurado completa e event.repeat não reinicia", () => {
    const { root, handler } = setup({ holdMs: 1000 });
    fireEvent.keyDown(root, { key: " " });
    advance(600);
    fireEvent.keyDown(root, { key: " ", repeat: true });
    advance(500);
    expect(handler.calls).toBe(1);
    expect(root).toHaveAttribute("data-state", "done");
  });

  it("keyup antes do fim cancela", () => {
    const { root, handler } = setup({ holdMs: 1000 });
    fireEvent.keyDown(root, { key: "Enter" });
    advance(400);
    fireEvent.keyUp(root, { key: "Enter" });
    advance(500);
    expect(handler.calls).toBe(0);
    expect(root).toHaveAttribute("data-state", "idle");
  });

  it("resetAfterMs volta a idle", () => {
    const { root } = setup({ holdMs: 500, resetAfterMs: 1000 });
    fireEvent.pointerDown(root, { button: 0 });
    advance(700);
    expect(root).toHaveAttribute("data-state", "done");
    advance(1100);
    expect(root).toHaveAttribute("data-state", "idle");
  });

  it("resetAfterMs 0 fica em done", () => {
    const { root } = setup({ holdMs: 500, resetAfterMs: 0 });
    fireEvent.pointerDown(root, { button: 0 });
    advance(700);
    advance(10000);
    expect(root).toHaveAttribute("data-state", "done");
  });

  it("disabled não segura", () => {
    const { root, handler } = setup({ disabled: true, holdMs: 500 });
    fireEvent.pointerDown(root, { button: 0 });
    advance(800);
    expect(handler.calls).toBe(0);
    expect(root).toHaveAttribute("data-state", "idle");
  });

  it("anuncia o progresso em aria-live e o doneLabel ao completar", () => {
    const { root, container } = setup({ holdMs: 1000 });
    const live = container.querySelector(".sr-only[aria-live]") as HTMLElement;
    fireEvent.pointerDown(root, { button: 0 });
    advance(560);
    expect(live.textContent).toBe("segurando… 50%");
    advance(700);
    expect(live.textContent).toBe("Conciliação excluída");
  });

  it("mostra a onda enquanto avança e some em 0", () => {
    const { root, container } = setup({ holdMs: 1000 });
    expect(container.querySelector(WAVE)).toBeNull();
    fireEvent.pointerDown(root, { button: 0 });
    advance(500);
    expect(container.querySelector(WAVE)).not.toBeNull();
  });

  it("wave=false não renderiza a onda", () => {
    const { root, container } = setup({ holdMs: 1000, wave: false });
    fireEvent.pointerDown(root, { button: 0 });
    advance(500);
    expect(container.querySelector(WAVE)).toBeNull();
  });

  it("movimento reduzido completa, sem onda", () => {
    const handler = new FakeCompletionHandler();
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <HoldButton doneLabel="Feito" holdMs={1000} onHoldComplete={handler.handle}>
          Segurar
        </HoldButton>
      </MotionConfig>
    );
    const root = container.querySelector(ROOT) as HTMLElement;
    fireEvent.pointerDown(root, { button: 0 });
    advance(500);
    expect(container.querySelector(WAVE)).toBeNull();
    advance(700);
    expect(handler.calls).toBe(1);
  });

  it("repassa ref e className para a raiz", () => {
    const ref = createRef<HTMLButtonElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root).toHaveAttribute("type", "button");
  });

  it("os dois rótulos ficam no DOM no repouso: o de feito escondido, o nome acessível é o de repouso", () => {
    const { root } = setup();
    const idle = root.querySelector('[data-slot="hold-button-label-idle"]') as HTMLElement;
    const doneLabel = root.querySelector('[data-slot="hold-button-label-done"]') as HTMLElement;
    expect(idle).not.toHaveAttribute("aria-hidden");
    expect(doneLabel).toHaveAttribute("aria-hidden", "true");
    expect(doneLabel).toHaveClass("invisible");
    expect(idle.parentElement).toBe(doneLabel.parentElement);
    expect(screen.getByRole("button", { name: "Segure para excluir a conciliação" })).toBe(root);
  });

  it("em done o rótulo de repouso é que fica escondido e o nome acessível é o de feito", () => {
    const { root } = setup({ holdMs: 500 });
    fireEvent.pointerDown(root, { button: 0 });
    advance(700);
    const idle = root.querySelector('[data-slot="hold-button-label-idle"]') as HTMLElement;
    const doneLabel = root.querySelector('[data-slot="hold-button-label-done"]') as HTMLElement;
    expect(idle).toHaveAttribute("aria-hidden", "true");
    expect(idle).toHaveClass("invisible");
    expect(doneLabel).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("button", { name: "Conciliação excluída" })).toBe(root);
  });
});
