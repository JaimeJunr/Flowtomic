"use client";

import type { ExecuteScriptResponse, TerminalLine } from "@flowtomic/logic";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms";
import { ScriptEditor } from "@/components/organisms/script-editor";
import { cn } from "@/lib/utils";

export interface SystemHealth {
  status: string;
  timestamp: string;
  service: string;
}

export interface SystemInfo {
  name: string;
  version: string;
  description: string;
}

export interface EnvironmentInfo {
  apiBaseUrl: string;
  nodeEnv: string;
  timestamp: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
}

export interface UserInfo {
  username?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
  token?: string;
}

export interface DeveloperPanelProps {
  /** Informações do usuário atual */
  user?: UserInfo;
  /** Status de health check do sistema */
  health?: SystemHealth | null;
  /** Informações do sistema/aplicação */
  systemInfo?: SystemInfo | null;
  /** Informações do ambiente frontend */
  environmentInfo?: EnvironmentInfo | null;
  /**
   * Estado de carregamento
   * @default false
   */
  loading?: boolean;
  /**
   * Mensagem de erro
   * @default null
   */
  error?: string | null;
  /**
   * URL base da API para links de ferramentas
   * @default ""
   */
  apiBaseUrl?: string;
  /** Callback para abrir Swagger UI */
  onOpenSwagger?: () => void;
  /** Callback para abrir API Docs */
  onOpenApiDocs?: () => void;
  /** Callback para abrir Health Check */
  onOpenHealthCheck?: () => void;
  /** Configurações do ScriptEditor */
  scriptEditorProps?: {
    defaultScript?: string;
    wsUrl?: string;
    executeScript?: (script: string) => Promise<ExecuteScriptResponse>;
    onOutput?: (line: TerminalLine) => void;
    onError?: (error: Error) => void;
  };
}

const MONO = "font-mono";
const DT = "text-muted-foreground";
const SECTION_TITLE = "text-[13px] font-medium text-muted-foreground";
const DL = "grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm leading-5";

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR");
}

/** Painel de diagnóstico para quem consome o Flowtomic: responde "meu ambiente está ok?" e dá acesso rápido às ferramentas. */
export default function DeveloperPanel({
  user,
  health,
  systemInfo,
  environmentInfo,
  loading = false,
  error = null,
  apiBaseUrl = "",
  onOpenSwagger,
  onOpenApiDocs,
  onOpenHealthCheck,
  scriptEditorProps,
}: DeveloperPanelProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const apiRoot = apiBaseUrl.replace("/api", "");
  const swaggerUrl = `${apiRoot}/swagger-ui.html`;
  const apiDocsUrl = `${apiRoot}/v3/api-docs`;
  const healthUrl = `${apiBaseUrl}/health`;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações do sistema…</p>
        </div>
      </div>
    );
  }

  const apiUp = health?.status === "UP";

  return (
    <div className="container mx-auto px-16 py-12">
      <Tabs defaultValue="info" className="flex flex-col gap-10">
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-semibold tracking-tight leading-tight">
              Painel do desenvolvedor
            </h1>
            <p className="text-sm text-muted-foreground">
              Ambiente local · {systemInfo?.name ?? "Flowtomic App"}
              {user?.username && ` · ${user.username}`}
            </p>
          </div>
          <TabsList aria-label="Seções">
            <TabsTrigger value="info">Ambiente</TabsTrigger>
            <TabsTrigger value="editor">Editor de scripts</TabsTrigger>
          </TabsList>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <TabsContent value="info" className="flex flex-col gap-10">
          <section
            aria-label="Estado do ambiente"
            className="flex flex-col gap-3.5 border-b border-border pb-8"
          >
            {health ? (
              <>
                <p className="flex items-center gap-3.5">
                  <span
                    aria-hidden
                    className={cn(
                      "size-3 shrink-0 rounded-full",
                      apiUp
                        ? "bg-success shadow-[0_0_0_4px_rgba(23,178,106,0.18)]"
                        : "bg-destructive shadow-[0_0_0_4px_rgba(240,68,56,0.18)]"
                    )}
                  />
                  <span className="text-[40px] font-semibold tracking-tight leading-none">
                    {apiUp ? "API no ar" : "API fora do ar"}
                  </span>
                </p>
                <p
                  className={cn(MONO, "flex flex-wrap gap-5 pl-[26px] text-sm text-foreground/80")}
                >
                  <span>{health.service}</span>
                  {systemInfo?.version && <span>v{systemInfo.version}</span>}
                  {environmentInfo?.nodeEnv && <span>{environmentInfo.nodeEnv}</span>}
                  <span className={DT}>
                    verificado às <time dateTime={health.timestamp}>{hora(health.timestamp)}</time>
                  </span>
                </p>
                {!apiUp && (
                  <p className="max-w-[640px] pl-[26px] text-sm leading-5 text-foreground/80">
                    Sem resposta em <code className={MONO}>{healthUrl}</code>. Confira se a API está
                    rodando e se a porta bate com a configuração do ambiente.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="flex items-center gap-3.5 text-muted-foreground">
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-full bg-muted-foreground/40"
                  />
                  <span className="text-[40px] font-semibold tracking-tight leading-none">
                    Sem resposta
                  </span>
                </p>
                <p className="max-w-[640px] pl-[26px] text-sm leading-5 text-foreground/80">
                  A API não respondeu em <code className={MONO}>{healthUrl}</code>. Confira se ela
                  está rodando e se a porta bate com a configuração do ambiente.
                </p>
              </>
            )}
          </section>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <section aria-labelledby="h-sessao" className="flex flex-col gap-3.5">
              <h2 id="h-sessao" className={SECTION_TITLE}>
                Sessão
              </h2>
              <dl className={DL}>
                <dt className={DT}>usuário</dt>
                <dd className={MONO}>{user?.username ?? "—"}</dd>
                <dt className={DT}>e-mail</dt>
                <dd className={MONO}>{user?.email ?? "—"}</dd>
                <dt className={DT}>papel</dt>
                <dd className={MONO}>{user?.role ?? "—"}</dd>
                {user?.token && (
                  <>
                    <dt className={DT}>token</dt>
                    <dd className="flex min-w-0 items-center gap-2">
                      <code className={cn(MONO, "truncate text-[13px]")}>{user.token}</code>
                      <CopyButton
                        label="Copiar token"
                        copied={copiedText === "token"}
                        onClick={() => user.token && copyToClipboard(user.token, "token")}
                      />
                    </dd>
                  </>
                )}
              </dl>
            </section>

            <section aria-labelledby="h-ambiente" className="flex flex-col gap-3.5">
              <h2 id="h-ambiente" className={SECTION_TITLE}>
                Ambiente
              </h2>
              <dl className={DL}>
                <dt className={DT}>API</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <code className={cn(MONO, "truncate text-[13px]")}>
                    {environmentInfo?.apiBaseUrl || apiBaseUrl || "—"}
                  </code>
                  {environmentInfo?.apiBaseUrl && (
                    <CopyButton
                      label="Copiar URL da API"
                      copied={copiedText === "apiUrl"}
                      onClick={() => copyToClipboard(environmentInfo.apiBaseUrl, "apiUrl")}
                    />
                  )}
                </dd>
                <dt className={DT}>modo</dt>
                <dd className={MONO}>{environmentInfo?.nodeEnv ?? "—"}</dd>
                <dt className={DT}>fuso</dt>
                <dd className={MONO}>{environmentInfo?.timezone ?? "—"}</dd>
                <dt className={DT}>versão</dt>
                <dd className={MONO}>{systemInfo?.version ?? "—"}</dd>
              </dl>
            </section>

            <section aria-labelledby="h-navegador" className="flex flex-col gap-3.5">
              <h2 id="h-navegador" className={SECTION_TITLE}>
                Navegador
              </h2>
              <dl className={DL}>
                <dt className={DT}>agente</dt>
                <dd className="flex min-w-0 items-start gap-2">
                  <span
                    className={cn(MONO, "break-all text-[13px] leading-[18px] text-foreground/80")}
                  >
                    {environmentInfo?.userAgent ?? "—"}
                  </span>
                  {environmentInfo?.userAgent && (
                    <CopyButton
                      label="Copiar user agent"
                      copied={copiedText === "userAgent"}
                      onClick={() => copyToClipboard(environmentInfo.userAgent, "userAgent")}
                    />
                  )}
                </dd>
                <dt className={DT}>tela</dt>
                <dd className={MONO}>{environmentInfo?.screenResolution ?? "—"}</dd>
                <dt className={DT}>lido às</dt>
                <dd className={MONO}>
                  {environmentInfo?.timestamp ? hora(environmentInfo.timestamp) : "—"}
                </dd>
              </dl>
            </section>
          </div>

          <section
            aria-labelledby="h-atalhos"
            className="flex flex-col gap-3.5 border-t border-border pt-8"
          >
            <h2 id="h-atalhos" className={SECTION_TITLE}>
              Atalhos
            </h2>
            <div className="flex flex-wrap gap-8 text-sm font-medium">
              <ToolLink href={swaggerUrl} onClick={onOpenSwagger}>
                Swagger UI
              </ToolLink>
              <ToolLink href={apiDocsUrl} onClick={onOpenApiDocs}>
                Especificação OpenAPI
              </ToolLink>
              <ToolLink href={healthUrl} onClick={onOpenHealthCheck}>
                Health check
              </ToolLink>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="editor">
          <ScriptEditor {...scriptEditorProps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CopyButtonProps {
  label: string;
  copied: boolean;
  onClick: () => void;
}

function CopyButton({ label, copied, onClick }: CopyButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground/80 hover:bg-muted"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

interface ToolLinkProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function ToolLink({ href, onClick, children }: ToolLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={
        onClick &&
        ((event) => {
          // callback customizado substitui a navegação padrão, sem perder a semântica de link
          event.preventDefault();
          onClick();
        })
      }
      className="inline-flex items-center gap-1.5 text-primary hover:underline"
    >
      {children}
      <ExternalLink className="size-[13px]" aria-hidden />
    </a>
  );
}
