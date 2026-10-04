import { render, screen } from "@testing-library/react";
import { MotionConfig } from "motion/react";
import { describe, expect, it, vi } from "vitest";
import { Shimmer } from "./shimmer";

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
