import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ScrubNumberField } from "./scrub-number-field";
import {
  decimalsFromStep,
  formatDelta,
  formatNumber,
  nudgeValue,
  parseNumberInput,
  rubberBand,
  scrubValue,
} from "./scrub-number-field-utils";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

type Props = Partial<React.ComponentProps<typeof ScrubNumberField>>;

function setup(props: Props = {}, reduced = false) {
  return render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <ScrubNumberField label="Raio" suffix="px" defaultValue={24} {...props} />
    </MotionConfig>
  );
}

const getInput = () => screen.getByRole("spinbutton") as HTMLInputElement;
const getRoot = (container: HTMLElement) =>
  container.querySelector('[data-slot="scrub-number-field"]') as HTMLElement;

function pointer(
  root: HTMLElement,
  type: "pointerDown" | "pointerMove" | "pointerUp",
  clientX: number,
  extra: object = {}
) {
  fireEvent[type](root, { clientX, pointerId: 1, button: 0, ...extra });
}

describe("funções puras", () => {
  const base = { step: 1, sensitivity: 2, multiplier: 1 };

  it("scrubValue aplica sensibilidade, coarse, fine e step fracionário", () => {
    expect(scrubValue(10, 10, base)).toBe(15);
    expect(scrubValue(10, -4, base)).toBe(8);
    expect(scrubValue(10, 10, { ...base, multiplier: 10 })).toBe(60);
    expect(scrubValue(10, 10, { ...base, multiplier: 0.1 })).toBe(10.5);
    expect(scrubValue(10, 6, { ...base, step: 0.5 })).toBe(11.5);
    expect(() => scrubValue(0, 1, { ...base, sensitivity: 0 })).toThrow(/received sensitivity 0/);
  });

  it("decimalsFromStep conta as casas do passo", () => {
    expect(decimalsFromStep(1)).toBe(0);
    expect(decimalsFromStep(0.1)).toBe(1);
    expect(decimalsFromStep(0.25)).toBe(2);
    expect(() => decimalsFromStep(0)).toThrow(/received step 0/);
  });

  it("rubberBand: dentro é igual, fora nunca passa do alcance, reach 0 é o limite", () => {
    expect(rubberBand(50, 0, 100, 8)).toBe(50);
    const over = rubberBand(150, 0, 100, 8);
    expect(over).toBeGreaterThan(100);
    expect(over).toBeLessThan(108);
    expect(rubberBand(1_000_000, 0, 100, 8)).toBeLessThanOrEqual(108);
    expect(rubberBand(-1_000_000, 0, 100, 8)).toBeGreaterThanOrEqual(-8);
    expect(rubberBand(150, 0, 100, 0)).toBe(100);
    expect(rubberBand(-5, 0, 100, 0)).toBe(0);
  });

  it("parseNumberInput aceita vírgula, limita, arredonda e cai no fallback", () => {
    const opts = { min: 0, max: 100, step: 0.5 };
    expect(parseNumberInput("12,5", 3, opts)).toBe(12.5);
    expect(parseNumberInput("12.7", 3, opts)).toBe(12.5);
    expect(parseNumberInput("abc", 3, opts)).toBe(3);
    expect(parseNumberInput("", 3, opts)).toBe(3);
    expect(parseNumberInput("500", 3, opts)).toBe(100);
    expect(parseNumberInput("-5", 3, opts)).toBe(0);
  });

  it("nudgeValue limita e respeita o multiplicador", () => {
    const opts = { step: 1, min: 0, max: 100 };
    expect(nudgeValue(10, 1, 1, opts)).toBe(11);
    expect(nudgeValue(10, -1, 10, opts)).toBe(0);
    expect(nudgeValue(99, 1, 10, opts)).toBe(100);
    expect(nudgeValue(10, 1, 0.1, opts)).toBe(10.1);
  });

  it("formatNumber usa vírgula e formatDelta usa o menos verdadeiro", () => {
    expect(formatNumber(1.5, 1)).toBe("1,5");
    expect(formatNumber(24, 0)).toBe("24");
    expect(formatDelta(6, 0)).toBe("+6");
    expect(formatDelta(-3, 0)).toBe("−3");
    expect(formatDelta(0.5, 1)).toBe("+0,5");
  });
});

describe("ScrubNumberField", () => {
  it("expõe o spinbutton acessível", () => {
    setup({ min: 0, max: 100 });
    const input = getInput();
    expect(input).toHaveAttribute("aria-label", "Raio");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "100");
    expect(input).toHaveAttribute("aria-valuenow", "24");
    expect(input).toHaveAttribute("aria-valuetext", "24 px");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveValue("24");
  });

  it("setas, Shift, Alt, Page e Home/End chamam onValueChange e onValueCommit", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    setup({ onValueChange, onValueCommit, min: 0, max: 100 });
    const input = getInput();
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(25);
    expect(onValueCommit).toHaveBeenLastCalledWith(25);
    fireEvent.keyDown(input, { key: "ArrowDown", shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(15);
    fireEvent.keyDown(input, { key: "ArrowUp", altKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(15.1);
    fireEvent.keyDown(input, { key: "PageUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(25.1);
    fireEvent.keyDown(input, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(input, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(input).toHaveAttribute("aria-valuenow", "0");
  });

  it("arrastar muda o valor, mostra o delta e compromete ao soltar", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    const { container } = setup({ onValueChange, onValueCommit });
    const root = getRoot(container);
    pointer(root, "pointerDown", 100);
    pointer(root, "pointerMove", 112);
    expect(onValueChange).toHaveBeenLastCalledWith(30);
    expect(root).toHaveAttribute("data-scrubbing", "true");
    const delta = container.querySelector('[data-slot="scrub-number-field-delta"]');
    expect(delta).toHaveTextContent("+6");
    expect(delta).toHaveAttribute("aria-hidden", "true");
    pointer(root, "pointerUp", 112);
    expect(onValueCommit).toHaveBeenCalledWith(30);
    expect(root).toHaveAttribute("data-scrubbing", "false");
    expect(getInput()).toHaveValue("30");
  });

  it("Shift acelera, Alt desacelera e o delta negativo usa U+2212", () => {
    const { container } = setup({ min: -1000, max: 1000, defaultValue: 0 });
    const root = getRoot(container);
    pointer(root, "pointerDown", 100);
    pointer(root, "pointerMove", 110, { shiftKey: true });
    expect(getInput()).toHaveValue("50");
    pointer(root, "pointerMove", 100, { altKey: true });
    expect(container.querySelector('[data-slot="scrub-number-field-delta"]')).toHaveTextContent(
      /^[+−]/
    );
    pointer(root, "pointerUp", 100);
  });

  it("passa do limite: o comprometido é limitado e o mostrado estica", async () => {
    const onValueChange = vi.fn();
    const { container } = setup({ min: 0, max: 100, defaultValue: 98, onValueChange });
    const root = getRoot(container);
    pointer(root, "pointerDown", 0);
    pointer(root, "pointerMove", 100);
    expect(onValueChange).toHaveBeenLastCalledWith(100);
    expect(Number(getInput().value.replace(",", "."))).toBeGreaterThan(100);
    pointer(root, "pointerUp", 100);
    await waitFor(() => expect(getInput()).toHaveValue("100"));
  });

  it("rubberReach 0 é parada seca", () => {
    const { container } = setup({ min: 0, max: 100, defaultValue: 98, rubberReach: 0 });
    const root = getRoot(container);
    pointer(root, "pointerDown", 0);
    pointer(root, "pointerMove", 100);
    expect(getInput()).toHaveValue("100");
    pointer(root, "pointerUp", 100);
  });

  it("movimento reduzido volta seco ao soltar", () => {
    const { container } = setup({ min: 0, max: 100, defaultValue: 98 }, true);
    const root = getRoot(container);
    pointer(root, "pointerDown", 0);
    pointer(root, "pointerMove", 100);
    pointer(root, "pointerUp", 100);
    expect(getInput()).toHaveValue("100");
  });

  it("showDelta=false não renderiza a pílula", () => {
    const { container } = setup({ showDelta: false });
    const root = getRoot(container);
    pointer(root, "pointerDown", 0);
    pointer(root, "pointerMove", 20);
    expect(container.querySelector('[data-slot="scrub-number-field-delta"]')).toBeNull();
  });

  it("clique sem mover foca e seleciona; digitar + Enter compromete", () => {
    const onValueCommit = vi.fn();
    const { container } = setup({ onValueCommit });
    const root = getRoot(container);
    pointer(root, "pointerDown", 50);
    pointer(root, "pointerUp", 51);
    const input = getInput();
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "42,4" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueCommit).toHaveBeenLastCalledWith(42);
    expect(input).toHaveValue("42");
  });

  it("Escape cancela a edição; texto inválido volta ao anterior no blur", () => {
    const { container } = setup();
    const root = getRoot(container);
    pointer(root, "pointerDown", 50);
    pointer(root, "pointerUp", 50);
    const input = getInput();
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("24");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("24");
  });

  it("showDirty liga o anel só quando o valor difere do padrão", () => {
    const { container } = setup({ showDirty: true });
    const root = getRoot(container);
    expect(root).toHaveAttribute("data-dirty", "false");
    expect(root.className).not.toContain("ring-primary");
    fireEvent.keyDown(getInput(), { key: "ArrowUp" });
    expect(root).toHaveAttribute("data-dirty", "true");
    expect(root.className).toContain("ring-primary");
  });

  it("showDirty desligado nunca põe o anel", () => {
    const { container } = setup();
    fireEvent.keyDown(getInput(), { key: "ArrowUp" });
    expect(getRoot(container).className).not.toContain("ring-primary");
  });

  it("showFill dimensiona o preenchimento pela faixa", () => {
    const { container } = setup({ min: 0, max: 200, defaultValue: 50 });
    const fill = container.querySelector('[data-slot="scrub-number-field-fill"]') as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("showFill=false remove o preenchimento", () => {
    const { container } = setup({ showFill: false });
    expect(container.querySelector('[data-slot="scrub-number-field-fill"]')).toBeNull();
  });

  it("modo controlado segue a prop value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ScrubNumberField label="Raio" value={10} onValueChange={onValueChange} />
    );
    fireEvent.keyDown(getInput(), { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(11);
    expect(getInput()).toHaveValue("10");
    rerender(<ScrubNumberField label="Raio" value={11} onValueChange={onValueChange} />);
    expect(getInput()).toHaveValue("11");
  });

  it("disabled ignora arrasto e teclado", () => {
    const onValueChange = vi.fn();
    const { container } = setup({ disabled: true, onValueChange });
    const root = getRoot(container);
    expect(root.className).toContain("opacity-50");
    pointer(root, "pointerDown", 0);
    pointer(root, "pointerMove", 40);
    fireEvent.keyDown(getInput(), { key: "ArrowUp" });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(getInput()).toBeDisabled();
  });

  it("repassa ref e className para a raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(getRoot(container));
    expect(getRoot(container)).toHaveClass("minha-classe");
  });
});
