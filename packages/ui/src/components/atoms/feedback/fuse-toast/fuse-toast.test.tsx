import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { FuseToast, type FuseToastProps } from "./fuse-toast";
import { fuseRemaining, shouldDismiss, swipeOpacity } from "./fuse-toast-utils";

const ROOT = '[data-slot="fuse-toast"]';
const FUSE = '[data-slot="fuse-toast-fuse"]';
const ACTION = '[data-slot="fuse-toast-action"]';

class FakeRecorder {
  reasons: string[] = [];
  actions = 0;
  onClose = (reason: string) => void this.reasons.push(reason);
  onAction = () => {
    this.actions += 1;
  };
}

const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));
const query = (selector: string) => document.body.querySelector(selector) as HTMLElement;

function setup(props: Partial<FuseToastProps> = {}, reducedMotion: "never" | "always" = "never") {
  const rec = new FakeRecorder();
  const tree = (next: Partial<FuseToastProps>) => (
    <MotionConfig reducedMotion={reducedMotion}>
      <FuseToast
        title="Conciliação arquivada"
        description="Movida para Arquivo"
        actionLabel="Desfazer"
        onAction={rec.onAction}
        onClose={rec.onClose}
        {...props}
        {...next}
      />
    </MotionConfig>
  );
  const view = render(tree({}));
  return {
    ...view,
    rec,
    rerenderWith: (next: Partial<FuseToastProps>) => view.rerender(tree(next)),
  };
}

// O PointerEvent do setup não carrega `clientX`; um MouseEvent traz coordenadas.
const OriginalPointerEvent = window.PointerEvent;
class CoordinateEvent extends MouseEvent {
  pointerId = 1;
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "mouse";
  }
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
  window.PointerEvent = CoordinateEvent as unknown as typeof PointerEvent;
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
      "Date",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("shouldDismiss: arraste lento curto não dispensa, longo sim, peteleco sempre", () => {
    expect(shouldDismiss(30, 100, 40)).toBe(false);
    expect(shouldDismiss(-41, 0, 40)).toBe(true);
    expect(shouldDismiss(5, -600, 40)).toBe(true);
  });

  it("shouldDismiss rejeita entrada inválida citando o valor", () => {
    expect(() => shouldDismiss(Number.NaN, 0, 40)).toThrow(/received dx NaN/);
    expect(() => shouldDismiss(0, 0, -1)).toThrow(/distance -1/);
  });

  it("fuseRemaining vai de 1 a 0, limitado, e rejeita duração inválida", () => {
    expect(fuseRemaining(0, 4000)).toBe(1);
    expect(fuseRemaining(1000, 4000)).toBe(0.75);
    expect(fuseRemaining(9000, 4000)).toBe(0);
    expect(() => fuseRemaining(0, 0)).toThrow(/received durationMs 0/);
  });

  it("swipeOpacity cai com |dx| nos dois sentidos", () => {
    expect(swipeOpacity(0)).toBe(1);
    expect(swipeOpacity(120)).toBe(0.5);
    expect(swipeOpacity(-120)).toBe(0.5);
    expect(swipeOpacity(1000)).toBe(0);
  });
});

describe("FuseToast", () => {
  it("renderiza como status educado com título, descrição e ação", () => {
    setup();
    const root = query(ROOT);
    expect(root.getAttribute("role")).toBe("status");
    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.getAttribute("data-state")).toBe("open");
    expect(root.textContent).toContain("Conciliação arquivada");
    expect(root.textContent).toContain("Movida para Arquivo");
    expect(query(ACTION).tagName).toBe("BUTTON");
  });

  it("fecha sozinho em durationMs com timeout", async () => {
    const { rec } = setup({ durationMs: 1000 });
    await advance(900);
    expect(rec.reasons).toEqual([]);
    await advance(300);
    expect(rec.reasons).toEqual(["timeout"]);
    expect(query(ROOT)).toBeNull();
  });

  it("durationMs 0 não fecha sozinho", async () => {
    const { rec } = setup({ durationMs: 0 });
    await advance(60_000);
    expect(rec.reasons).toEqual([]);
    expect(query(ROOT)).not.toBeNull();
  });

  it("hover pausa o pavio e sair retoma", async () => {
    const { rec } = setup({ durationMs: 1000 });
    fireEvent.pointerEnter(query(ROOT), { pointerType: "mouse" });
    await advance(5000);
    expect(rec.reasons).toEqual([]);
    fireEvent.pointerLeave(query(ROOT), { pointerType: "mouse" });
    await advance(1200);
    expect(rec.reasons).toEqual(["timeout"]);
  });

  it("pauseOnHover false ignora o hover", async () => {
    const { rec } = setup({ durationMs: 1000, pauseOnHover: false });
    fireEvent.pointerEnter(query(ROOT), { pointerType: "mouse" });
    await advance(1200);
    expect(rec.reasons).toEqual(["timeout"]);
  });

  it("hover emulado de toque não pausa o pavio", async () => {
    const { rec } = setup({ durationMs: 1000 });
    fireEvent.pointerEnter(query(ROOT), { pointerType: "touch" });
    await advance(1200);
    expect(rec.reasons).toEqual(["timeout"]);
  });

  it("o pavio encolhe com o tempo e fuse none não o desenha", async () => {
    const first = setup({ durationMs: 1000 });
    expect(query(FUSE)).not.toBeNull();
    await advance(500);
    expect(query(FUSE).style.transform).toMatch(/scaleX\(0\.[45]/);
    first.unmount();
    const second = setup({ durationMs: 1000, fuse: "none" });
    expect(query(FUSE)).toBeNull();
    await advance(1200);
    expect(second.rec.reasons).toEqual(["timeout"]);
  });

  it("fuse top ancora o pavio no topo", () => {
    setup({ fuse: "top" });
    expect(query(FUSE).className).toContain("top-0");
    expect(query(FUSE).className).toContain("origin-left");
  });

  it("a ação chama onAction e fecha com action", async () => {
    const { rec } = setup();
    fireEvent.click(query(ACTION));
    await advance(50);
    expect(rec.actions).toBe(1);
    expect(rec.reasons).toEqual(["action"]);
  });

  it("closeButton mostra o X nomeado e fecha com close", async () => {
    const { rec, getByLabelText } = setup({ closeButton: true });
    fireEvent.click(getByLabelText("Fechar"));
    await advance(50);
    expect(rec.reasons).toEqual(["close"]);
  });

  it("sem closeButton não há X", () => {
    const { queryByLabelText } = setup();
    expect(queryByLabelText("Fechar")).toBeNull();
  });

  it("Escape fecha com escape; dismissible false ignora", async () => {
    const first = setup();
    fireEvent.keyDown(document, { key: "Escape" });
    await advance(50);
    expect(first.rec.reasons).toEqual(["escape"]);
    first.unmount();
    const second = setup({ dismissible: false });
    fireEvent.keyDown(document, { key: "Escape" });
    await advance(50);
    expect(second.rec.reasons).toEqual([]);
  });

  it("open false fecha com programmatic e open true volta e rearma", async () => {
    const { rec, rerenderWith } = setup({ durationMs: 1000 });
    rerenderWith({ open: false });
    await advance(50);
    expect(rec.reasons).toEqual(["programmatic"]);
    expect(query(ROOT)).toBeNull();
    rerenderWith({ open: true });
    expect(query(ROOT)).not.toBeNull();
    await advance(1200);
    expect(rec.reasons).toEqual(["programmatic", "timeout"]);
  });

  it("mudar durationMs rearma o pavio", async () => {
    const { rec, rerenderWith } = setup({ durationMs: 1000 });
    await advance(800);
    rerenderWith({ durationMs: 2000 });
    await advance(1500);
    expect(rec.reasons).toEqual([]);
    await advance(700);
    expect(rec.reasons).toEqual(["timeout"]);
  });

  it("inline renderiza no fluxo, fora do portal", () => {
    const { container } = setup({ inline: true });
    expect(container.querySelector(ROOT)).not.toBeNull();
    expect(container.querySelector(ROOT)?.className).not.toContain("fixed");
  });

  it("fixo vai para o body, no canto inferior direito", () => {
    const { container } = setup();
    expect(container.querySelector(ROOT)).toBeNull();
    expect(query(ROOT).className).toContain("fixed");
    expect(query(ROOT).className).toContain("bottom-4");
    expect(query(ROOT).className).toContain("right-4");
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: "extra-cls" });
    expect(ref.current).toBe(query(ROOT));
    expect(query(ROOT).className).toContain("extra-cls");
  });

  it("movimento reduzido continua fechando pelo pavio", async () => {
    const { rec } = setup({ durationMs: 1000 }, "always");
    expect(query(FUSE)).not.toBeNull();
    await advance(1200);
    expect(rec.reasons).toEqual(["timeout"]);
  });
});

describe("arrastar", () => {
  const drag = async (to: number, holdMs: number) => {
    const root = query(ROOT);
    fireEvent.pointerDown(root, { clientX: 0, button: 0 });
    await advance(holdMs);
    fireEvent.pointerMove(root, { clientX: to });
    fireEvent.pointerUp(root, { clientX: to });
    await advance(50);
  };

  it("arraste lento além da distância dispensa com swipe", async () => {
    const { rec } = setup();
    await drag(60, 1000);
    expect(rec.reasons).toEqual(["swipe"]);
  });

  it("peteleco curto e rápido dispensa", async () => {
    const { rec } = setup();
    await drag(20, 20);
    expect(rec.reasons).toEqual(["swipe"]);
  });

  it("soltar antes da distância, devagar, volta e não fecha", async () => {
    const { rec } = setup({ durationMs: 0 });
    await drag(20, 1000);
    expect(rec.reasons).toEqual([]);
    expect(query(ROOT)).not.toBeNull();
  });

  it("swipeDistance personalizado é respeitado", async () => {
    const { rec } = setup({ swipeDistance: 200 });
    await drag(100, 1000);
    expect(rec.reasons).toEqual([]);
  });

  it("dismissible false não arrasta", async () => {
    const { rec } = setup({ dismissible: false });
    await drag(300, 20);
    expect(rec.reasons).toEqual([]);
  });

  it("durante o arraste o pavio pausa", async () => {
    const { rec } = setup({ durationMs: 1000 });
    fireEvent.pointerDown(query(ROOT), { clientX: 0, button: 0 });
    fireEvent.pointerMove(query(ROOT), { clientX: 10 });
    await advance(5000);
    expect(rec.reasons).toEqual([]);
  });

  it("começar o arraste sobre o botão de ação não arrasta", async () => {
    const { rec } = setup();
    fireEvent.pointerDown(query(ACTION), { clientX: 0, button: 0 });
    await advance(20);
    fireEvent.pointerMove(query(ROOT), { clientX: 300 });
    fireEvent.pointerUp(query(ROOT), { clientX: 300 });
    await advance(50);
    expect(rec.reasons).toEqual([]);
  });
});
