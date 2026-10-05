import { act, fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildRevealOrder, EncryptedText, resolveScrambleCharset } from "./encrypted-text";

// useInView depende de IntersectionObserver; aqui ele "vê" o elemento na hora.
function tornarVisivel(visivel: boolean) {
  global.IntersectionObserver = vi.fn().mockImplementation((cb: IntersectionObserverCallback) => ({
    observe: vi.fn((el: Element) => {
      if (visivel) {
        cb(
          [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    }),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),
  })) as unknown as typeof IntersectionObserver;
}

describe("EncryptedText", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("texto vazio não renderiza nada", () => {
    tornarVisivel(true);
    const { container } = render(<EncryptedText text="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("o nome acessível é o texto real, mesmo embaralhado", () => {
    tornarVisivel(false);
    render(<EncryptedText text="segredo" />);
    expect(screen.getByLabelText("segredo")).toBeInTheDocument();
  });

  it("antes de aparecer na tela os caracteres ficam embaralhados e espaços se preservam", () => {
    tornarVisivel(false);
    render(<EncryptedText text="ab cd" charset="#" encryptedClassName="cifrado" />);
    const el = screen.getByLabelText("ab cd");
    expect(el.textContent).toBe("## ##");
    expect(el.querySelectorAll(".cifrado")).toHaveLength(5);
  });

  it("ao aparecer, revela os caracteres reais aos poucos até o texto completo", () => {
    tornarVisivel(true);
    render(<EncryptedText text="abc" charset="#" revealDelayMs={100} revealedClassName="real" />);
    const el = screen.getByLabelText("abc");

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(el.textContent?.startsWith("a")).toBe(true);
    expect(el.textContent).not.toBe("abc");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(el.textContent).toBe("abc");
    expect(el.querySelectorAll(".real")).toHaveLength(3);
  });

  it("trocar o texto reinicia a revelação com o novo conteúdo", () => {
    tornarVisivel(true);
    const { rerender } = render(<EncryptedText text="abc" charset="#" revealDelayMs={10} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender(<EncryptedText text="xyzw" charset="#" revealDelayMs={10} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByLabelText("xyzw").textContent).toBe("xyzw");
  });
});

describe("buildRevealOrder", () => {
  it("start revela do índice 0 ao último", () => {
    expect(buildRevealOrder(4, "start")).toEqual([0, 1, 2, 3]);
  });

  it("end revela do último índice ao 0", () => {
    expect(buildRevealOrder(4, "end")).toEqual([3, 2, 1, 0]);
  });

  it("center vai do meio para as pontas alternando (comprimento ímpar)", () => {
    expect(buildRevealOrder(5, "center")).toEqual([2, 1, 3, 0, 4]);
  });

  it("center com comprimento par começa pelos dois do meio", () => {
    expect(buildRevealOrder(4, "center")).toEqual([1, 2, 0, 3]);
  });

  it("comprimento zero devolve lista vazia", () => {
    expect(buildRevealOrder(0, "center")).toEqual([]);
  });

  it("rejeita comprimento negativo informando o valor recebido", () => {
    expect(() => buildRevealOrder(-1, "start")).toThrow(
      /received -1, expected a non-negative integer/
    );
  });
});

describe("resolveScrambleCharset", () => {
  it("sem a opção devolve o charset recebido", () => {
    expect(resolveScrambleCharset("abc", "#", false)).toBe("#");
  });

  it("com a opção usa os caracteres únicos não-espaço do texto", () => {
    expect(resolveScrambleCharset("aab b", "#", true)).toBe("ab");
  });

  it("texto só de espaços cai para o charset recebido", () => {
    expect(resolveScrambleCharset("   ", "#", true)).toBe("#");
  });
});

describe("EncryptedText novas props", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("revealFrom end revela o último caractere primeiro", () => {
    tornarVisivel(true);
    render(<EncryptedText text="abc" charset="#" revealDelayMs={100} revealFrom="end" />);
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(screen.getByLabelText("abc").textContent?.endsWith("c")).toBe(true);
  });

  it("trigger hover começa legível e o hover embaralha e revela de novo", () => {
    tornarVisivel(false);
    render(<EncryptedText text="abc" charset="#" revealDelayMs={100} trigger="hover" />);
    const el = screen.getByLabelText("abc");
    expect(el.textContent).toBe("abc");
    expect(el).toHaveAttribute("tabindex", "0");

    fireEvent.pointerEnter(el);
    expect(el.textContent).toBe("###");
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(el.textContent).toBe("abc");
  });

  it("trigger hover também dispara pelo foco do teclado", () => {
    tornarVisivel(false);
    render(<EncryptedText text="abc" charset="#" trigger="hover" />);
    const el = screen.getByLabelText("abc");
    fireEvent.focus(el);
    expect(el.textContent).toBe("###");
  });

  it("trigger click dispara com clique e com Enter, mas não com outra tecla", () => {
    tornarVisivel(false);
    render(<EncryptedText text="abc" charset="#" revealDelayMs={100} trigger="click" />);
    const el = screen.getByLabelText("abc");
    expect(el.textContent).toBe("abc");
    expect(el).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(el, { key: "a" });
    expect(el.textContent).toBe("abc");

    fireEvent.keyDown(el, { key: "Enter" });
    expect(el.textContent).toBe("###");
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(el.textContent).toBe("abc");

    fireEvent.click(el);
    expect(el.textContent).toBe("###");
  });

  it("trigger view não torna o texto focável", () => {
    tornarVisivel(false);
    render(<EncryptedText text="abc" />);
    expect(screen.getByLabelText("abc")).not.toHaveAttribute("tabindex");
  });

  it("scrambleWithOwnCharacters só embaralha com caracteres do próprio texto", () => {
    tornarVisivel(false);
    render(<EncryptedText text="ab ba" scrambleWithOwnCharacters />);
    const el = screen.getByLabelText("ab ba");
    expect(el.textContent).toMatch(/^[ab]{2} [ab]{2}$/);
  });

  it("o conteúdo embaralhado fica em aria-hidden", () => {
    tornarVisivel(false);
    render(<EncryptedText text="abc" charset="#" />);
    expect(screen.getByLabelText("abc").querySelector('[aria-hidden="true"]')).toHaveTextContent(
      "###"
    );
  });

  it("com movimento reduzido mostra o texto final direto, em qualquer trigger", () => {
    tornarVisivel(true);
    render(
      <MotionConfig reducedMotion="always">
        <EncryptedText text="abc" charset="#" />
        <EncryptedText text="xyz" charset="#" trigger="click" />
      </MotionConfig>
    );
    expect(screen.getByLabelText("abc").textContent).toBe("abc");
    const click = screen.getByLabelText("xyz");
    fireEvent.click(click);
    expect(click.textContent).toBe("xyz");
  });
});
