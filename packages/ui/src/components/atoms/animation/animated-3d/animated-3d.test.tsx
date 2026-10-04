import { render, screen, waitFor } from "@testing-library/react";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Animated3D } from "./animated-3d";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("Animated3D", () => {
  it("aberto mostra o conteúdo totalmente visível", () => {
    render(
      <Animated3D isOpen>
        <button type="button">Dentro</button>
      </Animated3D>
    );
    const botao = screen.getByRole("button", { name: "Dentro" });
    expect(botao.parentElement).toHaveStyle({ opacity: "1" });
  });

  it("fechado usa a opacidade inicial informada", () => {
    render(
      <Animated3D isOpen={false} initialOpacity={0.2}>
        <button type="button">Dentro</button>
      </Animated3D>
    );
    expect(screen.getByRole("button", { name: "Dentro" }).parentElement).toHaveStyle({
      opacity: "0.2",
    });
  });

  it("fechado usa os valores iniciais padrão e esconde o conteúdo", () => {
    render(
      <Animated3D isOpen={false}>
        <span>Texto</span>
      </Animated3D>
    );
    expect(screen.getByText("Texto").parentElement).toHaveStyle({ opacity: "0" });
  });

  it("alternar isOpen revela o conteúdo", async () => {
    const { rerender } = render(
      <Animated3D isOpen={false}>
        <span>Texto</span>
      </Animated3D>
    );
    expect(screen.getByText("Texto").parentElement).toHaveStyle({ opacity: "0" });
    rerender(
      <Animated3D isOpen>
        <span>Texto</span>
      </Animated3D>
    );
    await waitFor(() =>
      expect(screen.getByText("Texto").parentElement).toHaveStyle({ opacity: "1" })
    );
  });

  it("aplica a perspectiva informada no contêiner", () => {
    render(
      <Animated3D isOpen perspective="800px">
        <span>Texto</span>
      </Animated3D>
    );
    const container = screen.getByText("Texto").parentElement?.parentElement as HTMLElement;
    expect(container.style.perspective).toBe("800px");
  });

  it("aceita transição customizada sem quebrar", () => {
    render(
      <Animated3D isOpen transition={{ duration: 0.1 }}>
        <span>Texto</span>
      </Animated3D>
    );
    expect(screen.getByText("Texto")).toBeInTheDocument();
  });

  it("repassa className e ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Animated3D ref={ref} isOpen className="minha">
        <span>Texto</span>
      </Animated3D>
    );
    expect(ref.current).toHaveClass("minha");
  });

  describe("com disabled", () => {
    it("renderiza o conteúdo sem animação nem perspectiva, mesmo fechado", () => {
      render(
        <Animated3D disabled isOpen={false} className="plano">
          <span>Texto</span>
        </Animated3D>
      );
      const pai = screen.getByText("Texto").parentElement as HTMLElement;
      expect(pai).toHaveClass("plano");
      expect(pai.style.opacity).toBe("");
    });

    it("repassa a ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Animated3D ref={ref} disabled isOpen>
          <span>Texto</span>
        </Animated3D>
      );
      expect(ref.current).toContainElement(screen.getByText("Texto"));
    });
  });

  it("com movimento reduzido, fechado só some: sem girar, encolher ou afundar", () => {
    render(
      <MotionConfig reducedMotion="always">
        <Animated3D isOpen={false}>
          <p>Painel</p>
        </Animated3D>
      </MotionConfig>
    );
    const painel = screen.getByText("Painel").parentElement as HTMLElement;
    expect(painel.style.transform).not.toMatch(/rotate|scale|translateZ/);
    expect(painel.style.opacity).toBe("0");
  });
});
