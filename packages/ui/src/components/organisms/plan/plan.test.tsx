import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
} from "./plan";

function renderPlano(props: { isStreaming?: boolean; defaultOpen?: boolean } = {}) {
  return render(
    <Plan {...props}>
      <PlanHeader>
        <PlanTitle>Migrar o tema</PlanTitle>
        <PlanDescription>Trocar os tokens antigos pelos semânticos</PlanDescription>
        <PlanAction>
          <button type="button">Aprovar</button>
        </PlanAction>
        <PlanTrigger />
      </PlanHeader>
      <PlanContent>
        <p>Passo 1: mapear as cores</p>
      </PlanContent>
      <PlanFooter>Atualizado agora</PlanFooter>
    </Plan>
  );
}

describe("PlanTrigger", () => {
  describe("Texto para leitor de tela em pt-BR", () => {
    it("expõe 'Expandir ou recolher o plano' para quem usa leitor de tela", () => {
      render(
        <Plan>
          <PlanHeader>
            <PlanTitle>Plano</PlanTitle>
            <PlanTrigger />
          </PlanHeader>
        </Plan>
      );
      expect(screen.getByText("Expandir ou recolher o plano")).toBeInTheDocument();
    });

    it("o título do plano aparece normalmente ao lado do gatilho", () => {
      render(
        <Plan>
          <PlanHeader>
            <PlanTitle>1. Rodar o type-check do ui</PlanTitle>
            <PlanTrigger />
          </PlanHeader>
        </Plan>
      );
      expect(screen.getByText("1. Rodar o type-check do ui")).toBeInTheDocument();
    });
  });
});

describe("Plan", () => {
  it("mostra título, descrição, ação e rodapé", () => {
    renderPlano();
    expect(screen.getByText("Migrar o tema")).toBeInTheDocument();
    expect(screen.getByText("Trocar os tokens antigos pelos semânticos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aprovar" })).toBeInTheDocument();
    expect(screen.getByText("Atualizado agora")).toBeInTheDocument();
  });

  it("começa recolhido e o gatilho expande e recolhe o conteúdo", async () => {
    const user = userEvent.setup();
    renderPlano();
    const gatilho = screen.getByRole("button", { name: "Expandir ou recolher o plano" });
    expect(gatilho).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Passo 1: mapear as cores")).not.toBeInTheDocument();
    await user.click(gatilho);
    expect(gatilho).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Passo 1: mapear as cores")).toBeInTheDocument();
    await user.click(gatilho);
    expect(screen.queryByText("Passo 1: mapear as cores")).not.toBeInTheDocument();
  });

  it("o gatilho funciona pelo teclado (Enter e Espaço)", async () => {
    const user = userEvent.setup();
    renderPlano();
    const gatilho = screen.getByRole("button", { name: "Expandir ou recolher o plano" });
    gatilho.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByText("Passo 1: mapear as cores")).toBeInTheDocument();
    await user.keyboard(" ");
    expect(screen.queryByText("Passo 1: mapear as cores")).not.toBeInTheDocument();
  });

  it("com defaultOpen, o conteúdo já nasce visível", () => {
    renderPlano({ defaultOpen: true });
    expect(screen.getByText("Passo 1: mapear as cores")).toBeInTheDocument();
  });

  it("em streaming, título e descrição continuam legíveis (com brilho animado)", () => {
    renderPlano({ isStreaming: true });
    expect(screen.getByText("Migrar o tema")).toBeInTheDocument();
    expect(screen.getByText("Trocar os tokens antigos pelos semânticos")).toBeInTheDocument();
  });

  it("título fora do Plan lança erro explicando o uso", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<PlanTitle>Solto</PlanTitle>)).toThrow(
      "Plan components must be used within Plan"
    );
    erro.mockRestore();
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = renderPlano({ defaultOpen: true });
    const resultado = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});
