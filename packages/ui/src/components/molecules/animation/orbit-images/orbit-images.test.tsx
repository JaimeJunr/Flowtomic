import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { OrbitImages, type OrbitImagesProps } from "./orbit-images";

const ITEMS = ["Banco", "Pix", "B3", "Planilha"].map((name) => <span key={name}>{name}</span>);

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<OrbitImagesProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <OrbitImages items={ITEMS} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="orbit-images"]') as HTMLElement;
  const items = () =>
    Array.from(view.container.querySelectorAll<HTMLElement>('[data-slot="orbit-images-item"]'));
  const positions = () => items().map((el) => `${el.style.left}|${el.style.top}`);
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  return { ...view, root, items, positions, advance };
}

describe("OrbitImages", () => {
  it("renderiza N itens numa lista dentro de um grupo", () => {
    const { root, items, getByText } = setup();
    expect(root).toHaveAttribute("role", "group");
    expect(root).toHaveAttribute("data-shape", "ellipse");
    expect(root.querySelector("ul")).not.toBeNull();
    expect(items()).toHaveLength(4);
    expect(getByText("Pix")).toBeInTheDocument();
  });

  it("renderiza o conteudo central", () => {
    const { container } = setup({ centerContent: <strong>12 bancos</strong> });
    const center = container.querySelector('[data-slot="orbit-images-center"]');
    expect(center).toHaveTextContent("12 bancos");
  });

  it("sem centerContent nao renderiza o centro", () => {
    const { container } = setup();
    expect(container.querySelector('[data-slot="orbit-images-center"]')).toBeNull();
  });

  it("mostra o caminho so com showPath, escondido do leitor de tela", () => {
    const off = setup();
    expect(off.container.querySelector('[data-slot="orbit-images-path"]')).toHaveAttribute(
      "fill",
      "none"
    );
    expect(off.container.querySelector('[data-slot="orbit-images-path"]')).toHaveAttribute(
      "stroke",
      "none"
    );
    off.unmount();
    const on = setup({ showPath: true, shape: "star" });
    const path = on.container.querySelector('[data-slot="orbit-images-path"]');
    expect(path).toHaveAttribute("stroke", "var(--border)");
    expect(path).toHaveAttribute("vector-effect", "non-scaling-stroke");
    expect(on.container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(on.root).toHaveAttribute("data-shape", "star");
  });

  it("customPath vence shape", () => {
    const { container } = setup({ customPath: "M 10 10 L 90 90 Z" });
    expect(container.querySelector('[data-slot="orbit-images-path"]')).toHaveAttribute(
      "d",
      "M 10 10 L 90 90 Z"
    );
  });

  it("expoe ref, className, aspect-ratio 16/9 e props nativas", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe", id: "integracoes" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("relative", "w-full", "minha-classe");
    expect(root.style.aspectRatio).toBe("16 / 9");
    expect(root).toHaveAttribute("id", "integracoes");
  });

  it("posiciona os itens em porcentagem, igualmente espacados", () => {
    const { items } = setup({ rotation: 0 });
    const [first, second, third] = items();
    expect(first.style.left).toBe("92%");
    expect(first.style.top).toBe("50%");
    expect(second.style.left).toBe("50%");
    expect(third.style.left).toBe("8%");
  });

  it("gira ao longo do tempo", () => {
    const { positions, advance } = setup();
    const before = positions();
    advance(3000);
    expect(positions()).not.toEqual(before);
  });

  it("paused mantem as posicoes", () => {
    const { positions, advance } = setup({ paused: true });
    const before = positions();
    advance(3000);
    expect(positions()).toEqual(before);
  });

  it("foco dentro de um item para o giro e soltar o foco retoma", () => {
    const { items, positions, advance } = setup({
      items: [
        <button key="a" type="button">
          Banco
        </button>,
        <button key="b" type="button">
          Pix
        </button>,
      ],
    });
    advance(100);
    const button = items()[0].querySelector("button") as HTMLButtonElement;
    act(() => button.focus());
    advance(50);
    const frozen = positions();
    advance(3000);
    expect(positions()).toEqual(frozen);
    act(() => button.blur());
    advance(3000);
    expect(positions()).not.toEqual(frozen);
  });

  it("movimento reduzido: posicoes fixas e iguais", () => {
    const { positions, advance } = setup({}, "always");
    const before = positions();
    advance(5000);
    expect(positions()).toEqual(before);
    expect(new Set(before).size).toBe(4);
  });

  it("reverse inverte o sentido", () => {
    const normal = setup({ rotation: 0, duration: 4 });
    normal.advance(1000);
    const a = normal.items()[0].style.top;
    normal.unmount();
    const reverse = setup({ rotation: 0, duration: 4, direction: "reverse" });
    reverse.advance(1000);
    const b = reverse.items()[0].style.top;
    expect(a).not.toBe(b);
  });

  it("usa getPointAtLength quando o ambiente mede o caminho", () => {
    Object.defineProperty(SVGElement.prototype, "getTotalLength", {
      configurable: true,
      value: () => 200,
    });
    Object.defineProperty(SVGElement.prototype, "getPointAtLength", {
      configurable: true,
      value: (at: number) => ({ x: at / 4, y: 30 }),
    });
    try {
      const { items } = setup({ rotation: 0, paused: true });
      expect(items()[1].style.left).toBe("12.5%");
      expect(items()[1].style.top).toBe("30%");
    } finally {
      delete (SVGElement.prototype as unknown as Record<string, unknown>).getTotalLength;
      delete (SVGElement.prototype as unknown as Record<string, unknown>).getPointAtLength;
    }
  });

  it("nao dispara erro ao receber blur sem foco previo", () => {
    const { root } = setup();
    expect(() => fireEvent.blur(root)).not.toThrow();
  });
});
