import { fireEvent, render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { StackingCard, StackingCards, type StackingCardsProps } from "./stacking-cards";

// jsdom não faz layout: os topos dos cartões vêm de uma tabela que o teste move.
let tops: number[] = [];
let rectSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

beforeEach(() => {
  tops = [100, 700, 1100];
  rectSpy = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function fake(this: HTMLElement) {
      const index = this.getAttribute("data-index");
      const top = index === null ? 0 : (tops[Number(index)] ?? 0);
      return { top, left: 0, right: 0, bottom: top + 300, width: 0, height: 300 } as DOMRect;
    });
  Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
});
afterEach(() => {
  rectSpy.mockRestore();
});

function setup(
  props: Partial<StackingCardsProps> = {},
  reducedMotion: "never" | "always" = "never"
) {
  const view = render(
    <MotionConfig reducedMotion={reducedMotion}>
      <StackingCards stackTop={100} stackOffset={0} itemGap={100} {...props}>
        <StackingCard>Verifique seu e-mail</StackingCard>
        <StackingCard>Envie seus documentos</StackingCard>
        <StackingCard>Escolha o perfil de investidor</StackingCard>
      </StackingCards>
    </MotionConfig>
  );
  const root = view.container.querySelector('[data-slot="stacking-cards"]') as HTMLElement;
  const cards = Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-slot="stacking-card"]')
  );
  return { ...view, root, cards };
}

function scrollTo(next: number[]) {
  tops = next;
  fireEvent.scroll(window);
}

describe("StackingCards", () => {
  it("expõe a lista e os itens com índice", () => {
    const { root, cards } = setup();
    expect(root).toHaveAttribute("role", "list");
    expect(cards.map((card) => card.getAttribute("role"))).toEqual([
      "listitem",
      "listitem",
      "listitem",
    ]);
    expect(cards.map((card) => card.dataset.index)).toEqual(["0", "1", "2"]);
  });

  it("calcula o top sticky em px, com o deslocamento por cartão", () => {
    const { cards } = setup({ stackTop: 80, stackOffset: 24 });
    expect(cards.map((card) => card.style.top)).toEqual(["80px", "104px", "128px"]);
  });

  it("calcula o top sticky em porcentagem", () => {
    const { cards } = setup({ stackTop: "15%", stackOffset: 24 });
    expect(cards.map((card) => card.style.top)).toEqual([
      "15%",
      "calc(15% + 24px)",
      "calc(15% + 48px)",
    ]);
  });

  it("separa os cartões pelo itemGap", () => {
    const { cards } = setup({ itemGap: 64 });
    expect(cards[0].style.marginBottom).toBe("64px");
  });

  it("reserva o trecho de hold depois do último cartão", () => {
    const { root } = setup({ holdDistance: 250 });
    const spacer = root.lastElementChild as HTMLElement;
    expect(spacer).toHaveAttribute("aria-hidden", "true");
    expect(spacer.style.height).toBe("250px");
  });

  it("não usa overflow hidden na raiz", () => {
    const { root } = setup();
    expect(root.className).not.toMatch(/overflow-hidden/);
  });

  it("encolhe e escurece o cartão coberto", async () => {
    const { cards } = setup();
    scrollTo([100, 100, 1100]);
    await waitFor(() => expect(cards[0].style.transform).toMatch(/scale\(0\.95/));
    const dim = cards[0].querySelector('[data-slot="stacking-card-dim"]') as HTMLElement;
    expect(dim).toHaveAttribute("aria-hidden", "true");
    await waitFor(() => expect(Number(dim.style.opacity)).toBeCloseTo(0.2));
  });

  it("aplica blur só quando blurAmount > 0", async () => {
    const { cards } = setup({ blurAmount: 4 });
    scrollTo([100, 100, 1100]);
    await waitFor(() => expect(cards[0].style.filter).toBe("blur(4px)"));
  });

  it("chama onStackComplete uma vez por descida e rearma ao subir", () => {
    const onStackComplete = vi.fn();
    setup({ onStackComplete });
    scrollTo([100, 300, 900]);
    expect(onStackComplete).not.toHaveBeenCalled();
    scrollTo([100, 100, 100]);
    scrollTo([100, 100, 100]);
    expect(onStackComplete).toHaveBeenCalledTimes(1);
    scrollTo([100, 100, 400]);
    scrollTo([100, 100, 100]);
    expect(onStackComplete).toHaveBeenCalledTimes(2);
  });

  it("escuta a rolagem do scrollContainer quando informado", () => {
    const onStackComplete = vi.fn();
    const scroller = document.createElement("div");
    document.body.appendChild(scroller);
    setup({ onStackComplete, scrollContainer: { current: scroller } });
    tops = [100, 100, 100];
    fireEvent.scroll(window);
    expect(onStackComplete).not.toHaveBeenCalled();
    fireEvent.scroll(scroller);
    expect(onStackComplete).toHaveBeenCalledTimes(1);
    scroller.remove();
  });

  it("com movimento reduzido mantém o sticky mas sem escala, escurecimento ou blur", async () => {
    const { cards } = setup({ blurAmount: 4 }, "always");
    scrollTo([100, 100, 100]);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(cards[0].style.top).toBe("100px");
    expect(cards[0].style.transform).toBe("");
    expect(cards[0].style.filter).toBe("");
    expect(cards[0].querySelector('[data-slot="stacking-card-dim"]')).toBeNull();
  });

  it("repassa className e ref ao cartão", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <StackingCards>
        <StackingCard ref={ref} className="extra">
          Passo
        </StackingCard>
      </StackingCards>
    );
    expect(ref.current).toHaveClass("extra");
  });
});

describe("StackingCards ref", () => {
  it("repassa o ref da raiz sem perder a medição", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <StackingCards ref={ref}>
        <StackingCard>Passo</StackingCard>
      </StackingCards>
    );
    expect(ref.current).toHaveAttribute("data-slot", "stacking-cards");
  });
});
