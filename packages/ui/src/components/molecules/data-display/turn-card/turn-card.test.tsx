import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { TurnCard } from "./turn-card";
import {
  clampVelocity,
  dragAngle,
  isBackFace,
  isClick,
  resolveDragDistance,
  settleFace,
  shadowScale,
  tiltPose,
} from "./turn-card-utils";

const ROOT = '[data-slot="turn-card"]';

class FakeFlipListener {
  calls: boolean[] = [];
  handle = (flipped: boolean) => {
    this.calls.push(flipped);
  };
}

function setup(props: Partial<React.ComponentProps<typeof TurnCard>> = {}) {
  const listener = new FakeFlipListener();
  const view = render(
    <MotionConfig reducedMotion="never">
      <TurnCard
        front={<p>Fundo Atlântico FIM</p>}
        back={<p>Ficha técnica</p>}
        onFlippedChange={listener.handle}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const front = root.querySelector('[data-slot="turn-card-front"]') as HTMLElement;
  const back = root.querySelector('[data-slot="turn-card-back"]') as HTMLElement;
  return { ...view, root, front, back, listener };
}

function swipe(root: HTMLElement, fromX: number, toX: number, fromY = 0, toY = 0) {
  fireEvent.pointerDown(root, { clientX: fromX, clientY: fromY, pointerId: 1, button: 0 });
  fireEvent.pointerMove(root, { clientX: toX, clientY: toY, pointerId: 1 });
  fireEvent.pointerUp(root, { clientX: toX, clientY: toY, pointerId: 1 });
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("funções puras", () => {
  it("settleFace sem velocidade vai para a face mais próxima", () => {
    expect(settleFace(40, 0)).toBe(0);
    expect(settleFace(100, 0)).toBe(180);
    expect(settleFace(-100, 0)).toBe(-180);
  });

  it("settleFace com velocidade alta passa para a próxima face", () => {
    expect(settleFace(30, 600)).toBe(180);
    expect(settleFace(-30, -600)).toBe(-180);
  });

  it("settleFace nunca devolve -0", () => {
    expect(Object.is(settleFace(-10, 0), 0)).toBe(true);
  });

  it("isBackFace olha a paridade do múltiplo de 180, inclusive negativo", () => {
    expect(isBackFace(0)).toBe(false);
    expect(isBackFace(180)).toBe(true);
    expect(isBackFace(-180)).toBe(true);
    expect(isBackFace(360)).toBe(false);
  });

  it("resolveDragDistance usa o tamanho quando 0 e recusa valor inválido", () => {
    expect(resolveDragDistance(0, 300)).toBe(300);
    expect(resolveDragDistance(120, 300)).toBe(120);
    expect(resolveDragDistance(0, 0)).toBeGreaterThan(0);
    expect(() => resolveDragDistance(-5, 300)).toThrow(/received -5/);
  });

  it("dragAngle é proporcional ao deslocamento", () => {
    expect(dragAngle(0, 100, 200)).toBe(90);
    expect(dragAngle(180, -100, 200)).toBe(90);
  });

  it("clampVelocity limita nos dois sentidos", () => {
    expect(clampVelocity(99999)).toBe(1200);
    expect(clampVelocity(-99999)).toBe(-1200);
    expect(clampVelocity(50)).toBe(50);
  });

  it("isClick distingue clique de arrasto", () => {
    expect(isClick(1, 2)).toBe(true);
    expect(isClick(4, 0)).toBe(false);
  });

  it("shadowScale some de lado", () => {
    expect(shadowScale(0)).toBeCloseTo(1);
    expect(shadowScale(90)).toBeCloseTo(0);
    expect(shadowScale(180)).toBeCloseTo(1);
  });

  it("tiltPose inclina na direção do ponteiro e limita em tiltMax", () => {
    const corner = tiltPose(200, 0, 200, 100, 10);
    expect(corner.rotateY).toBe(10);
    expect(corner.rotateX).toBe(10);
    expect(corner.gx).toBe(100);
    expect(corner.gy).toBe(0);
    expect(tiltPose(100, 50, 200, 100, 10)).toEqual({ rotateX: 0, rotateY: 0, gx: 50, gy: 50 });
    expect(tiltPose(999, 5, 200, 100, 10).rotateY).toBe(10);
    expect(tiltPose(5, 5, 0, 0, 10).rotateY).toBe(0);
  });
});

describe("TurnCard", () => {
  it("renderiza como botão focável com rótulo padrão", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("role", "button");
    expect(root).toHaveAttribute("tabindex", "0");
    expect(root).toHaveAttribute("aria-label", "Virar cartão");
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("clique vira e Enter vira de volta", async () => {
    const { root, listener } = setup();
    await userEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(root).toHaveAttribute("data-flipped", "true");
    expect(listener.calls).toEqual([true]);
    root.focus();
    await userEvent.keyboard("{Enter}");
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(listener.calls).toEqual([true, false]);
  });

  it("Espaço também vira", async () => {
    const { root } = setup();
    root.focus();
    await userEvent.keyboard(" ");
    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("a face escondida fica aria-hidden e inert, e troca ao virar", async () => {
    const { root, front, back } = setup();
    expect(back).toHaveAttribute("aria-hidden", "true");
    expect(back).toHaveAttribute("inert");
    expect(front).not.toHaveAttribute("aria-hidden");
    await userEvent.click(root);
    expect(front).toHaveAttribute("aria-hidden", "true");
    expect(front).toHaveAttribute("inert");
    expect(back).not.toHaveAttribute("aria-hidden");
    expect(back).not.toHaveAttribute("inert");
  });

  it("flipOnClick=false não vira no clique, mas o teclado continua virando", async () => {
    const { root, listener } = setup({ flipOnClick: false });
    await userEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(listener.calls).toEqual([]);
    root.focus();
    await userEvent.keyboard("{Enter}");
    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("defaultFlipped começa pelo verso", () => {
    const { root, back } = setup({ defaultFlipped: true });
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(back).not.toHaveAttribute("aria-hidden");
  });

  it("controlado respeita a prop e só avisa a mudança", async () => {
    const { root, listener, rerender } = setup({ flipped: false });
    await userEvent.click(root);
    expect(listener.calls).toEqual([true]);
    expect(root).toHaveAttribute("aria-pressed", "false");
    rerender(
      <MotionConfig reducedMotion="never">
        <TurnCard front="a" back="b" flipped onFlippedChange={listener.handle} />
      </MotionConfig>
    );
    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("disabled ignora clique e teclado", async () => {
    const { root, listener } = setup({ disabled: true });
    expect(root).toHaveAttribute("aria-disabled", "true");
    expect(root).toHaveAttribute("tabindex", "-1");
    fireEvent.click(root);
    swipe(root, 0, 0);
    fireEvent.keyDown(root, { key: "Enter" });
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(listener.calls).toEqual([]);
  });

  it("arrasto longo vira; arrasto curto volta sem virar nem avisar", () => {
    const long = setup({ dragDistance: 200 });
    swipe(long.root, 0, -120);
    expect(long.root).toHaveAttribute("aria-pressed", "true");
    expect(long.listener.calls).toEqual([true]);
    long.unmount();

    const short = setup({ dragDistance: 200 });
    swipe(short.root, 0, 30);
    expect(short.root).toHaveAttribute("aria-pressed", "false");
    expect(short.listener.calls).toEqual([]);
  });

  it("eixo x arrasta na vertical", () => {
    const { root } = setup({ axis: "x", dragDistance: 200 });
    swipe(root, 0, 0, 0, 150);
    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("draggable=false não vira ao arrastar", () => {
    const { root } = setup({ draggable: false, dragDistance: 100 });
    swipe(root, 0, 100);
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("o clique que termina um arrasto não alterna de novo", () => {
    const { root, listener } = setup({ dragDistance: 100 });
    swipe(root, 0, 100);
    fireEvent.click(root);
    expect(listener.calls).toEqual([true]);
  });

  it("ponteiro com outro botão não inicia gesto", () => {
    const { root } = setup();
    fireEvent.pointerDown(root, { clientX: 0, pointerId: 1, button: 2 });
    fireEvent.pointerUp(root, { clientX: 0, pointerId: 1, button: 2 });
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("brilho e sombra existem; sem glare o brilho some", () => {
    const { root, rerender } = setup();
    expect(root.querySelector('[data-slot="turn-card-glare"]')).not.toBeNull();
    expect(root.querySelector('[data-slot="turn-card-shadow"]')).not.toBeNull();
    rerender(
      <MotionConfig reducedMotion="never">
        <TurnCard front="a" back="b" glare={false} />
      </MotionConfig>
    );
    expect(root.querySelector('[data-slot="turn-card-glare"]')).toBeNull();
  });

  it("inclinação no hover não quebra e some ao sair", () => {
    const { root } = setup({ tiltMax: 12 });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    fireEvent.pointerMove(root, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerLeave(root);
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("repassa ref, className e props nativas à raiz", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TurnCard ref={ref} front="a" back="b" className="w-72 h-96" data-testid="cartao" />);
    expect(ref.current).toBe(screen.getByTestId("cartao"));
    expect(ref.current).toHaveClass("w-72", "h-96");
  });

  it("chama handlers do consumidor", async () => {
    const onKeyDown = vi.fn();
    const onPointerDown = vi.fn();
    const { root } = setup({ onKeyDown, onPointerDown });
    root.focus();
    await userEvent.keyboard("{Enter}");
    fireEvent.pointerDown(root, { pointerId: 1, button: 0 });
    expect(onKeyDown).toHaveBeenCalled();
    expect(onPointerDown).toHaveBeenCalled();
  });
});

describe("movimento reduzido", () => {
  it("vira por fade, sem rotação 3D, e mantém a semântica", async () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <TurnCard front={<p>Frente</p>} back={<p>Verso</p>} />
      </MotionConfig>
    );
    const root = container.querySelector(ROOT) as HTMLElement;
    const back = root.querySelector('[data-slot="turn-card-back"]') as HTMLElement;
    expect(root).toHaveAttribute("data-reduced", "true");
    expect(back.style.transform).toBe("");
    await userEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(back).not.toHaveAttribute("aria-hidden");
    expect(root.querySelector('[data-slot="turn-card-glare"]')).toBeNull();
  });
});
