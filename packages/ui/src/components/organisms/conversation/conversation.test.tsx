import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConversationEmptyState } from "./conversation";

describe("ConversationEmptyState", () => {
  describe("Estado vazio padrão em pt-BR", () => {
    it("mostra título e descrição em português quando nenhum é passado", () => {
      render(<ConversationEmptyState />);
      expect(screen.getByText("Nenhuma mensagem ainda")).toBeInTheDocument();
      expect(
        screen.getByText("Comece uma conversa para ver as mensagens aqui")
      ).toBeInTheDocument();
    });

    it("aceita título e descrição customizados no lugar do padrão", () => {
      render(
        <ConversationEmptyState
          title="Sem chamadas ao assistente"
          description="Peça algo no prompt-input"
        />
      );
      expect(screen.getByText("Sem chamadas ao assistente")).toBeInTheDocument();
      expect(screen.getByText("Peça algo no prompt-input")).toBeInTheDocument();
      expect(screen.queryByText("Nenhuma mensagem ainda")).not.toBeInTheDocument();
    });
  });
});
