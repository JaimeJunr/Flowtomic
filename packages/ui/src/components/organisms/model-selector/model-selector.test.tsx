import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModelSelector, ModelSelectorContent } from "./model-selector";

describe("ModelSelectorContent", () => {
  describe("Título padrão (leitor de tela) em pt-BR", () => {
    it("mostra 'Seletor de modelo' quando nenhum título é passado", () => {
      render(
        <ModelSelector defaultOpen>
          <ModelSelectorContent />
        </ModelSelector>
      );
      expect(screen.getByText("Seletor de modelo")).toBeInTheDocument();
    });

    it("aceita um título customizado no lugar do padrão", () => {
      render(
        <ModelSelector defaultOpen>
          <ModelSelectorContent title="Escolha o modelo do agente" />
        </ModelSelector>
      );
      expect(screen.getByText("Escolha o modelo do agente")).toBeInTheDocument();
      expect(screen.queryByText("Seletor de modelo")).not.toBeInTheDocument();
    });
  });
});
