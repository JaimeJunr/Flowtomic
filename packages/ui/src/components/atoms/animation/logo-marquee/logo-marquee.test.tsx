import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LogoMarquee, type LogoMarqueeItem, type LogoMarqueeProps } from "./logo-marquee";

const ROOT = '[data-slot="logo-marquee"]';
const TRACK = '[data-slot="logo-marquee-track"]';
const ITEM = '[data-slot="logo-marquee-item"]';

const ITEMS: LogoMarqueeItem[] = [
  { node: <span>Open Finance</span>, title: "Open Finance" },
  { node: <span>Pix</span>, href: "https://example.com/pix", title: "Pix" },
  { src: "/b3.svg", alt: "Logo da B3" },
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
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<LogoMarqueeProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <LogoMarquee items={ITEMS} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const track = view.container.querySelector(TRACK) as HTMLElement;
  return { ...view, root, track };
}

// Mede cada elemento pelo data-slot: a raiz vira o viewport e a cópia o tamanho de uma lista.
function stubSizes(viewport: number, copy: number) {
  return vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
    this: HTMLElement
  ) {
    return this.dataset.slot === "logo-marquee" ? viewport : copy;
  });
}

describe("LogoMarquee", () => {
  it("expõe ref, className, região rotulada e data-slot", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "overflow-hidden");
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-label", "Logos de parceiros");
    expect(root).toHaveAttribute("data-direction", "left");
  });

  it("aceita rótulo e direção customizados", () => {
    const { root, track } = setup({ "aria-label": "Integrações", direction: "up" });
    expect(root).toHaveAttribute("aria-label", "Integrações");
    expect(root).toHaveAttribute("data-direction", "up");
    expect(track).toHaveClass("flex-col");
  });

  it("renderiza os itens e esconde as cópias extras de leitores de tela", () => {
    const { container, getAllByText } = setup();
    expect(container.querySelectorAll(ITEM)).toHaveLength(ITEMS.length * 2);
    expect(getAllByText("Open Finance")).toHaveLength(2);
    const copies = container.querySelectorAll("[data-copy]");
    expect(copies[0]).not.toHaveAttribute("aria-hidden");
    expect(copies[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("links da primeira cópia são focáveis e os das extras não", () => {
    const { container } = setup();
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);
    expect(links[0]).not.toHaveAttribute("tabindex");
    expect(links[1]).toHaveAttribute("tabindex", "-1");
    expect(links[0]).toHaveAttribute("href", "https://example.com/pix");
  });

  it("src vira img com alt, altura e atributos de carregamento", () => {
    const { container } = setup({ itemHeight: 32 });
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("alt", "Logo da B3");
    expect(img).toHaveAttribute("src", "/b3.svg");
    expect(img).toHaveAttribute("height", "32");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("draggable", "false");
  });

  it("renderItem substitui o conteúdo do item", () => {
    const { getAllByTestId } = setup({
      renderItem: (item, key) => (
        <b data-testid="custom" key={key}>
          {"alt" in item ? item.alt : "no"}
        </b>
      ),
    });
    expect(getAllByTestId("custom")).toHaveLength(ITEMS.length * 2);
  });

  it("calcula as cópias pela medida do viewport e da lista", () => {
    const spy = stubSizes(500, 100);
    const { container } = setup();
    expect(container.querySelectorAll("[data-copy]")).toHaveLength(10);
    spy.mockRestore();
  });

  it("fadeEdges aplica máscara sem cor fixa", () => {
    const { root } = setup({ fadeEdges: true });
    expect(root.style.maskImage || root.getAttribute("style")).toContain("linear-gradient");
    expect(root.getAttribute("style")).toContain("to right");
  });

  it("fadeEdges vertical usa gradiente para baixo", () => {
    const { root } = setup({ fadeEdges: true, direction: "down" });
    expect(root.getAttribute("style")).toContain("to bottom");
  });

  it("scaleOnHover escala o item", () => {
    const { container } = setup({ scaleOnHover: true });
    expect((container.querySelector(ITEM) as HTMLElement).className).toContain("hover:scale-110");
  });

  it("movimento reduzido: uma cópia, quebra de linha e nenhum rAF", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const { container, track } = setup({}, "always");
    expect(container.querySelectorAll("[data-copy]")).toHaveLength(1);
    expect(track).toHaveClass("flex-wrap", "justify-center");
    expect(raf).not.toHaveBeenCalled();
    raf.mockRestore();
  });

  it("foco num link marca data-paused e o blur libera", () => {
    const { root, container } = setup();
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(root).toHaveAttribute("data-paused", "false");
    fireEvent.focus(link);
    expect(root).toHaveAttribute("data-paused", "true");
    fireEvent.blur(link);
    expect(root).toHaveAttribute("data-paused", "false");
  });
});

describe("LogoMarquee movimento", () => {
  function translateOf(track: HTMLElement): number {
    const match = /translate3d\((-?[\d.]+)px/.exec(track.style.transform);
    return match ? Number(match[1]) : 0;
  }

  it("anda para a esquerda e dá a volta sem emenda", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const spy = stubSizes(300, 200);
    const { track } = setup({ speed: 100 });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const first = translateOf(track);
    expect(first).toBeLessThan(0);
    expect(first).toBeGreaterThan(-200);
    spy.mockRestore();
  });

  it("hoverSpeed 0 para o movimento com o mouse e retoma ao sair", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const spy = stubSizes(300, 200000);
    const { root, track } = setup({ speed: 100 });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const stopped = translateOf(track);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(translateOf(track)).toBeCloseTo(stopped, 0);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(translateOf(track)).toBeLessThan(stopped - 10);
    spy.mockRestore();
  });

  it("toque não conta como hover", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const spy = stubSizes(300, 200000);
    const { root, track } = setup({ speed: 100 });
    fireEvent.pointerEnter(root, { pointerType: "touch" });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(translateOf(track)).toBeLessThan(-100);
    spy.mockRestore();
  });

  it("direction right anda no sentido oposto", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const spy = stubSizes(300, 200000);
    const { track } = setup({ speed: 100, direction: "right" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(translateOf(track)).toBeGreaterThan(-200000);
    expect(translateOf(track)).toBeLessThan(-199800);
    spy.mockRestore();
  });
});
