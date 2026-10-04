import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./conversation";

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

describe("ConversationEmptyState com ícone, filhos e sem descrição", () => {
  it("mostra o ícone acima do título quando informado", () => {
    render(<ConversationEmptyState icon={<svg aria-label="Balão de conversa" role="img" />} />);
    expect(screen.getByRole("img", { name: "Balão de conversa" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nenhuma mensagem ainda" })).toBeInTheDocument();
  });

  it("sem ícone, não reserva espaço para ele", () => {
    const { container } = render(<ConversationEmptyState />);
    expect(container.querySelector(".text-muted-foreground:not(p)")).not.toBeInTheDocument();
  });

  it("com description vazia, mostra só o título", () => {
    render(<ConversationEmptyState description="" />);
    expect(screen.getByRole("heading", { name: "Nenhuma mensagem ainda" })).toBeInTheDocument();
    expect(screen.queryByText("Envie a primeira mensagem para começar.")).not.toBeInTheDocument();
  });

  it("com filhos, substitui todo o conteúdo padrão pelo que foi passado", () => {
    render(
      <ConversationEmptyState>
        <button type="button">Iniciar conversa</button>
      </ConversationEmptyState>
    );
    expect(screen.getByRole("button", { name: "Iniciar conversa" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("repassa className, ref e atributos ao contêiner", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ConversationEmptyState ref={ref} className="bg-muted" data-testid="vazio" id="estado" />
    );
    const el = screen.getByTestId("vazio");
    expect(el).toHaveClass("bg-muted");
    expect(el).toHaveAttribute("id", "estado");
    expect(ref.current).toBe(el);
  });
});

describe("ConversationScrollButton com props próprias", () => {
  it("aceita className extra e preserva o visual padrão", () => {
    render(<ConversationScrollButton className="bottom-8" />);
    expect(screen.getByRole("button", { name: "Ir para o fim" })).toHaveClass(
      "bottom-8",
      "rounded-full"
    );
  });

  it("com a conversa rolada para cima, é alcançável pelo teclado e Enter volta ao fim", async () => {
    const user = userEvent.setup();
    render(<ConversationScrollButton />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Ir para o fim" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(stick.scrollToBottom).toHaveBeenCalledTimes(1);
  });
});

describe("Conversation", () => {
  it("é uma região de log com as mensagens dentro", () => {
    render(
      <Conversation aria-label="Histórico do chat">
        <ConversationContent>
          <p>Olá, tudo bem?</p>
        </ConversationContent>
      </Conversation>
    );
    const log = screen.getByRole("log", { name: "Histórico do chat" });
    expect(log).toHaveTextContent("Olá, tudo bem?");
  });

  it("aceita className extra no contêiner de rolagem", () => {
    render(
      <Conversation aria-label="Chat" className="h-96">
        <ConversationContent>Mensagem</ConversationContent>
      </Conversation>
    );
    expect(screen.getByRole("log")).toHaveClass("h-96", "overflow-y-auto");
  });

  it("o conteúdo aceita className extra sem perder o espaçamento entre mensagens", () => {
    render(
      <Conversation aria-label="Chat">
        <ConversationContent className="p-0" data-testid="conteudo">
          Mensagem
        </ConversationContent>
      </Conversation>
    );
    expect(screen.getByTestId("conteudo")).toHaveClass("p-0", "flex-col", "gap-8");
  });

  it("não tem violações de acessibilidade", async () => {
    const { container } = render(
      <Conversation aria-label="Histórico do chat">
        <ConversationContent>
          <p>Primeira mensagem</p>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    );
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
