import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ChatMessageData } from "../../data-display/chat-message";
import { EditChatMessageModal } from "./edit-chat-message-modal";

const message: ChatMessageData = {
  id: "1",
  content: "Olá, tudo bem?",
  sender: "Revisora",
  timestamp: "2026-09-20T17:52:22Z",
};

describe("EditChatMessageModal", () => {
  describe("Aviso de alterações não salvas", () => {
    it("mostra o aviso sem emoji, com o texto de alteração pendente", async () => {
      render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);

      await userEvent.type(screen.getByLabelText("Conteúdo da Mensagem"), "!");

      expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
    });

    it("não mostra o aviso quando o conteúdo não foi alterado", () => {
      render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);

      expect(screen.queryByText("Alterações não salvas")).not.toBeInTheDocument();
    });
  });
});
