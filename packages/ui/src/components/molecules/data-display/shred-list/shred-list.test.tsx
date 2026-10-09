import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ShredList } from "./shred-list";
import {
  feedDistance,
  moveItem,
  reorderIndex,
  stripClip,
  stripCount,
  stripMotion,
} from "./shred-list-utils";

type FileItem = { id: string; name: string };

const FILES: FileItem[] = [
  { id: "a", name: "Porto ao entardecer" },
  { id: "b", name: "Relatório de março" },
  { id: "c", name: "Contrato assinado" },
];

const ROOT = '[data-slot="shred-list"]';
const STRIP = '[data-slot="shred-list-strip"]';
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "Date",
      "performance",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

class FakeShredRecorder {
  shredded: FileItem[] = [];
  reordered: FileItem[][] = [];
  onShred = (item: FileItem) => {
    this.shredded.push(item);
  };
  onReorder = (items: FileItem[]) => {
    this.reordered.push(items);
  };
}

function setup(
  props: Partial<React.ComponentProps<typeof ShredList<FileItem>>> = {},
  reducedMotion: "never" | "always" = "never"
) {
  const recorder = new FakeShredRecorder();
  const renderItem = vi.fn((item: FileItem) => <div>{item.name}</div>);
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <ShredList
        items={FILES}
        renderItem={renderItem}
        onShred={recorder.onShred}
        onReorder={recorder.onReorder}
        {...props}
      />
    </MotionConfig>
  );
  const cards = () => view.container.querySelectorAll<HTMLElement>('[data-slot="shred-list-item"]');
  return { ...view, recorder, renderItem, cards };
}

describe("shred-list-utils", () => {
  it("stripCount arredonda e nunca passa de 1 como mínimo", () => {
    expect(stripCount(340, 10)).toBe(34);
    expect(stripCount(3, 10)).toBe(1);
    expect(() => stripCount(100, 0)).toThrow(/received 0/);
  });

  it("stripClip: primeira e última colunas cobrem os extremos", () => {
    expect(stripClip(0, 4)).toBe("inset(0 75% 0 0%)");
    expect(stripClip(3, 4)).toBe("inset(0 0% 0 75%)");
    expect(stripClip(0, 1)).toBe("inset(0 0% 0 0%)");
  });

  it("stripMotion é determinístico com rng fixo e curl 0 zera o drift", () => {
    const rng = () => 0.5;
    const a = stripMotion(3, 10, 1, rng);
    expect(stripMotion(3, 10, 1, rng)).toEqual(a);
    expect(a.delay).toBeGreaterThanOrEqual(0);
    expect(stripMotion(3, 10, 0, rng).drift).toBe(0);
    expect(Math.abs(stripMotion(3, 10, 1.5, rng).drift)).toBeGreaterThan(0);
  });

  it("reorderIndex conta os centros acima da posição", () => {
    expect(reorderIndex([30, 90, 150], 10)).toBe(0);
    expect(reorderIndex([30, 90, 150], 100)).toBe(2);
    expect(reorderIndex([30, 90, 150], 999)).toBe(3);
  });

  it("moveItem move sem mutar e valida o índice", () => {
    const original = [1, 2, 3];
    expect(moveItem(original, 0, 2)).toEqual([2, 3, 1]);
    expect(original).toEqual([1, 2, 3]);
    expect(() => moveItem(original, 5, 0)).toThrow(/received 5/);
  });

  it("feedDistance cresce, com o primeiro puxão mais rápido", () => {
    expect(feedDistance(0, 180)).toBe(0);
    expect(feedDistance(1, 180)).toBeGreaterThan(180);
    expect(feedDistance(2, 180) - feedDistance(1, 180)).toBeCloseTo(180);
  });
});

describe("ShredList", () => {
  it("renderiza lista, itens e a fenda, e passa item e índice ao renderItem", () => {
    const { container, renderItem } = setup({ "aria-label": "Arquivos" });
    expect(container.querySelector(ROOT)).not.toBeNull();
    expect(screen.getByRole("list", { name: "Arquivos" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(container.querySelector('[data-slot="shred-list-slit"]')).not.toBeNull();
    expect(renderItem).toHaveBeenCalledWith(FILES[1], 1);
    expect(screen.getByText(/Delete tritura o item/)).toBeTruthy();
  });

  it("repassa ref e className à raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(container.querySelector(ROOT));
    expect(ref.current?.className).toContain("minha-classe");
  });

  it("Delete tritura: renderiza tiras e chama onShred uma vez ao fim", () => {
    const { cards, recorder, container } = setup();
    fireEvent.keyDown(cards()[0], { key: "Delete" });
    advance(100);
    expect(container.querySelectorAll(STRIP).length).toBeGreaterThan(0);
    expect(recorder.shredded).toHaveLength(0);
    advance(5000);
    expect(recorder.shredded).toEqual([FILES[0]]);
    advance(5000);
    expect(recorder.shredded).toHaveLength(1);
    expect(container.querySelectorAll(STRIP)).toHaveLength(0);
  });

  it("Backspace também tritura e ignora um segundo Delete durante o puxão", () => {
    const { cards, recorder } = setup();
    fireEvent.keyDown(cards()[1], { key: "Backspace" });
    fireEvent.keyDown(cards()[2], { key: "Delete" });
    advance(6000);
    expect(recorder.shredded).toEqual([FILES[1]]);
  });

  it("Alt+ArrowDown chama onReorder com a ordem trocada e anuncia a posição", () => {
    const { cards, recorder } = setup();
    fireEvent.keyDown(cards()[0], { key: "ArrowDown", altKey: true });
    expect(recorder.reordered).toEqual([[FILES[1], FILES[0], FILES[2]]]);
    expect(screen.getByText("Item movido para a posição 2 de 3")).toBeTruthy();
  });

  it("Alt+ArrowUp no primeiro e Alt+ArrowDown no último não fazem nada", () => {
    const { cards, recorder } = setup();
    fireEvent.keyDown(cards()[0], { key: "ArrowUp", altKey: true });
    fireEvent.keyDown(cards()[2], { key: "ArrowDown", altKey: true });
    expect(recorder.reordered).toHaveLength(0);
  });

  it("movimento reduzido: Delete chama onShred sem renderizar tiras", () => {
    const { cards, recorder, container } = setup({}, "always");
    fireEvent.keyDown(cards()[0], { key: "Delete" });
    expect(container.querySelectorAll(STRIP)).toHaveLength(0);
    advance(1000);
    expect(recorder.shredded).toEqual([FILES[0]]);
    expect(screen.getByText("Item removido")).toBeTruthy();
  });

  it("disabled ignora o teclado e tira os cartões da ordem de tab", () => {
    const { cards, recorder } = setup({ disabled: true });
    fireEvent.keyDown(cards()[0], { key: "Delete" });
    fireEvent.keyDown(cards()[0], { key: "ArrowDown", altKey: true });
    advance(6000);
    expect(recorder.shredded).toHaveLength(0);
    expect(recorder.reordered).toHaveLength(0);
    expect(cards()[0].tabIndex).toBe(-1);
  });

  it("curl 0 e stripWidth maior geram menos tiras", () => {
    const wide = setup({ stripWidth: 400, curl: 0 });
    vi.spyOn(wide.cards()[0], "getBoundingClientRect").mockReturnValue(rect(0, 0, 400, 50));
    fireEvent.keyDown(wide.cards()[0], { key: "Delete" });
    advance(100);
    expect(wide.container.querySelectorAll(STRIP)).toHaveLength(1);
  });
});

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return {
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

describe("ShredList com ponteiro", () => {
  // Cartões de 50px a cada 60px; fenda em y=180.
  function mockLayout(view: ReturnType<typeof setup>) {
    const spies = [
      ...Array.from(view.cards()).map((card, i) =>
        vi.spyOn(card, "getBoundingClientRect").mockReturnValue(rect(i * 60, 0, 300, 50))
      ),
      vi
        .spyOn(
          view.container.querySelector('[data-slot="shred-list-slit"]') as HTMLElement,
          "getBoundingClientRect"
        )
        .mockReturnValue(rect(180, 0, 300, 4)),
    ];
    return () => {
      for (const spy of spies) spy.mockRestore();
    };
  }

  const drag = (card: HTMLElement, dy: number) => {
    fireEvent.pointerDown(card, { clientX: 10, clientY: 10, pointerId: 1, button: 0 });
    fireEvent.pointerMove(card, { clientX: 10, clientY: 10 + dy, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 10, clientY: 10 + dy, pointerId: 1 });
  };

  it("soltar acima da fenda reordena pelo centro do cartão", () => {
    const view = setup();
    const restore = mockLayout(view);
    drag(view.cards()[0], 100);
    expect(view.recorder.reordered).toEqual([[FILES[1], FILES[0], FILES[2]]]);
    restore();
  });

  it("soltar na mesma posição não chama onReorder", () => {
    const view = setup();
    const restore = mockLayout(view);
    drag(view.cards()[0], 10);
    expect(view.recorder.reordered).toHaveLength(0);
    restore();
  });

  it("passar do bite com autoFeed puxa o cartão e tritura ao fim", () => {
    const view = setup();
    const restore = mockLayout(view);
    fireEvent.pointerDown(view.cards()[0], { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(view.cards()[0], { clientX: 0, clientY: 160, pointerId: 1 });
    advance(100);
    expect(view.container.querySelectorAll(STRIP).length).toBeGreaterThan(0);
    advance(10000);
    expect(view.recorder.shredded).toEqual([FILES[0]]);
    restore();
  });

  it("autoFeed false só tritura ao soltar sobre a fenda", () => {
    const view = setup({ autoFeed: false });
    const restore = mockLayout(view);
    fireEvent.pointerDown(view.cards()[0], { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(view.cards()[0], { clientX: 0, clientY: 160, pointerId: 1 });
    advance(100);
    expect(view.container.querySelectorAll(STRIP)).toHaveLength(0);
    fireEvent.pointerUp(view.cards()[0], { clientX: 0, clientY: 160, pointerId: 1 });
    advance(10000);
    expect(view.recorder.shredded).toEqual([FILES[0]]);
    restore();
  });

  it("disabled ignora o arrasto", () => {
    const view = setup({ disabled: true });
    const restore = mockLayout(view);
    fireEvent.pointerDown(view.cards()[0], { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(view.cards()[0], { clientX: 0, clientY: 160, pointerId: 1 });
    advance(10000);
    expect(view.recorder.shredded).toHaveLength(0);
    restore();
  });
});
