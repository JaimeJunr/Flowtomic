/**
 * useScriptEditor - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * function MyScriptEditor() {
 *   const {
 *     script,
 *     setScript,
 *     terminalLines,
 *     preview,
 *     isRunning,
 *     isConnected,
 *     executeScript,
 *     stopExecution,
 *     clearTerminal,
 *   } = useScriptEditor({
 *     wsUrl: "ws://localhost:8080/ws/terminal",
 *     executeScript: async (script) => {
 *       const response = await fetch("/api/scripts/execute", {
 *         method: "POST",
 *         body: JSON.stringify({ script }),
 *       });
 *       return response.json();
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <textarea value={script} onChange={(e) => setScript(e.target.value)} />
 *       <button onClick={executeScript}>Executar</button>
 *       <div>
 *         {terminalLines.map((line) => (
 *           <div key={line.id}>{line.content}</div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp: Date;
}

export interface ExecuteScriptResponse {
  output?: string;
  error?: string;
  result?: unknown;
}

export interface UseScriptEditorOptions {
  /**
   * URL do WebSocket para conexão em tempo real
   * @default undefined
   */
  wsUrl?: string;

  /**
   * Função para executar script via HTTP (fallback quando WebSocket não está disponível)
   * @default undefined
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

  /**
   * Script inicial
   * @default ""
   */
  defaultScript?: string;
}

export interface UseScriptEditorReturn {
  /**
   * Script atual
   */
  script: string;

  /**
   * Atualizar script
   */
  setScript: (script: string) => void;

  /**
   * Linhas do terminal
   */
  terminalLines: TerminalLine[];

  /**
   * Preview formatado (JSON)
   */
  preview: string;

  /**
   * Aba ativa (terminal ou preview)
   */
  activeTab: "terminal" | "preview";

  /**
   * Mudar aba ativa
   */
  setActiveTab: (tab: "terminal" | "preview") => void;

  /**
   * Se o script está sendo executado
   */
  isRunning: boolean;

  /**
   * Se o WebSocket está conectado
   */
  isConnected: boolean;

  /**
   * Executar script
   */
  executeScript: () => Promise<void>;

  /**
   * Parar execução
   */
  stopExecution: () => void;

  /**
   * Limpar terminal e preview
   */
  clearTerminal: () => void;

  /**
   * Adicionar linha ao terminal manualmente
   */
  addTerminalLine: (type: TerminalLine["type"], content: string) => void;
}

/**
 * Hook headless para gerenciar editor de scripts com terminal interativo
 */
export function useScriptEditor(options: UseScriptEditorOptions = {}): UseScriptEditorReturn {
  const {
    wsUrl,
    executeScript: executeScriptFn,
    onOutput,
    onError,
    autoConnect = true,
    maxReconnectAttempts = 3,
    defaultScript = "",
  } = options;

  const [script, setScript] = useState(defaultScript);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"terminal" | "preview">("terminal");
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  // Adicionar linha ao terminal
  const addTerminalLine = useCallback(
    (type: TerminalLine["type"], content: string) => {
      const line: TerminalLine = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        content,
        timestamp: new Date(),
      };

      setTerminalLines((prev) => [...prev, line]);
      onOutput?.(line);
    },
    [onOutput]
  );

  // Conectar WebSocket
  const connectWebSocket = useCallback(() => {
    if (!wsUrl) return;

    // Verificar se já existe uma conexão ativa
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // Fechar conexão anterior se existir
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignorar erros ao fechar
      }
      wsRef.current = null;
    }

    if (!shouldReconnectRef.current) return;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "output") {
            addTerminalLine("output", data.content);
          } else if (data.type === "error") {
            addTerminalLine("error", data.content);
          } else if (data.type === "result") {
            setPreview(JSON.stringify(data.content, null, 2));
            setActiveTab("preview");
          } else if (data.type === "system") {
            // Mensagens de sistema não são exibidas no terminal
            console.log("[useScriptEditor] Mensagem de sistema:", data.content);
          }
        } catch {
          addTerminalLine("output", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("[useScriptEditor] WebSocket error:", error);
        setIsConnected(false);
        onError?.(new Error("Erro na conexão WebSocket"));
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;

        // Tentar reconectar apenas se não excedeu tentativas e ainda deve reconectar
        if (
          event.code !== 1000 &&
          shouldReconnectRef.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1;
          setTimeout(() => {
            if (shouldReconnectRef.current) {
              connectWebSocket();
            }
          }, 3000);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.warn("[useScriptEditor] Máximo de tentativas de reconexão atingido");
        }
      };
    } catch (error) {
      console.error("[useScriptEditor] Erro ao conectar WebSocket:", error);
      setIsConnected(false);
      onError?.(error instanceof Error ? error : new Error("Erro desconhecido ao conectar"));
    }
  }, [wsUrl, maxReconnectAttempts, addTerminalLine, onError]);

  // Conectar WebSocket quando montar (se autoConnect)
  useEffect(() => {
    if (autoConnect && wsUrl) {
      const connectTimeout = setTimeout(() => {
        connectWebSocket();
      }, 100);

      return () => {
        clearTimeout(connectTimeout);
      };
    }
  }, [autoConnect, wsUrl, connectWebSocket]);

  // Limpar conexão ao desmontar
  useEffect(() => {
    return () => {
      shouldReconnectRef.current = false;

      if (wsRef.current) {
        try {
          wsRef.current.close(1000, "Component unmounting");
        } catch {
          // Ignorar erros ao fechar
        }
        wsRef.current = null;
      }
    };
  }, []);

  // Executar script
  const executeScript = useCallback(async () => {
    if (!script.trim()) {
      addTerminalLine("error", "❌ Script vazio");
      return;
    }

    setIsRunning(true);
    addTerminalLine("input", script);

    try {
      // Enviar script via WebSocket se conectado
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "execute", script }));
      } else if (executeScriptFn) {
        // Fallback para HTTP se WebSocket não estiver disponível
        try {
          const result = await executeScriptFn(script);

          if (result.output) {
            addTerminalLine("output", result.output);
          }

          if (result.error) {
            addTerminalLine("error", result.error);
          }

          if (result.result) {
            setPreview(JSON.stringify(result.result, null, 2));
            setActiveTab("preview");
          }
        } catch (error) {
          addTerminalLine(
            "error",
            `❌ Erro na requisição: ${error instanceof Error ? error.message : "Erro desconhecido"}`
          );
        }
      } else {
        addTerminalLine("error", "❌ Nenhuma forma de execução disponível (WebSocket ou HTTP)");
      }
    } catch (error) {
      addTerminalLine(
        "error",
        `❌ Erro ao executar: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    } finally {
      setIsRunning(false);
    }
  }, [script, executeScriptFn, addTerminalLine]);

  // Parar execução
  const stopExecution = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
    }
    setIsRunning(false);
  }, []);

  // Limpar terminal
  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
    setPreview("");
  }, []);

  return {
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
    addTerminalLine,
  };
}
