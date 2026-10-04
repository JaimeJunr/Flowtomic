import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSpeechButton,
  PromptInputSubmit,
  type PromptInputSubmitProps,
  PromptInputTextarea,
} from "./prompt-input";

function renderPrompt(onSubmit = vi.fn(), submitProps: PromptInputSubmitProps = {}) {
  render(
    <PromptInput onSubmit={onSubmit}>
      <PromptInputTextarea aria-label="Mensagem" />
      <PromptInputFooter>
        <PromptInputSubmit {...submitProps} />
      </PromptInputFooter>
    </PromptInput>
  );
  return onSubmit;
}

describe("PromptInput", () => {
  it("não envia mensagem vazia com Enter", async () => {
    const onSubmit = renderPrompt();
    await userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), "   {Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia o texto com Enter e Shift+Enter só quebra a linha", async () => {
    const onSubmit = renderPrompt();
    const campo = screen.getByRole("textbox", { name: "Mensagem" });
    await userEvent.type(campo, "Linha 1{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(campo, "Linha 2{Enter}");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ text: "Linha 1\nLinha 2" });
  });

  it("não usa sombra no contêiner (Hairline Rule)", () => {
    renderPrompt();
    const form = screen.getByRole("textbox", { name: "Mensagem" }).closest("form");
    expect(form).not.toHaveClass("shadow-sm");
  });
});

describe("PromptInputSubmit", () => {
  it("parado, é o botão de enviar, com nome e texto visíveis", () => {
    renderPrompt();
    const botao = screen.getByRole("button", { name: "Enviar" });
    expect(botao).toHaveAttribute("type", "submit");
    expect(botao).toHaveTextContent("Enviar");
  });

  it("com erro, continua sendo Enviar, para tentar de novo", () => {
    renderPrompt(vi.fn(), { status: "error" });
    expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit");
  });

  it.each([
    "submitted",
    "streaming",
  ] as const)("em %s, vira Parar no mesmo lugar e para sem reenviar", async (status) => {
    const onStop = vi.fn();
    const onSubmit = renderPrompt(vi.fn(), { status, onStop });
    await userEvent.type(screen.getByRole("textbox", { name: "Mensagem" }), "oi");
    const botao = screen.getByRole("button", { name: "Parar" });
    expect(botao).toHaveAttribute("type", "button");
    await userEvent.click(botao);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("respondendo sem onStop, o Parar fica desabilitado em vez de reenviar", () => {
    renderPrompt(vi.fn(), { status: "streaming" });
    expect(screen.getByRole("button", { name: "Parar" })).toBeDisabled();
  });
});

describe("PromptInputTextarea", () => {
  describe("Placeholder padrão em pt-BR", () => {
    it("mostra 'O que você gostaria de saber?' quando nenhum placeholder é passado", () => {
      render(
        <PromptInput onSubmit={() => undefined}>
          <PromptInputBody>
            <PromptInputTextarea />
          </PromptInputBody>
        </PromptInput>
      );
      expect(screen.getByPlaceholderText("O que você gostaria de saber?")).toBeInTheDocument();
    });

    it("aceita um placeholder customizado no lugar do padrão", () => {
      render(
        <PromptInput onSubmit={() => undefined}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Pergunte sobre o registry" />
          </PromptInputBody>
        </PromptInput>
      );
      expect(screen.getByPlaceholderText("Pergunte sobre o registry")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("O que você gostaria de saber?")
      ).not.toBeInTheDocument();
    });
  });
});

describe("PromptInputActionMenuTrigger", () => {
  it("expõe nome acessível 'Adicionar anexo' sem depender do tooltip", () => {
    render(
      <PromptInputActionMenu>
        <PromptInputActionMenuTrigger />
      </PromptInputActionMenu>
    );
    expect(screen.getByRole("button", { name: "Adicionar anexo" })).toBeInTheDocument();
  });
});

// Stub mínimo de SpeechRecognition: só o suficiente pra alternar isListening
// via onstart/onend, sem depender de reconhecimento de fala real do browser.
class FakeSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  start() {
    this.onstart?.();
  }
  stop() {
    this.onend?.();
  }
}

describe("PromptInputSpeechButton", () => {
  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: stub de API de browser não tipada no jsdom
    (window as any).SpeechRecognition = FakeSpeechRecognition;
  });

  afterEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: stub de API de browser não tipada no jsdom
    delete (window as any).SpeechRecognition;
  });

  it("expõe nome acessível 'Ditar por voz' e aria-pressed=false em repouso", () => {
    render(<PromptInputSpeechButton />);
    const button = screen.getByRole("button", { name: "Ditar por voz" });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("marca aria-pressed=true enquanto está ditando", () => {
    render(<PromptInputSpeechButton />);
    const button = screen.getByRole("button", { name: "Ditar por voz" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
