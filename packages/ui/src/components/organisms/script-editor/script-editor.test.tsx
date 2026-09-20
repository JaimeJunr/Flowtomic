import type { ExecuteScriptResponse } from "@flowtomic/logic";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

describe("ScriptEditor — o que o editor faz", () => {
  /** Promise que o teste resolve quando quiser — para observar o estado "executando". */
  function execucaoControlada() {
    let resolver!: (r: ExecuteScriptResponse) => void;
    const pendente = new Promise<ExecuteScriptResponse>((res) => {
      resolver = res;
    });
    const executeScript = vi.fn(() => pendente);
    return { executeScript, concluir: resolver };
  }

  it("Executar vira Parar enquanto o script roda, e volta quando termina", async () => {
    const { executeScript, concluir } = execucaoControlada();
    render(
      <ScriptEditor autoConnect={false} defaultScript="1 + 1" executeScript={executeScript} />
    );

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    expect(await screen.findByRole("button", { name: /parar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /executar/i })).not.toBeInTheDocument();

    await act(async () => {
      concluir({ output: "2", result: 2 });
    });

    expect(await screen.findByRole("button", { name: /executar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /parar/i })).not.toBeInTheDocument();
  });

  it("Ctrl+Enter no editor executa; enquanto roda, não dispara de novo", async () => {
    const { executeScript, concluir } = execucaoControlada();
    render(
      <ScriptEditor autoConnect={false} defaultScript="1 + 1" executeScript={executeScript} />
    );
    const editor = screen.getByRole("textbox");

    await userEvent.click(editor);
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(executeScript).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    expect(executeScript).toHaveBeenCalledTimes(1);

    await act(async () => {
      concluir({ output: "2" });
    });
  });

  it("mostra a saída no log e o resultado em destaque; Limpar zera os dois", async () => {
    const executeScript = vi.fn().mockResolvedValue({
      output: "3 registros",
      result: { total: 3 },
    });
    render(<ScriptEditor autoConnect={false} defaultScript="x" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    expect(await screen.findByText("3 registros")).toBeInTheDocument();
    expect(screen.getByText("resultado")).toBeInTheDocument();
    expect(screen.getByText(/"total": 3/)).toBeInTheDocument();
    expect(screen.getByText(/última execução/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /limpar/i }));

    expect(screen.queryByText("3 registros")).not.toBeInTheDocument();
    expect(screen.queryByText("resultado")).not.toBeInTheDocument();
  });

  it("os números de linha acompanham o que se digita", async () => {
    render(<ScriptEditor autoConnect={false} defaultScript="a" />);
    expect(screen.getByTestId("line-numbers").textContent?.trim()).toBe("1");

    await userEvent.type(screen.getByRole("textbox"), "{Enter}b{Enter}c");

    expect(screen.getByTestId("line-numbers").textContent?.trim().split(/\s+/)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});
