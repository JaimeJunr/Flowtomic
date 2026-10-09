import { fireEvent, render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { buildShimmerMotion, Shimmer } from "./shimmer";

describe("Shimmer", () => {
  it("mostra o texto como parágrafo por padrão", () => {
    render(<Shimmer>Pensando...</Shimmer>);
    const texto = screen.getByText("Pensando...");
    expect(texto.tagName).toBe("P");
  });

  it("renderiza no elemento escolhido em `as`", () => {
    render(<Shimmer as="span">Carregando</Shimmer>);
    expect(screen.getByText("Carregando").tagName).toBe("SPAN");
  });

  it("repassa className e escala o brilho pelo tamanho do texto e spread", () => {
    render(
      <Shimmer className="minha" spread={3}>
        abcd
      </Shimmer>
    );
    const texto = screen.getByText("abcd");
    expect(texto).toHaveClass("minha");
    expect(texto.style.getPropertyValue("--spread")).toBe("12px");
  });

  it("usa spread padrão 2 quando não informado", () => {
    render(<Shimmer>abc</Shimmer>);
    expect(screen.getByText("abc").style.getPropertyValue("--spread")).toBe("6px");
  });

  it("o texto continua acessível ao leitor de tela", () => {
    render(<Shimmer>Gerando resposta</Shimmer>);
    expect(screen.getByText("Gerando resposta")).not.toHaveAttribute("aria-hidden");
  });

  it("sem texto não quebra e zera o brilho", () => {
    const { container } = render(<Shimmer>{undefined as unknown as string}</Shimmer>);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--spread")).toBe(
      "0px"
    );
  });

  it("com movimento reduzido o texto fica parado, sem a varredura infinita", () => {
    render(
      <MotionConfig reducedMotion="always">
        <Shimmer>Pensando...</Shimmer>
      </MotionConfig>
    );
    expect(screen.getByText("Pensando...").style.backgroundPosition).toBe("");
  });

  it("sem pedido de movimento reduzido, a varredura começa da direita", () => {
    render(<Shimmer>Pensando...</Shimmer>);
    expect(screen.getByText("Pensando...").style.backgroundPosition).toBe("100% center");
  });
});

describe("buildShimmerMotion", () => {
  it("sem props novas mantém initial, animate e transition de antes", () => {
    expect(buildShimmerMotion({ direction: "start", duration: 2 })).toEqual({
      initial: { backgroundPosition: "100% center" },
      animate: { backgroundPosition: "0% center" },
      transition: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "linear" },
    });
  });

  it("direction end troca as posições inicial e final", () => {
    const motion = buildShimmerMotion({ direction: "end", duration: 2 });
    expect(motion.initial).toEqual({ backgroundPosition: "0% center" });
    expect(motion.animate).toEqual({ backgroundPosition: "100% center" });
  });

  it("repeatDelayMs entra na transição em segundos", () => {
    const motion = buildShimmerMotion({ direction: "start", duration: 2, repeatDelayMs: 1500 });
    expect(motion.transition.repeatDelay).toBe(1.5);
  });

  it("rejeita repeatDelayMs negativo informando o valor recebido", () => {
    expect(() =>
      buildShimmerMotion({ direction: "start", duration: 2, repeatDelayMs: -5 })
    ).toThrow(/received -5, expected a non-negative number/);
  });
});

describe("Shimmer props novas", () => {
  it("direction end começa da esquerda no DOM", () => {
    render(<Shimmer direction="end">Pensando...</Shimmer>);
    expect(screen.getByText("Pensando...").style.backgroundPosition).toBe("0% center");
  });

  it("sem pauseOnHover não expõe data-paused", () => {
    render(<Shimmer>Pensando...</Shimmer>);
    expect(screen.getByText("Pensando...")).not.toHaveAttribute("data-paused");
  });

  it("pauseOnHover pausa no hover e retoma ao sair", () => {
    render(<Shimmer pauseOnHover>Pensando...</Shimmer>);
    const texto = screen.getByText("Pensando...");
    expect(texto).toHaveAttribute("data-paused", "false");
    fireEvent.pointerEnter(texto);
    expect(texto).toHaveAttribute("data-paused", "true");
    fireEvent.pointerLeave(texto);
    expect(texto).toHaveAttribute("data-paused", "false");
  });

  it("com movimento reduzido o pauseOnHover não altera o texto estático", () => {
    render(
      <MotionConfig reducedMotion="always">
        <Shimmer pauseOnHover>Pensando...</Shimmer>
      </MotionConfig>
    );
    const texto = screen.getByText("Pensando...");
    fireEvent.pointerEnter(texto);
    expect(texto.style.backgroundPosition).toBe("");
  });
});

describe("Shimmer: componente animado estável entre renders", () => {
  it("mudar o texto não remonta o elemento nem reinicia a animação", () => {
    const { rerender } = render(<Shimmer>Pensando...</Shimmer>);
    const antes = screen.getByText("Pensando...");
    rerender(<Shimmer>Pensando muito...</Shimmer>);
    expect(screen.getByText("Pensando muito...")).toBe(antes);
  });

  it("dois Shimmer com a mesma tag não se remontam um ao outro", () => {
    const { rerender } = render(
      <>
        <Shimmer as="span">um</Shimmer>
        <Shimmer as="span">dois</Shimmer>
      </>
    );
    const [um, dois] = [screen.getByText("um"), screen.getByText("dois")];
    rerender(
      <>
        <Shimmer as="span">um</Shimmer>
        <Shimmer as="span">dois!</Shimmer>
      </>
    );
    expect(screen.getByText("um")).toBe(um);
    expect(screen.getByText("dois!")).toBe(dois);
  });

  it("trocar `as` entre renders troca a tag e mantém o brilho", () => {
    const { rerender } = render(<Shimmer as="p">Título</Shimmer>);
    expect(screen.getByText("Título").tagName).toBe("P");
    rerender(<Shimmer as="h2">Título</Shimmer>);
    const titulo = screen.getByText("Título");
    expect(titulo.tagName).toBe("H2");
    expect(titulo.style.backgroundPosition).toBe("100% center");
  });

  it("aceita um componente em `as` e o mantém animado, sem remontar ao re-renderizar", () => {
    const Titulo = (props: ComponentProps<"h3">) => <h3 {...props} />;
    const { rerender } = render(<Shimmer as={Titulo}>Seção</Shimmer>);
    const antes = screen.getByText("Seção");
    expect(antes.tagName).toBe("H3");
    expect(antes).toHaveAttribute("data-slot", "shimmer");
    expect(antes.style.backgroundPosition).toBe("100% center");
    rerender(<Shimmer as={Titulo}>Seção nova</Shimmer>);
    expect(screen.getByText("Seção nova")).toBe(antes);
  });
});

describe("Shimmer sem motion.create disponível", () => {
  async function carregarSemCreate() {
    vi.resetModules();
    vi.doMock("motion/react", async (importOriginal) => ({
      ...(await importOriginal<typeof import("motion/react")>()),
      motion: {},
    }));
    const mod = await import("./shimmer");
    return mod.Shimmer;
  }

  it("cai para o elemento simples e mantém o texto", async () => {
    const Sh = await carregarSemCreate();
    render(<Sh as="span">Fallback</Sh>);
    expect(screen.getByText("Fallback").tagName).toBe("SPAN");
    vi.doUnmock("motion/react");
    vi.resetModules();
  });

  it("sem `as` válido usa parágrafo", async () => {
    const Sh = await carregarSemCreate();
    render(<Sh as={null as never}>Padrão</Sh>);
    expect(screen.getByText("Padrão").tagName).toBe("P");
    vi.doUnmock("motion/react");
    vi.resetModules();
  });
});
