import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
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

describe("ChatLog: conteúdo e opções", () => {
  beforeEach(() => {
    stick.isAtBottom = true;
    stick.stopScroll.mockClear();
  });

  const duasMensagens: ChatMessageData[] = [
    ...messages,
    {
      id: "2",
      content: "Tudo ótimo",
      sender: "Jogador",
      timestamp: new Date(2026, 8, 26, 14, 6, 0),
    },
  ];

  it("lista todas as mensagens recebidas, com remetente e texto", () => {
    render(<ChatLog messages={duasMensagens} />);
    expect(screen.getByText("Olá, tudo bem?")).toBeInTheDocument();
    expect(screen.getByText("Tudo ótimo")).toBeInTheDocument();
    expect(screen.getByText("Mestre")).toBeInTheDocument();
    expect(screen.getByText("Jogador")).toBeInTheDocument();
    expect(screen.queryByText("Envie a primeira mensagem para começar.")).not.toBeInTheDocument();
  });

  it("mostra a barra de ações do cabeçalho e os filtros quando informados", () => {
    render(
      <ChatLog
        messages={messages}
        headerActions={<button type="button">Limpar histórico</button>}
        filters={<button type="button">Só falas</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Limpar histórico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Só falas" })).toBeInTheDocument();
  });

  it("sem cabeçalho nem filtros, não reserva espaço para eles", () => {
    const { container } = render(<ChatLog messages={messages} />);
    // só o painel da conversa: nenhum bloco extra acima dele
    expect(container.firstElementChild?.children).toHaveLength(1);
    expect(screen.getByRole("log").parentElement).toBe(container.firstElementChild);
  });

  it("título e descrição do vazio podem ser trocados", () => {
    render(
      <ChatLog
        messages={[]}
        emptyStateTitle="Sala silenciosa"
        emptyStateDescription="Ninguém falou por aqui ainda."
      />
    );
    expect(screen.getByRole("heading", { name: "Sala silenciosa" })).toBeInTheDocument();
    expect(screen.getByText("Ninguém falou por aqui ainda.")).toBeInTheDocument();
  });

  it("um emptyState próprio substitui o padrão", () => {
    render(<ChatLog messages={[]} emptyState={<p>Convide alguém para a sala</p>} />);
    expect(screen.getByText("Convide alguém para a sala")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Nenhuma mensagem ainda" })
    ).not.toBeInTheDocument();
  });

  it("formatTimestamp customizado define o texto do horário", () => {
    render(<ChatLog messages={messages} formatTimestamp={() => "agora mesmo"} />);
    expect(screen.getByText("agora mesmo")).toBeInTheDocument();
    expect(screen.queryByText("26/09, 14:05")).not.toBeInTheDocument();
  });

  it("showTimestamp desligado esconde o horário das mensagens", () => {
    render(<ChatLog messages={messages} showTimestamp={false} />);
    expect(screen.queryByText("26/09, 14:05")).not.toBeInTheDocument();
  });

  it("messageTypeConfig customizado rotula o tipo da mensagem", () => {
    render(
      <ChatLog
        messages={[{ ...messages[0], messageType: "OOC" }]}
        messageTypeConfig={{ OOC: { label: "Fora do jogo" } }}
      />
    );
    expect(screen.getByText("Fora do jogo")).toBeInTheDocument();
  });

  it("senderConfig marca um remetente como mensagem de sistema", () => {
    render(
      <ChatLog
        messages={[{ ...messages[0], sender: "Narrador" }]}
        senderConfig={{ Narrador: { isSystem: true } }}
        onMessageEdit={vi.fn()}
      />
    );
    // Mensagem de sistema não oferece menu de ações
    expect(screen.getByText("Narrador")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mais opções" })).not.toBeInTheDocument();
  });

  it("renderMarkdown desligado mostra o texto literal, sem formatar", () => {
    render(
      <ChatLog messages={[{ ...messages[0], content: "**negrito**" }]} renderMarkdown={false} />
    );
    expect(screen.getByText("**negrito**")).toBeInTheDocument();
  });

  it("renderMarkdown ligado (padrão) formata o texto", () => {
    render(<ChatLog messages={[{ ...messages[0], content: "**negrito**" }]} />);
    expect(screen.getByText("negrito").tagName).toBe("STRONG");
  });

  describe("ações por mensagem", () => {
    it("sem handlers, a mensagem não tem menu de opções", () => {
      render(<ChatLog messages={messages} />);
      expect(screen.queryByRole("button", { name: "Mais opções" })).not.toBeInTheDocument();
    });

    it("showActions desligado esconde o menu mesmo com handlers", () => {
      render(<ChatLog messages={messages} onMessageEdit={vi.fn()} showActions={false} />);
      expect(screen.queryByRole("button", { name: "Mais opções" })).not.toBeInTheDocument();
    });

    it("editar, ver contexto e excluir chamam o handler com o id da mensagem", async () => {
      const onMessageEdit = vi.fn();
      const onMessageViewContext = vi.fn();
      const onMessageDelete = vi.fn();
      const user = userEvent.setup({ skipHover: true });
      render(
        <ChatLog
          messages={messages}
          onMessageEdit={onMessageEdit}
          onMessageViewContext={onMessageViewContext}
          onMessageDelete={onMessageDelete}
        />
      );

      await user.click(screen.getByRole("button", { name: "Mais opções" }));
      await user.click(await screen.findByRole("menuitem", { name: "Editar" }));
      expect(onMessageEdit).toHaveBeenCalledWith("1");

      await user.click(screen.getByRole("button", { name: "Mais opções" }));
      await user.click(await screen.findByRole("menuitem", { name: "Ver contexto" }));
      expect(onMessageViewContext).toHaveBeenCalledWith("1");

      await user.click(screen.getByRole("button", { name: "Mais opções" }));
      await user.click(await screen.findByRole("menuitem", { name: "Excluir" }));
      expect(onMessageDelete).toHaveBeenCalledWith("1");
    });
  });

  it("repassa className, ref e atributos ao contêiner externo", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <ChatLog ref={ref} messages={messages} className="h-96" data-testid="log-externo" />
    );
    expect(screen.getByTestId("log-externo")).toBe(container.firstElementChild);
    expect(screen.getByTestId("log-externo")).toHaveClass("h-96");
    expect(ref.current).toBe(container.firstElementChild);
  });

  it("é uma região de log para leitores de tela", () => {
    render(<ChatLog messages={messages} />);
    expect(screen.getByRole("log")).toHaveTextContent("Olá, tudo bem?");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <ChatLog
        messages={messages}
        onMessageEdit={vi.fn()}
        headerActions={<button type="button">Limpar histórico</button>}
      />
    );
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
