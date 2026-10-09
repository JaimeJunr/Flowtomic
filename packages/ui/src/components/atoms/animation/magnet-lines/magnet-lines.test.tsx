import { act, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MagnetLines, type MagnetLinesProps } from "./magnet-lines";

const ROOT = '[data-slot="magnet-lines"]';
const LINE = '[data-slot="magnet-lines-line"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

// Todos os traços ficam com centro em (50, 50): basta para provar que o ângulo é recalculado.
let rectSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.useFakeTimers();
  rectSpy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    left: 40,
    top: 40,
    right: 60,
    bottom: 60,
    width: 20,
    height: 20,
    x: 40,
    y: 40,
    toJSON: () => ({}),
  } as DOMRect);
});
afterEach(() => {
  rectSpy.mockRestore();
  vi.useRealTimers();
});

function setup(props: Partial<MagnetLinesProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <MagnetLines {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const lines = () => Array.from(view.container.querySelectorAll<HTMLElement>(LINE));
  return { ...view, root, lines };
}

function movePointer(x: number, y: number, type = "pointermove") {
  act(() => {
    window.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y }));
    vi.advanceTimersByTime(40);
  });
}

describe("MagnetLines", () => {
  it("renderiza rows x columns traços", () => {
    const { lines } = setup({ rows: 3, columns: 4 });
    expect(lines()).toHaveLength(12);
  });

  it("usa 9x9 por padrão", () => {
    const { lines } = setup();
    expect(lines()).toHaveLength(81);
  });

  it("em repouso todos ficam no baseAngle", () => {
    const { lines } = setup({ rows: 2, columns: 2, baseAngle: -25 });
    for (const line of lines()) expect(line.style.getPropertyValue("--angle")).toBe("-25deg");
  });

  it("depois de pointermove o --angle muda", () => {
    const { lines } = setup({ rows: 2, columns: 2 });
    movePointer(150, 50);
    for (const line of lines()) expect(line.style.getPropertyValue("--angle")).toBe("90deg");
  });

  it("pointerdown também vale (toque sem ponteiro)", () => {
    const { lines } = setup({ rows: 1, columns: 1 });
    movePointer(50, 150, "pointerdown");
    expect(lines()[0].style.getPropertyValue("--angle")).toBe("180deg");
  });

  it("processa no máximo uma vez por quadro", () => {
    const { lines } = setup({ rows: 1, columns: 1 });
    act(() => {
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 150, clientY: 50 }));
      window.dispatchEvent(new MouseEvent("pointermove", { clientX: 50, clientY: 150 }));
      vi.advanceTimersByTime(40);
    });
    expect(lines()[0].style.getPropertyValue("--angle")).toBe("180deg");
  });

  it("movimento reduzido não muda o ângulo", () => {
    const { lines } = setup({ rows: 2, columns: 2, baseAngle: -10 }, "always");
    movePointer(150, 50);
    for (const line of lines()) expect(line.style.getPropertyValue("--angle")).toBe("-10deg");
  });

  it("remove os listeners ao desmontar", () => {
    const { unmount } = setup();
    unmount();
    expect(() => movePointer(150, 50)).not.toThrow();
  });

  it("é decorativo: aria-hidden e role presentation", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("role", "presentation");
  });

  it("aplica medidas e cor do traço", () => {
    const { lines } = setup({
      rows: 1,
      columns: 1,
      lineWidth: "4px",
      lineLength: "30px",
      lineColor: "var(--primary)",
    });
    const style = lines()[0].style;
    expect(style.width).toBe("4px");
    expect(style.height).toBe("30px");
    expect(style.background).toContain("var(--primary)");
  });

  it("repassa ref, className e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "raiz-x", id: "limalha" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("raiz-x");
    expect(root).toHaveAttribute("id", "limalha");
  });

  it("define as colunas do grid", () => {
    const { root } = setup({ columns: 5 });
    expect(root.style.gridTemplateColumns).toBe("repeat(5, 1fr)");
  });
});
