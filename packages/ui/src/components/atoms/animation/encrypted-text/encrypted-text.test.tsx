import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EncryptedText } from "./encrypted-text";

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
