import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessageData } from "@/components/molecules/data-display/chat-message";
import { ChatLog } from "./chat-log";

// O use-stick-to-bottom não mede nada no jsdom; o contexto mutável deixa cada teste dizer
// se a conversa está no fim e observar quem pediu para rolar.
const stick = vi.hoisted(() => ({
  isAtBottom: true,
  scrollToBottom: vi.fn(),
  stopScroll: vi.fn(),
}));
vi.mock("use-stick-to-bottom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("use-stick-to-bottom")>();
  return { ...actual, useStickToBottomContext: () => stick };
});

const messages: ChatMessageData[] = [
  {
    id: "1",
    content: "Olá, tudo bem?",
    sender: "Mestre",
    timestamp: new Date(2026, 8, 26, 14, 5, 9),
  },
];

describe("ChatLog", () => {
  it("mostra a data e o horário da mensagem em pt-BR (24h, sem AM/PM) por padrão", () => {
    render(<ChatLog messages={messages} />);
    expect(screen.getByText("26/09, 14:05")).toBeInTheDocument();
  });

  it("não usa o formato en-US (com AM/PM) por padrão", () => {
    render(<ChatLog messages={messages} />);
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument();
  });

  it("sem mensagens, convida a enviar a primeira", () => {
    render(<ChatLog messages={[]} />);
    expect(screen.getByText("Envie a primeira mensagem para começar.")).toBeInTheDocument();
    expect(
      screen.queryByText("Comece a conversar para ver mensagens aqui")
    ).not.toBeInTheDocument();
  });

  describe("rolagem", () => {
    const scrollIntoView = vi.fn();

    beforeEach(() => {
      stick.isAtBottom = true;
      stick.stopScroll.mockClear();
      scrollIntoView.mockClear();
      Element.prototype.scrollIntoView = scrollIntoView;
    });

    afterEach(() => {
      // jsdom não tem scrollIntoView; tirar o stub evita vazar para outros arquivos
      delete (Element.prototype as Partial<Element>).scrollIntoView;
    });

    const novaMensagem: ChatMessageData = {
      id: "2",
      content: "Chegou outra",
      sender: "Jogador",
      timestamp: new Date(2026, 8, 26, 14, 6, 0),
    };

    it("não puxa a pessoa para baixo por conta própria quando chega mensagem", () => {
      const { rerender } = render(<ChatLog messages={messages} />);
      rerender(<ChatLog messages={[...messages, novaMensagem]} />);
      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(stick.stopScroll).not.toHaveBeenCalled();
    });

    it("oferece o botão para voltar ao fim quando a pessoa rolou para cima", () => {
      stick.isAtBottom = false;
      render(<ChatLog messages={messages} />);
      expect(screen.getByRole("button", { name: "Ir para o fim" })).toBeInTheDocument();
    });

    it("com autoScroll desligado, solta a rolagem a cada mensagem nova", () => {
      const { rerender } = render(<ChatLog messages={messages} autoScroll={false} />);
      rerender(<ChatLog messages={[...messages, novaMensagem]} autoScroll={false} />);
      expect(stick.stopScroll).toHaveBeenCalledTimes(2);
    });
  });
});
