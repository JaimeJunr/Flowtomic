import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChainOfThought, ChainOfThoughtHeader } from "./chain-of-thought";

describe("ChainOfThoughtHeader", () => {
  describe("Rótulo padrão em pt-BR", () => {
    it("mostra 'Cadeia de raciocínio' quando nenhum texto é passado", () => {
      render(
        <ChainOfThought>
          <ChainOfThoughtHeader />
        </ChainOfThought>
      );
      expect(screen.getByText("Cadeia de raciocínio")).toBeInTheDocument();
    });

    it("mostra o texto customizado no lugar do padrão", () => {
      render(
        <ChainOfThought>
          <ChainOfThoughtHeader>Raciocínio do agente</ChainOfThoughtHeader>
        </ChainOfThought>
      );
      expect(screen.getByText("Raciocínio do agente")).toBeInTheDocument();
      expect(screen.queryByText("Cadeia de raciocínio")).not.toBeInTheDocument();
    });
  });
});
