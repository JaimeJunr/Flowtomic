import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatMessage, type ChatMessageData } from "./chat-message";

const narration: ChatMessageData = {
  id: 1,
  sender: "Mestre",
  content: "A porta da taverna **range**.",
  timestamp: new Date(2026, 9, 2, 19, 15),
  messageType: "STORY",
};

describe("ChatMessage", () => {
  describe("Tipo de mensagem", () => {
    it("os tipos padrão aparecem em português, sem caixa alta", () => {
      const { rerender } = render(<ChatMessage message={narration} />);
      expect(screen.getByText("Narração")).toBeInTheDocument();
      rerender(<ChatMessage message={{ ...narration, messageType: "ACTION" }} />);
      expect(screen.getByText("Ação")).toBeInTheDocument();
      rerender(<ChatMessage message={{ ...narration, messageType: "SAY" }} />);
      expect(screen.getByText("Fala")).toBeInTheDocument();
      expect(screen.queryByText(/^(STORY|ACTION|SAY)$/)).not.toBeInTheDocument();
    });

    it("o tipo é um ponto de cor ao lado do rótulo, não uma caixa colorida em volta da mensagem", () => {
      const { container } = render(<ChatMessage message={narration} />);
      const row = container.firstChild as HTMLElement;
      expect(row.className).not.toMatch(/bg-(info|warning|success)|border-l-4/);
      expect(screen.getByText("Narração").querySelector("span")?.className).toMatch(/bg-info/);
    });

    it("config de tipo passada por quem usa continua valendo", () => {
      render(
        <ChatMessage
          message={{ ...narration, messageType: "OOC" }}
          messageTypeConfig={{ OOC: { label: "Fora do jogo", badgeClassName: "bg-primary" } }}
        />
      );
      expect(screen.getByText("Fora do jogo")).toBeInTheDocument();
    });
  });

  describe("Linha do log", () => {
    it("o remetente sai na cor do texto e o horário em mono, sem segundos", () => {
      render(<ChatMessage message={narration} />);
      expect(screen.getByText("Mestre").className).not.toMatch(/text-(info|warning|success)/);
      const time = screen.getByText("02/10, 19:15");
      expect(time.className).toMatch(/font-mono/);
    });

    it("mensagem do sistema fica discreta, sem itálico centralizado", () => {
      const { container } = render(
        <ChatMessage
          message={{
            id: 2,
            sender: "Sistema",
            content: "Rolagem: 14",
            timestamp: narration.timestamp,
          }}
        />
      );
      expect((container.firstChild as HTMLElement).className).not.toMatch(/italic|text-center/);
      expect(screen.getByText("Rolagem: 14")).toBeInTheDocument();
    });
  });

  describe("Menu da mensagem", () => {
    it("abre com clique normal e pelo nome acessível, e dispara a ação", async () => {
      const onEdit = vi.fn();
      render(<ChatMessage message={narration} onEdit={onEdit} onDelete={() => {}} />);
      await userEvent.click(screen.getByRole("button", { name: "Mais opções" }));
      await userEvent.click(await screen.findByRole("menuitem", { name: "Editar" }));
      expect(onEdit).toHaveBeenCalledWith(1);
    });

    it("sem nenhuma ação não há botão de menu", () => {
      render(<ChatMessage message={narration} />);
      expect(screen.queryByRole("button", { name: "Mais opções" })).not.toBeInTheDocument();
    });
  });
});
