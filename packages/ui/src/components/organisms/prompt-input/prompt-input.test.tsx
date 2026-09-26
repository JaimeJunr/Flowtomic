import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptInput, PromptInputBody, PromptInputTextarea } from "./prompt-input";

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
