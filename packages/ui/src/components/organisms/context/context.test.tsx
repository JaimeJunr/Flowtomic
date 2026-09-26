import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Context,
  ContextContent,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextTrigger,
} from "./context";

describe("Context", () => {
  describe("Rótulos e locale em pt-BR", () => {
    it("mostra o percentual usado com vírgula decimal, no padrão pt-BR", () => {
      render(
        <Context maxTokens={200_000} usedTokens={50_000}>
          <ContextTrigger />
        </Context>
      );
      expect(screen.getByText("25%")).toBeInTheDocument();
    });

    it("o cabeçalho compacta os tokens no padrão pt-BR (vírgula, não ponto)", () => {
      render(
        <Context maxTokens={200_000} open usedTokens={1_500}>
          <ContextContent>
            <ContextContentHeader />
          </ContextContent>
        </Context>
      );
      expect(screen.getByText("1,5 mil / 200 mil")).toBeInTheDocument();
    });

    it("o rodapé mostra 'Custo total' em vez de 'Total cost'", () => {
      render(
        <Context maxTokens={200_000} open usedTokens={0}>
          <ContextContent>
            <ContextContentFooter />
          </ContextContent>
        </Context>
      );
      expect(screen.getByText("Custo total")).toBeInTheDocument();
    });

    it("o uso de entrada mostra 'Entrada' em vez de 'Input'", () => {
      render(
        <Context maxTokens={200_000} usedTokens={100} usage={{ inputTokens: 100 }}>
          <ContextInputUsage />
        </Context>
      );
      expect(screen.getByText("Entrada")).toBeInTheDocument();
    });
  });
});
