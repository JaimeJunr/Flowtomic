import type { ExecuteScriptResponse } from "@flowtomic/logic";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  describe("Script padrão é do Flowtomic, não de outro projeto", () => {
    it("não traz o exemplo de userRepository do Spring de outro projeto", () => {
      render(<ScriptEditor autoConnect={false} />);
      expect(screen.getByRole("textbox")).not.toHaveValue(
        expect.stringMatching(/userRepository/) as unknown as string
      );
      expect(document.body.textContent).not.toMatch(/userRepository/);
    });

    it("o script padrão referencia o registro de componentes do Flowtomic", () => {
      render(<ScriptEditor autoConnect={false} />);
      const editor = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(editor.value).toMatch(/componentRegistryService/);
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

// Servidor de scripts falso: o WebSocket é I/O externo e o jsdom não abre conexão de verdade.
class FakeWebSocket {
  static readonly OPEN = 1;
  static instancias: FakeWebSocket[] = [];
  readyState = FakeWebSocket.OPEN;
  enviados: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.instancias.push(this);
  }

  send(dado: string) {
    this.enviados.push(dado);
  }

  close() {}

  receber(mensagem: unknown) {
    act(() => {
      this.onmessage?.({
        data: typeof mensagem === "string" ? mensagem : JSON.stringify(mensagem),
      });
    });
  }
}

async function conectarAoServidor(onError?: (e: Error) => void) {
  FakeWebSocket.instancias = [];
  vi.stubGlobal("WebSocket", FakeWebSocket);
  render(
    <ScriptEditor wsUrl="ws://localhost:8080/ws/scripts" defaultScript="x" onError={onError} />
  );
  await waitFor(() => expect(FakeWebSocket.instancias).toHaveLength(1));
  const servidor = FakeWebSocket.instancias[0];
  act(() => {
    servidor.onopen?.();
  });
  return servidor;
}

describe("ScriptEditor — conectado a um servidor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("depois de conectar, diz 'conectado' com o endereço do servidor", async () => {
    await conectarAoServidor();
    expect(await screen.findByText("conectado")).toBeInTheDocument();
    expect(screen.queryByText("desconectado")).not.toBeInTheDocument();
    expect(screen.getByText("ws://localhost:8080/ws/scripts")).toBeInTheDocument();
  });

  it("Executar manda o script ao servidor em vez de usar HTTP", async () => {
    const servidor = await conectarAoServidor();
    await userEvent.click(screen.getByRole("button", { name: /executar/i }));
    expect(servidor.enviados).toEqual([JSON.stringify({ type: "execute", script: "x" })]);
  });

  it("mostra no log a saída e o erro que o servidor emite", async () => {
    const servidor = await conectarAoServidor();
    servidor.receber({ type: "output", content: "linha de saída" });
    servidor.receber({ type: "error", content: "falhou aqui" });
    expect(await screen.findByText("linha de saída")).toBeInTheDocument();
    expect(screen.getByText("falhou aqui")).toHaveClass("text-destructive");
  });

  it("mostra o resultado em destaque quando o servidor devolve um resultado", async () => {
    const servidor = await conectarAoServidor();
    servidor.receber({ type: "result", content: { total: 7 } });
    expect(await screen.findByText("resultado")).toBeInTheDocument();
    expect(screen.getByText(/"total": 7/)).toBeInTheDocument();
  });

  it("texto que não é JSON entra no log como veio", async () => {
    const servidor = await conectarAoServidor();
    servidor.receber("texto cru do servidor");
    expect(await screen.findByText("texto cru do servidor")).toBeInTheDocument();
  });

  it("erro de conexão avisa quem integra e volta para 'desconectado'", async () => {
    const onError = vi.fn();
    const erroNoConsole = vi.spyOn(console, "error").mockImplementation(() => {});
    const servidor = await conectarAoServidor(onError);
    expect(await screen.findByText("conectado")).toBeInTheDocument();

    act(() => {
      servidor.onerror?.(new Event("error"));
    });

    expect(await screen.findByText("desconectado")).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Erro na conexão WebSocket" })
    );
    erroNoConsole.mockRestore();
  });
});

describe("ScriptEditor — log de execução", () => {
  it("antes de executar, o log convida a executar e o cabeçalho diz que não houve execução", () => {
    renderIdle();
    expect(screen.getByText("Execute o script para ver o log aqui.")).toBeInTheDocument();
    expect(screen.getByText("sem execução ainda")).toBeInTheDocument();
  });

  it("enquanto roda, mostra 'executando…' no lugar do convite", async () => {
    let concluir!: (r: ExecuteScriptResponse) => void;
    const executeScript = vi.fn(
      () =>
        new Promise<ExecuteScriptResponse>((res) => {
          concluir = res;
        })
    );
    render(<ScriptEditor autoConnect={false} defaultScript="1" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    expect(await screen.findByText("executando…")).toBeInTheDocument();
    expect(screen.queryByText("Execute o script para ver o log aqui.")).not.toBeInTheDocument();
    await act(async () => {
      concluir({});
    });
    expect(screen.queryByText("executando…")).not.toBeInTheDocument();
  });

  it("Parar interrompe a execução e devolve o botão Executar", async () => {
    const executeScript = vi.fn(() => new Promise<ExecuteScriptResponse>(() => {}));
    render(<ScriptEditor autoConnect={false} defaultScript="1" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));
    await userEvent.click(await screen.findByRole("button", { name: /parar/i }));

    expect(screen.getByRole("button", { name: /executar/i })).toBeInTheDocument();
    expect(screen.queryByText("executando…")).not.toBeInTheDocument();
  });

  it("o script executado aparece no log com '> ' na frente e o erro do servidor em vermelho", async () => {
    const executeScript = vi.fn().mockResolvedValue({ error: "NullPointerException" });
    render(
      <ScriptEditor autoConnect={false} defaultScript="boom()" executeScript={executeScript} />
    );

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    expect(await screen.findByText("NullPointerException")).toHaveClass("text-destructive");
    expect(screen.getByText(/^>\s*boom\(\)$/)).toBeInTheDocument();
    expect(screen.getByText(/última execução · \d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it("falha na requisição vira uma linha de erro com a mensagem", async () => {
    const executeScript = vi.fn().mockRejectedValue(new Error("servidor fora do ar"));
    render(<ScriptEditor autoConnect={false} defaultScript="1" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    expect(await screen.findByText(/servidor fora do ar/)).toHaveClass("text-destructive");
  });

  it("sem WebSocket nem executeScript, explica que não há como executar", async () => {
    renderIdle();
    await userEvent.click(screen.getByRole("button", { name: /executar/i }));
    expect(await screen.findByText(/Nenhuma forma de execução disponível/)).toHaveClass(
      "text-destructive"
    );
  });

  it("script vazio não executa e avisa", async () => {
    const executeScript = vi.fn();
    render(<ScriptEditor autoConnect={false} defaultScript="" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    expect(await screen.findByText(/Script vazio/)).toBeInTheDocument();
    expect(executeScript).not.toHaveBeenCalled();
  });

  it("o log rola até a última linha quando chega saída nova", async () => {
    const executeScript = vi.fn().mockResolvedValue({ output: "ok" });
    render(<ScriptEditor autoConnect={false} defaultScript="1" executeScript={executeScript} />);
    const log = screen.getByRole("log", { name: "Log de execução" });
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 480 });

    await userEvent.click(screen.getByRole("button", { name: /executar/i }));

    await waitFor(() => expect(log.scrollTop).toBe(480));
  });

  it("mensagens de erro do log não usam emoji como ícone", async () => {
    render(<ScriptEditor autoConnect={false} defaultScript="" executeScript={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /executar/i }));
    expect(await screen.findByText("Script vazio")).toHaveClass("text-destructive");
  });
});

describe("ScriptEditor — atalho de teclado", () => {
  it("Cmd+Enter (Mac) também executa", async () => {
    const executeScript = vi.fn().mockResolvedValue({ output: "ok" });
    render(<ScriptEditor autoConnect={false} defaultScript="1" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}");

    await waitFor(() => expect(executeScript).toHaveBeenCalledTimes(1));
  });

  it("Enter sozinho só quebra a linha, não executa", async () => {
    const executeScript = vi.fn().mockResolvedValue({ output: "ok" });
    render(<ScriptEditor autoConnect={false} defaultScript="a" executeScript={executeScript} />);

    await userEvent.type(screen.getByRole("textbox"), "{Enter}");

    expect(executeScript).not.toHaveBeenCalled();
  });

  it("Ctrl com outra tecla não executa", async () => {
    const executeScript = vi.fn().mockResolvedValue({ output: "ok" });
    render(<ScriptEditor autoConnect={false} defaultScript="a" executeScript={executeScript} />);

    await userEvent.click(screen.getByRole("textbox"));
    await userEvent.keyboard("{Control>}b{/Control}");

    expect(executeScript).not.toHaveBeenCalled();
  });

  it("repassa className e ref ao contêiner", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ScriptEditor ref={ref} autoConnect={false} className="mt-4" />);
    expect(container.firstElementChild).toHaveClass("mt-4");
    expect(ref.current).toBe(container.firstElementChild);
  });
});

describe("ScriptEditor — acessibilidade", () => {
  it("não tem violações de acessibilidade", async () => {
    const { container } = renderIdle();
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
