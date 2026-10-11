import { act, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import * as React from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MasonryGrid, type MasonryItem } from "./masonry-grid";

// ResizeObserver falso: o teste decide a largura que a raiz "mediu".
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  constructor(private callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  emit(width: number) {
    this.callback([{ contentRect: { width } } as ResizeObserverEntry], this as never);
  }
}

function emitWidth(width: number) {
  act(() => {
    for (const observer of FakeResizeObserver.instances) observer.emit(width);
  });
}

const items: MasonryItem[] = [
  { id: "a", height: 100, content: <p>Relatório A</p> },
  { id: "b", height: 50, content: <p>Nota B</p> },
  { id: "c", height: 30, content: <p>Nota C</p>, href: "/c" },
];

const originalObserver = global.ResizeObserver;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  FakeResizeObserver.instances = [];
  global.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
});
afterEach(() => {
  global.ResizeObserver = originalObserver;
});

describe("MasonryGrid", () => {
  it("marca a raiz com data-slot, role list e repassa className", () => {
    render(<MasonryGrid items={items} className="extra" data-testid="grid" />);
    const root = screen.getByTestId("grid");
    expect(root).toHaveAttribute("data-slot", "masonry-grid");
    expect(root).toHaveAttribute("role", "list");
    expect(root).toHaveClass("extra");
  });

  it("não renderiza itens antes da primeira medição", () => {
    render(<MasonryGrid items={items} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("dá à raiz a altura total e aos itens as posições", () => {
    render(<MasonryGrid items={items} data-testid="grid" breakpoints={[[0, 2]]} gap={20} />);
    emitWidth(220);
    // a=100 na coluna 0; b=50 e c=30 na coluna 1 -> 50 + 20 + 30 = 100
    expect(screen.getByTestId("grid").style.height).toBe("100px");
    const nodes = screen.getAllByRole("listitem");
    expect(nodes).toHaveLength(3);
    expect(nodes[0].style.width).toBe("100px");
    expect(nodes[0].style.height).toBe("100px");
    expect(nodes[1].style.transform).toContain("120px");
    expect(nodes[2].style.transform).toContain("70px");
  });

  it("mantém a ordem do DOM igual à de items", () => {
    render(<MasonryGrid items={items} />);
    emitWidth(800);
    const text = screen.getAllByRole("listitem").map((n) => n.textContent);
    expect(text).toEqual(["Relatório A", "Nota B", "Nota C"]);
  });

  it("renderiza link quando o item tem href", () => {
    render(<MasonryGrid items={items} />);
    emitWidth(800);
    const link = screen.getAllByRole("listitem")[2];
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/c");
    expect(link).toHaveAttribute("data-slot", "masonry-grid-item");
  });

  it("reflow: ao mudar a largura, as posições acompanham o novo número de colunas", () => {
    render(
      <MasonryGrid
        items={items}
        data-testid="grid"
        breakpoints={[
          [500, 3],
          [0, 1],
        ]}
        gap={0}
      />
    );
    emitWidth(600);
    expect(screen.getByTestId("grid").style.height).toBe("100px");
    emitWidth(300);
    expect(screen.getByTestId("grid").style.height).toBe("180px");
  });

  it("com movimento reduzido, os itens ficam direto no destino e sem blur", () => {
    render(
      <MotionConfig reducedMotion="always">
        <MasonryGrid items={items} animateFrom="bottom" breakpoints={[[0, 2]]} gap={20} />
      </MotionConfig>
    );
    emitWidth(220);
    const second = screen.getAllByRole("listitem")[1];
    expect(second.style.transform).toContain("120px");
    expect(second.style.transform).toContain("0px");
    expect(second.style.opacity).toBe("1");
    expect(second.style.filter ?? "").not.toContain("blur(10px)");
  });

  it("sem blurToFocus não aplica filtro de blur", () => {
    render(<MasonryGrid items={items} blurToFocus={false} />);
    emitWidth(800);
    expect(screen.getAllByRole("listitem")[0].style.filter ?? "").not.toContain("blur");
  });

  it("aceita ref como prop", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<MasonryGrid ref={ref} items={items} />);
    expect(ref.current).toHaveAttribute("data-slot", "masonry-grid");
  });

  it("aceita lista vazia sem erro e com altura zero", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<MasonryGrid items={[]} data-testid="grid" />);
    emitWidth(800);
    expect(screen.getByTestId("grid").style.height).toBe("0px");
    spy.mockRestore();
  });
});
