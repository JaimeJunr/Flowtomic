# ⚛️ Regras de Uso do Flowtomic UI e Logic

> **📚 Documento de Referência para Agentes de IA**: Este documento serve como referência completa e atualizada para agentes de IA especializados no Flowtomic. **SEMPRE consulte este arquivo** antes de recomendar, implementar ou modificar componentes do Flowtomic.

## Visão Geral

O **Flowtomic** é uma biblioteca modular que fornece:

- **`@flowtomic/ui`**: Componentes UI reutilizáveis (54 atoms, 36 molecules, 23 organisms, 3 blocks)
- **`@flowtomic/logic`**: 13 hooks headless e lógica reutilizável
- **`flowtomic-cli`**: CLI para instalação de componentes em projetos externos

## 🎯 Para Agentes de IA

### Informações Críticas

1. **SEMPRE consulte** este documento antes de recomendar componentes
2. **SEMPRE verifique** a lista completa de componentes disponíveis nas seções abaixo
3. **SEMPRE confirme** dependências necessárias antes de sugerir uso
4. **SEMPRE use** os nomes exatos dos componentes conforme listados
5. **SEMPRE informe** sobre hooks headless quando componentes têm lógica separada
6. **SEMPRE mencione** que componentes são copiados localmente e podem ser customizados

### Organização dos Componentes

- **Atoms**: 54 componentes básicos e indivisíveis
- **Molecules**: 36 componentes compostos que combinam atoms
- **Organisms**: 23 componentes complexos de alto nível
- **Hooks**: 13 hooks headless para lógica reutilizável
- **Blocks**: 3 blocks pré-construídos completos

### Padrões Importantes

- Componentes são **copiados localmente** via CLI (estilo shadcn/ui)
- Hooks são **headless** - fornecem apenas lógica, sem UI
- Todos os componentes têm **TypeScript** com tipos exportados
- Todos os componentes usam **Tailwind CSS v4.1.14+** para estilização
- Componentes interativos usam **Radix UI** para acessibilidade

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

#### Comandos Principais

```bash
# Adicionar componentes/hooks/blocks
npx flowtomic-cli@latest add button
npx flowtomic-cli@latest add button card input badge  # múltiplos
npx flowtomic-cli@latest add use-stat-card            # hooks
npx flowtomic-cli@latest add-block dashboard-01       # blocks
npx flowtomic-cli@latest list                         # listar disponíveis
```

### Via npm (Packages Publicados)

```bash
npm install @flowtomic/ui @flowtomic/logic
# ou: yarn/pnpm/bun add @flowtomic/ui @flowtomic/logic
```

```typescript
import { Button, Card } from "@flowtomic/ui";
import { useStatCard, useIsMobile } from "@flowtomic/logic";
```

**Nota:** Packages npm permitem importação direta. Use CLI para customização local.

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

### Atoms (54 Componentes Básicos)

Componentes fundamentais e indivisíveis, organizados em categorias:

**Actions** (4 componentes):

- `button` - Botão com variantes e tamanhos
- `badge` - Badge para labels e status
- `dropdown-menu` - Menu dropdown
- `context-menu` - Menu de contexto

**Forms** (13 componentes):

- `input` - Campo de entrada de texto
- `select` - Campo de seleção
- `checkbox` - Checkbox
- `label` - Label para formulários
- `radio-group` - Grupo de radio buttons
- `switch` - Switch toggle
- `textarea` - Área de texto
- `slider` - Slider de valores
- `toggle` - Toggle button
- `field` - Campo de formulário com label e erro
- `form` - Wrapper de formulário com React Hook Form
- `input-otp` - Input para códigos OTP

**Display** (8 componentes):

- `card` - Card container
- `table` - Tabela básica
- `skeleton` - Skeleton loader
- `empty` - Estado vazio
- `kbd` - Teclas de teclado
- `calendar` - Calendário
- `carousel` - Carrossel de imagens
- `chart` - Gráfico base (Recharts)
- `avatar` - Avatar de usuário
- `qr-code` - Código QR

**Navigation** (6 componentes):

- `tabs` - Abas
- `command` - Command palette (cmdk)
- `breadcrumb` - Breadcrumb navigation
- `pagination` - Paginação
- `menubar` - Barra de menu
- `navigation-menu` - Menu de navegação

**Feedback** (8 componentes):

- `alert` - Alerta
- `alert-dialog` - Dialog de confirmação
- `dialog` - Modal dialog
- `tooltip` - Tooltip (Radix UI padrão + React Aria com seguimento do mouse)
- `popover` - Popover
- `sheet` - Sheet lateral
- `sonner` - Toast notifications
- `hover-card` - Card ao passar mouse
- `inline-citation` - Citação inline

**Animation** (7 componentes):

- `loader` - Loader animado
- `shimmer` - Efeito shimmer
- `spinner` - Spinner
- `progress` - Barra de progresso
- `encrypted-text` - Texto com animação de criptografia
- `sliding-number` - Número com animação de deslizamento
- `animated-3d` - Animação 3D
- `backdrop-blur` - Efeito de blur no fundo

**Layout** (8 componentes):

- `collapsible` - Componente colapsável
- `scroll-area` - Área com scroll customizado
- `separator` - Separador
- `accordion` - Accordion
- `aspect-ratio` - Container com aspect ratio
- `toggle-group` - Grupo de toggles
- `drawer` - Drawer lateral (vaul)
- `sidebar` - Sidebar (usa `@flowtomic/logic`)
- `resizable` - Componente redimensionável

**Code** (3 componentes):

- `code-block` - Bloco de código com syntax highlighting (shiki)
- `snippet` - Snippet de código
- `inline-citation` - Citação inline

### Molecules (36 Componentes Compostos)

Componentes que combinam atoms, organizados por categoria:

**Forms** (5 componentes):

- `button-group` - Grupo de botões
- `password-input` - Input de senha com toggle de visibilidade
- `image-dropzone` - Upload de imagem com drag and drop
- `input-group` - Grupo de input com addons
- `autocomplete` - Campo de autocomplete com busca (usa hook `useAutocomplete` do `@flowtomic/logic`)
- `item` - Item de formulário
- `text-editor` - Editor de texto rico

**Data Display** (13 componentes):

- `stat-card` - Card de estatística (usa hook `use-stat-card`)
- `data-table` - Tabela avançada com ordenação e filtro
- `chart-area-interactive` - Gráfico de área interativo
- `chart-bar-interactive` - Gráfico de barras interativo
- `bar-chart` - Gráfico de barras simples (SVG puro)
- `circular-progress-chart` - Gráfico circular de progresso (SVG puro)
- `project-list` - Lista de projetos
- `team-member-list` - Lista de membros da equipe
- `reminder-card` - Card de lembretes
- `time-tracker` - Timer com controles (usa hook `useTimeTracker`)
- `artifact` - Container de artifact
- `message` - Componente de mensagem com branches
- `suggestion` - Lista de sugestões
- `sources` - Lista de fontes colapsável
- `tool` - Display de tool
- `task` - Item de task
- `checkpoint` - Checkpoint display

**Animation** (3 componentes):

- `animated-modal` - Modal com animações suaves
- `animated-sliding-number` - Número com animação de deslizamento
- `button-counter` - Contador com botões de incremento/decremento

**Layout** (1 componente):

- `dashboard-header` - Header com busca, notificações e perfil

**Navigation** (2 componentes):

- `menu-dock` - Dock de menu
- `sidebar-navigation` - Menu lateral completo

**Theme** (1 componente):

- `theme-toggle-button` - Botão de toggle de tema

**Auth** (3 componentes):

- `auth-navigation-link` - Link de navegação de auth
- `auth-form-error-message` - Mensagem de erro de formulário
- `social-login-buttons` - Botões de login social

**Feedback** (1 componente):

- `confirmation` - Confirmation dialog wrapper

**Flow/ReactFlow** (2 componentes):

- `connection` - ConnectionLineComponent do @xyflow/react
- `canvas` - Wrapper do ReactFlow

**Typography** (1 componente):

- `animated-shiny-text` - Texto com efeito shimmer animado

### Organisms (23 Componentes Complexos)

Componentes de alto nível que combinam molecules:

**Dashboard** (6 componentes):

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações
- `resizable-layout` - Componente redimensionável com sidebar (usa hook `useResizable`)

**AI/Conversation** (10 componentes):

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

**ReactFlow** (5 componentes):

- `panel` - Panel do @xyflow/react
- `toolbar` - Toolbar do @xyflow/react
- `controls` - Controls do @xyflow/react
- `node` - Node do ReactFlow
- `edge` - Edge do ReactFlow

**Outros** (2 componentes):

- `web-preview` - Visualizador de páginas web
- `script-editor` - Editor de scripts com terminal interativo (usa hook `useScriptEditor`)
- `genealogy-canvas` - Canvas para visualização de genealogia
- `document-editor` - Editor de documentos
- `form-layout` - Layout de formulário

### Hooks (13 Hooks Headless)

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
- `use-autocomplete` - Hook headless para autocomplete (filtragem, navegação por teclado, loading, empty states)

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

### Tooltip

**Padrão (Radix UI)**: `Tooltip`, `TooltipContent`, `TooltipTrigger`, `TooltipProvider`

**Com seguimento do mouse (React Aria)**: `TooltipWithMouseFollow` - segue cursor, posicionamento inteligente, animações suaves

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

#### useResizable, useThemeTransition, useScriptEditor

**useResizable**: Gerencia componentes redimensionáveis com sidebar, persistência no localStorage, suporte mobile drawer. Usa com `react-resizable-panels`.

**useThemeTransition**: Transições suaves de tema usando View Transitions API com fallback automático.

**useScriptEditor**: Gerencia editor de scripts com terminal interativo, WebSocket com reconexão, execução via WebSocket ou HTTP (fallback).

#### useAutocomplete

Hook headless para autocomplete: filtragem customizável, navegação por teclado, loading/empty states, helpers de props (`getInputProps`, `getPopoverProps`, `getListProps`, `getItemProps`). Usa com componente `Autocomplete` do Flowtomic.

**Nota**: Todos os hooks são headless - fornecem apenas lógica, formatação e props de acessibilidade. Você controla o markup e styles.

## Uso dos Blocks

### Importação de Blocks

Após instalar via CLI, os blocks são copiados para o seu projeto:

```typescript
// Blocks são importados dos caminhos locais após instalação via CLI
import DeveloperPanel from "@/app/developer/page";
import DashboardPage from "@/app/dashboard/page";
```

### Developer Panel

Painel completo com: informações do usuário, health check, informações da aplicação, ambiente frontend, ferramentas (Swagger, API Docs), editor de scripts integrado com WebSocket. Requer props: `user`, `health`, `systemInfo`, `environmentInfo`, `scriptEditorProps`.

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

### Dependências Core

- **React** 18+ ou 19+ (peer dependency)
- **Tailwind CSS** configurado (v4.1.14+ com `@tailwindcss/postcss`)
- **class-variance-authority** (para variantes de componentes)
- **clsx** e **tailwind-merge** (para classes CSS)

### Dependências por Categoria

**Radix UI**: `@radix-ui/react-*` (25+ pacotes para componentes interativos)

**React Aria**: `@react-aria/*`, `@react-stately/*` (tooltip com seguimento do mouse)

**UI/Animações**: `lucide-react` (ícones), `sonner` (toast), `motion` (animações)

**Formulários**: `react-hook-form`, `input-otp`

**Dados**: `@tanstack/react-table` (tabelas), `recharts` (gráficos), `react-day-picker` (calendário), `embla-carousel-react` (carrossel)

**Layout**: `react-resizable-panels`, `vaul` (drawer), `cmdk` (command palette)

**Código**: `shiki` (syntax highlighting)

**AI**: `ai`, `streamdown`, `tokenlens`, `nanoid`, `use-stick-to-bottom`

**ReactFlow**: `@xyflow/react` (grafos e fluxos)

**Flowtomic Logic**: `@flowtomic/logic` (hooks headless)

## Características dos Componentes

1. **Componentes são copiados localmente**: Você pode e deve modificar conforme necessário
2. **Hooks são headless**: Fornecem apenas lógica, sem UI
3. **TypeScript**: Todos os componentes têm tipos exportados
4. **Tailwind CSS**: Todos os componentes usam Tailwind para estilização
5. **Acessibilidade**: Componentes interativos usam Radix UI para acessibilidade

## Troubleshooting

**"components.json não encontrado"**: Execute `npx flowtomic-cli@latest init`

**"Repositório não encontrado"**: Configure `FLOWTOMIC_REPO_PATH` ou `FLOWTOMIC_REPO_URL`, ou use download automático do GitHub

**"Componente não encontrado"**: Use `npx flowtomic-cli@latest list` para ver componentes disponíveis

**"Imports incorretos"**: Verifique `components.json` e aliases no `tsconfig.json`/`jsconfig.json`

**"Dependências faltando"**: Instale dependências manualmente conforme `package.json` do componente

## Quando Usar Cada Tipo

- **Atoms**: Use quando precisar de componentes básicos e reutilizáveis (button, input, card, etc.)
- **Molecules**: Use quando precisar de componentes compostos que combinam atoms (button-group, data-table, stat-card, etc.)
- **Organisms**: Use quando precisar de componentes complexos e específicos de contexto (dashboard-layout, conversation, etc.)
- **Hooks**: Use quando precisar apenas de lógica sem UI (use-stat-card, use-mobile, use-resizable, etc.)
- **Blocks**: Use quando precisar de componentes completos e prontos para uso (dashboard-01, flowtomic-dashboard, developer-panel)

## Boas Práticas

### Para Desenvolvedores

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

### Para Agentes de IA

1. **SEMPRE consultar** este documento antes de recomendar componentes
2. **SEMPRE verificar** a lista completa de componentes disponíveis (54 atoms, 36 molecules, 23 organisms, 13 hooks, 3 blocks)
3. **SEMPRE confirmar** dependências necessárias antes de sugerir uso
4. **SEMPRE usar** os nomes exatos dos componentes conforme listados neste documento
5. **SEMPRE informar** sobre hooks headless quando componentes têm lógica separada (ex: `stat-card` usa `use-stat-card`, `autocomplete` usa `use-autocomplete`)
6. **SEMPRE mencionar** que componentes são copiados localmente e podem ser customizados
7. **SEMPRE recomendar** usar o CLI para instalação quando customização for necessária
8. **SEMPRE sugerir** usar packages npm quando apenas importação for necessária
9. **SEMPRE informar** sobre dependências específicas de cada componente
10. **SEMPRE destacar** que hooks são headless e fornecem apenas lógica

### Padrões de Desenvolvimento

1. **SEMPRE criar** story (`.stories.tsx`) para cada componente ou hook
2. **SEMPRE consultar** `docs/INDEX.md` antes de implementar para identificar padrões estabelecidos
3. **SEMPRE seguir** ordem de importação dos estilos: globals.css → theme.css → typography.css
4. **SEMPRE usar** Biome para linting e formatação (não ESLint/Prettier)
5. **SEMPRE manter** componentes agnósticos de negócio (exceto organisms específicos)
6. **SEMPRE exportar** tipos TypeScript junto com componentes
7. **SEMPRE usar** barrel exports em `index.ts` de cada componente

## Informações Adicionais

**Resolução do Repositório**: CLI resolve automaticamente via `FLOWTOMIC_REPO_PATH`, `FLOWTOMIC_REPO_URL`, caminho relativo ou download do GitHub

**Aliases**: `btn`→`button`, `stat`→`stat-card`, `table`→`data-table`, `layout`→`dashboard-layout`, etc.

**Registry**: `https://registry.flowtomic.dev` - compatível com shadcn CLI: `npx shadcn@latest add https://registry.flowtomic.dev/all.json`

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

## Composição de Componentes

**Dashboard**: Combine `DashboardLayout`, `StatsGrid`, `StatCard`, `DataTable`

**Formulários**: Use `Form` (React Hook Form) com `FormField`, `FormItem`, `FormLabel`, `FormControl`, `Input`, `Button`

**Autocomplete**: Use hook `useAutocomplete` com componente `Autocomplete` ou composição customizada com `Popover`

## Resumo Rápido para Agentes de IA

### Números Atuais

- **54 Atoms**: Componentes básicos e indivisíveis
- **36 Molecules**: Componentes compostos
- **23 Organisms**: Componentes complexos
- **13 Hooks**: Hooks headless
- **3 Blocks**: Componentes completos pré-construídos

### Referência Rápida

1. **CLI**: `npx flowtomic-cli@latest add <componente>`
2. **npm**: `npm install @flowtomic/ui @flowtomic/logic`
3. **Registry**: `https://registry.flowtomic.dev`
4. **Componentes são copiados localmente** (customizáveis)
5. **Hooks são headless** (apenas lógica)
6. **TypeScript** em todos os componentes
7. **Tailwind CSS v4.1.14+** para estilização
8. **Radix UI** para acessibilidade
