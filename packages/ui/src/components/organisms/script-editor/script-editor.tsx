/**
 * ScriptEditor Component - Flowtomic UI
 *
 * Componente para editar e executar scripts com terminal interativo
 *
 * Funcionalidades:
 * - Editor de código para scripts
 * - Terminal interativo em tempo real
 * - Preview da resposta do servidor
 * - Abas para alternar entre terminal e preview
 * - Execução de scripts no backend
 */

import { type ExecuteScriptResponse, type TerminalLine, useScriptEditor } from "@flowtomic/logic";
import { Check, Copy, Play, Square, Trash2 } from "lucide-react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge, Button } from "../../atoms/actions";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms/display";
import { Textarea } from "../../atoms/forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../atoms/navigation/tabs";

export interface ScriptEditorProps extends HTMLAttributes<HTMLDivElement> {
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

/**
 * ScriptEditor - Componente para editar e executar scripts com terminal interativo
 */
export const ScriptEditor = forwardRef<HTMLDivElement, ScriptEditorProps>(
  (
    {
      className,
      defaultScript = `// Exemplo de script Groovy
// Serviços do Spring Boot estão disponíveis automaticamente
// Exemplos: userService, animalService, herdService, ctx (ApplicationContext)

// Exemplo 1: Acessar repositório via ApplicationContext
def userRepo = ctx.getBean("userRepository")
def usuarios = userRepo.findAll()
def resultado = [
  message: "Usuários encontrados",
  total: usuarios.size(),
  usuarios: usuarios.collect { [id: it.id, name: it.name, email: it.email] }
]

// Exemplo 2: Usar serviço diretamente (se disponível)
// def userService = ctx.getBean("userService")

// Última expressão é retornada como resultado
resultado`,
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
      activeTab,
      setActiveTab,
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

    const [copied, setCopied] = useState(false);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Scroll automático do terminal
    useEffect(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, []);

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Erro ao copiar:", err);
      }
    };

    return (
      <Card ref={ref} className={cn("w-full", className)} {...props}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Editor de Scripts</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Edite e execute scripts com terminal interativo em tempo real
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(script)}
                disabled={!script}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editor de Código */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="script-editor-textarea" className="text-sm font-medium">
                Script
              </label>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={executeScriptHandler}
                  disabled={isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Executar
                </Button>
                <Button variant="outline" size="sm" onClick={stopExecution} disabled={!isRunning}>
                  <Square className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              </div>
            </div>
            <div className="relative bg-muted/50 border border-border rounded-lg overflow-hidden">
              <div className="flex flex-row gap-x-2 p-3 border-b border-border bg-muted">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <Textarea
                id="script-editor-textarea"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Digite seu script Groovy aqui... (ou JavaScript como fallback)"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Terminal e Preview com Abas */}
          <div className="border border-border rounded-lg overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "terminal" | "preview")}
            >
              <div className="flex border-b border-border bg-muted">
                <TabsList className="bg-transparent border-0 p-0 h-auto">
                  <TabsTrigger value="terminal">Terminal</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={clearTerminal} className="mr-2">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>

              <TabsContent value="terminal" className="mt-0">
                <TerminalContent ref={terminalRef} lines={terminalLines} isRunning={isRunning} />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <PreviewContent content={preview} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    );
  }
);
ScriptEditor.displayName = "ScriptEditor";

// Componente de conteúdo do terminal
interface TerminalContentProps {
  lines: TerminalLine[];
  isRunning: boolean;
}

const TerminalContent = forwardRef<HTMLDivElement, TerminalContentProps>(
  ({ lines, isRunning }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "p-4 font-mono text-sm h-64 overflow-auto",
          // Modo dark: estilo terminal escuro
          "dark:bg-[#0d1117] dark:text-[#c9d1d9]",
          // Modo light: usar input que é mais escuro que muted, mantendo a paleta
          "bg-input text-foreground"
        )}
      >
        {lines.length === 0 ? (
          <div className="text-muted-foreground dark:text-[#8b949e]">
            <span className="text-primary dark:text-[#58a6ff]">$</span> Terminal pronto. Execute um
            script para ver a saída...
          </div>
        ) : (
          <div className="space-y-1">
            {lines.map((line) => (
              <div
                key={line.id}
                className={cn(
                  "flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200",
                  line.type === "error" && "text-destructive dark:text-[#f85149]",
                  line.type === "output" && "text-foreground dark:text-[#c9d1d9]",
                  line.type === "system" && "text-muted-foreground dark:text-[#8b949e]",
                  line.type === "input" && "text-primary dark:text-[#58a6ff]"
                )}
              >
                {line.type === "input" && (
                  <span className="text-primary dark:text-[#58a6ff]">$</span>
                )}
                {line.type === "error" && (
                  <span className="text-destructive dark:text-[#f85149]">✗</span>
                )}
                {line.type === "system" && (
                  <span className="text-muted-foreground dark:text-[#8b949e]">●</span>
                )}
                <span className="flex-1 whitespace-pre-wrap break-words">{line.content}</span>
              </div>
            ))}
            {isRunning && (
              <div className="text-muted-foreground dark:text-[#8b949e] animate-pulse">
                <span className="text-primary dark:text-[#58a6ff]">$</span>{" "}
                <span className="animate-pulse">▋</span> Executando...
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
TerminalContent.displayName = "TerminalContent";

// Componente de preview
interface PreviewContentProps {
  content: string;
}

const PreviewContent = ({ content }: PreviewContentProps) => {
  if (!content) {
    return (
      <div className="p-4 text-muted-foreground text-center h-64 flex items-center justify-center">
        Nenhum resultado ainda. Execute um script para ver o preview...
      </div>
    );
  }

  return (
    <div className="p-4 h-64 overflow-auto">
      <pre className="text-sm font-mono bg-muted p-4 rounded-lg overflow-auto">
        <code>{content}</code>
      </pre>
    </div>
  );
};
