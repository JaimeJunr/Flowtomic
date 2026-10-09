import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { StrikeCheckbox } from "./strike-checkbox";
import { springFromBounce, strikeOrigin } from "./strike-checkbox-utils";

const LABEL = "Publicar a build";
const STRIKE = '[data-slot="strike-checkbox-strike"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<React.ComponentProps<typeof StrikeCheckbox>> = {}) {
  const view = render(
    <MotionConfig reducedMotion="never">
      <StrikeCheckbox label={LABEL} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="strike-checkbox"]') as HTMLElement;
  return { ...view, root, box: screen.getByRole("checkbox", { name: LABEL }) };
}

describe("funções puras", () => {
  it("springFromBounce: 0 é criticamente amortecida", () => {
    const { stiffness, damping, mass } = springFromBounce(0);
    expect(damping).toBeCloseTo(2 * Math.sqrt(stiffness * mass));
  });

  it("springFromBounce: mais bounce amortece menos", () => {
    expect(springFromBounce(0.5).damping).toBeLessThan(springFromBounce(0.2).damping);
    expect(springFromBounce(0.5).damping).toBeGreaterThan(0);
  });

  it("springFromBounce rejeita bounce negativo informando o valor", () => {
    expect(() => springFromBounce(-1)).toThrow(/received -1/);
  });

  it("strikeOrigin mapeia as 4 opções", () => {
    expect(strikeOrigin("left")).toBe("origin-left");
    expect(strikeOrigin("center")).toBe("origin-center");
    expect(strikeOrigin("right")).toBe("origin-right");
    expect(strikeOrigin("none")).toBeNull();
  });
});

describe("StrikeCheckbox", () => {
  it("expõe o checkbox com o texto como nome acessível", () => {
    const { box } = setup();
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("clicar no texto marca e chama onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    const { box } = setup({ onCheckedChange });
    await userEvent.click(screen.getByText(LABEL));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("controlado respeita checked", async () => {
    const { box } = setup({ checked: false });
    await userEvent.click(screen.getByText(LABEL));
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("espaço alterna", async () => {
    const { box } = setup();
    box.focus();
    await userEvent.keyboard(" ");
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("strike none não renderiza o risco", () => {
    const { container } = setup({ defaultChecked: true, strike: "none" });
    expect(container.querySelector(STRIKE)).toBeNull();
  });

  it("marcado com left renderiza o risco com origin-left", () => {
    const { container } = setup({ defaultChecked: true });
    const strike = container.querySelector(STRIKE) as HTMLElement;
    expect(strike).toHaveClass("origin-left");
    expect(strike).toHaveAttribute("aria-hidden", "true");
  });

  it("aplica doneOpacity ao texto quando marcado", () => {
    setup({ defaultChecked: true, doneOpacity: 0.3 });
    expect(screen.getByText(LABEL).closest("span[style]")).toHaveStyle({ opacity: "0.3" });
  });

  it("desmarcado mantém o texto opaco", () => {
    setup({ doneOpacity: 0.3 });
    expect(screen.getByText(LABEL).closest("span[style]")).toHaveStyle({ opacity: "1" });
  });

  it("disabled não alterna", async () => {
    const onCheckedChange = vi.fn();
    const { box, root } = setup({ disabled: true, onCheckedChange });
    await userEvent.click(screen.getByText(LABEL));
    fireEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(root).toHaveClass("opacity-50");
  });

  it("movimento reduzido marca e mostra o ✓", async () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <StrikeCheckbox label={LABEL} />
      </MotionConfig>
    );
    await userEvent.click(screen.getByText(LABEL));
    expect(screen.getByRole("checkbox", { name: LABEL })).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector("svg path")).toBeInTheDocument();
  });

  it("ref vai no controle, className e data-state na raiz", () => {
    const ref = createRef<HTMLButtonElement>();
    const { root } = setup({ ref, className: "custom", defaultChecked: true });
    expect(ref.current).toBe(screen.getByRole("checkbox", { name: LABEL }));
    expect(root).toHaveClass("custom");
    expect(root).toHaveAttribute("data-state", "checked");
  });

  it("aplica o tamanho lg", () => {
    const { container } = setup({ size: "lg" });
    expect(container.querySelector('[data-slot="strike-checkbox-box"]')).toHaveClass("size-6");
  });
});
