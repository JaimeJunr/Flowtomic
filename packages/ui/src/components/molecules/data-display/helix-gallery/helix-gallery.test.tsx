import { act, fireEvent, render } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { HelixGallery, type HelixGalleryProps, type HelixItem } from "./helix-gallery";

const ROOT = '[data-slot="helix-gallery"]';
const CARD = '[data-slot="helix-gallery-card"]';

const ITEMS: HelixItem[] = [
  { id: "a", label: "Renda fixa", content: <span>Renda fixa</span> },
  { id: "b", label: "Ações", content: <span>Ações</span>, href: "/acoes" },
  { id: "c", label: "Fundos imobiliários", image: "/fii.png" },
];

// O PointerEvent do setup não carrega `pointerType`; sem ele mouse e toque não se distinguem.
const OriginalPointerEvent = window.PointerEvent;
class PointerTypeEvent extends MouseEvent {
  pointerType: string;
  pointerId: number;
  constructor(
    type: string,
    init: MouseEventInit & { pointerType?: string; pointerId?: number } = {}
  ) {
    super(type, init);
    this.pointerType = init.pointerType ?? "";
    this.pointerId = init.pointerId ?? 1;
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
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
      "setTimeout",
      "clearTimeout",
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
});

function setup(props: Partial<HelixGalleryProps> = {}, reduced: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reduced}>
      <HelixGallery items={ITEMS} aria-label="Classes de ativos" {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLElement;
  const cards = () => Array.from(view.container.querySelectorAll<HTMLElement>(CARD));
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  return { ...view, root, cards, advance };
}

describe("HelixGallery", () => {
  it("expõe ref, className, data-slot e a semântica de região", () => {
    const ref = createRef<HTMLDivElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe", "relative", "overflow-hidden");
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-roledescription", "galeria");
    expect(root).toHaveAttribute("aria-label", "Classes de ativos");
    expect(root.querySelector('[data-slot="helix-gallery-stage"]')).toBeInTheDocument();
  });

  it("renderiza max(itens, 2 voltas) cartões e esconde as cópias", () => {
    const { cards } = setup();
    const all = cards();
    expect(all).toHaveLength(14);
    expect(all.map((c) => c.getAttribute("data-slot-index"))[13]).toBe("13");
    all.forEach((card, k) => {
      if (k < ITEMS.length) expect(card).not.toHaveAttribute("aria-hidden");
      else expect(card).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("só os originais viram link; cópias não são focáveis", () => {
    const { container } = setup();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("a")).toHaveAttribute("href", "/acoes");
  });

  it("usa a imagem com o rótulo como alt e fit", () => {
    const { container } = setup({ fit: "contain" });
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("alt", "Fundos imobiliários");
    expect(img).toHaveClass("object-contain");
  });

  it("rejeita lista vazia", () => {
    expect(() => render(<HelixGallery items={[]} />)).toThrow(/received 0/);
  });

  it("no modo auto o transform muda com o tempo", () => {
    const { cards, advance } = setup();
    const before = cards()[0].style.transform;
    expect(before).toContain("translate3d(");
    advance(600);
    expect(cards()[0].style.transform).not.toBe(before);
  });

  it("no modo drag sem arrasto fica parado", () => {
    const { cards, advance } = setup({ mode: "drag" });
    const before = cards()[0].style.transform;
    advance(600);
    expect(cards()[0].style.transform).toBe(before);
  });

  it("direction down inverte o sentido vertical", () => {
    const up = setup({ direction: "up" });
    up.advance(600);
    const yUp = up.cards()[0].style.transform;
    up.unmount();
    const down = setup({ direction: "down" });
    down.advance(600);
    expect(down.cards()[0].style.transform).not.toBe(yUp);
  });

  it("movimento reduzido não anima", () => {
    const { cards, advance } = setup({}, "always");
    const before = cards()[0].style.transform;
    advance(600);
    expect(cards()[0].style.transform).toBe(before);
  });

  it("arrastar muda o transform, inclusive com movimento reduzido", () => {
    for (const reduced of ["never", "always"] as const) {
      const { root, cards, unmount } = setup({ mode: "drag" }, reduced);
      const before = cards()[0].style.transform;
      fireEvent.pointerDown(root, { clientY: 200, pointerType: "mouse" });
      fireEvent.pointerMove(root, { clientY: 140, pointerType: "mouse" });
      fireEvent.pointerUp(root, { clientY: 140, pointerType: "mouse" });
      expect(cards()[0].style.transform).not.toBe(before);
      unmount();
    }
  });

  it("arrastar é ignorado no modo auto", () => {
    const { root, cards } = setup({ mode: "auto" });
    const before = cards()[0].style.transform;
    fireEvent.pointerDown(root, { clientY: 200, pointerType: "mouse" });
    fireEvent.pointerMove(root, { clientY: 140, pointerType: "mouse" });
    expect(cards()[0].style.transform).toBe(before);
  });

  it("superfície arrastável usa select-none e touch-action none", () => {
    const { root } = setup({ mode: "all" });
    expect(root).toHaveClass("select-none");
    expect(root.style.touchAction).toBe("none");
  });

  it("pausa ao entrar com o mouse e retoma ao sair", () => {
    const { root, cards, advance } = setup();
    advance(100);
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    advance(1500);
    const paused = cards()[0].style.transform;
    advance(500);
    expect(cards()[0].style.transform).toBe(paused);
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    advance(600);
    expect(cards()[0].style.transform).not.toBe(paused);
  });

  it("não pausa com pauseOnHover desligado", () => {
    const { root, cards, advance } = setup({ pauseOnHover: false });
    advance(100);
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    advance(1500);
    const before = cards()[0].style.transform;
    advance(500);
    expect(cards()[0].style.transform).not.toBe(before);
  });

  it("foco por teclado num link pausa o laço", () => {
    const { container, cards, advance } = setup();
    advance(100);
    const link = container.querySelector("a") as HTMLAnchorElement;
    act(() => link.focus());
    advance(1500);
    const paused = cards()[0].style.transform;
    advance(500);
    expect(cards()[0].style.transform).toBe(paused);
  });

  it("a rolagem gira no modo scroll", () => {
    const { cards } = setup({ mode: "scroll" });
    const before = cards()[0].style.transform;
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 300, configurable: true });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(cards()[0].style.transform).not.toBe(before);
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });
});
