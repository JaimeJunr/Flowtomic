import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChatMessageData } from "@/components/molecules/data-display/chat-message";
import { ChatLog } from "./chat-log";

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
    expect(screen.getByText("26/09/2026, 14:05:09")).toBeInTheDocument();
  });

  it("não usa o formato en-US (com AM/PM) por padrão", () => {
    render(<ChatLog messages={messages} />);
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument();
  });
});
