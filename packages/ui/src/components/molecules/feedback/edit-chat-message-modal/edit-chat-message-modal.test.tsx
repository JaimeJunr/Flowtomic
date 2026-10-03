import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ChatMessageData } from "../../data-display/chat-message";
import { EditChatMessageModal } from "./edit-chat-message-modal";

const message: ChatMessageData = {
  id: "1",
  content: "Olá, tudo bem?",
  sender: "Mestre",
  timestamp: new Date(2026, 9, 2, 19, 15),
  messageType: "STORY",
};

describe("EditChatMessageModal", () => {
  describe("Aviso de alterações não salvas", () => {
    it("mostra o aviso sem emoji, com o texto de alteração pendente", async () => {
      render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);

      await userEvent.type(screen.getByLabelText("Texto"), "!");

      expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    });

    it("não mostra o aviso quando o conteúdo não foi alterado", () => {
      render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);

      expect(screen.queryByText("Alterações não salvas")).not.toBeInTheDocument();
    });
  });

  describe("Cabeçalho e metadados", () => {
    it("título em caixa de frase e metadados numa lista de definição", () => {
      render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);
      expect(screen.getByRole("heading", { name: "Editar mensagem" })).toBeInTheDocument();
      const terms = screen.getAllByRole("term").map((el) => el.textContent);
      expect(terms).toEqual(["Remetente", "Tipo", "Enviada"]);
      expect(screen.getByText("Narração")).toBeInTheDocument();
      expect(screen.queryByText("STORY")).not.toBeInTheDocument();
      expect(screen.getByText("02/10, 19:15").className).toMatch(/font-mono/);
    });
  });

  describe("Salvar", () => {
    it("salva o texto novo e fecha", async () => {
      const onSave = vi.fn();
      const onClose = vi.fn();
      render(<EditChatMessageModal isOpen onClose={onClose} message={message} onSave={onSave} />);
      await userEvent.type(screen.getByLabelText("Texto"), " Sim.");
      await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
      expect(onSave).toHaveBeenCalledWith("1", "Olá, tudo bem? Sim.");
      expect(onClose).toHaveBeenCalled();
    });

    it("salvando, o botão diz isso e fica desabilitado", () => {
      render(
        <EditChatMessageModal
          isOpen
          onClose={vi.fn()}
          message={message}
          onSave={vi.fn()}
          isLoading
        />
      );
      expect(screen.getByRole("button", { name: "Salvando" })).toBeDisabled();
    });
  });
});
