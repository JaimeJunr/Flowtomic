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

  describe("Markdown", () => {
    const comMarkdown = (content: string): ChatMessageData => ({ ...narration, content });

    it("lista vira lista de verdade, não texto corrido", () => {
      render(<ChatMessage message={comMarkdown("Na mochila:\n\n- corda\n- tocha")} />);
      const itens = screen.getAllByRole("listitem");
      expect(itens.map((li) => li.textContent)).toEqual(["corda", "tocha"]);
    });

    it("bloco de código sai num bloco próprio, com o texto inteiro", async () => {
      const { container } = render(
        <ChatMessage message={comMarkdown("Rode:\n\n```bash\nbun run dev\n```")} />
      );
      expect(container.querySelector("pre")).not.toBeNull();
      expect(await screen.findByText("bun run dev")).toBeInTheDocument();
    });

    it("tabela no formato do GitHub vira tabela", () => {
      render(<ChatMessage message={comMarkdown("| dado | valor |\n|---|---|\n| d20 | 14 |")} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByRole("cell", { name: "14" })).toBeInTheDocument();
    });

    it("link com javascript: não vira link clicável", () => {
      render(<ChatMessage message={comMarkdown("[abrir](javascript:alert(1))")} />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("parágrafo não fica dentro de span (HTML inválido)", () => {
      const { container } = render(<ChatMessage message={comMarkdown("Primeiro.\n\nSegundo.")} />);
      expect(container.querySelector("span p, span div, span ul")).toBeNull();
      expect(container.querySelectorAll("p")).toHaveLength(2);
    });

    it("mensagem do sistema continua numa linha só, com negrito", () => {
      const { container } = render(
        <ChatMessage
          message={{
            id: 3,
            sender: "Sistema",
            content: "Rolagem: **14**",
            timestamp: narration.timestamp,
          }}
        />
      );
      expect(screen.getByText("14").tagName).toBe("STRONG");
      expect((container.firstChild as HTMLElement).querySelector("p, div")).toBeNull();
    });

    it("negrito continua sendo <strong>, com o peso de ênfase para o leitor de tela", () => {
      render(<ChatMessage message={comMarkdown("Cuidado com o **dragão**.")} />);
      expect(screen.getByText("dragão").tagName).toBe("STRONG");
    });

    it("com renderMarkdown={false}, mostra o texto cru", () => {
      render(<ChatMessage message={comMarkdown("- não é lista")} renderMarkdown={false} />);
      expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
      expect(screen.getByText("- não é lista")).toBeInTheDocument();
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
