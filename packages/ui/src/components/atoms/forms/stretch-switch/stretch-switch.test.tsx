import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { StretchSwitch } from "./stretch-switch";
import {
  dampingFromStiffness,
  dragPosition,
  isRealDrag,
  resolveDragRelease,
  stiffnessFromSpeed,
  stretchScale,
  thumbTravel,
} from "./stretch-switch-utils";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<React.ComponentProps<typeof StretchSwitch>> = {}, reduced = false) {
  return render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <StretchSwitch label="Modo avião" {...props} />
    </MotionConfig>
  );
}

const getSwitch = () => screen.getByRole("switch");
const getThumb = (container: HTMLElement) =>
  container.querySelector('[data-slot="stretch-switch-thumb"]') as HTMLElement;

function drag(thumb: HTMLElement, fromX: number, toX: number) {
  fireEvent.pointerDown(thumb, { clientX: fromX, pointerId: 1, button: 0 });
  fireEvent.pointerMove(thumb, { clientX: toX, pointerId: 1 });
  fireEvent.pointerUp(thumb, { clientX: toX, pointerId: 1 });
}

describe("funções puras", () => {
  it("stiffnessFromSpeed é linear e limitado", () => {
    expect(stiffnessFromSpeed(0)).toBe(120);
    expect(stiffnessFromSpeed(50)).toBe(510);
    expect(stiffnessFromSpeed(100)).toBe(900);
    expect(stiffnessFromSpeed(-20)).toBe(120);
    expect(stiffnessFromSpeed(400)).toBe(900);
    expect(() => stiffnessFromSpeed(Number.NaN)).toThrow(/received speed NaN/);
  });

  it("dampingFromStiffness cresce com a rigidez", () => {
    expect(dampingFromStiffness(900)).toBeGreaterThan(dampingFromStiffness(120));
  });

  it("stretchScale: 0 não estica, velocidade alta é limitada, área constante", () => {
    expect(stretchScale(5000, 0)).toEqual({ scaleX: 1, scaleY: 1 });
    expect(stretchScale(0, 36)).toEqual({ scaleX: 1, scaleY: 1 });
    const capped = stretchScale(1_000_000, 36);
    expect(capped.scaleX).toBeCloseTo(1.36);
    const mid = stretchScale(-300, 36);
    expect(mid.scaleX).toBeGreaterThan(1);
    expect(mid.scaleX * mid.scaleY).toBeCloseTo(1);
  });

  it("resolveDragRelease decide pelo meio do curso", () => {
    expect(resolveDragRelease(10, 24)).toBe(false);
    expect(resolveDragRelease(12, 24)).toBe(false);
    expect(resolveDragRelease(13, 24)).toBe(true);
  });

  it("dragPosition prende ao trilho e isRealDrag ignora tremida", () => {
    expect(dragPosition(0, -10, 24)).toBe(0);
    expect(dragPosition(20, 30, 24)).toBe(24);
    expect(dragPosition(5, 4, 24)).toBe(9);
    expect(isRealDrag(2)).toBe(false);
    expect(isRealDrag(-8)).toBe(true);
  });

  it("thumbTravel por tamanho", () => {
    expect(thumbTravel("sm")).toBe(18);
    expect(thumbTravel("default")).toBe(24);
    expect(thumbTravel("lg")).toBe(30);
  });
});

describe("StretchSwitch", () => {
  it("clique alterna e chama onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    setup({ onCheckedChange });
    await userEvent.click(getSwitch());
    expect(getSwitch()).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("controlado não muda sozinho", async () => {
    const onCheckedChange = vi.fn();
    setup({ checked: false, onCheckedChange });
    await userEvent.click(getSwitch());
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(getSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("Espaço alterna pelo teclado", async () => {
    setup();
    getSwitch().focus();
    await userEvent.keyboard(" ");
    expect(getSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("label liga ao switch", async () => {
    setup();
    expect(screen.getByLabelText("Modo avião")).toBe(getSwitch());
    await userEvent.click(screen.getByText("Modo avião"));
    expect(getSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("usa o id recebido no label", () => {
    setup({ id: "aviao" });
    expect(getSwitch()).toHaveAttribute("id", "aviao");
    expect(screen.getByText("Modo avião")).toHaveAttribute("for", "aviao");
  });

  it("disabled não alterna nem arrasta", async () => {
    const onCheckedChange = vi.fn();
    const { container } = setup({ disabled: true, onCheckedChange });
    await userEvent.click(getSwitch());
    drag(getThumb(container), 0, 40);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(getSwitch()).toHaveAttribute("aria-checked", "false");
    expect(getSwitch()).toBeDisabled();
    expect(getSwitch()).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
  });

  it("arrastar além do meio liga, uma única vez", () => {
    const onCheckedChange = vi.fn();
    const { container } = setup({ onCheckedChange });
    drag(getThumb(container), 0, 20);
    fireEvent.click(getSwitch());
    expect(getSwitch()).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it("arrastar antes do meio não liga", () => {
    const onCheckedChange = vi.fn();
    const { container } = setup({ onCheckedChange });
    drag(getThumb(container), 0, 8);
    fireEvent.click(getSwitch());
    expect(getSwitch()).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("arrastar de volta antes do meio desliga", () => {
    const { container } = setup({ defaultChecked: true });
    drag(getThumb(container), 24, 4);
    expect(getSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("arrasto que não sai do lugar vira clique comum", () => {
    const { container } = setup();
    drag(getThumb(container), 10, 11);
    fireEvent.click(getSwitch());
    expect(getSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("movimento reduzido renderiza e alterna", async () => {
    setup({}, true);
    await userEvent.click(getSwitch());
    expect(getSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("expõe data-slot, data-state, className e ref", async () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = setup({ ref, className: "extra" });
    const root = container.querySelector('[data-slot="stretch-switch"]');
    expect(root).toHaveAttribute("data-state", "unchecked");
    expect(ref.current).toBe(getSwitch());
    expect(getSwitch()).toHaveClass("extra");
    expect(getSwitch()).toHaveAttribute("data-slot", "stretch-switch-control");
    await userEvent.click(getSwitch());
    expect(root).toHaveAttribute("data-state", "checked");
  });

  it("aplica o tamanho no trilho", () => {
    setup({ size: "lg" });
    expect(getSwitch()).toHaveStyle({ width: "64px", height: "34px" });
  });
});
