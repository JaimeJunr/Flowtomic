import { type ExecuteScriptResponse, type TerminalLine, useScriptEditor } from "@flowtomic/logic";
import { Play, Square } from "lucide-react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ScriptEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onError"> {
  /**
   * Script inicial
   * @default ""
   */
  defaultScript?: string;

  /**
   * URL do WebSocket para conexão em tempo real
   */
  wsUrl?: string;

  /**
   * Função para executar script via HTTP (fallback quando WebSocket não está disponível)
   */
  executeScript?: (script: string) => Promise<ExecuteScriptResponse>;

  /**
   * Callback quando uma linha é adicionada ao terminal
   */
  onOutput?: (line: TerminalLine) => void;

  /**
   * Callback quando ocorre um erro
   */
  onError?: (error: Error) => void;

  /**
   * Se deve conectar automaticamente ao WebSocket
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Número máximo de tentativas de reconexão
   * @default 3
   */
  maxReconnectAttempts?: number;
}

const MONO = "font-mono text-[13px] leading-[22px]";

const DEFAULT_SCRIPT = `// Serviços do Spring estão no contexto: ctx.getBean("nome")

def repo = ctx.getBean("userRepository")
def usuarios = repo.findAll()

def resultado = [
  total: usuarios.size(),
  usuarios: usuarios.collect { [id: it.id, name: it.name] }
]

// a última expressão volta como resultado
resultado`;

/** Editor de scripts Groovy executados no servidor, com log de execução e resultado lado a lado. */
export const ScriptEditor = forwardRef<HTMLDivElement, ScriptEditorProps>(
  (
    {
      className,
      defaultScript = DEFAULT_SCRIPT,
      wsUrl,
      executeScript,
      onOutput,
      onError,
      autoConnect = true,
      maxReconnectAttempts = 3,
      ...props
    },
    ref
  ) => {
    const {
      script,
      setScript,
      terminalLines,
      preview,
      isRunning,
      isConnected,
      executeScript: executeScriptHandler,
      stopExecution,
      clearTerminal,
    } = useScriptEditor({
      defaultScript,
      wsUrl,
      executeScript,
      onOutput,
      onError,
      autoConnect,
      maxReconnectAttempts,
    });

    const logRef = useRef<HTMLDivElement>(null);

    // Mantém a última linha do log visível conforme o servidor emite saída
    useEffect(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    }, []);

    const lineCount = Math.max(1, script.split("\n").length);
    const ultimaExecucao = terminalLines.at(-1)?.timestamp;

    const runOnCtrlEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !isRunning) {
        event.preventDefault();
        executeScriptHandler();
      }
    };

    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <div className="flex items-center justify-between gap-6">
          <p className={cn(MONO, "flex items-center gap-2.5 text-foreground/80")}>
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                isConnected ? "bg-success" : "bg-destructive"
              )}
            />
            <span>{isConnected ? "conectado" : "desconectado"}</span>
            {wsUrl && <span className="text-muted-foreground">{wsUrl}</span>}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Ctrl+Enter executa</span>
            {isRunning ? (
              <button
                type="button"
                onClick={stopExecution}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-destructive bg-background px-4 text-[13px] font-medium text-destructive hover:bg-destructive/5"
              >
                <Square className="size-3 fill-current" aria-hidden />
                Parar
              </button>
            ) : (
              <button
                type="button"
                onClick={executeScriptHandler}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Play className="size-3 fill-current" aria-hidden />
                Executar
              </button>
            )}
          </div>
        </div>

        <div className="grid min-h-[420px] grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border">
            <div className="flex items-center border-b border-border bg-muted/50 px-3.5 py-2">
              <label
                htmlFor="script-editor-textarea"
                className="font-mono text-xs text-foreground/80"
              >
                script.groovy
              </label>
            </div>
            <div className={cn(MONO, "grid min-h-0 flex-1 grid-cols-[44px_minmax(0,1fr)]")}>
              <pre
                aria-hidden
                data-testid="line-numbers"
                className="m-0 select-none border-r border-border bg-muted/50 py-3.5 pr-2.5 text-right text-muted-foreground/70"
              >
                {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
              </pre>
              <textarea
                id="script-editor-textarea"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                onKeyDown={runOnCtrlEnter}
                spellCheck={false}
                className={cn(
                  MONO,
                  "m-0 resize-none overflow-auto whitespace-pre bg-background px-4 py-3.5 text-foreground outline-none"
                )}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-gray-900 text-gray-200">
            <div className="flex items-center justify-between border-b border-gray-700 px-3.5 py-2">
              <span className="font-mono text-xs text-gray-400">
                {ultimaExecucao
                  ? `última execução · ${hora(ultimaExecucao)}`
                  : "sem execução ainda"}
              </span>
              <button
                type="button"
                onClick={clearTerminal}
                className="h-6.5 rounded px-2 text-xs text-gray-400 hover:text-gray-200"
              >
                Limpar
              </button>
            </div>
            <div ref={logRef} className={cn(MONO, "flex min-h-0 flex-1 flex-col overflow-auto")}>
              <div className="flex flex-col gap-0.5 px-4 py-3.5 text-gray-400">
                {terminalLines.length === 0 && !isRunning && (
                  <span>Execute o script para ver o log aqui.</span>
                )}
                {terminalLines.map((line) => (
                  <LogLine key={line.id} line={line} />
                ))}
                {isRunning && <span className="animate-pulse text-gray-300">executando…</span>}
              </div>
              {preview && (
                <div className="flex flex-1 flex-col gap-2 border-t border-gray-700 px-4 py-3.5">
                  <p className="m-0 text-xs text-gray-500">resultado</p>
                  <pre className="m-0 whitespace-pre font-[inherit] text-white">{preview}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
ScriptEditor.displayName = "ScriptEditor";

const LINE_COLOR: Record<TerminalLine["type"], string> = {
  input: "text-brand-300",
  output: "text-gray-200",
  error: "text-error-400",
  system: "text-gray-400",
};

function LogLine({ line }: { line: TerminalLine }) {
  return (
    <div className="flex gap-3">
      <span className="shrink-0 text-gray-500">{hora(line.timestamp)}</span>
      <span className={cn("whitespace-pre-wrap break-words", LINE_COLOR[line.type])}>
        {line.type === "input" && "> "}
        {line.content}
      </span>
    </div>
  );
}

function hora(date: Date): string {
  return date.toLocaleTimeString("pt-BR");
}
