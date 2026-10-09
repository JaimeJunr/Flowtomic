import { act, createEvent, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CursorTrail, floatJitter, pointerAngle, shouldCreatePoint } from "./cursor-trail";

const POINT = '[data-slot="cursor-trail-point"]';

const rootOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="cursor-trail"]') as HTMLElement;
const pointsOf = (container: HTMLElement) => container.querySelectorAll(POINT);
// A lista lógica: a saída animada do motion mantém o nó no DOM por mais alguns quadros.
const countOf = (container: HTMLElement) => Number(rootOf(container).dataset.points);
// O PointerEvent do setup do jsdom não tem `pointerType`: ele entra por defineProperty.
const move = (root: HTMLElement, x: number, y = 0, pointerType = "mouse") => {
  const event = createEvent.pointerMove(root, { clientX: x, clientY: y });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(root, event);
};
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("CursorTrail", () => {
  it("shouldCreatePoint depende da distância desde o último ponto", () => {
    expect(shouldCreatePoint(null, { x: 0, y: 0 }, 100)).toBe(true);
    expect(shouldCreatePoint({ x: 0, y: 0 }, { x: 99, y: 0 }, 100)).toBe(false);
    expect(shouldCreatePoint({ x: 0, y: 0 }, { x: 100, y: 0 }, 100)).toBe(true);
    expect(shouldCreatePoint({ x: 0, y: 0 }, { x: 60, y: 80 }, 100)).toBe(true);
  });

  it("pointerAngle devolve graus a partir do deslocamento", () => {
    expect(pointerAngle({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0);
    expect(pointerAngle({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(90);
    expect(pointerAngle({ x: 0, y: 0 }, { x: -10, y: 0 })).toBe(180);
    expect(pointerAngle({ x: 0, y: 0 }, { x: 0, y: -10 })).toBe(-90);
  });

  it("floatJitter fica nos limites e é nulo no meio do intervalo", () => {
    expect(floatJitter(() => 0.5)).toEqual({ x: 0, y: 0, rotate: 0 });
    const low = floatJitter(() => 0);
    const high = floatJitter(() => 1);
    expect(low.x).toBeLessThan(0);
    expect(high.x).toBe(-low.x);
    expect(high.rotate).toBe(-low.rotate);
  });

  it("pointermove de mouse acima do espaçamento cria ponto; abaixo, não", () => {
    const { container } = render(<CursorTrail content="*" spacingPx={100} />);
    const root = rootOf(container);
    move(root, 0);
    expect(pointsOf(container)).toHaveLength(1);
    move(root, 50);
    expect(pointsOf(container)).toHaveLength(1);
    move(root, 120);
    expect(pointsOf(container)).toHaveLength(2);
  });

  it("caneta (pen) também cria ponto", () => {
    const { container } = render(<CursorTrail content="*" />);
    move(rootOf(container), 0, 0, "pen");
    expect(pointsOf(container)).toHaveLength(1);
  });

  it("pointerType touch é ignorado", () => {
    const { container } = render(<CursorTrail content="*" />);
    move(rootOf(container), 0, 0, "touch");
    move(rootOf(container), 300, 0, "touch");
    expect(pointsOf(container)).toHaveLength(0);
  });

  it("respeita maxPoints removendo o mais antigo", () => {
    const { container } = render(<CursorTrail content="*" maxPoints={3} spacingPx={10} />);
    const root = rootOf(container);
    for (let step = 0; step < 6; step++) move(root, step * 20);
    expect(countOf(container)).toBe(3);
  });

  it("parado, os pontos saem um a um, do mais antigo ao mais novo", () => {
    const { container } = render(<CursorTrail content="*" spacingPx={10} removeIntervalMs={30} />);
    const root = rootOf(container);
    for (let step = 0; step < 3; step++) move(root, step * 20);
    expect(countOf(container)).toBe(3);
    tick(99);
    expect(countOf(container)).toBe(3);
    tick(1 + 30);
    expect(countOf(container)).toBe(2);
    tick(30);
    expect(countOf(container)).toBe(1);
    tick(30);
    expect(countOf(container)).toBe(0);
  });

  it("o nó do ponto sai do DOM depois da animação de saída", async () => {
    vi.useRealTimers();
    const { container } = render(<CursorTrail content="*" removeIntervalMs={5} exitMs={10} />);
    move(rootOf(container), 0);
    expect(pointsOf(container)).toHaveLength(1);
    await vi.waitFor(() => expect(pointsOf(container)).toHaveLength(0));
  });

  it("continuar mexendo adia a remoção", () => {
    const { container } = render(<CursorTrail content="*" spacingPx={10} />);
    const root = rootOf(container);
    move(root, 0);
    tick(80);
    move(root, 20);
    tick(80);
    expect(pointsOf(container)).toHaveLength(2);
  });

  it("sair da área começa a remoção", () => {
    const { container } = render(<CursorTrail content="*" />);
    const root = rootOf(container);
    move(root, 0);
    fireEvent.pointerLeave(root);
    tick(100 + 30);
    expect(countOf(container)).toBe(0);
  });

  it("followDirection gira o ponto; sem ele fica sem giro", () => {
    const rotationOf = (follow: boolean) => {
      const { container, unmount } = render(
        <CursorTrail content="*" spacingPx={10} followDirection={follow} float={false} />
      );
      const root = rootOf(container);
      move(root, 0, 0);
      move(root, 0, 40);
      const rotation = (pointsOf(container)[1] as HTMLElement).style.transform;
      unmount();
      return rotation;
    };
    expect(rotationOf(true)).toContain("rotate(90deg)");
    expect(rotationOf(false)).not.toContain("rotate(90deg)");
  });

  it("a camada do rastro é decorativa e não bloqueia cliques", () => {
    const { container } = render(<CursorTrail content="*" />);
    move(rootOf(container), 0);
    const layer = pointsOf(container)[0]?.parentElement as HTMLElement;
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
  });

  it("renderiza os children e eles continuam clicáveis", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <CursorTrail content="*">
        <button type="button" onClick={onClick}>
          Exportar relatório
        </button>
      </CursorTrail>
    );
    fireEvent.click(getByRole("button", { name: "Exportar relatório" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("com movimento reduzido não há pontos, só os children", () => {
    const { container, getByText } = render(
      <MotionConfig reducedMotion="always">
        <CursorTrail content="*">
          <p>Resumo do mês</p>
        </CursorTrail>
      </MotionConfig>
    );
    move(rootOf(container), 0);
    move(rootOf(container), 300);
    expect(pointsOf(container)).toHaveLength(0);
    expect(getByText("Resumo do mês")).toBeInTheDocument();
  });

  it("raiz é relative overflow-hidden e expõe ref, className e props", () => {
    const ref = createRef<HTMLDivElement>();
    const onPointerMove = vi.fn();
    render(
      <CursorTrail content="*" ref={ref} className="h-40" id="area" onPointerMove={onPointerMove} />
    );
    expect(ref.current).toHaveAttribute("data-slot", "cursor-trail");
    expect(ref.current).toHaveClass("relative", "overflow-hidden", "h-40");
    expect(ref.current).toHaveAttribute("id", "area");
    move(ref.current as HTMLElement, 10);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
  });
});
