import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ElasticSegment, type ElasticSegmentProps } from "./elastic-segment";
import {
  normalizeItems,
  type Rect,
  resolveFling,
  segmentEdges,
  stretchPhases,
} from "./elastic-segment-utils";

const RECTS: Rect[] = [
  { left: 0, width: 100 },
  { left: 100, width: 100 },
  { left: 200, width: 100 },
  { left: 300, width: 100 },
];
const ITEMS = ["Dia", "Semana", "Mês", "Ano"];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<ElasticSegmentProps> = {}, reduced: "never" | "always" = "never") {
  return render(
    <MotionConfig reducedMotion={reduced}>
      <ElasticSegment items={ITEMS} {...props} />
    </MotionConfig>
  );
}

describe("segmentEdges", () => {
  it("devolve as bordas esquerda e direita do segmento", () => {
    expect(segmentEdges(RECTS, 1)).toEqual({ left: 100, right: 200 });
  });

  it("rejeita índice fora dos limites com o valor recebido", () => {
    expect(() => segmentEdges(RECTS, 9)).toThrow(/received index 9/);
  });
});

describe("stretchPhases", () => {
  const from = segmentEdges(RECTS, 0);
  const to = segmentEdges(RECTS, 2);

  it("indo para a direita, a borda direita lidera e a esquerda atrasa", () => {
    const phases = stretchPhases(from, to, 100, 3);
    expect(phases.front).toMatchObject({ edge: "right", target: 300, delay: 0 });
    expect(phases.back.edge).toBe("left");
    expect(phases.back.target).toBe(200);
    expect(phases.back.overshoot).toBe(203);
    expect(phases.back.delay).toBeGreaterThan(0);
  });

  it("indo para a esquerda, a borda esquerda lidera e a direita passa para trás", () => {
    const phases = stretchPhases(to, from, 100, 3);
    expect(phases.front).toMatchObject({ edge: "left", target: 0, delay: 0 });
    expect(phases.back).toMatchObject({ edge: "right", target: 100, overshoot: 97 });
  });

  it("stretch 0 move as duas bordas juntas", () => {
    const phases = stretchPhases(from, to, 0, 3);
    expect(phases.back.delay).toBe(0);
  });

  it("squash 0 não passa do destino", () => {
    const phases = stretchPhases(from, to, 100, 0);
    expect(phases.back.overshoot).toBe(phases.back.target);
  });

  it("o atraso cresce com o stretch", () => {
    const low = stretchPhases(from, to, 25, 0).back.delay;
    const high = stretchPhases(from, to, 100, 0).back.delay;
    expect(high).toBeGreaterThan(low);
  });
});

describe("resolveFling", () => {
  it("velocidade 0 escolhe o mais próximo", () => {
    expect(resolveFling(RECTS, 160, 0, 75)).toBe(1);
    expect(resolveFling(RECTS, 240, 0, 75)).toBe(2);
  });

  it("lançamento rápido vai um a mais", () => {
    expect(resolveFling(RECTS, 150, 600, 75)).toBe(2);
    expect(resolveFling(RECTS, 150, -600, 75)).toBe(0);
  });

  it("glide 0 ignora a velocidade", () => {
    expect(resolveFling(RECTS, 150, 5000, 0)).toBe(1);
  });

  it("respeita os limites 0..n-1", () => {
    expect(resolveFling(RECTS, 350, 99999, 100)).toBe(3);
    expect(resolveFling(RECTS, 50, -99999, 100)).toBe(0);
  });
});

describe("normalizeItems", () => {
  it("transforma string em value e label", () => {
    expect(normalizeItems(["Dia"])).toEqual([{ value: "Dia", label: "Dia", icon: undefined }]);
  });

  it("mantém objeto", () => {
    expect(normalizeItems([{ value: "d", label: "Dia" }])[0]).toMatchObject({ value: "d" });
  });
});

describe("ElasticSegment", () => {
  it("expõe um radiogroup nomeado e escolhe o primeiro item", () => {
    setup();
    expect(screen.getByRole("radiogroup", { name: "Controle segmentado" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dia" })).toBeChecked();
  });

  it("a camada de rótulos ativos é aria-hidden", () => {
    const { container } = setup();
    const layer = container.querySelector('[data-slot="elastic-segment-active-labels"]');
    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[data-slot="elastic-segment-thumb"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="elastic-segment-item"]')).toHaveLength(4);
  });

  it("clicar escolhe e chama onValueChange(value, index)", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    await userEvent.click(screen.getByRole("radio", { name: "Mês" }));
    expect(onValueChange).toHaveBeenCalledWith("Mês", 2);
    expect(screen.getByRole("radio", { name: "Mês" })).toBeChecked();
  });

  it("setas também escolhem", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange });
    // O Radix só confirma por seta enquanto a tecla está pressionada: sem keyup.
    fireEvent.keyDown(screen.getByRole("radio", { name: "Dia" }), { key: "ArrowRight" });
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("Semana", 1));
  });

  it("obedece value controlado sem chamar onValueChange", () => {
    const onValueChange = vi.fn();
    const view = setup({ value: "Ano", onValueChange });
    expect(screen.getByRole("radio", { name: "Ano" })).toBeChecked();
    view.rerender(
      <MotionConfig reducedMotion="never">
        <ElasticSegment items={ITEMS} value="Semana" onValueChange={onValueChange} />
      </MotionConfig>
    );
    expect(screen.getByRole("radio", { name: "Semana" })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("aceita defaultValue", () => {
    setup({ defaultValue: "Mês" });
    expect(screen.getByRole("radio", { name: "Mês" })).toBeChecked();
  });

  it("disabled ignora cliques", async () => {
    const onValueChange = vi.fn();
    setup({ disabled: true, onValueChange });
    await userEvent.click(screen.getByRole("radio", { name: "Mês" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("radiogroup")).toHaveClass("opacity-50");
  });

  it("funciona com movimento reduzido", async () => {
    const onValueChange = vi.fn();
    setup({ onValueChange }, "always");
    await userEvent.click(screen.getByRole("radio", { name: "Ano" }));
    expect(onValueChange).toHaveBeenCalledWith("Ano", 3);
  });

  it("repassa ref, className e data-slot na raiz", () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: "custom" });
    const root = screen.getByRole("radiogroup");
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("custom");
    expect(root).toHaveAttribute("data-slot", "elastic-segment");
  });

  it("equalSlots false deixa cada segmento abraçar o rótulo", () => {
    setup({ equalSlots: false });
    expect(screen.getByRole("radio", { name: "Dia" })).toHaveClass("px-3");
  });

  it("draggable false desliga o ponteiro no thumb", () => {
    const { container } = setup({ draggable: false });
    expect(container.querySelector('[data-slot="elastic-segment-thumb"]')).toHaveClass(
      "pointer-events-none"
    );
  });

  it("aplica a altura de cada tamanho", () => {
    setup({ size: "lg" });
    expect(screen.getByRole("radiogroup")).toHaveClass("h-11");
  });

  it("renderiza ícone e rótulo de item objeto", () => {
    setup({ items: [{ value: "d", label: "Dia", icon: <svg data-testid="ic" /> }, "Semana"] });
    expect(screen.getByRole("radio", { name: "Dia" })).toBeInTheDocument();
    expect(screen.getAllByTestId("ic").length).toBeGreaterThan(0);
  });
});

describe("ElasticSegment arrastando (layout simulado)", () => {
  it("soltar depois de arrastar escolhe o segmento mais próximo", () => {
    const widthSpy = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        return this.dataset.slot === "elastic-segment" ? 400 : 100;
      });
    const leftSpy = vi
      .spyOn(HTMLElement.prototype, "offsetLeft", "get")
      .mockImplementation(function (this: HTMLElement) {
        return ITEMS.indexOf(this.getAttribute("value") ?? "") * 100;
      });
    const onValueChange = vi.fn();
    const { container } = setup({ onValueChange });
    const thumb = container.querySelector('[data-slot="elastic-segment-thumb"]') as HTMLElement;
    fireEvent.pointerDown(thumb, { clientX: 50, pointerId: 1, button: 0 });
    fireEvent.pointerMove(thumb, { clientX: 260, pointerId: 1 });
    fireEvent.pointerUp(thumb, { clientX: 260, pointerId: 1 });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][1]).toBeGreaterThanOrEqual(2);
    widthSpy.mockRestore();
    leftSpy.mockRestore();
  });
});
