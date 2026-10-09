import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SwellChipGroup } from "./swell-chip-group";
import {
  neighbourOffset,
  normalizeItems,
  springDamping,
  staggerDelayMs,
} from "./swell-chip-group-utils";

const LEVELS = ["Desligado", "Baixo", "Médio", "Alto", "Máximo"];

class FakeValueListener {
  calls: Array<[string, number]> = [];
  handle = (value: string, index: number) => {
    this.calls.push([value, index]);
  };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<React.ComponentProps<typeof SwellChipGroup>> = {}) {
  const listener = new FakeValueListener();
  const view = render(
    <MotionConfig reducedMotion="never">
      <SwellChipGroup
        aria-label="Nível de alerta"
        items={LEVELS}
        onValueChange={listener.handle}
        {...props}
      />
    </MotionConfig>
  );
  return { ...view, listener };
}

describe("funções puras", () => {
  it("neighbourOffset empurra para longe do escolhido", () => {
    expect(neighbourOffset(0, 2, 100, 0.2, 6)).toBe(-16);
    expect(neighbourOffset(4, 2, 100, 0.2, 6)).toBe(16);
  });

  it("neighbourOffset devolve 0 para o próprio escolhido e respeita push 0", () => {
    expect(neighbourOffset(2, 2, 100, 0.2, 6)).toBe(0);
    expect(neighbourOffset(3, 2, 100, 0.2, 0)).toBe(10);
  });

  it("staggerDelayMs cresce com a distância", () => {
    expect(staggerDelayMs(2, 2, 22)).toBe(0);
    expect(staggerDelayMs(0, 2, 22)).toBe(44);
    expect(staggerDelayMs(3, 2, 22)).toBe(22);
  });

  it("springDamping reduz o amortecimento com o bounce e rejeita bounce inválido", () => {
    expect(springDamping(0)).toBeGreaterThan(springDamping(0.4));
    expect(springDamping(0.4)).toBeGreaterThan(0);
    expect(() => springDamping(1.5)).toThrow(/received bounce 1.5/);
  });

  it("normalizeItems aceita string e objeto", () => {
    expect(normalizeItems(["a", { value: "b", label: "B", disabled: true }])).toEqual([
      { value: "a", label: "a", icon: undefined, disabled: false },
      { value: "b", label: "B", icon: undefined, disabled: true },
    ]);
  });
});

describe("SwellChipGroup", () => {
  it("expõe radiogroup nomeado, ref, className e data-slot", () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, className: "custom" });
    const group = screen.getByRole("radiogroup", { name: "Nível de alerta" });
    expect(group).toBe(ref.current);
    expect(group).toHaveClass("custom");
    expect(group).toHaveAttribute("data-slot", "swell-chip-group");
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("sem value/defaultValue, o primeiro fica escolhido", () => {
    setup();
    expect(screen.getByRole("radio", { name: "Desligado" })).toBeChecked();
  });

  it("clique escolhe e chama onValueChange com value e índice", async () => {
    const { listener } = setup();
    await userEvent.click(screen.getByRole("radio", { name: "Alto" }));
    expect(screen.getByRole("radio", { name: "Alto" })).toBeChecked();
    expect(listener.calls).toEqual([["Alto", 3]]);
  });

  it("setas movem a escolha", async () => {
    const { listener } = setup({ defaultValue: "Baixo" });
    const baixo = screen.getByRole("radio", { name: "Baixo" });
    baixo.focus();
    // Sem keyup: o Radix escolhe ao receber foco enquanto a seta está pressionada.
    fireEvent.keyDown(baixo, { key: "ArrowRight" });
    await waitFor(() => expect(screen.getByRole("radio", { name: "Médio" })).toBeChecked());
    expect(listener.calls).toEqual([["Médio", 2]]);
  });

  it("modo controlado segue a prop value", () => {
    const { rerender } = setup({ value: "Médio" });
    expect(screen.getByRole("radio", { name: "Médio" })).toBeChecked();
    rerender(
      <MotionConfig reducedMotion="never">
        <SwellChipGroup aria-label="Nível de alerta" items={LEVELS} value="Máximo" />
      </MotionConfig>
    );
    expect(screen.getByRole("radio", { name: "Máximo" })).toBeChecked();
  });

  it("item disabled não é escolhido", async () => {
    const { listener } = setup({
      items: ["Desligado", { value: "Baixo", label: "Baixo", disabled: true }],
    });
    const chip = screen.getByRole("radio", { name: "Baixo" });
    expect(chip).toBeDisabled();
    await userEvent.click(chip);
    expect(chip).not.toBeChecked();
    expect(listener.calls).toEqual([]);
  });

  it("grupo disabled bloqueia todos os chips", () => {
    setup({ disabled: true });
    for (const chip of screen.getAllByRole("radio")) expect(chip).toBeDisabled();
  });

  it("renderiza ícone e rótulo de nó", () => {
    setup({ items: [{ value: "a", label: "Rótulo A", icon: <svg data-testid="ico" /> }] });
    expect(screen.getByTestId("ico")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Rótulo A" })).toBeInTheDocument();
  });

  it("movimento reduzido: escolhe sem escala nem deslocamento", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <SwellChipGroup aria-label="Nível" items={LEVELS} />
      </MotionConfig>
    );
    fireEvent.click(screen.getByRole("radio", { name: "Médio" }));
    expect(screen.getByRole("radio", { name: "Médio" })).toBeChecked();
    const chip = container.querySelector('[data-slot="swell-chip"][data-state="checked"]');
    expect(chip).toHaveClass("bg-primary");
    expect((chip as HTMLElement).style.transform).not.toMatch(/scale\((?!1\))/);
  });
});
