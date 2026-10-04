import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationEmptyState, ConversationScrollButton } from "./conversation";

// isAtBottom parte de `true` no use-stick-to-bottom (ver useStickToBottom.js) e o efeito de
// resize/scroll que o recalcularia não roda no jsdom — sem esse mock o botão sempre retorna
// null e o teste de a11y nunca alcança o <button>. O objeto é mutável para cada teste
// escolher se a conversa está no fim ou não.
const stick = vi.hoisted(() => ({ isAtBottom: false, scrollToBottom: vi.fn() }));
vi.mock("use-stick-to-bottom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("use-stick-to-bottom")>();
  return { ...actual, useStickToBottomContext: () => stick };
});

beforeEach(() => {
  stick.isAtBottom = false;
  stick.scrollToBottom.mockClear();
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
  it("aparece com texto quando a pessoa rolou para cima e leva de volta ao fim", async () => {
    render(<ConversationScrollButton />);
    const button = screen.getByRole("button", { name: "Ir para o fim" });
    expect(button).toHaveAttribute("data-state", "visible");
    expect(button).toHaveClass("rounded-full", "shadow-md");
    await userEvent.click(button);
    expect(stick.scrollToBottom).toHaveBeenCalledTimes(1);
  });

  it("no fim da conversa some da tela e do teclado, mas fica no DOM para a transição", () => {
    stick.isAtBottom = true;
    const { container } = render(<ConversationScrollButton />);
    expect(screen.queryByRole("button", { name: "Ir para o fim" })).not.toBeInTheDocument();
    const button = container.querySelector("button");
    expect(button).toHaveAttribute("data-state", "hidden");
    expect(button).toHaveAttribute("tabindex", "-1");
    expect(button).toHaveClass("opacity-0", "pointer-events-none", "motion-reduce:transition-none");
  });
});
