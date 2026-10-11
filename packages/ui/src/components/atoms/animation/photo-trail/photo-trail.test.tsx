import { act, render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PhotoTrail, type PhotoTrailProps } from "./photo-trail";

const ROOT = '[data-slot="photo-trail"]';
const CARD = '[data-slot="photo-trail-card"]';

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
  <span key="a">Renda fixa</span>,
  <span key="b">Ações</span>,
  <span key="c">Fundos</span>,
];

function setup(props: Partial<PhotoTrailProps> = {}, reducedMotion: "never" | "always" = "never") {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <PhotoTrail items={ITEMS} {...props}>
        <h2>Passe o mouse</h2>
      </PhotoTrail>
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLDivElement;
  root.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 600,
      bottom: 400,
      width: 600,
      height: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return { ...view, root };
}

function move(root: HTMLElement, x: number, y: number, pointerType = "mouse") {
  act(() => {
    root.dispatchEvent(
      new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType, bubbles: true })
    );
  });
}

const cards = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>(CARD));

describe("PhotoTrail", () => {
  it("renderiza a raiz e os children", () => {
    const { root, getByText } = setup();
    expect(root).toHaveAttribute("data-slot", "photo-trail");
    expect(getByText("Passe o mouse")).toBeInTheDocument();
    expect(cards(root)).toHaveLength(0);
  });

  it("o primeiro movimento só registra o ponto", () => {
    const { root } = setup();
    move(root, 10, 10);
    expect(cards(root)).toHaveLength(0);
  });

  it("movimento acima do espaçamento cria cartão e cicla pelos itens", () => {
    const { root } = setup({ spacing: 50 });
    move(root, 0, 0);
    move(root, 60, 0);
    move(root, 120, 0);
    move(root, 180, 0);
    move(root, 240, 0);
    const list = cards(root);
    expect(list).toHaveLength(4);
    expect(list.map((c) => c.textContent)).toEqual(["Renda fixa", "Ações", "Fundos", "Renda fixa"]);
    expect(list.map((c) => c.getAttribute("data-index"))).toEqual(["0", "1", "2", "0"]);
  });

  it("movimento abaixo do espaçamento não cria cartão", () => {
    const { root } = setup({ spacing: 80 });
    move(root, 0, 0);
    move(root, 30, 0);
    expect(cards(root)).toHaveLength(0);
  });

  it("z-index cresce a cada cartão", () => {
    const { root } = setup({ spacing: 10 });
    move(root, 0, 0);
    move(root, 20, 0);
    move(root, 40, 0);
    const [a, b] = cards(root);
    expect(Number(b.parentElement?.style.zIndex)).toBeGreaterThan(
      Number(a.parentElement?.style.zIndex)
    );
  });

  it("toque é ignorado", () => {
    const { root } = setup({ spacing: 10 });
    move(root, 0, 0, "touch");
    move(root, 100, 0, "touch");
    expect(cards(root)).toHaveLength(0);
  });

  it("aceita caneta", () => {
    const { root } = setup({ spacing: 10 });
    move(root, 0, 0, "pen");
    move(root, 100, 0, "pen");
    expect(cards(root)).toHaveLength(1);
  });

  it("respeita maxCards removendo o mais antigo", () => {
    const { root } = setup({ spacing: 10, maxCards: 2, lifetime: 30 });
    move(root, 0, 0);
    for (let x = 20; x <= 100; x += 20) move(root, x, 0);
    return waitFor(() => {
      const list = cards(root);
      expect(list).toHaveLength(2);
      expect(list.map((c) => c.getAttribute("data-index"))).toEqual(["0", "1"]);
    });
  });

  it("o cartão some depois de lifetime", async () => {
    const { root } = setup({ spacing: 10, lifetime: 0.05 });
    move(root, 0, 0);
    move(root, 30, 0);
    expect(cards(root)).toHaveLength(1);
    await waitFor(() => expect(cards(root)).toHaveLength(0), { timeout: 2000 });
  });

  it("posiciona o cartão centrado no ponteiro", () => {
    const { root } = setup({ spacing: 10, cardWidth: 100 });
    move(root, 0, 0);
    move(root, 200, 100);
    const wrapper = cards(root)[0].parentElement as HTMLElement;
    expect(wrapper.style.left).toBe("200px");
    expect(wrapper.style.top).toBe("100px");
    expect(wrapper.style.marginLeft).toBe("-50px");
    expect(wrapper.style.marginTop).toBe("-37.5px");
  });

  it("cartões são decorativos", () => {
    const { root } = setup({ spacing: 10 });
    move(root, 0, 0);
    move(root, 30, 0);
    expect(cards(root)[0].parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza item com src como imagem decorativa", () => {
    const { root } = setup({ spacing: 10, items: [{ src: "/a.jpg", alt: "Praia" }] });
    move(root, 0, 0);
    move(root, 30, 0);
    const img = cards(root)[0].querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("src", "/a.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("draggable", "false");
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("aceita as três variantes", () => {
    for (const variant of ["pop", "drift", "tilt"] as const) {
      const { root, unmount } = setup({ spacing: 10, variant });
      move(root, 0, 0);
      move(root, 30, 0);
      expect(cards(root)).toHaveLength(1);
      unmount();
    }
  });

  it("movimento reduzido não cria cartões", () => {
    const { root, getByText } = setup({ spacing: 10 }, "always");
    move(root, 0, 0);
    move(root, 100, 0);
    expect(cards(root)).toHaveLength(0);
    expect(getByText("Passe o mouse")).toBeInTheDocument();
  });

  it("repassa className e ref", () => {
    let node: HTMLDivElement | null = null;
    const { root } = setup({
      className: "minha-classe",
      ref: (el) => {
        node = el;
      },
    });
    expect(root).toHaveClass("minha-classe");
    expect(node).toBe(root);
  });
});
