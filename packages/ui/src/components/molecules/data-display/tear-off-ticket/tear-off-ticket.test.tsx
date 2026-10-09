import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TearOffTicket } from "./tear-off-ticket";
import {
  bridgeCount,
  foldGain,
  nextFoldAngle,
  perforationHoles,
  pieceMask,
  tearProgress,
} from "./tear-off-ticket-utils";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  vi.useRealTimers();
});

describe("perforationHoles", () => {
  it("devolve a quantidade pedida, uniforme e dentro da linha", () => {
    const centers = perforationHoles(250, 12, 6);
    expect(centers).toHaveLength(12);
    const gaps = centers.slice(1).map((c, i) => c - centers[i]);
    for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0]);
    expect(centers[0]).toBeGreaterThan(6);
    expect(centers[11]).toBeLessThan(250 - 6);
  });

  it("zero furos dá lista vazia e entrada inválida lança com o valor", () => {
    expect(perforationHoles(250, 0, 6)).toEqual([]);
    expect(() => perforationHoles(-1, 3, 6)).toThrow("received length -1");
    expect(() => perforationHoles(100, 2.5, 6)).toThrow("received holes 2.5");
  });
});

describe("tearProgress", () => {
  it("zero ângulo não rompe nada; ângulo de rasgo rompe todas", () => {
    expect(tearProgress(0, 30, 12)).toBe(0);
    expect(tearProgress(30, 30, 12)).toBe(bridgeCount(12));
    expect(tearProgress(90, 30, 12)).toBe(bridgeCount(12));
  });

  it("cresce de forma monotônica com o ângulo", () => {
    const counts = [0, 5, 10, 15, 20, 25, 30].map((a) => tearProgress(a, 30, 12));
    for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    expect(counts[3]).toBeGreaterThan(0);
  });

  it("rejeita tearAngle inválido", () => {
    expect(() => tearProgress(5, 0, 12)).toThrow("received tearAngle 0");
  });
});

describe("fold", () => {
  it("o papel resiste mais no começo", () => {
    expect(foldGain(0.45, 0)).toBeCloseTo(0.55);
    expect(foldGain(0.45, 1)).toBeCloseTo(1);
    expect(foldGain(0.45, 0.5)).toBeGreaterThan(foldGain(0.45, 0));
  });

  it("nextFoldAngle acumula e nunca fica negativo", () => {
    expect(nextFoldAngle(0, 20, 30, 0.45, 12)).toBeGreaterThan(0);
    expect(nextFoldAngle(2, -500, 30, 0.45, 12)).toBe(0);
  });
});

describe("pieceMask", () => {
  it("gera um caminho fechado com um arco por furo", () => {
    const d = pieceMask({
      seam: "right",
      length: 250,
      depth: 300,
      holes: 4,
      holeSize: 6,
      notch: 8,
    });
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    expect((d.match(/A/g) ?? []).length).toBe(4 + 2);
  });

  it("ponte rompida recua a borda no canhoto", () => {
    const whole = pieceMask({
      seam: "left",
      length: 250,
      depth: 150,
      holes: 4,
      holeSize: 6,
      notch: 8,
    });
    const torn = pieceMask({
      seam: "left",
      length: 250,
      depth: 150,
      holes: 4,
      holeSize: 6,
      notch: 8,
      broken: 2,
    });
    expect(torn).not.toBe(whole);
  });
});

function setup(props: Partial<React.ComponentProps<typeof TearOffTicket>> = {}, reduced = false) {
  const onTear = vi.fn();
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <TearOffTicket stub={<span>Nº 284619</span>} onTear={onTear} {...props}>
        <p>Spectrum</p>
      </TearOffTicket>
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="tear-off-ticket"]') as HTMLElement;
  return { ...view, onTear, root };
}

describe("TearOffTicket", () => {
  it("renderiza corpo e canhoto acessível pelo rótulo padrão", () => {
    const { root } = setup();
    expect(root).toHaveAttribute("data-torn", "false");
    expect(screen.getByText("Spectrum")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Destacar o canhoto" })).toBeInTheDocument();
  });

  it("Enter rasga: onTear uma vez, data-torn e canhoto fora da árvore", () => {
    vi.useFakeTimers();
    const { root, onTear } = setup();
    fireEvent.keyDown(screen.getByRole("button", { name: "Destacar o canhoto" }), { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTear).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-torn", "true");
    expect(screen.queryByRole("button", { name: "Destacar o canhoto" })).not.toBeInTheDocument();
  });

  it("Espaço também rasga", () => {
    vi.useFakeTimers();
    const { root } = setup();
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root).toHaveAttribute("data-torn", "true");
  });

  it("defaultTorn começa rasgado e sem canhoto", () => {
    const { root } = setup({ defaultTorn: true });
    expect(root).toHaveAttribute("data-torn", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("torn controlado volta a inteiro", () => {
    const { rerender, root } = setup({ torn: true });
    expect(root).toHaveAttribute("data-torn", "true");
    rerender(
      <MotionConfig reducedMotion="never">
        <TearOffTicket stub="x" torn={false}>
          corpo
        </TearOffTicket>
      </MotionConfig>
    );
    expect(root).toHaveAttribute("data-torn", "false");
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("arrastar além do ângulo rasga", () => {
    vi.useFakeTimers();
    const { root, onTear } = setup();
    const stub = screen.getByRole("button");
    fireEvent.pointerDown(stub, { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    for (let x = 20; x <= 400; x += 20) {
      fireEvent.pointerMove(stub, { clientX: x, clientY: 0, pointerId: 1 });
    }
    fireEvent.pointerUp(stub, { clientX: 400, clientY: 0, pointerId: 1 });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTear).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-torn", "true");
  });

  it("soltar antes do ângulo não rasga", () => {
    vi.useFakeTimers();
    const { root, onTear } = setup();
    const stub = screen.getByRole("button");
    fireEvent.pointerDown(stub, { clientX: 0, clientY: 0, pointerId: 1, button: 0 });
    fireEvent.pointerMove(stub, { clientX: 10, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(stub, { clientX: 10, clientY: 0, pointerId: 1 });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTear).not.toHaveBeenCalled();
    expect(root).toHaveAttribute("data-torn", "false");
  });

  it("orientation vertical marca data-orientation", () => {
    const { root } = setup({ orientation: "vertical" });
    expect(root).toHaveAttribute("data-orientation", "vertical");
  });

  it("disabled ignora o teclado e fica opaco", () => {
    vi.useFakeTimers();
    const { root, onTear } = setup({ disabled: true });
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTear).not.toHaveBeenCalled();
    expect(root).toHaveClass("opacity-50");
  });

  it("movimento reduzido também rasga", () => {
    vi.useFakeTimers();
    const { root, onTear } = setup({}, true);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onTear).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-torn", "true");
  });

  it("imagem leva o alt e fica cinza depois de usado", () => {
    setup({
      image: "data:image/svg+xml,%3Csvg/%3E",
      imageAlt: "Arte do evento",
      defaultTorn: true,
    });
    const img = screen.getByAltText("Arte do evento");
    expect(img).toHaveClass("grayscale");
  });

  it("encolhe com scale quando o pai é mais estreito que width", () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => 230,
    });
    try {
      const { root } = setup({ width: 460, height: 250 });
      expect(root).toHaveAttribute("data-scale", "0.5");
      expect(root.style.height).toBe("125px");
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, "offsetWidth", original);
    }
  });

  it("sem medida (jsdom) usa o tamanho nominal", () => {
    const { root } = setup({ width: 460, height: 250 });
    expect(root).toHaveAttribute("data-scale", "1");
    expect(root.style.height).toBe("250px");
  });

  it("repassa ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
  });
});
