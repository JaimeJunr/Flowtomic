import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Reasoning, ReasoningTrigger } from "./reasoning";

describe("ReasoningTrigger", () => {
  describe("Mensagem padrão em pt-BR", () => {
    it("mostra 'Pensando…' enquanto está em streaming", () => {
      render(
        <Reasoning isStreaming>
          <ReasoningTrigger />
        </Reasoning>
      );
      expect(screen.getByText("Pensando…")).toBeInTheDocument();
    });

    it("mostra a duração em segundos quando o raciocínio já terminou", () => {
      render(
        <Reasoning duration={7} isStreaming={false}>
          <ReasoningTrigger />
        </Reasoning>
      );
      expect(screen.getByText("Pensou por 7 segundos")).toBeInTheDocument();
    });
  });
});
