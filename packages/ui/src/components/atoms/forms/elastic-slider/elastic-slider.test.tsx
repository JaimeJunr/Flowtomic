import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ElasticSlider, type ElasticSliderProps } from "./elastic-slider";

// O PointerEvent do setup não carrega `pointerType`; sem ele o hover de mouse não dispara.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  pointerId = 1;
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

function setup(
  props: Partial<ElasticSliderProps> = {},
  reducedMotion: "never" | "always" = "never"
) {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <ElasticSlider aria-label="Aporte mensal" {...props} />
    </MotionConfig>
  );
  const track = screen.getByRole("slider");
  track.getBoundingClientRect = () =>
    ({ left: 100, right: 300, width: 200, top: 0, bottom: 6, height: 6 }) as DOMRect;
  return { ...view, track };
}

describe("ElasticSlider", () => {
  it("expõe os atributos aria e usa formatValue no texto", () => {
    setup({
      defaultValue: 2500,
      min: 0,
      max: 5000,
      formatValue: (v) => `R$ ${v}`,
    });
    const slider = screen.getByRole("slider", { name: "Aporte mensal" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "5000");
    expect(slider).toHaveAttribute("aria-valuenow", "2500");
    expect(slider).toHaveAttribute("aria-valuetext", "R$ 2500");
    expect(document.querySelector('[data-slot="elastic-slider-value"]')).toHaveTextContent(
      "R$ 2500"
    );
  });

  it("teclado: seta, End e Home chamam onValueChange", () => {
    const onValueChange = vi.fn();
    const { track } = setup({ defaultValue: 50, onValueChange });
    fireEvent.keyDown(track, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(51);
    fireEvent.keyDown(track, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(track, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(track).toHaveAttribute("aria-valuenow", "0");
  });

  it("arraste define o valor e o overflow não passa do máximo", () => {
    const onValueChange = vi.fn();
    const { track, container } = setup({ defaultValue: 0, onValueChange });
    const root = container.querySelector('[data-slot="elastic-slider"]');
    fireEvent.pointerDown(track, { clientX: 200 });
    expect(onValueChange).toHaveBeenLastCalledWith(50);
    expect(root).toHaveAttribute("data-dragging", "true");
    fireEvent.pointerMove(track, { clientX: 400 });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    fireEvent.pointerUp(track, { clientX: 400 });
    expect(root).toHaveAttribute("data-dragging", "false");
  });

  it("estica a trilha além da ponta e volta ao soltar", async () => {
    const { track } = setup({ defaultValue: 0 });
    fireEvent.pointerDown(track, { clientX: 200 });
    fireEvent.pointerMove(track, { clientX: 400 });
    await waitFor(() => expect(track.style.transform).toMatch(/scaleX\(1\.\d+/));
    fireEvent.pointerUp(track, { clientX: 400 });
    await waitFor(() => expect(track.style.transform).not.toMatch(/scaleX\(1\.\d+/));
  });

  it("modo controlado manda no valor", () => {
    const onValueChange = vi.fn();
    const { track } = setup({ value: 30, onValueChange });
    fireEvent.pointerDown(track, { clientX: 300 });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    expect(track).toHaveAttribute("aria-valuenow", "30");
  });

  it("respeita step na escala de 1 a 10", () => {
    const onValueChange = vi.fn();
    const { track } = setup({ min: 1, max: 10, step: 1, defaultValue: 5, onValueChange });
    fireEvent.pointerDown(track, { clientX: 163 });
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("hover de mouse escurece os ícones", () => {
    const { track } = setup();
    const start = document.querySelector('[data-slot="elastic-slider-start"]');
    expect(start).toHaveClass("text-muted-foreground");
    act(() => {
      fireEvent.pointerEnter(track, { pointerType: "mouse" });
    });
    expect(start).toHaveClass("text-foreground");
    act(() => {
      fireEvent.pointerLeave(track, { pointerType: "mouse" });
    });
    expect(start).toHaveClass("text-muted-foreground");
  });

  it("movimento reduzido muda o valor sem esticar a trilha", () => {
    const { track } = setup({ defaultValue: 10 }, "always");
    fireEvent.pointerDown(track, { clientX: 100 });
    fireEvent.pointerMove(track, { clientX: 20 });
    expect(track).toHaveAttribute("aria-valuenow", "0");
    const range = document.querySelector('[data-slot="elastic-slider-track"]') as HTMLElement;
    expect(range.style.transform).not.toContain("scaleX(1.");
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: "w-80" });
    const root = container.querySelector('[data-slot="elastic-slider"]');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("w-80");
  });

  it("lança erro com min >= max", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => setup({ min: 5, max: 5 })).toThrow("min=5 and max=5");
    spy.mockRestore();
  });
});
