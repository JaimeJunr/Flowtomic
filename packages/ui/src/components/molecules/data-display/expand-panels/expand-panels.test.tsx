import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ExpandPanels, type ExpandPanelsProps } from "./expand-panels";

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
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

const ITEMS = [
  { id: "rf", label: "Renda fixa", content: <span>CDB e Tesouro</span> },
  { id: "acoes", label: "Ações", content: <span>Bolsa</span> },
  { id: "fii", label: "Fundos imobiliários", content: <span>FIIs</span> },
  { id: "mm", label: "Multimercado", content: <span>Gestão ativa</span>, href: "/multimercado" },
];

function setup(
  props: Partial<ExpandPanelsProps> = {},
  reducedMotion: "never" | "always" = "never"
) {
  return render(
    <MotionConfig reducedMotion={reducedMotion}>
      <ExpandPanels items={ITEMS} aria-label="Classes de ativo" {...props} />
    </MotionConfig>
  );
}

const panel = (name: string) => screen.getByLabelText(name);
const active = (name: string) => panel(name).getAttribute("data-active");

describe("ExpandPanels", () => {
  it("marca a raiz e abre o primeiro painel", () => {
    const { container } = setup();
    const root = container.querySelector('[data-slot="expand-panels"]');
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveAttribute("aria-label", "Classes de ativo");
    expect(panel("Renda fixa")).toHaveAttribute("aria-expanded", "true");
    expect(panel("Ações")).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelectorAll('[data-slot="expand-panels-item"]')).toHaveLength(4);
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: "extra" });
    expect(ref.current).toBe(container.querySelector('[data-slot="expand-panels"]'));
    expect(ref.current).toHaveClass("extra");
  });

  it("usa link quando há href e botão nos demais", () => {
    setup();
    expect(panel("Multimercado").tagName).toBe("A");
    expect(panel("Ações").tagName).toBe("BUTTON");
  });

  it("mantém o conteúdo dos fechados na árvore", () => {
    setup();
    expect(screen.getByText("Gestão ativa")).toBeInTheDocument();
  });

  it("hover com mouse ativa o painel", () => {
    const onChange = vi.fn();
    setup({ onChange });
    fireEvent.pointerEnter(panel("Ações"), { pointerType: "mouse" });
    expect(active("Ações")).toBe("true");
    expect(active("Renda fixa")).toBe("false");
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("hover com toque não ativa; toque ao pressionar ativa", () => {
    setup();
    fireEvent.pointerEnter(panel("Ações"), { pointerType: "touch" });
    expect(active("Ações")).toBe("false");
    fireEvent.pointerDown(panel("Ações"), { pointerType: "touch" });
    expect(active("Ações")).toBe("true");
  });

  it("com trigger click, hover não ativa e clique ativa", () => {
    setup({ trigger: "click" });
    fireEvent.pointerEnter(panel("Ações"), { pointerType: "mouse" });
    expect(active("Ações")).toBe("false");
    fireEvent.click(panel("Ações"));
    expect(active("Ações")).toBe("true");
  });

  it("foco ativa mesmo com trigger click", () => {
    setup({ trigger: "click" });
    act(() => panel("Fundos imobiliários").focus());
    expect(active("Fundos imobiliários")).toBe("true");
  });

  it("setas movem o foco e o ativo; vertical usa cima e baixo", () => {
    setup();
    act(() => panel("Renda fixa").focus());
    fireEvent.keyDown(panel("Renda fixa"), { key: "ArrowRight" });
    expect(panel("Ações")).toHaveFocus();
    expect(active("Ações")).toBe("true");
    fireEvent.keyDown(panel("Ações"), { key: "ArrowLeft" });
    expect(panel("Renda fixa")).toHaveFocus();
  });

  it("na vertical, ArrowDown avança e ArrowRight é ignorada", () => {
    setup({ orientation: "vertical" });
    act(() => panel("Renda fixa").focus());
    fireEvent.keyDown(panel("Renda fixa"), { key: "ArrowRight" });
    expect(panel("Renda fixa")).toHaveFocus();
    fireEvent.keyDown(panel("Renda fixa"), { key: "ArrowDown" });
    expect(panel("Ações")).toHaveFocus();
  });

  it("modo controlado respeita value e só avisa", () => {
    const onChange = vi.fn();
    setup({ value: 2, onChange });
    expect(active("Fundos imobiliários")).toBe("true");
    fireEvent.pointerEnter(panel("Ações"), { pointerType: "mouse" });
    expect(onChange).toHaveBeenCalledWith(1);
    expect(active("Fundos imobiliários")).toBe("true");
    expect(active("Ações")).toBe("false");
  });

  it("defaultIndex define o aberto inicial", () => {
    setup({ defaultIndex: 3 });
    expect(active("Multimercado")).toBe("true");
  });

  it("mostra a legenda só no aberto e some com showLabels falso", () => {
    const { container, rerender } = setup();
    const captions = container.querySelectorAll('[data-slot="expand-panels-caption"]');
    expect(captions).toHaveLength(1);
    expect(panel("Renda fixa").querySelector('[data-slot="expand-panels-caption"]')).not.toBeNull();
    rerender(
      <MotionConfig reducedMotion="never">
        <ExpandPanels items={ITEMS} aria-label="x" showLabels={false} />
      </MotionConfig>
    );
    expect(container.querySelector('[data-slot="expand-panels-caption"]')).toBeNull();
  });

  it("lança erro com valores inválidos", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => setup({ items: [ITEMS[0]] })).toThrow(/received 1/);
    expect(() => setup({ expandRatio: 0.95 })).toThrow(/received 0.95/);
    expect(() => setup({ defaultIndex: 9 })).toThrow(/received 9/);
    spy.mockRestore();
  });

  it("gira os fechados e não gira o aberto", () => {
    setup({ tilt: 8 });
    expect(panel("Ações").style.transform).toContain("rotateY(-8deg)");
    expect(panel("Renda fixa").style.transform).not.toContain("rotateY(-");
  });

  it("com movimento reduzido não há giro", () => {
    setup({ tilt: 8 }, "always");
    for (const name of ["Renda fixa", "Ações", "Fundos imobiliários"]) {
      const transform = panel(name).style.transform;
      expect(transform).not.toMatch(/rotateY\((?!0(deg)?\))/);
    }
  });

  it("mostra o rótulo vertical nos fechados, escondido (aria-hidden) e oculto no ativo", () => {
    setup();
    const label = (name: string) => panel(name).querySelector('[data-slot="expand-panels-label"]');
    expect(label("Ações")).toHaveAttribute("aria-hidden", "true");
    expect(label("Ações")).toHaveAttribute("data-state", "visible");
    expect(label("Ações")).toHaveTextContent("Ações");
    expect(label("Renda fixa")).toHaveAttribute("data-state", "hidden");
  });

  it("apaga o conteúdo dos fechados para 0.15 e mantém o do aberto pleno", () => {
    setup();
    const content = (name: string) =>
      panel(name).querySelector('[data-slot="expand-panels-content"]') as HTMLElement;
    expect(content("Ações").style.opacity).toBe("0.15");
    expect(content("Renda fixa").style.opacity).toBe("1");
  });

  it("na orientação vertical o rótulo fica horizontal", () => {
    setup({ orientation: "vertical" });
    const label = panel("Ações").querySelector('[data-slot="expand-panels-label"]');
    expect(label?.className).not.toContain("writing-mode");
  });
});
