import { render, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BackdropBlur } from "./backdrop-blur";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function fundo(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

describe("BackdropBlur", () => {
  it("aberto aplica blur e cor de fundo com a opacidade", () => {
    const { container } = render(<BackdropBlur isOpen blurIntensity={8} opacity={0.4} />);
    expect(fundo(container).style.backdropFilter).toBe("blur(8px)");
    expect(fundo(container).style.backgroundColor).toBe("rgba(0, 0, 0, 0.4)");
  });

  it("fechado remove o blur e deixa o fundo transparente", () => {
    const { container } = render(<BackdropBlur isOpen={false} />);
    expect(fundo(container).style.backdropFilter).toBe("blur(0px)");
    expect(fundo(container).style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("alternar isOpen fecha o backdrop", async () => {
    const { container, rerender } = render(<BackdropBlur isOpen />);
    expect(fundo(container).style.backdropFilter).toBe("blur(10px)");
    rerender(<BackdropBlur isOpen={false} />);
    await waitFor(() => expect(fundo(container).style.backdropFilter).toBe("blur(0px)"));
  });

  it.each([
    ["#ff0000", "rgba(255, 0, 0, 0.5)"],
    ["rgb(10, 20, 30)", "rgba(10, 20, 30, 0.5)"],
    ["rgba(1, 2, 3, 0.9)", "rgba(1, 2, 3, 0.5)"],
    ["WHITE", "rgba(255, 255, 255, 0.5)"],
  ])("converte a cor %s respeitando a opacidade", (cor, esperado) => {
    const { container } = render(<BackdropBlur isOpen backgroundColor={cor} />);
    expect(fundo(container).style.backgroundColor).toBe(esperado);
  });

  it("cor rgba malformada cai no valor original", () => {
    const { container } = render(<BackdropBlur isOpen backgroundColor="rgba(x)" />);
    // valor inválido para o CSS: jsdom descarta
    expect(fundo(container).style.backgroundColor).toBe("");
  });

  it("cor rgb malformada cai no valor original", () => {
    const { container } = render(<BackdropBlur isOpen backgroundColor="rgb(x)" />);
    expect(fundo(container).style.backgroundColor).toBe("");
  });

  it("cor desconhecida (ex.: hsl) é mantida como veio", () => {
    const { container } = render(<BackdropBlur isOpen backgroundColor="hsl(0, 0%, 50%)" />);
    expect(fundo(container).style.backgroundColor).toBe("rgb(128, 128, 128)");
  });

  it("repassa className e ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<BackdropBlur ref={ref} isOpen className="minha" />);
    expect(ref.current).toBe(fundo(container));
    expect(ref.current).toHaveClass("minha");
  });

  describe("com disabled", () => {
    it("aberto aplica blur direto, sem animação", () => {
      const { container } = render(<BackdropBlur disabled isOpen blurIntensity={6} />);
      expect(fundo(container).style.backdropFilter).toBe("blur(6px)");
    });

    it("fechado zera o blur", () => {
      const { container } = render(<BackdropBlur disabled isOpen={false} />);
      expect(fundo(container).style.backdropFilter).toBe("blur(0px)");
    });

    it("repassa className e ref", () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(<BackdropBlur ref={ref} disabled isOpen className="x" />);
      expect(ref.current).toBe(fundo(container));
      expect(ref.current).toHaveClass("x");
    });
  });

  it("é só enfeite: fica fora da árvore de acessibilidade", () => {
    const { container, rerender } = render(<BackdropBlur isOpen />);
    expect(fundo(container)).toHaveAttribute("aria-hidden", "true");
    rerender(<BackdropBlur isOpen disabled />);
    expect(fundo(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("com movimento reduzido, abrir e fechar trocam o desfoque na hora, sem transição", () => {
    const { container, rerender } = render(
      <MotionConfig reducedMotion="always">
        <BackdropBlur isOpen blurIntensity={8} backgroundColor="#000000" opacity={0.5} />
      </MotionConfig>
    );
    expect(fundo(container).style.backdropFilter).toBe("blur(8px)");
    expect(fundo(container).style.backgroundColor).toBe("rgba(0, 0, 0, 0.5)");
    rerender(
      <MotionConfig reducedMotion="always">
        <BackdropBlur isOpen={false} blurIntensity={8} backgroundColor="#000000" opacity={0.5} />
      </MotionConfig>
    );
    expect(fundo(container).style.backdropFilter).toBe("blur(0px)");
  });
});
