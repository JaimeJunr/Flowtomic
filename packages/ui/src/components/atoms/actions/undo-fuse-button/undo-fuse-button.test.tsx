import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { UndoFuseButton } from "./undo-fuse-button";
import { fuseReducer, fuseRemaining, pillPath, pillPerimeter } from "./undo-fuse-button-utils";

const ROOT = '[data-slot="undo-fuse-button"]';
const FUSE = '[data-slot="undo-fuse-button-fuse"]';

class FakeRecorder {
  commits: string[] = [];
  undos = 0;
  ends = 0;
  phases: string[] = [];
  onCommit = (reason: string) => void this.commits.push(reason);
  onUndo = () => {
    this.undos += 1;
  };
  onFuseEnd = () => {
    this.ends += 1;
  };
  onPhaseChange = (phase: string) => void this.phases.push(phase);
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function setup(props: Partial<React.ComponentProps<typeof UndoFuseButton>> = {}) {
  const rec = new FakeRecorder();
  const view = render(
    <MotionConfig reducedMotion="never">
      <UndoFuseButton
        onCommit={rec.onCommit}
        onUndo={rec.onUndo}
        onFuseEnd={rec.onFuseEnd}
        onPhaseChange={rec.onPhaseChange}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLButtonElement;
  return { ...view, root, rec };
}

// O PointerEvent do setup não carrega `pointerType`; sem ele o hover de mouse não é distinguível.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
  }
}

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
      "Date",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("fuseRemaining vai de 1 a 0, limitado", () => {
    expect(fuseRemaining(0, 4000)).toBe(1);
    expect(fuseRemaining(2000, 4000)).toBe(0.5);
    expect(fuseRemaining(4000, 4000)).toBe(0);
    expect(fuseRemaining(9000, 4000)).toBe(0);
    expect(fuseRemaining(-5, 4000)).toBe(1);
  });

  it("fuseRemaining rejeita janela inválida com o valor recebido", () => {
    expect(() => fuseRemaining(10, 0)).toThrow("received windowMs 0");
  });

  it("pillPerimeter: estádio, círculo e inset", () => {
    expect(pillPerimeter(100, 40, 0)).toBeCloseTo(120 + Math.PI * 40);
    expect(pillPerimeter(40, 40, 0)).toBeCloseTo(Math.PI * 40);
    expect(pillPerimeter(102, 42, 1)).toBeCloseTo(120 + Math.PI * 40);
    expect(pillPerimeter(30, 40, 0)).toBeCloseTo(Math.PI * 40);
  });

  it("pillPath começa no topo central e segue no sentido horário", () => {
    const d = pillPath(100, 40, 1);
    expect(d.startsWith("M 50 1")).toBe(true);
    expect(d).toContain("H 80");
    expect(d).toContain("A 19 19 0 0 1 80 39");
    expect(d).toContain("A 19 19 0 0 1 20 1");
  });

  it("pillPath e pillPerimeter rejeitam valores inválidos com o valor recebido", () => {
    expect(() => pillPath(-1, 40, 1)).toThrow("received width -1");
    expect(() => pillPerimeter(100, Number.NaN, 1)).toThrow("received height NaN");
    expect(() => pillPath(100, 40, -2)).toThrow("received inset -2");
  });

  it("fuseReducer cobre todas as transições", () => {
    expect(fuseReducer("idle", { type: "press" })).toBe("armed");
    expect(fuseReducer("armed", { type: "undo" })).toBe("idle");
    expect(fuseReducer("armed", { type: "end", settle: "reset" })).toBe("idle");
    expect(fuseReducer("armed", { type: "end", settle: "stay" })).toBe("settled");
    expect(fuseReducer("idle", { type: "undo" })).toBe("idle");
    expect(fuseReducer("idle", { type: "end", settle: "stay" })).toBe("idle");
    expect(fuseReducer("armed", { type: "press" })).toBe("armed");
    expect(fuseReducer("settled", { type: "press" })).toBe("settled");
    expect(fuseReducer("settled", { type: "undo" })).toBe("settled");
  });
});

describe("UndoFuseButton", () => {
  it("clique chama onCommit('press') e mostra Desfazer", () => {
    const { root, rec } = setup();
    expect(root).toHaveAttribute("data-phase", "idle");
    fireEvent.click(root);
    expect(rec.commits).toEqual(["press"]);
    expect(root).toHaveAttribute("data-phase", "armed");
    expect(root).toHaveAccessibleName("Desfazer");
  });

  it("clicar de novo desfaz e volta a idle", () => {
    const { root, rec } = setup();
    fireEvent.click(root);
    fireEvent.click(root);
    expect(rec.undos).toBe(1);
    expect(root).toHaveAttribute("data-phase", "idle");
    expect(root).toHaveAccessibleName("Arquivar");
  });

  it("esperar a janela chama onFuseEnd e volta a idle", () => {
    const { root, rec } = setup({ undoWindowMs: 1000 });
    fireEvent.click(root);
    advance(1200);
    expect(rec.ends).toBe(1);
    expect(rec.commits).toEqual(["press"]);
    expect(root).toHaveAttribute("data-phase", "idle");
  });

  it("commitOn fuseEnd: onCommit só no fim", () => {
    const { root, rec } = setup({ commitOn: "fuseEnd", undoWindowMs: 1000 });
    fireEvent.click(root);
    expect(rec.commits).toEqual([]);
    advance(1200);
    expect(rec.commits).toEqual(["fuseEnd"]);
  });

  it("commitOn fuseEnd: desfazer antes não chama onCommit, mas chama onUndo", () => {
    const { root, rec } = setup({ commitOn: "fuseEnd", undoWindowMs: 1000 });
    fireEvent.click(root);
    advance(300);
    fireEvent.click(root);
    advance(2000);
    expect(rec.commits).toEqual([]);
    expect(rec.undos).toBe(1);
    expect(rec.ends).toBe(0);
  });

  it("settle stay: fica em Arquivado e desabilitado", () => {
    const { root } = setup({ settle: "stay", undoWindowMs: 500 });
    fireEvent.click(root);
    advance(700);
    expect(root).toHaveAttribute("data-phase", "settled");
    expect(root).toBeDisabled();
    expect(root).toHaveAccessibleName("Arquivado");
    advance(10000);
    expect(root).toHaveAttribute("data-phase", "settled");
  });

  it("Escape desfaz", () => {
    const { root, rec } = setup();
    fireEvent.click(root);
    fireEvent.keyDown(root, { key: "Escape" });
    expect(rec.undos).toBe(1);
    expect(root).toHaveAttribute("data-phase", "idle");
  });

  it("Escape em idle não faz nada", () => {
    const { root, rec } = setup();
    fireEvent.keyDown(root, { key: "Escape" });
    expect(rec.undos).toBe(0);
  });

  it("disabled ignora o clique em idle", () => {
    const { root, rec } = setup({ disabled: true });
    expect(root).toBeDisabled();
    fireEvent.click(root);
    expect(rec.commits).toEqual([]);
  });

  it("disabled depois de armar não bloqueia o desfazer", () => {
    const { root, rerender, rec } = setup();
    fireEvent.click(root);
    rerender(
      <MotionConfig reducedMotion="never">
        <UndoFuseButton disabled onUndo={rec.onUndo} />
      </MotionConfig>
    );
    const armed = document.querySelector(ROOT) as HTMLButtonElement;
    expect(armed).not.toBeDisabled();
    fireEvent.click(armed);
    expect(rec.undos).toBe(1);
  });

  it("onPhaseChange em cada fase", () => {
    const { root, rec } = setup({ settle: "stay", undoWindowMs: 500 });
    fireEvent.click(root);
    advance(700);
    expect(rec.phases).toEqual(["armed", "settled"]);
  });

  it("pavio outline usa path com dash em px do perímetro medido", () => {
    const widthSpy = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100);
    const heightSpy = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(40);
    try {
      const { root, container } = setup({ undoWindowMs: 1000 });
      expect(container.querySelector(FUSE)).toBeNull();
      fireEvent.click(root);
      const svg = container.querySelector(FUSE) as SVGElement;
      expect(svg.getAttribute("viewBox")).toBe("0 0 100 40");
      const path = svg.querySelector("path") as SVGPathElement;
      const perimeter = pillPerimeter(100, 40, 1);
      expect(path.getAttribute("pathLength")).toBeNull();
      expect(path.getAttribute("d")).toBe(pillPath(100, 40, 1));
      expect(Number(path.style.strokeDasharray.replace("px", ""))).toBeCloseTo(perimeter);
      advance(500);
      const offset = Number(path.style.strokeDashoffset.replace("px", ""));
      expect(offset).toBeGreaterThan(perimeter * 0.3);
      expect(offset).toBeLessThan(perimeter * 0.7);
    } finally {
      widthSpy.mockRestore();
      heightSpy.mockRestore();
    }
  });

  it("sem medida (jsdom) o pavio outline não desenha nada", () => {
    const { root, container } = setup();
    fireEvent.click(root);
    expect(container.querySelector(`${FUSE} path`)).toBeNull();
  });

  it("fuse bottom usa barra com scaleX", () => {
    const { root, container } = setup({ fuse: "bottom", undoWindowMs: 1000 });
    fireEvent.click(root);
    advance(500);
    const bar = container.querySelector(FUSE) as HTMLElement;
    expect(bar.querySelector("rect")).toBeNull();
    expect(bar.style.transform).toMatch(/scaleX\(0\.[3-7]/);
    expect(bar).toHaveClass("bottom-0");
  });

  it("fuse top posiciona no topo", () => {
    const { root, container } = setup({ fuse: "top" });
    fireEvent.click(root);
    expect(container.querySelector(FUSE)).toHaveClass("top-0");
  });

  it("hover de mouse pausa só depois de sair e voltar", () => {
    const { root, rec } = setup({ undoWindowMs: 1000 });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    fireEvent.click(root);
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    advance(1200);
    expect(rec.ends).toBe(1);
  });

  it("depois de sair e voltar o hover pausa o pavio e sair retoma", () => {
    const { root, rec } = setup({ undoWindowMs: 1000 });
    fireEvent.click(root);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    advance(300);
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    advance(5000);
    expect(rec.ends).toBe(0);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    advance(1000);
    expect(rec.ends).toBe(1);
  });

  it("pauseOnHover=false e toque não pausam", () => {
    const a = setup({ undoWindowMs: 1000, pauseOnHover: false });
    fireEvent.click(a.root);
    fireEvent.pointerLeave(a.root, { pointerType: "mouse" });
    fireEvent.pointerEnter(a.root, { pointerType: "mouse" });
    advance(1200);
    expect(a.rec.ends).toBe(1);
    a.unmount();
    const b = setup({ undoWindowMs: 1000 });
    fireEvent.click(b.root);
    fireEvent.pointerLeave(b.root, { pointerType: "touch" });
    fireEvent.pointerEnter(b.root, { pointerType: "touch" });
    advance(1200);
    expect(b.rec.ends).toBe(1);
  });

  it("anuncia em aria-live ao armar e ao desfazer", () => {
    const { root, container } = setup();
    const live = container.querySelector(".sr-only[aria-live]") as HTMLElement;
    fireEvent.click(root);
    expect(live.textContent).toBe("Arquivado. Desfazer disponível por 4 segundos.");
    fireEvent.click(root);
    expect(live.textContent).toBe("Ação desfeita");
  });

  it("monta o anúncio a partir das props", () => {
    const { root, container } = setup({
      label: "Excluir",
      doneLabel: "Excluído",
      undoLabel: "Restaurar",
      undoWindowMs: 6000,
      undoneAnnouncement: "Exclusão cancelada",
    });
    const live = container.querySelector(".sr-only[aria-live]") as HTMLElement;
    fireEvent.click(root);
    expect(live.textContent).toBe("Excluído. Restaurar disponível por 6 segundos.");
    fireEvent.click(root);
    expect(live.textContent).toBe("Exclusão cancelada");
  });

  it("os três rótulos dividem a célula e só o da fase atual é acessível", () => {
    const { root } = setup();
    const idle = root.querySelector('[data-slot="undo-fuse-button-label-idle"]') as HTMLElement;
    const armed = root.querySelector('[data-slot="undo-fuse-button-label-armed"]') as HTMLElement;
    expect(idle).not.toHaveAttribute("aria-hidden");
    expect(armed).toHaveAttribute("aria-hidden", "true");
    expect(idle.parentElement).toBe(armed.parentElement);
  });

  it("rótulos e ícone personalizados", () => {
    const { root } = setup({ label: "Guardar", undoLabel: "Voltar", icon: <i data-testid="ic" /> });
    expect(root).toHaveAccessibleName("Guardar");
    fireEvent.click(root);
    expect(root).toHaveAccessibleName("Voltar");
  });

  it("movimento reduzido mantém o pavio", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <UndoFuseButton undoWindowMs={1000} fuse="bottom" />
      </MotionConfig>
    );
    const root = container.querySelector(ROOT) as HTMLElement;
    fireEvent.click(root);
    expect(container.querySelector(FUSE)).not.toBeNull();
  });

  it("repassa ref e className para a raiz", () => {
    const ref = createRef<HTMLButtonElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root).toHaveAttribute("type", "button");
  });
});
