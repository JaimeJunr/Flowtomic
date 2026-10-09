import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FolderPicker } from "./folder-picker";
import {
  cloudHeight,
  defaultSublabel,
  estimatePillWidth,
  floatMotion,
  packRows,
  resolveItems,
  tiltFor,
} from "./folder-picker-utils";

const NOTAS = [
  "Paleta mais quente",
  "Apertar o espaçamento",
  "Logo parece pequeno",
  "Adorei o novo hero",
];

// O PointerEvent do setup não carrega `pointerType`; sem ele o hover de mouse não é distinguível.
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

class FakeSelectionRecorder {
  picks: Array<[string, number]> = [];
  record = (value: string, index: number) => {
    this.picks.push([value, index]);
  };
}

function setup(
  props: Partial<React.ComponentProps<typeof FolderPicker>> = {},
  reducedMotion: "never" | "always" = "never"
) {
  const rec = new FakeSelectionRecorder();
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <FolderPicker
        items={NOTAS}
        label="Feedback de design"
        trigger="click"
        onSelect={rec.record}
        {...props}
      />
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="folder-picker"]') as HTMLDivElement;
  const folder = screen.getByRole("button", { name: /Feedback de design/ });
  return { ...view, root, folder, rec };
}

describe("funções puras", () => {
  it("packRows respeita a largura, coloca todas e centraliza as linhas", () => {
    const widths = [100, 100, 100, 100];
    const packed = packRows(widths, 110, 10);
    expect(packed).toHaveLength(4);
    expect(new Set(packed.map((p) => p.row)).size).toBe(2);
    for (const row of [0, 1]) {
      const inRow = packed.map((p, i) => ({ ...p, w: widths[i] })).filter((p) => p.row === row);
      const left = Math.min(...inRow.map((p) => p.x - p.w / 2));
      const right = Math.max(...inRow.map((p) => p.x + p.w / 2));
      expect(right - left).toBeLessThanOrEqual(220);
      expect(left + right).toBeCloseTo(0);
    }
  });

  it("packRows põe pílula mais larga que a nuvem sozinha numa linha", () => {
    const packed = packRows([500, 50], 100, 8);
    expect(packed[0]).toEqual({ x: 0, row: 0 });
    expect(packed[1].row).toBe(1);
  });

  it("packRows de lista vazia devolve vazio", () => {
    expect(packRows([], 100, 8)).toEqual([]);
  });

  it("tiltFor é determinística e fica dentro de ±tilt", () => {
    for (let i = 0; i < 30; i += 1) {
      const value = tiltFor(i, 8);
      expect(value).toBe(tiltFor(i, 8));
      expect(Math.abs(value)).toBeLessThanOrEqual(8);
    }
    expect(tiltFor(3, 0)).toBe(0);
    expect(new Set([0, 1, 2, 3].map((i) => tiltFor(i, 8))).size).toBeGreaterThan(1);
  });

  it("floatMotion escala com drift e zera sem drift", () => {
    const still = floatMotion(1, 0, 0);
    expect(still.x.every((v) => v === 0)).toBe(true);
    const big = floatMotion(1, 1, 0.5);
    expect(Math.max(...big.y.map(Math.abs))).toBeGreaterThan(0);
    expect(big.delay).toBe(0.5);
    expect(floatMotion(0, 0.5, 0).duration).not.toBe(floatMotion(1, 0.5, 0).duration);
  });

  it("resolveItems normaliza strings e rejeita item inválido com o valor recebido", () => {
    expect(resolveItems(["a", { label: "B", value: "b" }])).toEqual([
      { label: "a", value: "a" },
      { label: "B", value: "b" },
    ]);
    expect(() => resolveItems([{ label: "x" } as never])).toThrow(/received .*"label":"x"/);
  });

  it("estimatePillWidth, defaultSublabel e cloudHeight", () => {
    expect(estimatePillWidth("abc")).toBeGreaterThan(estimatePillWidth("ab"));
    expect(defaultSublabel(4)).toBe("4 notas");
    expect(defaultSublabel(1)).toBe("1 nota");
    expect(cloudHeight(2)).toBeGreaterThan(cloudHeight(1));
  });
});

describe("FolderPicker", () => {
  it("expõe a pasta como botão com nome e sublabel padrão", () => {
    const { folder, root } = setup();
    expect(folder).toHaveAccessibleName(/Feedback de design.*4 notas/);
    expect(folder).toHaveAttribute("aria-expanded", "false");
    expect(root).toHaveAttribute("data-state", "closed");
    expect(screen.queryByRole("button", { name: NOTAS[0] })).toBeNull();
  });

  it("usa o sublabel informado", () => {
    const { folder } = setup({ sublabel: "revisão de hoje" });
    expect(folder).toHaveAccessibleName(/revisão de hoje/);
  });

  it("trigger click: clique abre e as pílulas ficam acessíveis no grupo", () => {
    const { folder, root } = setup();
    fireEvent.click(folder);
    expect(folder).toHaveAttribute("aria-expanded", "true");
    expect(root).toHaveAttribute("data-state", "open");
    const group = screen.getByRole("group", { name: "Feedback de design" });
    expect(folder.getAttribute("aria-controls")).toBe(group.id);
    for (const nota of NOTAS)
      expect(screen.getByRole("button", { name: nota })).toBeInTheDocument();
    fireEvent.click(folder);
    expect(folder).toHaveAttribute("aria-expanded", "false");
  });

  it("Escape fecha e devolve o foco à pasta", () => {
    const { folder } = setup();
    fireEvent.click(folder);
    const pill = screen.getByRole("button", { name: NOTAS[1] });
    pill.focus();
    fireEvent.keyDown(pill, { key: "Escape" });
    expect(folder).toHaveAttribute("aria-expanded", "false");
    expect(folder).toHaveFocus();
  });

  it("trigger click: clicar fora fecha", () => {
    const { folder } = setup();
    fireEvent.click(folder);
    fireEvent.pointerDown(document.body);
    expect(folder).toHaveAttribute("aria-expanded", "false");
  });

  it("trigger hover: pointerenter do mouse abre e pointerleave fecha", () => {
    const { folder, root } = setup({ trigger: "hover" });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    expect(folder).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    expect(folder).toHaveAttribute("aria-expanded", "false");
  });

  it("trigger hover: toque não abre por hover", () => {
    const { folder, root } = setup({ trigger: "hover" });
    fireEvent.pointerEnter(root, { pointerType: "touch" });
    expect(folder).toHaveAttribute("aria-expanded", "false");
  });

  it("trigger hover: foco e Enter também abrem", () => {
    const { folder } = setup({ trigger: "hover" });
    act(() => folder.focus());
    expect(folder).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(folder);
    expect(folder).toHaveAttribute("aria-expanded", "true");
  });

  it("trigger hover: fechar por Escape não reabre pelo foco devolvido", () => {
    const { folder } = setup({ trigger: "hover" });
    act(() => folder.focus());
    fireEvent.keyDown(folder, { key: "Escape" });
    expect(folder).toHaveAttribute("aria-expanded", "false");
  });

  it("clicar numa pílula chama onSelect e fecha", () => {
    const { folder, rec } = setup();
    fireEvent.click(folder);
    fireEvent.click(screen.getByRole("button", { name: NOTAS[2] }));
    expect(rec.picks).toEqual([[NOTAS[2], 2]]);
    expect(folder).toHaveAttribute("aria-expanded", "false");
    expect(folder).toHaveFocus();
  });

  it("closeOnSelect=false mantém aberta", () => {
    const { folder, rec } = setup({ closeOnSelect: false });
    fireEvent.click(folder);
    fireEvent.click(screen.getByRole("button", { name: NOTAS[0] }));
    expect(rec.picks).toHaveLength(1);
    expect(folder).toHaveAttribute("aria-expanded", "true");
  });

  it("itens { label, value } enviam o value", () => {
    const { folder, rec } = setup({ items: [{ label: "Paleta", value: "p1" }] });
    fireEvent.click(folder);
    fireEvent.click(screen.getByRole("button", { name: "Paleta" }));
    expect(rec.picks).toEqual([["p1", 0]]);
  });

  it("modo controlado respeita open e avisa onOpenChange", () => {
    const changes: boolean[] = [];
    const { folder } = setup({ open: false, onOpenChange: (o) => changes.push(o) });
    fireEvent.click(folder);
    expect(changes).toEqual([true]);
    expect(folder).toHaveAttribute("aria-expanded", "false");
  });

  it("defaultOpen começa aberta", () => {
    const { folder } = setup({ defaultOpen: true });
    expect(folder).toHaveAttribute("aria-expanded", "true");
  });

  it("float=false não habilita arrasto nas pílulas", () => {
    const { folder } = setup({ float: false });
    fireEvent.click(folder);
    const pill = screen.getByRole("button", { name: NOTAS[0] });
    expect(pill).toHaveAttribute("data-draggable", "false");
  });

  it("float habilita arrasto nas pílulas abertas", () => {
    const { folder } = setup();
    fireEvent.click(folder);
    expect(screen.getByRole("button", { name: NOTAS[0] })).toHaveAttribute(
      "data-draggable",
      "true"
    );
  });

  it("movimento reduzido abre sem boiar nem arrastar", () => {
    const { folder, root } = setup({}, "always");
    fireEvent.click(folder);
    expect(root).toHaveAttribute("data-state", "open");
    expect(screen.getByRole("button", { name: NOTAS[0] })).toHaveAttribute(
      "data-draggable",
      "false"
    );
  });

  it("repassa ref, className e marca os slots", () => {
    const ref = createRef<HTMLDivElement>();
    const { folder, root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
    expect(folder).toHaveAttribute("data-slot", "folder-picker-folder");
    fireEvent.click(folder);
    expect(document.querySelectorAll('[data-slot="folder-picker-item"]')).toHaveLength(4);
  });
});
