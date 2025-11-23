# ⚛️ Regras de Uso do Flowtomic UI e Logic

## Visão Geral

O **Flowtomic** é um sistema de design system modular que fornece:

- **`@flowtomic/ui`**: Componentes UI reutilizáveis (atoms, molecules, organisms, blocks)
- **`@flowtomic/logic`**: Hooks headless e lógica reutilizável
- **`flowtomic-cli`**: CLI para instalação de componentes em projetos externos

## Instalação

### Via CLI (Recomendado para Customização)

#### Inicialização

```bash
# Via npm (Recomendado)
npx flowtomic-cli@latest init
# ou
bunx flowtomic-cli@latest init
```

Isso cria o arquivo `components.json` na raiz do projeto.

#### Adicionar Componentes

```bash
# Adicionar um componente
npx flowtomic-cli@latest add button
# ou
bunx flowtomic-cli@latest add button

# Adicionar múltiplos componentes
npx flowtomic-cli@latest add button card input badge
# ou
bunx flowtomic-cli@latest add button card input badge

# Modo interativo (sem especificar componentes)
npx flowtomic-cli@latest add
# ou
bunx flowtomic-cli@latest add

# Listar componentes disponíveis
npx flowtomic-cli@latest list
# ou
bunx flowtomic-cli@latest list
```

#### Adicionar Hooks

```bash
# Adicionar um hook
npx flowtomic-cli@latest add use-stat-card
# ou
bunx flowtomic-cli@latest add use-stat-card
```

#### Adicionar Blocks

```bash
# Adicionar um block completo
npx flowtomic-cli@latest add-block dashboard-01
# ou
bunx flowtomic-cli@latest add-block dashboard-01

# Adicionar dashboard completo do Flowtomic
npx flowtomic-cli@latest add-block flowtomic-dashboard
# ou
bunx flowtomic-cli@latest add-block flowtomic-dashboard

# Adicionar painel de desenvolvedor
npx flowtomic-cli@latest add-block developer-panel
# ou
bunx flowtomic-cli@latest add-block developer-panel
```

### Via npm (Packages Publicados)

Os packages do Flowtomic também estão disponíveis diretamente no npm:

```bash
# Instalar UI e Logic
npm install @flowtomic/ui @flowtomic/logic

# Ou usando yarn/pnpm/bun
yarn add @flowtomic/ui @flowtomic/logic
pnpm add @flowtomic/ui @flowtomic/logic
bun add @flowtomic/ui @flowtomic/logic
```

**Uso dos packages npm**:

```typescript
// Componentes UI
import { Button, Card, Input, Badge } from "@flowtomic/ui";

// Hooks headless
import { useStatCard, useIsMobile, useResizable } from "@flowtomic/logic";
```

**Nota:** Ao usar os packages npm, você ainda pode usar o CLI para adicionar componentes individuais que serão copiados para seu projeto, permitindo customização total.

### Via shadcn CLI (Compatível)

O Flowtomic é compatível com o shadcn CLI:

```bash
# Usar registry do Flowtomic com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

## Como Funciona

1. **Cópia de Arquivos**: O CLI copia os arquivos dos componentes diretamente para o seu projeto (similar ao shadcn/ui)
2. **Customização Total**: Você pode modificar os componentes copiados conforme necessário
3. **Ajuste Automático de Imports**: Os imports são automaticamente ajustados para usar os aliases do seu projeto
4. **Utils Automático**: O arquivo `utils.ts` (função `cn`) é copiado automaticamente se não existir

## Estrutura de Componentes

### Atoms (26+ Componentes Básicos)

Componentes fundamentais e indivisíveis, organizados em categorias:

**Actions**: `button`, `badge`, `dropdown-menu`, `context-menu`

**Forms**: `input`, `select`, `checkbox`, `label`, `radio-group`, `switch`, `textarea`, `slider`, `toggle`, `field`, `form`, `input-otp`

**Display**: `card`, `table`, `skeleton`, `empty`, `kbd`, `calendar`, `carousel`, `chart`

**Navigation**: `tabs`, `command`, `breadcrumb`, `pagination`, `menubar`, `navigation-menu`

**Feedback**: `alert`, `alert-dialog`, `dialog`, `tooltip` (com suporte a seguimento do mouse), `popover`, `sheet`, `sonner`

**Animation**: `loader`, `shimmer`, `spinner`, `progress`

**Layout**: `collapsible`, `scroll-area`, `separator`, `accordion`, `aspect-ratio`, `toggle-group`, `drawer`, `sidebar`

**Code**: `code-block`, `snippet`, `inline-citation`

**Typography**: `animated-shiny-text`

### Molecules (24 Componentes Compostos)

Componentes que combinam atoms:

- `button-group` - Grupo de botões
- `password-input` - Input de senha
- `image-dropzone` - Upload de imagem
- `stat-card` - Card de estatística (usa `use-stat-card` hook)
- `data-table` - Tabela avançada
- `menu-dock` - Dock de menu
- `theme-toggle-button` - Botão de toggle de tema
- `auth-navigation-link` - Link de navegação de auth
- `auth-form-error-message` - Mensagem de erro de formulário
- `social-login-buttons` - Botões de login social
- `input-group` - Grupo de input com addons
- `artifact` - Container de artifact
- `message` - Componente de mensagem com branches
- `suggestion` - Lista de sugestões
- `sources` - Lista de fontes colapsável
- `tool` - Display de tool
- `task` - Item de task
- `checkpoint` - Checkpoint display
- `confirmation` - Confirmation dialog wrapper
- `chart-area-interactive` - Gráfico de área interativo
- `chart-bar-interactive` - Gráfico de barras interativo
- `item` - Item de formulário
- `connection` - Connection do @xyflow/react
- `canvas` - Canvas do ReactFlow

### Organisms (23 Componentes Complexos)

Componentes de alto nível que combinam molecules:

**Dashboard**:

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações
- `resizable-layout` - Componente redimensionável com sidebar

**AI/Conversation**:

- `conversation` - Container de conversa
- `model-selector` - Seletor de modelo
- `image` - Display de imagem gerada
- `open-in-chat` - Dropdown para abrir em outras plataformas
- `queue` - Fila de mensagens e tarefas
- `reasoning` - Exibição de raciocínio do modelo
- `plan` - Exibição de planos do modelo
- `chain-of-thought` - Cadeia de raciocínio
- `context` - Uso de contexto/tokens do modelo
- `prompt-input` - Input de prompt complexo

**ReactFlow**:

- `panel` - Panel do @xyflow/react
- `toolbar` - Toolbar do @xyflow/react
- `controls` - Controls do @xyflow/react
- `node` - Node do ReactFlow
- `edge` - Edge do ReactFlow

**Outros**:

- `web-preview` - Visualizador de páginas web
- `script-editor` - Editor de scripts com terminal interativo

### Hooks (12 Hooks Headless)

Hooks que fornecem apenas lógica, sem UI:

- `use-stat-card` - Hook headless para StatCard (formatação de valores, cálculo de tendências, props de acessibilidade)
- `use-mobile` (exportado como `useIsMobile`) - Hook para detectar dispositivos móveis baseado em breakpoint (768px)
- `use-react-table-back` - Hook para tabelas com paginação/ordenação no backend (server-side)
- `use-react-table-front` - Hook para tabelas com paginação/ordenação no frontend (client-side)
- `use-resizable` - Hook para componentes redimensionáveis com sidebar
- `use-script-editor` - Hook para gerenciar editor de scripts com terminal interativo (WebSocket, execução, preview)
- `use-theme-transition` - Hook para transições de tema com View Transitions API
- `use-time-tracker` - Hook para gerenciar timer (start, pause, stop, resume, format)
- `use-project-stats` - Hook para calcular estatísticas de projetos
- `use-project-progress` - Hook para calcular progresso de projetos
- `use-animated-indicator` - Hook para indicadores animados
- `use-genealogy` - Hook para gerenciar genealogia/hierarquia

### Blocks (3 Blocks Pré-construídos)

Componentes completos e prontos para uso:

- `dashboard-01` - Dashboard simples com cards
- `flowtomic-dashboard` - Dashboard completo com sidebar, header, estatísticas, gráficos, listas e timer
- `developer-panel` - Painel de desenvolvedor com informações do sistema, ambiente, ferramentas de desenvolvimento e editor de scripts integrado

## Uso dos Componentes

### Importação de Componentes

Após instalar via CLI, os componentes são copiados para o seu projeto:

```typescript
// Componentes são importados dos caminhos locais
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Exemplo de Uso de Componentes

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite algo..." />
        <Button variant="default" size="md">
          Enviar
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Exemplo de Uso do Tooltip

#### Tooltip Padrão (Radix UI)

```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function MyComponent() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Informação do tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

#### Tooltip com Seguimento do Mouse (React Aria)

```typescript
import { TooltipWithMouseFollow } from "@/components/ui/tooltip";

function MyComponent() {
  return (
    <TooltipWithMouseFollow
      content={<p>Este tooltip segue o cursor do mouse!</p>}
      minWidth={240}
    >
      <Button>Hover and move mouse</Button>
    </TooltipWithMouseFollow>
  );
}
```

**Características do Tooltip com Seguimento do Mouse**:

- Segue o cursor do mouse em tempo real
- Posicionamento inteligente que evita sair da viewport
- Animações suaves baseadas no Aceternity UI (spring animations)
- Usa React Aria para acessibilidade completa
- Suporta conteúdo longo com quebra de linha automática

## Uso dos Hooks

### Importação de Hooks

**Via CLI (cópia local)**:

```typescript
// Hooks são importados dos caminhos locais após instalação via CLI
import { useStatCard } from "@/hooks/use-stat-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResizable } from "@/hooks/use-resizable";
```

**Via npm package**:

```typescript
// Hooks são importados do package @flowtomic/logic
import {
  useStatCard,
  useIsMobile,
  useResizable,
  useScriptEditor,
  useThemeTransition,
} from "@flowtomic/logic";
```

### Exemplos de Uso de Hooks

#### useStatCard

```typescript
import { useStatCard } from "@/hooks/use-stat-card";

function MyComponent() {
  const { formattedValue, trend, getCardProps } = useStatCard({
    value: 122380,
    delta: 15.1,
    lastMonth: 105922,
    prefix: "R$ ",
  });

  return (
    <div {...getCardProps()}>
      <span>{formattedValue}</span>
      <Badge variant={trend.variant}>{trend.percentage}</Badge>
    </div>
  );
}
```

#### useIsMobile

```typescript
import { useIsMobile } from "@/hooks/use-mobile";

function ResponsiveComponent() {
  const isMobile = useIsMobile();

  return <div>{isMobile ? <p>Versão Mobile</p> : <p>Versão Desktop</p>}</div>;
}
```

#### useResizable

```typescript
import { useResizable } from "@/hooks/use-resizable";

function ResizableLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    handleDoubleClick,
    shouldUseMobileDrawer,
    containerRef,
    sidebarPanelRef,
    sidebarSize,
    minSize,
    maxSize,
  } = useResizable({
    sidebarOpen,
    setSidebarOpen,
    side: "left",
    persistKey: "main-sidebar",
    defaultSidebarPct: 0.28,
    minPx: 250,
    maxPct: 0.6,
    maxPxCap: 500,
    mobileDrawer: true,
  });

  // Usar com react-resizable-panels
  return (
    <div ref={containerRef}>
      {/* Implementação com react-resizable-panels */}
    </div>
  );
}
```

#### useThemeTransition

```typescript
import { useThemeTransition } from "@/hooks/use-theme-transition";

function ThemeToggle() {
  const { startTransition } = useThemeTransition();
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    startTransition(() => {
      toggleTheme();
    });
  };

  return (
    <button onClick={handleToggle}>{theme === "dark" ? "☀️" : "🌙"}</button>
  );
}
```

#### useScriptEditor

```typescript
import { useScriptEditor } from "@/hooks/use-script-editor";

function ScriptEditorExample() {
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
    wsUrl: "ws://localhost:8080/ws/terminal",
    executeScript: async (script) => {
      // Fallback HTTP se WebSocket não estiver disponível
      const response = await fetch("/api/scripts/execute", {
        method: "POST",
        body: JSON.stringify({ script }),
      });
      return response.json();
    },
    autoConnect: true,
    maxReconnectAttempts: 3,
  });

  return (
    <div>
      <textarea value={script} onChange={(e) => setScript(e.target.value)} />
      <button onClick={executeScript}>Executar</button>
      <div>
        {terminalLines.map((line) => (
          <div key={line.id}>{line.content}</div>
        ))}
      </div>
      {preview && <pre>{preview}</pre>}
    </div>
  );
}
```

**Nota**: Todos os hooks são headless - fornecem apenas lógica, formatação e props de acessibilidade. Você controla o markup e styles.

## Uso dos Blocks

### Importação de Blocks

Após instalar via CLI, os blocks são copiados para o seu projeto:

```typescript
// Blocks são importados dos caminhos locais após instalação via CLI
import DeveloperPanel from "@/app/developer/page";
import DashboardPage from "@/app/dashboard/page";
```

### Exemplo de Uso do Developer Panel

```typescript
import DeveloperPanel from "@/app/developer/page";
import type { DeveloperPanelProps } from "@/app/developer/page";

export default function DeveloperPage() {
  const [health, setHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [envInfo, setEnvInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar informações do sistema
    const fetchSystemInfo = async () => {
      try {
        const healthData = await fetch("/api/health").then((r) => r.json());
        const infoData = await fetch("/api/info").then((r) => r.json());

        setHealth(healthData);
        setSystemInfo(infoData);
        setEnvInfo({
          apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "",
          nodeEnv: process.env.NODE_ENV || "development",
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
  }, []);

  return (
    <DeveloperPanel
      user={{
        username: "dev.user",
        email: "dev@example.com",
        role: "ADMIN",
        isAdmin: true,
        token: localStorage.getItem("token") || undefined,
      }}
      health={health}
      systemInfo={systemInfo}
      environmentInfo={envInfo}
      loading={loading}
      apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
      onOpenSwagger={() => {
        window.open(
          `${process.env.NEXT_PUBLIC_API_URL}/swagger-ui.html`,
          "_blank"
        );
      }}
      onOpenApiDocs={() => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/v3/api-docs`, "_blank");
      }}
      onOpenHealthCheck={() => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/health`, "_blank");
      }}
      scriptEditorProps={{
        defaultScript: "console.log('Hello from Flowtomic!');",
        wsUrl: process.env.NEXT_PUBLIC_WS_URL,
        executeScript: async (script) => {
          const response = await fetch("/api/scripts/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ script }),
          });
          return response.json();
        },
      }}
    />
  );
}
```

**Funcionalidades do Developer Panel**:

- **Informações do Usuário**: Exibe dados da sessão atual (nome, email, role, token)
- **Health Check**: Status do sistema e serviços
- **Informações da Aplicação**: Versão, nome e descrição do sistema
- **Ambiente Frontend**: Configurações do cliente (API URL, modo, timezone, resolução)
- **Ferramentas**: Acesso rápido a Swagger UI, API Docs e Health Check
- **Informações do Navegador**: User Agent e timestamp
- **Editor de Scripts**: Terminal interativo integrado com suporte a WebSocket

## Configuração (components.json)

O arquivo `components.json` gerado pelo `init`:

```json
{
  "$schema": "https://flowtomic.dev/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "hooks": "@/hooks"
  },
  "packages": {
    "ui": "flowtomic/ui",
    "logic": "flowtomic/logic"
  }
}
```

### Personalizar Aliases

Você pode editar o `components.json` para ajustar os caminhos conforme sua estrutura de projeto.

## Dependências Comuns

Os componentes podem requerer:

- **React** 18+ ou 19+ (peer dependency)
- **Tailwind CSS** configurado (v4.1.14+ com `@tailwindcss/postcss`)
- **Radix UI** (para componentes interativos):
  - `@radix-ui/react-slot` (button)
  - `@radix-ui/react-label` (input, form)
  - `@radix-ui/react-checkbox` (checkbox)
  - `@radix-ui/react-tabs` (tabs)
  - `@radix-ui/react-alert-dialog` (alert-dialog)
  - `@radix-ui/react-dialog` (dialog, sheet)
  - `@radix-ui/react-dropdown-menu` (dropdown-menu)
  - `@radix-ui/react-tooltip` (tooltip padrão)
  - `@react-aria/tooltip`, `@react-aria/interactions`, `@react-aria/overlays`, `@react-stately/tooltip` (tooltip com seguimento do mouse)
  - `@radix-ui/react-popover` (popover, autocomplete)
  - `@radix-ui/react-select` (select)
  - `@radix-ui/react-scroll-area` (scroll-area)
  - `@radix-ui/react-hover-card` (hover-card)
  - `@radix-ui/react-separator` (separator)
  - `@radix-ui/react-collapsible` (collapsible)
  - `@radix-ui/react-accordion` (accordion)
  - `@radix-ui/react-aspect-ratio` (aspect-ratio)
  - `@radix-ui/react-toggle` (toggle)
  - `@radix-ui/react-toggle-group` (toggle-group)
  - `@radix-ui/react-radio-group` (radio-group)
  - `@radix-ui/react-switch` (switch)
  - `@radix-ui/react-slider` (slider)
  - `@radix-ui/react-context-menu` (context-menu)
  - `@radix-ui/react-menubar` (menubar)
  - `@radix-ui/react-navigation-menu` (navigation-menu)
  - `@radix-ui/react-use-controllable-state` (reasoning, chain-of-thought)
- **lucide-react** (para ícones)
- **class-variance-authority** (para variantes)
- **clsx** e **tailwind-merge** (para classes CSS)
- **sonner** (para toast notifications)
- **@tanstack/react-table** (para data-table)
- **@flowtomic/logic** (para stat-card, resizable-layout, sidebar)
- **cmdk** (para command, model-selector)
- **react-resizable-panels** (para resizable-layout)
- **react-hook-form** (para form)
- **shiki** (para code-block)
- **recharts** (para chart, chart-area-interactive, chart-bar-interactive)
- **react-day-picker** (para calendar)
- **embla-carousel-react** (para carousel)
- **vaul** (para drawer)
- **input-otp** (para input-otp)
- **streamdown** (para message, reasoning)
- **ai** (para image, tool, confirmation, context, prompt-input)
- **tokenlens** (para context)
- **nanoid** (para prompt-input)
- **@xyflow/react** (para panel, toolbar, controls, node, edge, canvas)
- **motion** (para shimmer, tooltip com seguimento do mouse)
- **use-stick-to-bottom** (para conversation)

## Padrões Importantes

1. **Componentes são copiados localmente**: Você pode e deve modificar conforme necessário
2. **Hooks são headless**: Fornecem apenas lógica, sem UI
3. **TypeScript**: Todos os componentes têm tipos exportados
4. **Tailwind CSS**: Todos os componentes usam Tailwind para estilização
5. **Acessibilidade**: Componentes interativos usam Radix UI para acessibilidade

## Troubleshooting

### Erro: "components.json não encontrado"

```bash
npx flowtomic-cli@latest init
# ou
bunx flowtomic-cli@latest init
```

### Erro: "Não foi possível encontrar o repositório Flowtomic"

Este erro geralmente ocorre quando o repositório não pode ser encontrado. O CLI tenta encontrar o repositório de várias formas:

- **Variável de ambiente** `FLOWTOMIC_REPO_PATH`:

```bash
export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
npx flowtomic-cli@latest add button
```

- **Variável de ambiente** `FLOWTOMIC_REPO_URL` (padrão: `JaimeJunr/Flowtomic`)

- **Caminho relativo** (se executado do repositório)

- **Caminhos padrão** (desenvolvimento local)

- **Download automático do GitHub** quando necessário

### Erro: "Componente não encontrado"

```bash
# Ver lista de componentes disponíveis
npx flowtomic-cli@latest list
# ou
bunx flowtomic-cli@latest list
```

### Erro: "Imports incorretos"

- **SEMPRE verifique** o arquivo `components.json`
- **SEMPRE confirme** que aliases estão corretos no `tsconfig.json` ou `jsconfig.json`
- **SEMPRE valide** que caminhos de instalação estão corretos

### Erro: "Dependências faltando"

- **SEMPRE instale** dependências necessárias manualmente
- **SEMPRE verifique** `package.json` do componente para dependências
- **SEMPRE consulte** documentação do componente para requisitos

## Quando Usar Cada Tipo

- **Atoms**: Use quando precisar de componentes básicos e reutilizáveis (button, input, card, etc.)
- **Molecules**: Use quando precisar de componentes compostos que combinam atoms (button-group, data-table, stat-card, etc.)
- **Organisms**: Use quando precisar de componentes complexos e específicos de contexto (dashboard-layout, conversation, etc.)
- **Hooks**: Use quando precisar apenas de lógica sem UI (use-stat-card, use-mobile, use-resizable, etc.)
- **Blocks**: Use quando precisar de componentes completos e prontos para uso (dashboard-01, flowtomic-dashboard, developer-panel)

## Boas Práticas

1. **Sempre** verificar se o componente já existe antes de criar um novo
2. **Sempre** usar os componentes do Flowtomic quando disponíveis
3. **Modificar** componentes copiados conforme necessário para seu projeto
4. **Manter** consistência visual usando os componentes do sistema
5. **Usar** hooks headless para lógica reutilizável sem acoplamento de UI
6. **Componentes são copiados localmente**: Você pode e deve modificar conforme necessário
7. **Hooks são headless**: Fornecem apenas lógica, sem UI - você controla o markup e styles
8. **TypeScript**: Todos os componentes têm tipos exportados
9. **Tailwind CSS**: Todos os componentes usam Tailwind CSS v4.1.14+ para estilização
10. **Acessibilidade**: Componentes interativos usam Radix UI para acessibilidade
11. **SEMPRE criar** story (`.stories.tsx`) para cada componente ou hook
12. **SEMPRE consultar** `docs/INDEX.md` antes de implementar para identificar padrões estabelecidos
13. **SEMPRE seguir** ordem de importação dos estilos: globals.css → theme.css → typography.css
14. **SEMPRE usar** Biome para linting e formatação (não ESLint/Prettier)

## Resolução do Repositório

Quando usando npm (`npx flowtomic-cli@latest`), o repositório é resolvido automaticamente através do pacote publicado.

O CLI resolve o repositório na seguinte ordem:

1. Variável de ambiente `FLOWTOMIC_REPO_PATH` (para desenvolvimento local)
2. Variável de ambiente `FLOWTOMIC_REPO_URL` (padrão: `JaimeJunr/Flowtomic`)
3. Caminho relativo (se executado do repositório)
4. Caminhos padrão para desenvolvimento local
5. Download automático do GitHub quando necessário

## Aliases Suportados

O CLI suporta aliases comuns para componentes:

**Atoms**:

- `btn` → `button`
- `input-field` → `input`

**Molecules**:

- `stat` → `stat-card`
- `table` → `data-table`
- `menu` → `menu-dock`
- `theme-toggle` → `theme-toggle-button`

**Organisms**:

- `layout` → `dashboard-layout`
- `grid` → `stats-grid`
- `summary` → `monthly-summary`
- `header-actions` → `dashboard-header-actions`
- `movements` → `dashboard-movements-section`

## Registry

O Flowtomic possui um registry compatível com shadcn CLI:

- **URL de produção**: `https://registry.flowtomic.dev`
- **Uso**: `npx shadcn@latest add https://registry.flowtomic.dev/all.json`

O registry contém todos os componentes, hooks e blocks disponíveis no Flowtomic.

## Arquitetura: Separação UI e Lógica

O Flowtomic segue uma arquitetura de **separação clara entre UI e lógica**:

- **Componentes UI (`@flowtomic/ui`)**: Focados em apresentação visual, com mínima ou nenhuma lógica de negócio
- **Hooks Headless (`@flowtomic/logic`)**: Contêm toda a lógica complexa, cálculos e gerenciamento de estado, sem qualquer markup ou estilos

### Benefícios

1. **Reutilização Máxima**: Use a lógica (`useStatCard`) em qualquer UI customizada
2. **Flexibilidade Total**: Crie seu próprio visual mantendo a lógica consistente
3. **Testabilidade**: Teste lógica e UI separadamente
4. **Manutenibilidade**: Mudanças na lógica não afetam o visual e vice-versa
5. **Composição**: Combine múltiplos hooks headless para criar componentes complexos

### Quando Usar Cada Abordagem

- **Use o hook headless** quando:

  - Precisa de UI completamente customizada
  - Quer reutilizar a lógica em diferentes contextos
  - Está criando um design system próprio

- **Use o componente visual** quando:
  - Precisa de uma solução rápida e pronta
  - O design padrão atende suas necessidades
  - Quer customizar apenas estilos (via `className` ou variáveis CSS)
