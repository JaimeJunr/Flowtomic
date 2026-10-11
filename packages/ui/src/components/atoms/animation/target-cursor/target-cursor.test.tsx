import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { TargetCursor, type TargetCursorProps } from "./target-cursor";

// Fake nomeada do loop de quadros: guarda o estado ligado/desligado pedido pelo componente.
const frameLoop = vi.hoisted(() => ({ calls: [] as boolean[] }));
vi.mock("@/lib/use-frame-loop", () => ({
  useFrameLoop: (_onFrame: unknown, active: boolean) => {
    frameLoop.calls.push(active);
  },
}));

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
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
  frameLoop.calls.length = 0;
  document.body.style.cursor = "";
});

const ROOT = '[data-slot="target-cursor"]';
const LABEL = '[data-slot="target-cursor-label"]';

function rectOf(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function Page(props: Partial<TargetCursorProps> & { reduced?: boolean }) {
  const { reduced = false, ...rest } = props;
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <main>
        <button type="button" data-cursor-target data-cursor-label="Abrir conta" data-testid="alvo">
          Abrir conta
        </button>
        <p data-testid="fora">Saldo consolidado</p>
        <TargetCursor {...rest} />
      </main>
    </MotionConfig>
  );
}

function move(on: Element | Window = window, pointerType = "mouse") {
  act(() => {
    on.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 40, clientY: 60, pointerType, bubbles: true })
    );
  });
}

function mouseIn(props: Partial<TargetCursorProps> & { reduced?: boolean } = {}) {
  const view = render(<Page {...props} />);
  const alvo = view.getByTestId("alvo");
  alvo.getBoundingClientRect = () => rectOf(100, 100, 120, 40);
  move();
  return { ...view, alvo };
}

describe("TargetCursor", () => {
  it("não renderiza antes do primeiro movimento do mouse", () => {
    const { container } = render(<Page />);
    expect(container.querySelector(ROOT)).toBeNull();
  });

  it("não ativa com toque nem com ponteiro desconhecido", () => {
    const { container } = render(<Page />);
    move(window, "touch");
    move(window, "");
    expect(container.querySelector(ROOT)).toBeNull();
    expect(document.body.style.cursor).toBe("");
  });

  it("aparece com o mouse e com caneta, escondido da leitura de tela", () => {
    const { container } = mouseIn();
    const root = container.querySelector(ROOT) as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("fixed");
    expect(root.className).toContain("pointer-events-none");
    const corners = container.querySelectorAll('[data-slot="target-cursor-corner"]');
    expect(Array.from(corners).map((c) => c.getAttribute("data-corner"))).toEqual([
      "tl",
      "tr",
      "br",
      "bl",
    ]);
    expect(container.querySelector('[data-slot="target-cursor-dot"]')).not.toBeNull();
  });

  it("aceita caneta como ponteiro", () => {
    const { container } = render(<Page />);
    move(window, "pen");
    expect(container.querySelector(ROOT)).not.toBeNull();
  });

  it("esconde o ponto com dotSize 0", () => {
    const { container } = mouseIn({ dotSize: 0 });
    expect(container.querySelector('[data-slot="target-cursor-dot"]')).toBeNull();
  });

  it("trava no alvo e mostra o rótulo; ao sair, solta", () => {
    const { container, getByTestId } = mouseIn();
    const root = container.querySelector(ROOT) as HTMLElement;
    expect(root.hasAttribute("data-locked")).toBe(false);

    fireEvent.pointerOver(getByTestId("alvo"));
    expect(root.getAttribute("data-locked")).toBe("true");
    expect(container.querySelector(LABEL)?.textContent).toBe("Abrir conta");

    fireEvent.pointerOver(getByTestId("fora"));
    expect(root.hasAttribute("data-locked")).toBe(false);
    expect(container.querySelector(LABEL)).toBeNull();
  });

  it("trava também quando o mouse passa por um filho do alvo", () => {
    const { container, getByTestId } = mouseIn();
    const filho = document.createElement("span");
    getByTestId("alvo").appendChild(filho);
    fireEvent.pointerOver(filho);
    expect(container.querySelector(ROOT)?.getAttribute("data-locked")).toBe("true");
  });

  it("respeita targetSelector customizado", () => {
    const { container, getByTestId } = mouseIn({ targetSelector: "p" });
    fireEvent.pointerOver(getByTestId("alvo"));
    expect(container.querySelector(ROOT)?.hasAttribute("data-locked")).toBe(false);
    fireEvent.pointerOver(getByTestId("fora"));
    expect(container.querySelector(ROOT)?.getAttribute("data-locked")).toBe("true");
  });

  it("não mostra rótulo com showLabel=false", () => {
    const { container, getByTestId } = mouseIn({ showLabel: false });
    fireEvent.pointerOver(getByTestId("alvo"));
    expect(container.querySelector(ROOT)?.getAttribute("data-locked")).toBe("true");
    expect(container.querySelector(LABEL)).toBeNull();
  });

  it("solta quando o alvo sai do DOM", () => {
    const { container, getByTestId, alvo } = mouseIn();
    fireEvent.pointerOver(getByTestId("alvo"));
    alvo.remove();
    move();
    expect(container.querySelector(ROOT)?.hasAttribute("data-locked")).toBe(false);
  });

  it("recalcula o retângulo na rolagem sem soltar o alvo", () => {
    const { container, getByTestId, alvo } = mouseIn();
    fireEvent.pointerOver(getByTestId("alvo"));
    alvo.getBoundingClientRect = () => rectOf(100, 20, 120, 40);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(container.querySelector(ROOT)?.getAttribute("data-locked")).toBe("true");
  });

  it("aperta e solta a mira com pointerdown/pointerup sem erro", () => {
    mouseIn();
    expect(() => {
      act(() => {
        window.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      });
    }).not.toThrow();
  });

  it("aplica cursor none no body enquanto ativa e restaura ao desmontar", () => {
    document.body.style.cursor = "crosshair";
    const { unmount } = render(<Page />);
    expect(document.body.style.cursor).toBe("crosshair");
    move();
    expect(document.body.style.cursor).toBe("none");
    unmount();
    expect(document.body.style.cursor).toBe("crosshair");
  });

  it("não mexe no cursor com hideNativeCursor=false", () => {
    mouseIn({ hideNativeCursor: false });
    expect(document.body.style.cursor).toBe("");
  });

  it("encaminha ref e className para a raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = mouseIn({ ref, className: "text-primary" });
    expect(ref.current).toBe(container.querySelector(ROOT));
    expect(ref.current?.className).toContain("text-primary");
  });

  describe("com container", () => {
    function Scoped() {
      const ref = { current: null as HTMLElement | null };
      return (
        <MotionConfig reducedMotion="never">
          <section
            data-testid="palco"
            ref={(node) => {
              ref.current = node;
            }}
            className="relative"
          >
            <button type="button" data-cursor-target data-testid="dentro">
              Simular
            </button>
            <TargetCursor container={ref} />
          </section>
          <button type="button" data-cursor-target data-testid="fora-palco">
            Fora
          </button>
        </MotionConfig>
      );
    }

    it("usa posição absolute, só reage dentro dele e põe cursor none nele", () => {
      const { getByTestId, container } = render(<Scoped />);
      const palco = getByTestId("palco");
      move(palco);
      const root = container.querySelector(ROOT) as HTMLElement;
      expect(root.className).toContain("absolute");
      expect(root.className).not.toContain("fixed");
      expect(palco.style.cursor).toBe("none");
      expect(document.body.style.cursor).toBe("");

      fireEvent.pointerOver(getByTestId("dentro"));
      expect(root.getAttribute("data-locked")).toBe("true");
    });

    it("ignora movimento fora do container", () => {
      const { getByTestId, container } = render(<Scoped />);
      move(getByTestId("fora-palco"));
      expect(container.querySelector(ROOT)).toBeNull();
    });

    it("some e restaura o cursor quando o mouse sai do container", () => {
      const { getByTestId, container } = render(<Scoped />);
      const palco = getByTestId("palco");
      move(palco);
      fireEvent.pointerLeave(palco);
      expect(container.querySelector(ROOT)).toBeNull();
      expect(palco.style.cursor).toBe("");
    });
  });

  describe("giro", () => {
    it("liga o loop de quadros depois que a mira está ativa", () => {
      render(<Page />);
      expect(frameLoop.calls.at(-1)).toBe(false);
      move();
      expect(frameLoop.calls.at(-1)).toBe(true);
    });

    it("não liga o loop com spinDuration 0", () => {
      mouseIn({ spinDuration: 0 });
      expect(frameLoop.calls.every((on) => !on)).toBe(true);
    });

    it("com movimento reduzido o giro fica parado", () => {
      mouseIn({ reduced: true });
      expect(frameLoop.calls.every((on) => !on)).toBe(true);
    });

    it("com movimento reduzido ainda trava no alvo, sem animação", () => {
      const { container, getByTestId } = mouseIn({ reduced: true });
      fireEvent.pointerOver(getByTestId("alvo"));
      expect(container.querySelector(ROOT)?.getAttribute("data-locked")).toBe("true");
    });
  });
});
