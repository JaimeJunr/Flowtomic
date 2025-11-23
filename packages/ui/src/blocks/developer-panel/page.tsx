/**
 * Developer Panel Block
 *
 * Painel de desenvolvedor com informações do sistema, ambiente e ferramentas de desenvolvimento.
 * Inclui editor de scripts integrado.
 */

"use client";

import type { ExecuteScriptResponse, TerminalLine } from "@flowtomic/logic";
import { ScriptEditor } from "@/components/organisms";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms";
import { Code, Info } from "lucide-react";
import { useState } from "react";

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
  /**
   * Informações do usuário atual
   */
  user?: UserInfo;

  /**
   * Status de health check do sistema
   */
  health?: SystemHealth | null;

  /**
   * Informações do sistema/aplicação
   */
  systemInfo?: SystemInfo | null;

  /**
   * Informações do ambiente frontend
   */
  environmentInfo?: EnvironmentInfo | null;

  /**
   * Estado de carregamento
   */
  loading?: boolean;

  /**
   * Mensagem de erro
   */
  error?: string | null;

  /**
   * URL base da API para links de ferramentas
   */
  apiBaseUrl?: string;

  /**
   * Callback para abrir Swagger UI
   */
  onOpenSwagger?: () => void;

  /**
   * Callback para abrir API Docs
   */
  onOpenApiDocs?: () => void;

  /**
   * Callback para abrir Health Check
   */
  onOpenHealthCheck?: () => void;

  /**
   * Configurações do ScriptEditor
   */
  scriptEditorProps?: {
    defaultScript?: string;
    wsUrl?: string;
    executeScript?: (script: string) => Promise<ExecuteScriptResponse>;
    onOutput?: (line: TerminalLine) => void;
    onError?: (error: Error) => void;
  };
}

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

  const defaultOpenSwagger = () => {
    const swaggerUrl = `${apiBaseUrl.replace("/api", "")}/swagger-ui.html`;
    window.open(swaggerUrl, "_blank");
  };

  const defaultOpenApiDocs = () => {
    const apiDocsUrl = `${apiBaseUrl.replace("/api", "")}/v3/api-docs`;
    window.open(apiDocsUrl, "_blank");
  };

  const defaultOpenHealthCheck = () => {
    window.open(`${apiBaseUrl}/health`, "_blank");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel de Desenvolvedor</h1>
          <p className="text-muted-foreground mt-2">Informações técnicas e ferramentas de desenvolvimento</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {user?.isAdmin ? "ADMIN" : "USER"}
        </Badge>
      </div>

      {/* Erro */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Abas principais */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informações do Sistema
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Editor de Scripts
          </TabsTrigger>
        </TabsList>

        {/* Aba: Informações do Sistema */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Informações do Usuário */}
            <Card>
              <CardHeader>
                <CardTitle>Usuário Atual</CardTitle>
                <CardDescription>Informações da sessão atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user?.username || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={user?.isAdmin ? "default" : "secondary"}>{user?.role || "N/A"}</Badge>
                </div>
                {user?.token && (
                  <div>
                    <p className="text-sm text-muted-foreground">Token</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                        {user.token.substring(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.token!, "token")}
                      >
                        {copiedText === "token" ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Check */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>Health check da API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {health ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={health.status === "UP" ? "default" : "destructive"}>{health.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                      <p className="font-medium">{health.service}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="font-medium text-xs">{new Date(health.timestamp).toLocaleString("pt-BR")}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Não disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Informações da Aplicação */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Aplicação</CardTitle>
                <CardDescription>Versão e detalhes do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {systemInfo ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{systemInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Versão</p>
                      <Badge variant="outline">{systemInfo.version}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Descrição</p>
                      <p className="font-medium text-sm">{systemInfo.description}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Não disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Ambiente Frontend */}
            <Card>
              <CardHeader>
                <CardTitle>Ambiente Frontend</CardTitle>
                <CardDescription>Configurações do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {environmentInfo ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">API Base URL</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {environmentInfo.apiBaseUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(environmentInfo.apiBaseUrl, "apiUrl")}
                        >
                          {copiedText === "apiUrl" ? "Copiado!" : "Copiar"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Modo</p>
                      <Badge variant="outline">{environmentInfo.nodeEnv}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timezone</p>
                      <p className="font-medium text-xs">{environmentInfo.timezone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resolução</p>
                      <p className="font-medium text-xs">{environmentInfo.screenResolution}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Não disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Ferramentas de Desenvolvimento */}
            <Card>
              <CardHeader>
                <CardTitle>Ferramentas</CardTitle>
                <CardDescription>Acesso rápido a ferramentas de desenvolvimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onOpenSwagger || defaultOpenSwagger}
                >
                  📚 Abrir Swagger UI
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onOpenApiDocs || defaultOpenApiDocs}
                >
                  📖 Abrir API Docs (JSON)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onOpenHealthCheck || defaultOpenHealthCheck}
                >
                  ❤️ Health Check
                </Button>
              </CardContent>
            </Card>

            {/* Informações do Navegador */}
            <Card>
              <CardHeader>
                <CardTitle>Navegador</CardTitle>
                <CardDescription>Informações do cliente web</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {environmentInfo ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">User Agent</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {environmentInfo.userAgent.substring(0, 50)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(environmentInfo.userAgent, "userAgent")}
                        >
                          {copiedText === "userAgent" ? "Copiado!" : "Copiar"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="font-medium text-xs">
                        {new Date(environmentInfo.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Não disponível</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba: Editor de Scripts */}
        <TabsContent value="editor" className="space-y-6">
          <ScriptEditor {...scriptEditorProps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

