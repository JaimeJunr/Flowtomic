import { act, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GridLoader } from "./grid-loader";
import {
  CHECK_MASK,
  CROSS_MASK,
  formatElapsed,
  formatSeconds,
  PATTERNS,
  resolvePattern,
} from "./grid-loader-utils";

const ROOT = '[data-slot="grid-loader"]';
const CELL = '[data-slot="grid-loader-cell"]';
const TIMER = '[data-slot="grid-loader-timer"]';

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["setInterval", "clearInterval", "setTimeout", "clearTimeout", "Date"],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

function setup(props: Partial<React.ComponentProps<typeof GridLoader>> = {}, reduced = false) {
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <GridLoader {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  const cells = Array.from(view.container.querySelectorAll<HTMLElement>(CELL));
  return { ...view, root, cells };
}

describe("funções puras", () => {
  it("todo padrão tem grid*grid entradas, com atrasos >= 0 ou null", () => {
    for (const grid of [3, 4] as const) {
      for (const [name, def] of Object.entries(PATTERNS[grid])) {
        expect(def.delays, `${name} ${grid}x${grid}`).toHaveLength(grid * grid);
        for (const d of def.delays) expect(d === null || d >= 0).toBe(true);
        expect(def.loop).toBeGreaterThan(0);
      }
    }
  });

  it("máscaras têm o tamanho certo e marcam células", () => {
    expect(CHECK_MASK[3]).toHaveLength(9);
    expect(CROSS_MASK[3]).toHaveLength(9);
    expect(CHECK_MASK[4]).toHaveLength(16);
    expect(CROSS_MASK[4]).toHaveLength(16);
    expect(CHECK_MASK[3].some((v) => v === 1)).toBe(true);
    expect(CROSS_MASK[4].some((v) => v === 1)).toBe(true);
  });

  it("formatElapsed usa uma casa em pt-BR", () => {
    expect(formatElapsed(1.234)).toBe("1,2 s");
    expect(formatElapsed(0)).toBe("0,0 s");
    expect(formatSeconds(3.45)).toMatch(/^3,[45]$/);
  });

  it("padrão 4x4 em grade 3 lança erro com nome e grade", () => {
    expect(() => resolvePattern("sweep", 3)).toThrow(/sweep.*3/);
  });

  it("padrão customizado com tamanho errado lança erro com o valor recebido", () => {
    expect(() => resolvePattern({ delays: [0, 1] }, 3)).toThrow(/2/);
  });

  it("padrão customizado sem loop deriva um ciclo do maior atraso", () => {
    const def = resolvePattern({ delays: [0, 1, 2, 3, 4, 5, 6, 7, null] }, 3);
    expect(def.loop).toBeGreaterThan(7);
  });
});

describe("renderização", () => {
  it("renderiza 9 células na grade 3 e 16 na 4", () => {
    expect(setup().cells).toHaveLength(9);
    expect(setup({ grid: 4, pattern: "sweep" }).cells).toHaveLength(16);
  });

  it("working mostra o rótulo e anima as células com delay por passo", () => {
    const { root, cells } = setup({ pattern: "dots", stepMs: 100 });
    expect(root).toHaveAttribute("data-status", "working");
    expect(screen.getByText("Pensando")).toBeInTheDocument();
    expect(cells[0].style.animationDelay).toBe("0ms");
    expect(cells[8].style.animationDelay).toBe("400ms");
    expect(cells[0].style.animationName).not.toBe("");
  });

  it("buraco (null) fica sem animação", () => {
    const { cells } = setup({ pattern: "orbit" });
    expect(cells[4].style.animationName).toBe("");
  });

  it("done mostra 'Pronto em' com tempo e marca as células do check", () => {
    const { root, cells } = setup({ status: "done", elapsed: 3.4 });
    expect(root).toHaveAttribute("data-status", "done");
    expect(screen.getByText("Pronto em")).toBeInTheDocument();
    expect(root.querySelector(TIMER)).toHaveTextContent("3,4 s");
    CHECK_MASK[3].forEach((v, i) => {
      expect(cells[i].dataset.on).toBe(v ? "true" : "false");
    });
    expect(cells[0].style.animationName).toBe("");
    expect(root.querySelector('[data-slot="grid-loader-grid"]')?.className).toContain(
      "text-success"
    );
  });

  it("error mostra 'Falhou após' e usa a máscara do X em destructive", () => {
    const { root, cells } = setup({ status: "error", elapsed: 3.4 });
    expect(screen.getByText("Falhou após")).toBeInTheDocument();
    CROSS_MASK[3].forEach((v, i) => {
      expect(cells[i].dataset.on).toBe(v ? "true" : "false");
    });
    expect(root.querySelector('[data-slot="grid-loader-grid"]')?.className).toContain(
      "text-destructive"
    );
  });

  it("showTimer=false esconde o cronômetro", () => {
    const { root } = setup({ showTimer: false, status: "done", elapsed: 2 });
    expect(root.querySelector(TIMER)).toBeNull();
  });

  it("shape square tira o arredondamento", () => {
    const { cells } = setup({ shape: "square" });
    expect(cells[0].className).not.toContain("rounded-full");
  });

  it("padrão customizado é aplicado", () => {
    const { cells } = setup({
      pattern: { delays: [0, null, null, null, null, null, null, null, 2], loop: 4 },
      stepMs: 50,
    });
    expect(cells[8].style.animationDelay).toBe("100ms");
    expect(cells[1].style.animationName).toBe("");
  });

  it("encaminha ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "extra" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("extra");
  });
});

describe("cronômetro", () => {
  it("avança em working e para em done", () => {
    const view = setup();
    advance(1200);
    expect(view.root.querySelector(TIMER)).toHaveTextContent("1,2 s");
    view.rerender(
      <MotionConfig reducedMotion="never">
        <GridLoader status="done" />
      </MotionConfig>
    );
    advance(2000);
    expect(view.root.querySelector(TIMER)).toHaveTextContent("1,2 s");
  });

  it("volta a zero ao retornar para working", () => {
    const view = setup();
    advance(1000);
    view.rerender(
      <MotionConfig reducedMotion="never">
        <GridLoader status="done" />
      </MotionConfig>
    );
    view.rerender(
      <MotionConfig reducedMotion="never">
        <GridLoader status="working" />
      </MotionConfig>
    );
    expect(view.root.querySelector(TIMER)).toHaveTextContent("0,0 s");
  });

  it("elapsed controlado não avança", () => {
    const { root } = setup({ elapsed: 5 });
    advance(3000);
    expect(root.querySelector(TIMER)).toHaveTextContent("5,0 s");
  });
});

describe("acessibilidade", () => {
  it("raiz é status polite e a grade é aria-hidden", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("role", "status");
    expect(root).toHaveAttribute("aria-live", "polite");
    expect(root.querySelector('[data-slot="grid-loader-grid"]')).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(screen.getByText("Pensando, em andamento")).toBeInTheDocument();
  });

  it("anuncia o tempo por extenso ao terminar", () => {
    setup({ status: "done", elapsed: 3.4 });
    expect(screen.getByText("Pronto em 3,4 segundos")).toBeInTheDocument();
  });

  it("anuncia falha por extenso", () => {
    setup({ status: "error", elapsed: 3.4 });
    expect(screen.getByText("Falhou após 3,4 segundos")).toBeInTheDocument();
  });

  it("cronômetro fica aria-hidden enquanto working", () => {
    const { root } = setup();
    expect(root.querySelector(TIMER)).toHaveAttribute("aria-hidden", "true");
  });
});

describe("movimento reduzido", () => {
  it("working fica parado, sem animation, com o centro meio aceso", () => {
    const { cells } = setup({}, true);
    for (const c of cells) expect(c.style.animationName).toBe("");
    expect(cells[4].style.opacity).toBe("0.5");
    expect(cells[0].style.opacity).toBe("0.15");
  });

  it("done troca direto para o check", () => {
    const { cells } = setup({ status: "done", elapsed: 1 }, true);
    expect(cells[2].dataset.on).toBe("true");
    expect(cells[2].className).toContain("transition-none");
  });
});
