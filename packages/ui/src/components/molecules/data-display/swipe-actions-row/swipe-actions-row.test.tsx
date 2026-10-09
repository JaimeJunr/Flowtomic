import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { SwipeAction, SwipeActionsRowProps } from "./swipe-actions-row";
import { SwipeActionsRow } from "./swipe-actions-row";
import { releaseTarget, rubberOffset } from "./swipe-actions-row-utils";

const ROOT = '[data-slot="swipe-actions-row"]';
const SURFACE = '[data-slot="swipe-actions-row-surface"]';
const ROW_WIDTH = 400;

class FakeActionLog {
  selected: string[] = [];
  committed: string[] = [];
  openChanges: boolean[] = [];
  onAction = (action: SwipeAction) => void this.selected.push(action.id);
  onCommit = (action: SwipeAction) => void this.committed.push(action.id);
  onOpenChange = (open: boolean) => void this.openChanges.push(open);
}

const ACTIONS: SwipeAction[] = [
  { id: "delete", label: "Excluir" },
  { id: "archive", label: "Arquivar" },
];

function setup(props: Partial<SwipeActionsRowProps> = {}, reduced: "never" | "always" = "never") {
  const log = new FakeActionLog();
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <SwipeActionsRow
        actions={ACTIONS}
        onAction={log.onAction}
        onCommit={log.onCommit}
        onOpenChange={log.onOpenChange}
        {...props}
      >
        Notas da revisão de design
      </SwipeActionsRow>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const surface = view.container.querySelector(SURFACE) as HTMLDivElement;
  return { ...view, root, surface, log };
}

function drag(surface: Element, from: number, to: number) {
  fireEvent.pointerDown(surface, { clientX: from, pointerId: 1, button: 0 });
  fireEvent.pointerMove(surface, { clientX: to, pointerId: 1 });
  fireEvent.pointerUp(surface, { clientX: to, pointerId: 1 });
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

let widthSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  widthSpy = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(ROW_WIDTH);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  widthSpy.mockRestore();
  vi.useRealTimers();
});

describe("rubberOffset", () => {
  it("com fullSwipe é 1:1 até commitAt * largura", () => {
    expect(rubberOffset(0, 600, 0.6, true, 160, 0.55)).toBe(0);
    expect(rubberOffset(300, 600, 0.6, true, 160, 0.55)).toBe(300);
    expect(rubberOffset(360, 600, 0.6, true, 160, 0.55)).toBe(360);
  });

  it("uma linha de 600px arrastada 370px alcança o limite de commit", () => {
    expect(rubberOffset(370, 600, 0.6, true, 160, 0.55)).toBeGreaterThanOrEqual(360);
  });

  it("sem fullSwipe é 1:1 só até a gaveta e resiste depois", () => {
    expect(rubberOffset(160, 600, 0.6, false, 160, 0.55)).toBe(160);
    const beyond = rubberOffset(300, 600, 0.6, false, 160, 0.55);
    expect(beyond).toBeGreaterThan(160);
    expect(beyond).toBeLessThan(300);
  });

  it("nunca passa da largura da linha e é monótono", () => {
    const far = rubberOffset(5000, 600, 0.6, true, 160, 0.55);
    expect(far).toBeLessThan(600);
    expect(rubberOffset(500, 600, 0.6, true, 160, 0.55)).toBeLessThan(far);
    expect(rubberOffset(400, 600, 0.6, true, 160, 0.55)).toBeLessThan(
      rubberOffset(500, 600, 0.6, true, 160, 0.55)
    );
  });

  it("ignora arrasto negativo e rejeita entradas inválidas com o valor recebido", () => {
    expect(rubberOffset(-30, 600, 0.6, true, 160, 0.55)).toBe(0);
    expect(() => rubberOffset(10, 0, 0.6, true, 160, 0.55)).toThrow("received rowWidth 0");
    expect(() => rubberOffset(10, 600, 0.6, true, 160, 2)).toThrow("received resistance 2");
  });
});

describe("releaseTarget", () => {
  it("commit quando passa de commitAt com fullSwipe", () => {
    expect(releaseTarget(250, 0, 160, 400, 0.6, true)).toBe("commit");
  });

  it("sem fullSwipe, passar de commitAt só deixa aberta", () => {
    expect(releaseTarget(250, 0, 160, 400, 0.6, false)).toBe("open");
  });

  it("abre se passou da metade da gaveta, senão fecha", () => {
    expect(releaseTarget(90, 0, 160, 400, 0.6, true)).toBe("open");
    expect(releaseTarget(70, 0, 160, 400, 0.6, true)).toBe("closed");
  });

  it("peteleco abre ou fecha independente da posição", () => {
    expect(releaseTarget(30, 0.8, 160, 400, 0.6, true)).toBe("open");
    expect(releaseTarget(120, -0.8, 160, 400, 0.6, true)).toBe("closed");
  });
});

describe("estrutura", () => {
  it("expõe grupo nomeado, slots e ref/className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "extra", label: "Nota" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveAttribute("aria-label", "Nota");
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("nome acessível padrão", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("aria-label", "Item da lista");
  });

  it("ações ficam inertes enquanto fechadas", () => {
    const { container } = setup();
    const drawer = container.querySelector('[data-slot="swipe-actions-row-drawer"]');
    expect(drawer).toHaveAttribute("inert");
  });
});

describe("teclado", () => {
  it("o botão Ações abre, foca as ações e Escape fecha", () => {
    const { root, container, log } = setup();
    const toggle = screen.getByRole("button", { name: "Ações" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-state", "open");
    expect(container.querySelector('[data-slot="swipe-actions-row-drawer"]')).not.toHaveAttribute(
      "inert"
    );
    fireEvent.keyDown(root, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(log.openChanges).toEqual([true, false]);
  });
});

describe("ações", () => {
  it("ação sem dismiss chama onAction e fecha a gaveta", () => {
    const onSelect = vi.fn();
    const { log, root } = setup({
      actions: [ACTIONS[0], { id: "archive", label: "Arquivar", onSelect }],
    });
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    fireEvent.click(screen.getByRole("button", { name: "Arquivar" }));
    expect(log.selected).toEqual(["archive"]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-state", "closed");
    expect(log.committed).toEqual([]);
  });

  it("closeOnAction false mantém a gaveta aberta", () => {
    const { root } = setup({ closeOnAction: false });
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    fireEvent.click(screen.getByRole("button", { name: "Arquivar" }));
    expect(root).toHaveAttribute("data-state", "open");
  });

  it("ação principal dobra a linha e chama onCommit depois do colapso", () => {
    const { root, log } = setup({ collapseMs: 200 });
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(root).toHaveAttribute("data-state", "committing");
    expect(log.committed).toEqual([]);
    advance(200);
    expect(log.committed).toEqual(["delete"]);
  });

  it("ação secundária com dismiss também dobra", () => {
    const { log } = setup({
      actions: [ACTIONS[0], { id: "archive", label: "Arquivar", dismiss: true }],
    });
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    fireEvent.click(screen.getByRole("button", { name: "Arquivar" }));
    advance(200);
    expect(log.committed).toEqual(["archive"]);
  });
});

describe("arrasto", () => {
  it("arrastar além de commitAt e soltar executa a ação principal", () => {
    const { surface, root, log } = setup();
    drag(surface, 380, -20);
    expect(root).toHaveAttribute("data-state", "committing");
    advance(200);
    expect(log.committed).toEqual(["delete"]);
    expect(log.selected).toEqual(["delete"]);
  });

  it("arrasto curto abre e arrasto pequeno volta a fechar", () => {
    const { surface, root, log } = setup();
    drag(surface, 300, 190);
    expect(root).toHaveAttribute("data-state", "open");
    expect(log.openChanges).toEqual([true]);
    drag(surface, 300, 450);
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("sem fullSwipe, arrasto longo só abre", () => {
    const { surface, root, log } = setup({ fullSwipe: false });
    drag(surface, 380, -20);
    expect(root).toHaveAttribute("data-state", "open");
    advance(500);
    expect(log.committed).toEqual([]);
  });

  it("direction right espelha o arrasto", () => {
    const { surface, log } = setup({ direction: "right" });
    drag(surface, 20, 420);
    advance(200);
    expect(log.committed).toEqual(["delete"]);
  });

  it("arrastar no sentido contrário ao da direção não abre", () => {
    const { surface, root } = setup();
    drag(surface, 100, 300);
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("marca o salto da ação principal ao passar de commitAt", () => {
    const { surface, container } = setup();
    fireEvent.pointerDown(surface, { clientX: 380, pointerId: 1, button: 0 });
    fireEvent.pointerMove(surface, { clientX: -20, pointerId: 1 });
    const primary = container.querySelector('[data-slot="swipe-actions-row-action"]');
    const jumped = container.querySelectorAll('[data-jumped="true"]');
    expect(jumped).toHaveLength(1);
    expect(primary).not.toBeNull();
    fireEvent.pointerMove(surface, { clientX: 300, pointerId: 1 });
    expect(container.querySelectorAll('[data-jumped="true"]')).toHaveLength(0);
  });

  it("vibra uma vez ao saltar, quando navigator.vibrate existe", () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });
    const { surface } = setup();
    fireEvent.pointerDown(surface, { clientX: 380, pointerId: 1, button: 0 });
    fireEvent.pointerMove(surface, { clientX: -20, pointerId: 1 });
    fireEvent.pointerMove(surface, { clientX: -30, pointerId: 1 });
    expect(vibrate).toHaveBeenCalledTimes(1);
    Reflect.deleteProperty(navigator, "vibrate");
  });
});

describe("linha larga", () => {
  it("linha de 600px arrastada 400px salta e, ao soltar, executa a principal", () => {
    widthSpy.mockReturnValue(600);
    const { surface, container, log } = setup();
    fireEvent.pointerDown(surface, { clientX: 500, pointerId: 1, button: 0 });
    fireEvent.pointerMove(surface, { clientX: 100, pointerId: 1 });
    expect(container.querySelectorAll('[data-jumped="true"]')).toHaveLength(1);
    fireEvent.pointerUp(surface, { clientX: 100, pointerId: 1 });
    advance(200);
    expect(log.committed).toEqual(["delete"]);
  });
});

describe("controlado e desabilitado", () => {
  it("open controlado define o estado e pede mudança por onOpenChange", () => {
    const { log, root } = setup({ open: true });
    expect(root).toHaveAttribute("data-state", "open");
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    expect(log.openChanges).toEqual([false]);
    expect(root).toHaveAttribute("data-state", "open");
  });

  it("disabled ignora arrasto e desabilita o botão Ações", () => {
    const { surface, root, log } = setup({ disabled: true });
    drag(surface, 380, -20);
    expect(root).toHaveAttribute("data-state", "closed");
    expect(root).toHaveClass("opacity-50");
    expect(screen.getByRole("button", { name: "Ações" })).toBeDisabled();
    expect(log.committed).toEqual([]);
  });
});

describe("movimento reduzido", () => {
  it("commit com movimento reduzido conclui sem esperar collapseMs", () => {
    const { log } = setup({}, "always");
    fireEvent.click(screen.getByRole("button", { name: "Ações" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    advance(0);
    expect(log.committed).toEqual(["delete"]);
  });
});
