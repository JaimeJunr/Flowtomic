import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Chatbot, { type ChatbotMessage } from "./page";

const conversa: ChatbotMessage[] = [
  {
    id: "1",
    role: "user",
    parts: [{ type: "text", text: "Como faço o DataTable ordenar pelo teclado?" }],
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      { type: "tool", kind: "file", state: "done", label: "Leu", detail: "data-table.tsx" },
      { type: "text", text: "O cabeçalho ordenável precisa ser um botão dentro do th." },
      {
        type: "sources",
        sources: [
          { url: "https://www.w3.org/WAI/ARIA/apg/", title: "Sortable table" },
          { url: "https://developer.mozilla.org/aria-sort", title: "aria-sort" },
          { url: "https://www.w3.org/WAI/ARIA/apg/", title: "Sortable table" },
        ],
      },
    ],
  },
];

describe("Chatbot", () => {
  describe("conversa nova", () => {
    it("diz o que fazer e envia o pedido completo da sugestão escolhida", async () => {
      const onSend = vi.fn();
      render(
        <Chatbot
          emptyTitle="Pergunte sobre qualquer componente"
          suggestions={[
            { label: "Trocar a cor da marca", prompt: "Quais tokens eu mudo para trocar a cor?" },
          ]}
          onSend={onSend}
          onNewChat={vi.fn()}
        />
      );
      expect(
        screen.getByRole("heading", { name: "Pergunte sobre qualquer componente" })
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Nova conversa/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Trocar a cor da marca" }));
      expect(onSend).toHaveBeenCalledWith("Quais tokens eu mudo para trocar a cor?");
    });

    it("envia o que a pessoa escreve com Enter", async () => {
      const onSend = vi.fn();
      render(<Chatbot onSend={onSend} />);
      await userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), "Oi{Enter}");
      await waitFor(() => expect(onSend).toHaveBeenCalledWith("Oi"));
    });
  });

  describe("conversa em andamento", () => {
    it("põe só a mensagem da pessoa no balão e mostra a ferramenta numa linha", () => {
      render(<Chatbot title="Ordenar o DataTable" messages={conversa} />);
      const pergunta = screen.getByText("Como faço o DataTable ordenar pelo teclado?");
      expect(pergunta.closest("[data-slot=bubble]")).not.toBeNull();
      const resposta = screen.getByText("O cabeçalho ordenável precisa ser um botão dentro do th.");
      expect(resposta.closest("[data-slot=bubble]")).toBeNull();
      expect(
        screen.getByText("data-table.tsx").closest("[data-slot=tool-status-line]")
      ).toHaveAttribute("data-state", "done");
      expect(screen.getByRole("heading", { name: "Ordenar o DataTable" })).toBeInTheDocument();
    });

    it("conta as fontes sem repetir, só depois que a resposta termina", () => {
      const { rerender } = render(<Chatbot messages={conversa} status="streaming" />);
      expect(screen.queryByText(/Usou \d fontes/)).not.toBeInTheDocument();
      rerender(<Chatbot messages={conversa} status="ready" />);
      expect(screen.getByText("Usou 2 fontes")).toBeInTheDocument();
    });

    it("a última pergunta e a resposta dela ficam juntas no turno que sobe pro topo", () => {
      const historico: ChatbotMessage[] = [
        ...conversa,
        { id: "3", role: "user", parts: [{ type: "text", text: "E o campo de busca?" }] },
        { id: "4", role: "assistant", parts: [{ type: "text", text: "Falta o label." }] },
      ];
      render(<Chatbot messages={historico} />);
      const turno = screen
        .getByText("E o campo de busca?")
        .closest("[data-slot=conversation-turn]");
      expect(turno).not.toBeNull();
      expect(turno).toContainElement(screen.getByText("Falta o label."));
      expect(turno).not.toContainElement(
        screen.getByText("Como faço o DataTable ordenar pelo teclado?")
      );
    });

    it("o aviso de pensando fica no turno da pergunta que acabou de sair", () => {
      render(<Chatbot messages={conversa.slice(0, 1)} status="submitted" />);
      const turno = screen.getByText("Pensando…").closest("[data-slot=conversation-turn]");
      expect(turno).toContainElement(
        screen.getByText("Como faço o DataTable ordenar pelo teclado?")
      );
    });

    it("avisa que está pensando enquanto a resposta não começou", () => {
      render(<Chatbot messages={conversa.slice(0, 1)} status="submitted" />);
      expect(screen.getByText("Pensando…")).toBeInTheDocument();
    });

    it("troca Enviar por Parar enquanto responde", async () => {
      const onStop = vi.fn();
      render(<Chatbot messages={conversa} status="streaming" onStop={onStop} />);
      expect(screen.queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Parar" }));
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it("oferece começar de novo pelo cabeçalho", async () => {
      const onNewChat = vi.fn();
      render(<Chatbot messages={conversa} onNewChat={onNewChat} />);
      await userEvent.click(screen.getByRole("button", { name: "Nova conversa" }));
      expect(onNewChat).toHaveBeenCalledTimes(1);
    });
  });

  it("mostra o erro colado no campo, com o que tentar", async () => {
    const onRetry = vi.fn();
    render(
      <Chatbot
        messages={conversa}
        status="error"
        error="429 · limite de requisições"
        onRetry={onRetry}
      />
    );
    const alerta = screen.getByRole("alert");
    expect(alerta).toHaveTextContent("A resposta falhou.");
    expect(alerta).toHaveTextContent("429 · limite de requisições");
    await userEvent.click(within(alerta).getByRole("button", { name: "Tentar de novo" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("quando o assistente pergunta, trava o campo e manda as respostas", async () => {
    const onAnswer = vi.fn();
    render(
      <Chatbot
        messages={conversa}
        question={{
          questions: [
            {
              id: "entrada",
              title: "Como a pessoa entra?",
              choices: [{ value: "senha", label: "E-mail e senha" }],
            },
          ],
        }}
        onAnswer={onAnswer}
      />
    );
    expect(screen.getByRole("textbox", { name: "Mensagem" })).toBeDisabled();
    // um botão forte por vez: só o Enviar da pergunta, o do campo some
    expect(screen.getAllByRole("button", { name: "Enviar" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("radio", { name: /E-mail e senha/ }));
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onAnswer).toHaveBeenCalledWith([
      {
        questionId: "entrada",
        question: "Como a pessoa entra?",
        answer: "E-mail e senha",
        skipped: false,
      },
    ]);
  });

  it("deixa as respostas da pergunta no histórico", () => {
    render(
      <Chatbot
        messages={[
          {
            id: "3",
            role: "user",
            parts: [
              {
                type: "answers",
                answers: [
                  {
                    questionId: "entrada",
                    question: "Como a pessoa entra?",
                    answer: "E-mail e senha",
                    skipped: false,
                  },
                ],
              },
            ],
          },
        ]}
      />
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("Como a pessoa entra? E-mail e senha");
  });
});
