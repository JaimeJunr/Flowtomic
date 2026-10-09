import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GlideTooltip, GlideTooltipGroup } from "./glide-tooltip";
import {
  placeLabel,
  popOrigin,
  resolveSide,
  type WarmthState,
  warmthReducer,
} from "./glide-tooltip-utils";

// Com timers falsos a saída do motion pode demorar a remover o nó; "fechado" = ausente ou data-state=closed.
const isClosed = () => {
  const tip = screen.queryByRole("tooltip");
  return tip === null || tip.getAttribute("data-state") === "closed";
};

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

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

const COLD: WarmthState = { phase: "cold", target: null, delayMs: 0 };

describe("warmthReducer", () => {
  it("cold: enter inicia espera com o atraso pedido", () => {
    expect(warmthReducer(COLD, { type: "enter", id: "a", delayMs: 400 })).toEqual({
      phase: "pending",
      target: "a",
      delayMs: 400,
    });
  });

  it("cold: enter sem atraso abre na hora", () => {
    expect(warmthReducer(COLD, { type: "enter", id: "a", delayMs: 0 }).phase).toBe("open");
  });

  it("pending: elapsed abre, leave volta a cold, outro id é ignorado", () => {
    const pending = warmthReducer(COLD, { type: "enter", id: "a", delayMs: 400 });
    expect(warmthReducer(pending, { type: "elapsed" })).toMatchObject({
      phase: "open",
      target: "a",
    });
    expect(warmthReducer(pending, { type: "leave", id: "a" }).phase).toBe("cold");
    expect(warmthReducer(pending, { type: "leave", id: "b" })).toBe(pending);
  });

  it("open: enter em outro gatilho troca o alvo imediatamente", () => {
    const open: WarmthState = { phase: "open", target: "a", delayMs: 400 };
    expect(warmthReducer(open, { type: "enter", id: "b", delayMs: 400 })).toMatchObject({
      phase: "open",
      target: "b",
    });
    expect(warmthReducer(open, { type: "enter", id: "a", delayMs: 400 })).toBe(open);
  });

  it("open: leave do alvo esquenta; leave de outro é ignorado", () => {
    const open: WarmthState = { phase: "open", target: "a", delayMs: 400 };
    expect(warmthReducer(open, { type: "leave", id: "a" })).toMatchObject({
      phase: "warm",
      target: null,
    });
    expect(warmthReducer(open, { type: "leave", id: "b" })).toBe(open);
  });

  it("warm: enter abre imediato, cool esfria", () => {
    const warm: WarmthState = { phase: "warm", target: null, delayMs: 400 };
    expect(warmthReducer(warm, { type: "enter", id: "b", delayMs: 400 })).toMatchObject({
      phase: "open",
      target: "b",
    });
    expect(warmthReducer(warm, { type: "cool" }).phase).toBe("cold");
  });

  it("close (Escape) leva pending e open a cold; cool/elapsed fora de fase não mudam nada", () => {
    expect(warmthReducer({ phase: "open", target: "a", delayMs: 1 }, { type: "close" }).phase).toBe(
      "cold"
    );
    expect(
      warmthReducer({ phase: "pending", target: "a", delayMs: 1 }, { type: "close" }).phase
    ).toBe("cold");
    expect(warmthReducer(COLD, { type: "cool" })).toBe(COLD);
    expect(warmthReducer(COLD, { type: "elapsed" })).toBe(COLD);
  });
});

describe("placeLabel e resolveSide", () => {
  const trigger = { left: 100, top: 100, width: 40, height: 20 };
  const label = { width: 60, height: 24 };

  it("posiciona nos quatro lados com o gap", () => {
    expect(placeLabel(trigger, label, "top")).toEqual({ x: 90, y: 68 });
    expect(placeLabel(trigger, label, "bottom")).toEqual({ x: 90, y: 128 });
    expect(placeLabel(trigger, label, "left")).toEqual({ x: 32, y: 98 });
    expect(placeLabel(trigger, label, "right")).toEqual({ x: 148, y: 98 });
  });

  it("gap customizado", () => {
    expect(placeLabel(trigger, label, "top", 0)).toEqual({ x: 90, y: 76 });
  });

  it("vira top para bottom quando estoura o topo", () => {
    const viewport = { width: 800, height: 600 };
    expect(resolveSide({ ...trigger, top: 10 }, label, "top", viewport)).toBe("bottom");
    expect(resolveSide(trigger, label, "top", viewport)).toBe("top");
  });

  it("vira bottom para top, left para right e right para left", () => {
    const viewport = { width: 800, height: 600 };
    expect(resolveSide({ ...trigger, top: 580 }, label, "bottom", viewport)).toBe("top");
    expect(resolveSide({ ...trigger, left: 5 }, label, "left", viewport)).toBe("right");
    expect(resolveSide({ ...trigger, left: 780 }, label, "right", viewport)).toBe("left");
  });

  it("popOrigin nasce no lado do gatilho", () => {
    expect(popOrigin("top")).toBe("bottom center");
    expect(popOrigin("left")).toBe("right center");
  });

  it("mantém o lado quando o oposto também não cabe", () => {
    const viewport = { width: 800, height: 40 };
    expect(resolveSide({ ...trigger, top: 8 }, label, "top", viewport)).toBe("top");
  });
});

function Toolbar({
  groupProps = {},
}: {
  groupProps?: Partial<React.ComponentProps<typeof GlideTooltipGroup>>;
}) {
  return (
    <MotionConfig reducedMotion="never">
      <GlideTooltipGroup {...groupProps}>
        <GlideTooltip content="Negrito" shortcut="⌘B">
          <button type="button">B</button>
        </GlideTooltip>
        <GlideTooltip content="Itálico">
          <button type="button">I</button>
        </GlideTooltip>
      </GlideTooltipGroup>
    </MotionConfig>
  );
}

const bold = () => screen.getByRole("button", { name: "B" });
const italic = () => screen.getByRole("button", { name: "I" });

describe("GlideTooltip", () => {
  it("hover espera delayMs, mostra role=tooltip e liga aria-describedby", () => {
    render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    advance(399);
    expect(screen.queryByRole("tooltip")).toBeNull();
    advance(1);
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent("Negrito");
    expect(bold()).toHaveAttribute("aria-describedby", tip.id);
    expect(tip).toHaveAttribute("data-slot", "glide-tooltip");
    expect(tip).toHaveAttribute("data-state", "open");
  });

  it("sair antes do atraso cancela e o gatilho não fica com aria-describedby", () => {
    render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    advance(200);
    fireEvent.mouseLeave(bold());
    advance(500);
    expect(isClosed()).toBe(true);
    expect(bold()).not.toHaveAttribute("aria-describedby");
  });

  it("com um aberto, o vizinho troca o texto sem esperar", () => {
    render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    advance(400);
    fireEvent.mouseLeave(bold());
    fireEvent.mouseEnter(italic());
    expect(screen.getByRole("tooltip")).toHaveTextContent("Itálico");
    expect(italic()).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
    expect(bold()).not.toHaveAttribute("aria-describedby");
  });

  it("voltar dentro de warmWindowMs abre sem esperar; depois dele espera de novo", () => {
    render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    advance(400);
    fireEvent.mouseLeave(bold());
    advance(299);
    fireEvent.mouseEnter(bold());
    expect(screen.getByRole("tooltip")).toHaveTextContent("Negrito");
    fireEvent.mouseLeave(bold());
    advance(100);
    expect(isClosed()).toBe(true);
    advance(300);
    fireEvent.mouseEnter(bold());
    expect(isClosed()).toBe(true);
    advance(400);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("respeita delayMs e warmWindowMs do grupo", () => {
    render(<Toolbar groupProps={{ delayMs: 100, warmWindowMs: 50 }} />);
    fireEvent.mouseEnter(bold());
    advance(100);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.mouseLeave(bold());
    advance(60);
    fireEvent.mouseEnter(italic());
    expect(isClosed()).toBe(true);
  });

  it("delayMs do tooltip sobrescreve o do grupo", () => {
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltipGroup delayMs={1000}>
          <GlideTooltip content="Rápido" delayMs={50}>
            <button type="button">R</button>
          </GlideTooltip>
        </GlideTooltipGroup>
      </MotionConfig>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    advance(50);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Rápido");
  });

  it("focus abre, blur fecha e Escape fecha", () => {
    render(<Toolbar />);
    fireEvent.focus(bold());
    advance(400);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    fireEvent.blur(bold());
    advance(100);
    expect(isClosed()).toBe(true);
    fireEvent.focus(italic());
    expect(screen.getByRole("tooltip")).toHaveTextContent("Itálico");
    fireEvent.keyDown(italic(), { key: "Escape" });
    advance(100);
    expect(isClosed()).toBe(true);
  });

  it("disabled não abre", () => {
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltip content="Nada" disabled>
          <button type="button">X</button>
        </GlideTooltip>
      </MotionConfig>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    advance(1000);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shortcut vira <kbd>", () => {
    render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    advance(400);
    expect(screen.getByRole("tooltip").querySelector("kbd")).toHaveTextContent("⌘B");
  });

  it("chama os handlers originais do gatilho", () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltip content="Oi">
          <button
            type="button"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
          >
            B
          </button>
        </GlideTooltip>
      </MotionConfig>
    );
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.focus(button);
    fireEvent.blur(button);
    fireEvent.keyDown(button, { key: "a" });
    for (const spy of [onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown]) {
      expect(spy).toHaveBeenCalledTimes(1);
    }
  });

  it("preserva aria-describedby do gatilho e o junta ao do rótulo", () => {
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltip content="Oi">
          <button type="button" aria-describedby="ajuda">
            B
          </button>
        </GlideTooltip>
      </MotionConfig>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-describedby", "ajuda");
    fireEvent.mouseEnter(button);
    advance(400);
    expect(button.getAttribute("aria-describedby")).toBe(`ajuda ${screen.getByRole("tooltip").id}`);
  });

  it("funciona sozinho, fora de um grupo", () => {
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltip content="Sozinho" side="bottom">
          <button type="button">S</button>
        </GlideTooltip>
      </MotionConfig>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    advance(400);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Sozinho");
  });

  it("className vai para o rótulo e data-side reflete o lado", () => {
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltip content="Oi" side="right" className="minha-classe">
          <button type="button">S</button>
        </GlideTooltip>
      </MotionConfig>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    advance(400);
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveClass("minha-classe");
    expect(tip).toHaveAttribute("data-side", "right");
  });

  it("showFuse mostra a linha só durante a espera", () => {
    render(
      <MotionConfig reducedMotion="never">
        <GlideTooltip content="Oi" showFuse>
          <button type="button">S</button>
        </GlideTooltip>
      </MotionConfig>
    );
    const fuse = () => document.body.querySelector('[data-slot="glide-tooltip-fuse"]');
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(fuse()).not.toBeNull();
    advance(400);
    expect(fuse()).toBeNull();
  });

  it("sem showFuse não há linha", () => {
    render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    expect(document.body.querySelector('[data-slot="glide-tooltip-fuse"]')).toBeNull();
  });

  it("movimento reduzido ainda abre", () => {
    render(
      <MotionConfig reducedMotion="always">
        <GlideTooltipGroup>
          <GlideTooltip content="Reduzido">
            <button type="button">R</button>
          </GlideTooltip>
        </GlideTooltipGroup>
      </MotionConfig>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    advance(400);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Reduzido");
  });

  it("travelMs 0 abre normalmente (sem deslize)", () => {
    render(<Toolbar groupProps={{ travelMs: 0 }} />);
    fireEvent.mouseEnter(bold());
    advance(400);
    fireEvent.mouseLeave(bold());
    fireEvent.mouseEnter(italic());
    expect(screen.getByRole("tooltip")).toHaveTextContent("Itálico");
  });

  it("o grupo marca data-slot e usa display: contents", () => {
    const { container } = render(<Toolbar />);
    const group = container.querySelector('[data-slot="glide-tooltip-group"]');
    expect(group).not.toBeNull();
    expect(group).toHaveClass("contents");
  });

  it("desmontar o gatilho aberto fecha o rótulo", () => {
    const { rerender } = render(<Toolbar />);
    fireEvent.mouseEnter(bold());
    advance(400);
    rerender(
      <MotionConfig reducedMotion="never">
        <GlideTooltipGroup />
      </MotionConfig>
    );
    advance(100);
    expect(isClosed()).toBe(true);
  });
});
