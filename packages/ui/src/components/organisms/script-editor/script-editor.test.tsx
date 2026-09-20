import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScriptEditor } from "./script-editor";

// autoConnect desligado: jsdom não tem WebSocket de verdade e o teste é de renderização
function renderIdle() {
  // entre chaves: em atributo JSX puro, "\n" seria a barra e o n literais
  return render(<ScriptEditor autoConnect={false} defaultScript={"def x = 1\nx"} />);
}

describe("ScriptEditor", () => {
  describe("Um botão, dois estados", () => {
    it("parado, mostra só Executar — Parar não existe até haver o que parar", () => {
      renderIdle();
      expect(screen.getByRole("button", { name: /executar/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /parar/i })).not.toBeInTheDocument();
    });
  });

  describe("Vernáculo de IDE, não de card", () => {
    it("nomeia o arquivo e numera as linhas do script", () => {
      renderIdle();
      expect(screen.getByText("script.groovy")).toBeInTheDocument();
      const numeros = screen.getByTestId("line-numbers");
      expect(numeros.textContent?.trim().split(/\s+/)).toEqual(["1", "2"]);
    });

    it("não tem título nem descrição de card por cima do editor", () => {
      renderIdle();
      expect(screen.queryByText("Editor de Scripts")).not.toBeInTheDocument();
      expect(screen.queryByText(/terminal interativo em tempo real/i)).not.toBeInTheDocument();
    });

    it("não usa emoji como ícone", () => {
      renderIdle();
      expect(document.body.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2764}]/u);
    });
  });

  describe("Painel de resultado", () => {
    it("é um só — sem abas Terminal/Preview", () => {
      renderIdle();
      expect(screen.queryByRole("tab", { name: /terminal/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("tab", { name: /preview/i })).not.toBeInTheDocument();
    });

    it("diz o estado da conexão em texto, com o endereço", () => {
      render(<ScriptEditor autoConnect={false} wsUrl="ws://localhost:8080/ws/scripts" />);
      expect(screen.getByText("desconectado")).toBeInTheDocument();
      expect(screen.getByText("ws://localhost:8080/ws/scripts")).toBeInTheDocument();
    });
  });
});
