import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpenIn, OpenInClaude, OpenInContent, OpenInT3, OpenInTrigger } from "./open-in-chat";

describe("OpenIn", () => {
  describe("Rótulos em pt-BR", () => {
    it("o gatilho padrão mostra 'Abrir no chat'", () => {
      render(
        <OpenIn open query="bug no registry:build">
          <OpenInTrigger />
          <OpenInContent>
            <OpenInClaude />
          </OpenInContent>
        </OpenIn>
      );
      expect(screen.getByText("Abrir no chat")).toBeInTheDocument();
    });

    it("cada provedor mostra 'Abrir no <Provedor>' em vez de 'Open in <Provider>'", () => {
      render(
        <OpenIn open query="bug no registry:build">
          <OpenInTrigger />
          <OpenInContent>
            <OpenInClaude />
            <OpenInT3 />
          </OpenInContent>
        </OpenIn>
      );
      expect(screen.getByText("Abrir no Claude")).toBeInTheDocument();
      expect(screen.getByText("Abrir no T3 Chat")).toBeInTheDocument();
    });
  });
});
