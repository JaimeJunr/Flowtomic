import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
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

describe("EditChatMessageModal: fechar, falhar e variações de metadados", () => {
  it("sem mensagem não renderiza nada", () => {
    render(<EditChatMessageModal isOpen onClose={vi.fn()} message={null} onSave={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("cancelar sem alterações fecha direto, sem pedir confirmação", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    const onClose = vi.fn();
    render(<EditChatMessageModal isOpen onClose={onClose} message={message} onSave={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it("cancelar com alterações pede confirmação e só fecha se a pessoa confirmar", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    const onClose = vi.fn();
    render(<EditChatMessageModal isOpen onClose={onClose} message={message} onSave={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Texto"), "!");

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(confirmSpy).toHaveBeenCalledWith(
      "Você tem alterações não salvas. Deseja realmente fechar?"
    );
    expect(onClose).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it("Escape com alterações também pede confirmação antes de fechar", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const onClose = vi.fn();
    render(<EditChatMessageModal isOpen onClose={onClose} message={message} onSave={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Texto"), "!");

    await userEvent.keyboard("{Escape}");

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("se salvar falhar, registra o erro e mantém o modal aberto", async () => {
    const erro = new Error("falha de rede");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onSave = vi.fn().mockRejectedValue(erro);
    const onClose = vi.fn();
    render(<EditChatMessageModal isOpen onClose={onClose} message={message} onSave={onSave} />);
    await userEvent.type(screen.getByLabelText("Texto"), "!");

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(consoleSpy).toHaveBeenCalledWith("Error saving message:", erro);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("Salvar fica desabilitado sem alterações e quando o texto fica em branco", async () => {
    render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();

    const campo = screen.getByLabelText("Texto");
    await userEvent.clear(campo);
    await userEvent.type(campo, "   ");

    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("conta os caracteres do texto em edição", async () => {
    render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);
    expect(screen.getByText("14 caracteres")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Texto"), "ab");
    expect(screen.getByText("16 caracteres")).toBeInTheDocument();
  });

  it("carregando, o campo e o cancelar ficam desabilitados", () => {
    render(
      <EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} isLoading />
    );
    expect(screen.getByLabelText("Texto")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("trocar a mensagem recarrega o texto e descarta a edição anterior", async () => {
    const outra: ChatMessageData = { ...message, id: "2", content: "Outra mensagem" };
    const { rerender } = render(
      <EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />
    );
    await userEvent.type(screen.getByLabelText("Texto"), "!");

    rerender(<EditChatMessageModal isOpen onClose={vi.fn()} message={outra} onSave={vi.fn()} />);

    expect(screen.getByLabelText("Texto")).toHaveValue("Outra mensagem");
    expect(screen.queryByText("Alterações não salvas")).not.toBeInTheDocument();
  });

  it("usa o formatador de data passado por quem chama", () => {
    render(
      <EditChatMessageModal
        isOpen
        onClose={vi.fn()}
        message={message}
        onSave={vi.fn()}
        formatTimestamp={() => "ontem à noite"}
      />
    );
    expect(screen.getByText("ontem à noite")).toBeInTheDocument();
  });

  it("tipo desconhecido aparece como veio; sem tipo a linha Tipo some", () => {
    const { rerender } = render(
      <EditChatMessageModal
        isOpen
        onClose={vi.fn()}
        message={{ ...message, messageType: "SYSTEM" }}
        onSave={vi.fn()}
      />
    );
    expect(screen.getByText("SYSTEM")).toBeInTheDocument();

    rerender(
      <EditChatMessageModal
        isOpen
        onClose={vi.fn()}
        message={{ ...message, messageType: undefined }}
        onSave={vi.fn()}
      />
    );
    expect(screen.queryByRole("term", { name: "Tipo" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("term").map((el) => el.textContent)).toEqual([
      "Remetente",
      "Enviada",
    ]);
  });

  it.each([
    ["SAY", "Fala", "bg-success"],
    ["ACTION", "Ação", "bg-warning"],
    ["STORY", "Narração", "bg-info"],
    ["SYSTEM", "SYSTEM", "bg-muted-foreground"],
  ])("o ponto do tipo %s usa a cor semântica %s", (tipo, rotulo, classe) => {
    render(
      <EditChatMessageModal
        isOpen
        onClose={vi.fn()}
        message={{ ...message, messageType: tipo }}
        onSave={vi.fn()}
      />
    );
    const ponto = screen.getByText(rotulo).querySelector('[aria-hidden="true"]');
    expect(ponto?.className).toContain(classe);
  });

  it("aceita a classe de cor do tipo vinda de quem chama", () => {
    const corDoTipo = vi.fn(() => "bg-primary");
    render(
      <EditChatMessageModal
        isOpen
        onClose={vi.fn()}
        message={message}
        onSave={vi.fn()}
        getMessageTypeBadgeClassName={corDoTipo}
      />
    );
    expect(corDoTipo).toHaveBeenCalledWith("STORY");
    expect(screen.getByText("Narração").querySelector('[aria-hidden="true"]')?.className).toContain(
      "bg-primary"
    );
  });

  it("não tem violações de acessibilidade", async () => {
    render(<EditChatMessageModal isOpen onClose={vi.fn()} message={message} onSave={vi.fn()} />);
    const resultado = await axe.run(await screen.findByRole("dialog"), {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(resultado.violations).toEqual([]);
  });
});
