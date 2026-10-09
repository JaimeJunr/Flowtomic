import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { EvasiveTarget, type EvasiveTargetProps } from "./evasive-target";
import { applyWall, countsAsDodge, fleeOffset, tauntFor } from "./evasive-target-utils";

const ROOT = '[data-slot="evasive-target"]';
const PILL = '[data-slot="evasive-target-pill"]';
const HOME = { x: 200, y: 120 };

// O PointerEvent do setup não carrega `pointerType`; sem ele o mouse não é distinguível do toque.
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

class FakeDodgeRecorder {
  dodges: number[] = [];
  gaveUp = 0;
  caught = 0;
  onDodge = (count: number) => void this.dodges.push(count);
  onGiveUp = () => {
    this.gaveUp += 1;
  };
  onCatch = () => {
    this.caught += 1;
  };
}

function setup(props: Partial<EvasiveTargetProps> = {}) {
  const rec = new FakeDodgeRecorder();
  const view = render(
    <MotionConfig reducedMotion="never">
      <EvasiveTarget
        onDodge={rec.onDodge}
        onGiveUp={rec.onGiveUp}
        onCatch={rec.onCatch}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  root.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 400,
      bottom: 240,
      width: 400,
      height: 240,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return { ...view, root, rec };
}

const move = (root: Element, dx: number, dy = 0, pointerType = "mouse") =>
  fireEvent.pointerMove(root, {
    clientX: HOME.x + dx,
    clientY: HOME.y + dy,
    pointerType,
  });

/** Um ciclo completo: chega perto (conta uma fuga) e vai embora (rearma). */
function dodgeOnce(root: Element) {
  move(root, 30);
  move(root, 500);
}

describe("funções puras", () => {
  const home = { x: 0, y: 0 };

  it("fleeOffset é zero longe e igual a reach em cima de casa", () => {
    expect(fleeOffset({ x: 300, y: 0 }, home, 72, 120, 2, "both")).toEqual({ x: 0, y: 0 });
    const onTop = fleeOffset(home, home, 72, 120, 2, "both");
    expect(Math.hypot(onTop.x, onTop.y)).toBeCloseTo(72);
  });

  it("fleeOffset foge no sentido oposto ao ponteiro", () => {
    const offset = fleeOffset({ x: -30, y: 0 }, home, 72, 120, 2, "both");
    expect(offset.x).toBeGreaterThan(0);
    expect(offset.y).toBeCloseTo(0);
    expect(offset.x).toBeCloseTo(72 * 0.75 ** 2);
  });

  it("fleeOffset com eixo x zera y e mantém o módulo", () => {
    const offset = fleeOffset({ x: -30, y: -40 }, home, 72, 120, 2, "x");
    expect(offset.y).toBe(0);
    expect(offset.x).toBeGreaterThan(0);
    expect(fleeOffset({ x: 0, y: -30 }, home, 72, 120, 2, "y").x).toBe(0);
  });

  it("fleeOffset com falloff maior é mais fraco a meia distância", () => {
    const soft = fleeOffset({ x: -60, y: 0 }, home, 72, 120, 1, "both");
    const hard = fleeOffset({ x: -60, y: 0 }, home, 72, 120, 3, "both");
    expect(hard.x).toBeLessThan(soft.x);
  });

  it("applyWall: clamp corta e bounce dobra o excesso para dentro", () => {
    const bounds = { min: -50, max: 50 };
    expect(applyWall(80, bounds, "clamp")).toBe(50);
    expect(applyWall(-80, bounds, "clamp")).toBe(-50);
    expect(applyWall(30, bounds, "clamp")).toBe(30);
    expect(applyWall(70, bounds, "bounce")).toBe(30);
    expect(applyWall(-70, bounds, "bounce")).toBe(-30);
    expect(applyWall(500, bounds, "bounce")).toBeLessThanOrEqual(50);
  });

  it("countsAsDodge usa histerese: só conta ao cruzar 50% do reach, vindo de perto de casa", () => {
    expect(countsAsDodge(true, 10, 72)).toEqual({ armed: true, counted: false });
    expect(countsAsDodge(true, 40, 72)).toEqual({ armed: false, counted: true });
    expect(countsAsDodge(false, 70, 72)).toEqual({ armed: false, counted: false });
    expect(countsAsDodge(false, 5, 72)).toEqual({ armed: true, counted: false });
  });

  it("tauntFor percorre as falas e usa a última ao desistir", () => {
    const taunts = ["a", "b", "c", "fim"];
    expect(tauntFor(0, taunts, false)).toBe("a");
    expect(tauntFor(2, taunts, false)).toBe("c");
    expect(tauntFor(9, taunts, false)).toBe("c");
    expect(tauntFor(9, taunts, true)).toBe("fim");
  });
});

describe("EvasiveTarget", () => {
  it("renderiza a pílula padrão com a primeira fala e os slots", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-gave-up", "false");
    expect(root.querySelector(PILL)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Me pega" })).toBeInTheDocument();
  });

  it("mouse perto de casa chama onDodge(1) e troca a fala", () => {
    const { root, rec } = setup();
    move(root, 30);
    expect(rec.dodges).toEqual([1]);
    expect(screen.getByRole("button", { name: "Não" })).toBeInTheDocument();
    expect(root.querySelector(PILL)).toHaveAttribute("data-fleeing", "true");
  });

  it("não conta de novo enquanto o ponteiro continua perto (histerese)", () => {
    const { root, rec } = setup();
    move(root, 30);
    move(root, 31);
    move(root, 29);
    expect(rec.dodges).toEqual([1]);
    move(root, 500);
    dodgeOnce(root);
    expect(rec.dodges).toEqual([1, 2]);
  });

  it("ponteiro longe devolve a pílula para casa", () => {
    const { root } = setup();
    move(root, 30);
    move(root, 500);
    expect(root.querySelector(PILL)).toHaveAttribute("data-fleeing", "false");
  });

  it("desiste depois de `patience` fugas e para de reagir", () => {
    const { root, rec } = setup({ patience: 2 });
    dodgeOnce(root);
    dodgeOnce(root);
    expect(rec.gaveUp).toBe(1);
    expect(root).toHaveAttribute("data-gave-up", "true");
    expect(screen.getByRole("button", { name: "Tá bom, tá bom" })).toBeInTheDocument();
    move(root, 30);
    expect(rec.dodges).toEqual([1, 2]);
    expect(root.querySelector(PILL)).toHaveAttribute("data-fleeing", "false");
  });

  it("taunts personalizadas", () => {
    const { root } = setup({ taunts: ["Oi", "Tchau", "Fim"] });
    expect(screen.getByRole("button", { name: "Oi" })).toBeInTheDocument();
    move(root, 30);
    expect(screen.getByRole("button", { name: "Tchau" })).toBeInTheDocument();
  });

  it("toque não foge e mostra o touchNotice", () => {
    const { root, rec } = setup({ touchNotice: "Aqui é só de mouse" });
    expect(screen.queryByText("Aqui é só de mouse")).not.toBeInTheDocument();
    move(root, 30, 0, "touch");
    expect(rec.dodges).toEqual([]);
    expect(screen.getByText("Aqui é só de mouse")).toBeInTheDocument();
  });

  it("toque sem touchNotice não renderiza aviso", () => {
    const { root, container } = setup();
    move(root, 30, 0, "touch");
    expect(container.querySelector("output")).toBeNull();
  });

  it("clique chama onCatch e marca caught; teclado também pega sem fugir", async () => {
    const user = userEvent.setup({ skipHover: true });
    const { rec, root } = setup();
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(rec.caught).toBe(1);
    expect(rec.dodges).toEqual([]);
    expect(root.querySelector(PILL)).toHaveAttribute("data-caught", "true");
  });

  it("children como função recebe o estado", () => {
    const { root } = setup({
      children: (state) => (
        <button type="button">
          fugas {state.dodges} {state.gaveUp ? "desistiu" : "firme"}
        </button>
      ),
      patience: 2,
    });
    expect(screen.getByRole("button", { name: "fugas 0 firme" })).toBeInTheDocument();
    dodgeOnce(root);
    dodgeOnce(root);
    expect(screen.getByRole("button", { name: "fugas 2 desistiu" })).toBeInTheDocument();
  });

  it("children como nó é renderizado no lugar da pílula padrão", () => {
    setup({ children: <a href="#x">Surpresa</a> });
    expect(screen.getByRole("link", { name: "Surpresa" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disabled fica parado e não conta", () => {
    const { root, rec } = setup({ disabled: true });
    move(root, 30);
    expect(rec.dodges).toEqual([]);
    expect(root).toHaveAttribute("data-disabled", "true");
  });

  it("movimento reduzido não foge nem conta, e segue clicável", async () => {
    const rec = new FakeDodgeRecorder();
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <EvasiveTarget onDodge={rec.onDodge} onCatch={rec.onCatch} />
      </MotionConfig>
    );
    const root = container.querySelector(ROOT) as HTMLDivElement;
    root.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 240 }) as DOMRect;
    move(root, 30);
    expect(rec.dodges).toEqual([]);
    await userEvent.setup({ skipHover: true }).click(screen.getByRole("button"));
    expect(rec.caught).toBe(1);
  });

  it("eixo x e wall bounce aceitos sem quebrar", () => {
    const { root, rec } = setup({ axis: "x", wall: "bounce" });
    move(root, 0, 30);
    expect(rec.dodges).toEqual([1]);
  });

  it("patience menor que 1 lança erro com o valor recebido", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<EvasiveTarget patience={0} />)).toThrow(/received 0.*expected.*>= 1/);
    spy.mockRestore();
  });

  it("repassa ref, className, fieldHeight e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", fieldHeight: 300, id: "campo" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(root.style.height).toBe("300px");
    expect(root).toHaveAttribute("id", "campo");
  });

  it("act de pointerleave volta para casa", () => {
    const { root } = setup();
    move(root, 30);
    act(() => void fireEvent.pointerLeave(root, { pointerType: "mouse" }));
    expect(root.querySelector(PILL)).toHaveAttribute("data-fleeing", "false");
  });
});
