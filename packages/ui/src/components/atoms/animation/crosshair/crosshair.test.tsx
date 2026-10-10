import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Crosshair, type CrosshairProps } from "./crosshair";

const ROOT = '[data-slot="crosshair"]';
const AREA = { left: 100, top: 50, width: 400, height: 300 };
const BUTTON_RECT = { left: 140, top: 90, width: 80, height: 32 };

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

// Fake nomeado: mede o layout que o jsdom não calcula.
type Box = { left: number; top: number; width: number; height: number };

const rectOf = (r: Box) => () => ({
  ...r,
  x: r.left,
  y: r.top,
  right: r.left + r.width,
  bottom: r.top + r.height,
  toJSON: () => ({}),
});

const fakeLayout = {
  apply(root: Element, button: Element | null) {
    root.getBoundingClientRect = rectOf(AREA);
    if (button) button.getBoundingClientRect = rectOf(BUTTON_RECT);
  },
};

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = PointerTypeEvent as unknown as typeof PointerEvent;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
  window.PointerEvent = OriginalPointerEvent;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: CrosshairProps = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <Crosshair {...props}>
        <button type="button">Resgatar cotas</button>
      </Crosshair>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const button = view.container.querySelector("button") as HTMLButtonElement;
  fakeLayout.apply(root, button);
  return { ...view, root, button };
}

const move = (el: Element, clientX: number, clientY: number, pointerType = "mouse") =>
  fireEvent.pointerMove(el, { clientX, clientY, pointerType });
const down = (el: Element, clientX: number, clientY: number) =>
  fireEvent.pointerDown(el, { clientX, clientY, pointerType: "mouse" });
const slot = (root: Element, name: string) => root.querySelector(`[data-slot="${name}"]`);

describe("Crosshair", () => {
  it("expõe ref, className, data-slot e a camada decorativa", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "area" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "overflow-hidden");
    expect(root).toHaveAttribute("id", "area");
    expect(root).toHaveTextContent("Resgatar cotas");
    const layer = slot(root, "crosshair-layer");
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
  });

  it("fica visível com o mouse dentro e esconde ao sair", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-visible", "false");
    move(root, 200, 120);
    expect(root).toHaveAttribute("data-visible", "true");
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    expect(root).toHaveAttribute("data-visible", "false");
  });

  it("ignora toque", () => {
    const { root } = setup();
    move(root, 200, 120, "touch");
    expect(root).toHaveAttribute("data-visible", "false");
  });

  it("mostra coordenadas inteiras relativas à área", () => {
    const { root } = setup();
    move(root, 200.6, 120.4);
    expect(slot(root, "crosshair-label-x")).toHaveTextContent("x 101");
    expect(slot(root, "crosshair-label-y")).toHaveTextContent("y 70");
  });

  it("showCoordinates={false} remove os rótulos", () => {
    const { root } = setup({ showCoordinates: false });
    expect(slot(root, "crosshair-label-x")).toBeNull();
    expect(slot(root, "crosshair-label-y")).toBeNull();
  });

  it("desenha duas linhas com dois segmentos cada", () => {
    const { root } = setup({ lineStyle: "dashed", thickness: 2 });
    const lineX = slot(root, "crosshair-line-x") as HTMLElement;
    const lineY = slot(root, "crosshair-line-y") as HTMLElement;
    expect(lineX.children).toHaveLength(2);
    expect(lineY.children).toHaveLength(2);
    expect((lineX.children[0] as HTMLElement).style.borderTopStyle).toBe("dashed");
    expect((lineX.children[0] as HTMLElement).style.borderTopWidth).toBe("2px");
    expect((lineY.children[0] as HTMLElement).style.borderLeftStyle).toBe("dashed");
  });

  // O jsdom não faz layout: um contêiner w-0/h-0 zerava os segmentos e as linhas sumiam no browser.
  it("cada linha cruza a área inteira e fica na altura/coluna do ponteiro", () => {
    const { root } = setup();
    const lineX = slot(root, "crosshair-line-x") as HTMLElement;
    const lineY = slot(root, "crosshair-line-y") as HTMLElement;
    expect(lineX).toHaveClass("inset-x-0");
    expect(lineX.style.transform).toBe("translateY(var(--cy))");
    expect(lineY).toHaveClass("inset-y-0");
    expect(lineY.style.transform).toBe("translateX(var(--cx))");
  });

  it("para os segmentos a gap px do ponteiro", () => {
    const { root } = setup({ gap: 6 });
    const lineX = slot(root, "crosshair-line-x") as HTMLElement;
    expect((lineX.children[1] as HTMLElement).style.transform).toContain("+ 6px");
  });

  it("persegue o ponteiro com atraso e chega ao alvo", () => {
    const { root } = setup({ smoothing: 0.5 });
    const layer = slot(root, "crosshair-layer") as HTMLElement;
    move(root, 200, 100);
    expect(layer.style.getPropertyValue("--cx")).toBe("100px");
    move(root, 300, 100);
    expect(layer.style.getPropertyValue("--cx")).toBe("100px");
    act(() => void vi.advanceTimersByTime(40));
    const mid = Number.parseFloat(layer.style.getPropertyValue("--cx"));
    expect(mid).toBeGreaterThan(100);
    expect(mid).toBeLessThan(200);
    act(() => void vi.advanceTimersByTime(2000));
    expect(Number.parseFloat(layer.style.getPropertyValue("--cx"))).toBeCloseTo(200, 0);
  });

  it("smoothing 0 gruda no ponteiro sem esperar quadro", () => {
    const { root } = setup({ smoothing: 0 });
    const layer = slot(root, "crosshair-layer") as HTMLElement;
    move(root, 200, 100);
    move(root, 300, 150);
    expect(layer.style.getPropertyValue("--cx")).toBe("200px");
    expect(layer.style.getPropertyValue("--cy")).toBe("100px");
  });

  it("hover num botão cria o lock com a medida do alvo", () => {
    const { root, button } = setup();
    move(button, 160, 100);
    const lock = slot(root, "crosshair-lock");
    expect(lock).not.toBeNull();
    expect(lock).toHaveTextContent("80 × 32");
    move(root, 400, 300);
    expect(slot(root, "crosshair-lock")).toBeNull();
  });

  it("sair da área desfaz o lock", () => {
    const { root, button } = setup();
    move(button, 160, 100);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    expect(slot(root, "crosshair-lock")).toBeNull();
  });

  it("targetSelector troca o que conta como alvo", () => {
    const { root, button } = setup({ targetSelector: "[data-alvo]" });
    move(button, 160, 100);
    expect(slot(root, "crosshair-lock")).toBeNull();
  });

  it("targetEffect=none não cria lock", () => {
    const { root, button } = setup({ targetEffect: "none" });
    move(button, 160, 100);
    expect(slot(root, "crosshair-lock")).toBeNull();
  });

  it("clique solta um pulso que some depois de 500 ms", () => {
    const { root } = setup();
    move(root, 200, 120);
    down(root, 200, 120);
    expect(slot(root, "crosshair-pulse")).not.toBeNull();
    act(() => void vi.advanceTimersByTime(600));
    expect(slot(root, "crosshair-pulse")).toBeNull();
  });

  it("clickPulse={false} não cria pulso", () => {
    const { root } = setup({ clickPulse: false });
    down(root, 200, 120);
    expect(slot(root, "crosshair-pulse")).toBeNull();
  });

  it("movimento reduzido: sem pulso e linhas sem atraso", () => {
    const { root } = setup({ smoothing: 0.5 }, "always");
    const layer = slot(root, "crosshair-layer") as HTMLElement;
    move(root, 200, 100);
    move(root, 300, 100);
    expect(layer.style.getPropertyValue("--cx")).toBe("200px");
    down(root, 300, 100);
    expect(slot(root, "crosshair-pulse")).toBeNull();
  });

  it("hideCursor esconde o cursor do sistema e mostra um ponto", () => {
    const { root } = setup({ hideCursor: true });
    expect(root).toHaveClass("cursor-none");
    expect(slot(root, "crosshair-dot")).not.toBeNull();
  });

  it("sem hideCursor não há ponto nem cursor-none", () => {
    const { root } = setup();
    expect(root).not.toHaveClass("cursor-none");
    expect(slot(root, "crosshair-dot")).toBeNull();
  });

  it("repassa handlers do consumidor", () => {
    const onPointerMove = vi.fn();
    const { root } = setup({ onPointerMove });
    move(root, 200, 120);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
  });
});
