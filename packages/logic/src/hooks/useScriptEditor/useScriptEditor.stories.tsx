import type { Meta, StoryObj } from "@storybook/react-vite";
import { useScriptEditor } from "./index";

/**
 * Story demonstrando o uso do hook useScriptEditor
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useScriptEditor",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica para gerenciar editor de scripts com terminal interativo. Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function ScriptEditorDemo({
  wsUrl,
  defaultScript = 'console.log("Hello, World!");',
}: {
  wsUrl?: string;
  defaultScript?: string;
}) {
  const {
    script,
    setScript,
    terminalLines,
    preview,
    activeTab,
    setActiveTab,
    isRunning,
    isConnected,
    executeScript,
    stopExecution,
    clearTerminal,
  } = useScriptEditor({
    defaultScript,
    wsUrl,
    executeScript: async (script) => {
      // Simulação de execução HTTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        output: `Executando: ${script}`,
        result: { message: "Script executado com sucesso", timestamp: new Date().toISOString() },
      };
    },
    autoConnect: false, // Desabilitar auto-connect para demo
  });

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-lg w-full max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Script Editor Demo</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isConnected ? "text-green-500" : "text-red-500"}`}>
            {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="script-editor-demo" className="text-sm font-medium">
          Script
        </label>
        <textarea
          id="script-editor-demo"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-32 p-2 border rounded font-mono text-sm"
          placeholder="Digite seu script aqui..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={executeScript}
          disabled={isRunning}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isRunning ? "Executando..." : "Executar"}
        </button>
        <button
          type="button"
          onClick={stopExecution}
          disabled={!isRunning}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Parar
        </button>
        <button
          type="button"
          onClick={clearTerminal}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Limpar
        </button>
      </div>

      <div className="border rounded">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`px-4 py-2 text-sm ${
              activeTab === "terminal" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-sm ${
              activeTab === "preview" ? "bg-gray-100 font-medium" : ""
            }`}
          >
            Preview
          </button>
        </div>

        <div className="p-4 h-64 overflow-auto bg-gray-900 text-green-400 font-mono text-sm">
          {activeTab === "terminal" ? (
            <div className="space-y-1">
              {terminalLines.length === 0 ? (
                <div className="text-gray-500">$ Terminal pronto. Execute um script...</div>
              ) : (
                terminalLines.map((line) => (
                  <div
                    key={line.id}
                    className={
                      line.type === "error"
                        ? "text-red-400"
                        : line.type === "input"
                          ? "text-blue-400"
                          : "text-green-400"
                    }
                  >
                    {line.type === "input" && "$ "}
                    {line.content}
                  </div>
                ))
              )}
              {isRunning && <div className="text-yellow-400 animate-pulse">$ ▋ Executando...</div>}
            </div>
          ) : (
            <div className="text-gray-300">
              {preview || "Nenhum resultado ainda. Execute um script para ver o preview..."}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Linhas do terminal: {terminalLines.length}</p>
        <p>Aba ativa: {activeTab}</p>
        <p>Status: {isRunning ? "Executando" : "Parado"}</p>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <ScriptEditorDemo />,
};

export const WithWebSocket: Story = {
  render: () => (
    <ScriptEditorDemo wsUrl="ws://localhost:8080/ws/terminal" defaultScript="console.log('WS');" />
  ),
};

export const WithCustomScript: Story = {
  render: () => (
    <ScriptEditorDemo
      defaultScript={`// Script customizado
const result = [1, 2, 3].map(x => x * 2);
console.log(result);`}
    />
  ),
};
