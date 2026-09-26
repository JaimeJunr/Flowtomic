import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConversationEmptyState, ConversationScrollButton } from "./conversation";

// isAtBottom parte de `true` no use-stick-to-bottom (ver useStickToBottom.js) e o efeito de
// resize/scroll que o recalcularia não roda no jsdom — sem esse mock o botão sempre retorna
// null e o teste de a11y nunca alcança o <button>.
vi.mock("use-stick-to-bottom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("use-stick-to-bottom")>();
  return {
    ...actual,
    useStickToBottomContext: () => ({ isAtBottom: false, scrollToBottom: vi.fn() }),
  };
});

describe("ConversationEmptyState", () => {
  describe("Estado vazio padrão em pt-BR", () => {
    it("convida a enviar a primeira mensagem", () => {
      render(<ConversationEmptyState />);
      expect(screen.getByText("Envie a primeira mensagem para começar.")).toBeInTheDocument();
    });

    it("não mostra mais a descrição genérica anterior", () => {
      render(<ConversationEmptyState />);
      expect(
        screen.queryByText("Comece uma conversa para ver as mensagens aqui")
      ).not.toBeInTheDocument();
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

describe("ConversationScrollButton", () => {
  it("expõe nome acessível para quem usa leitor de tela", () => {
    render(<ConversationScrollButton />);
    expect(screen.getByRole("button", { name: "Ir para a última mensagem" })).toBeInTheDocument();
  });
});
