import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PromptInput,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputSpeechButton,
  PromptInputTextarea,
} from "./prompt-input";

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
