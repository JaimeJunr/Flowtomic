import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LikeButton } from "./like-button";
import { diffDigits, formatCount, likeScaleKeyframes } from "./like-button-utils";

const ROOT = '[data-slot="like-button"]';
const ICON = '[data-slot="like-button-icon"]';
const COUNT = '[data-slot="like-button-count"]';

class FakeLikeListener {
  calls: Array<[boolean, number]> = [];
  handle = (liked: boolean, count: number) => {
    this.calls.push([liked, count]);
  };
}

function setup(props: Partial<React.ComponentProps<typeof LikeButton>> = {}, reduced = false) {
  const listener = new FakeLikeListener();
  const view = render(
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <LikeButton count={1204} onLikedChange={listener.handle} {...props} />
    </MotionConfig>
  );
  const root = view.container.querySelector(ROOT) as HTMLButtonElement;
  return { ...view, root, listener };
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("funções puras", () => {
  it("likeScaleKeyframes troca o estado em 40% e passa do tamanho na volta", () => {
    const { values, times } = likeScaleKeyframes(0.3, 1.7);
    expect(times).toEqual([0, 0.4, 0.7, 1]);
    expect(values[0]).toBe(1);
    expect(values[1]).toBe(0.3);
    expect(values[2]).toBeCloseTo(1.17);
    expect(values[3]).toBe(1);
  });

  it("likeScaleKeyframes com overshoot 0 não tem pico", () => {
    expect(likeScaleKeyframes(0.3, 0).values[2]).toBe(1);
  });

  it("diffDigits devolve só o índice (da direita) que mudou", () => {
    expect(diffDigits("1.204", "1.205")).toEqual([0]);
    expect(diffDigits("1.204", "1.214")).toEqual([1]);
  });

  it("diffDigits devolve todos quando o tamanho muda e nenhum quando igual", () => {
    expect(diffDigits("999", "1.000")).toEqual([0, 1, 2, 3, 4]);
    expect(diffDigits("1.204", "1.204")).toEqual([]);
  });

  it("formatCount usa separador pt-BR e rejeita valor inválido com o recebido", () => {
    expect(formatCount(1204)).toBe("1.204");
    expect(() => formatCount(Number.NaN)).toThrow("received NaN");
  });
});

describe("LikeButton", () => {
  it("clicar curte: aria-pressed, contador soma e onLikedChange(true, 1205)", () => {
    const { root, listener } = setup();
    expect(root).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(root).toHaveAttribute("data-state", "on");
    expect(root.querySelector(COUNT)).toHaveTextContent("1.205");
    expect(listener.calls).toEqual([[true, 1205]]);
  });

  it("clicar de novo descurte e chama (false, 1204)", () => {
    const { root, listener } = setup();
    fireEvent.click(root);
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(root.querySelector(COUNT)).toHaveTextContent("1.204");
    expect(listener.calls[1]).toEqual([false, 1204]);
  });

  it("nome acessível leva a contagem formatada e acompanha o clique", () => {
    const { root } = setup({ label: "Aplaudir" });
    expect(root).toHaveAccessibleName("Aplaudir, 1.204");
    fireEvent.click(root);
    expect(root).toHaveAccessibleName("Aplaudir, 1.205");
  });

  it("showCount=false não renderiza o contador, mas o nome tem a contagem", () => {
    const { root } = setup({ showCount: false });
    expect(root.querySelector(COUNT)).toBeNull();
    expect(root).toHaveAccessibleName("Curtir, 1.204");
  });

  it("icon=star e ReactNode customizado trocam o ícone", () => {
    const heart = setup().root.querySelector(`${ICON} svg`)?.getAttribute("class");
    const star = setup({ icon: "star" }).root.querySelector(`${ICON} svg`)?.getAttribute("class");
    expect(star).toContain("lucide-star");
    expect(heart).toContain("lucide-heart");
    setup({ icon: <i data-testid="meu-icone" /> });
    expect(screen.getByTestId("meu-icone")).toBeInTheDocument();
  });

  it("a troca visual de cor acontece em 40% da duração", () => {
    const { root } = setup({ durationMs: 500 });
    const icon = () => root.querySelector(ICON) as HTMLElement;
    expect(icon()).toHaveAttribute("data-liked", "false");
    fireEvent.click(root);
    expect(icon()).toHaveAttribute("data-liked", "false");
    act(() => void vi.advanceTimersByTime(210));
    expect(icon()).toHaveAttribute("data-liked", "true");
  });

  it("movimento reduzido troca direto, sem esperar", () => {
    const { root } = setup({}, true);
    fireEvent.click(root);
    expect(root.querySelector(ICON)).toHaveAttribute("data-liked", "true");
    expect(root.querySelector(COUNT)).toHaveTextContent("1.205");
  });

  it("controlado não muda sozinho, mas avisa; mudança externa assenta sem corrida", async () => {
    const { root, listener, rerender } = setup({ liked: false });
    fireEvent.click(root);
    expect(root).toHaveAttribute("aria-pressed", "false");
    expect(root.querySelector(COUNT)).toHaveTextContent("1.204");
    expect(listener.calls).toEqual([[true, 1205]]);
    await act(async () => {});
    rerender(
      <MotionConfig reducedMotion="never">
        <LikeButton liked count={1205} onLikedChange={listener.handle} />
      </MotionConfig>
    );
    expect(root).toHaveAttribute("aria-pressed", "true");
    expect(root.querySelector(ICON)).toHaveAttribute("data-liked", "true");
  });

  it("defaultLiked começa curtido", () => {
    const { root } = setup({ defaultLiked: true });
    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("disabled ignora o clique", () => {
    const { root, listener } = setup({ disabled: true });
    fireEvent.click(root);
    expect(listener.calls).toEqual([]);
    expect(root).toHaveAttribute("aria-pressed", "false");
  });

  it("repassa ref e className para a raiz", () => {
    const ref = createRef<HTMLButtonElement>();
    const { root } = setup({ ref, className: "minha-classe" });
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("minha-classe");
  });
});
