# ⚛️ Flowtomic Monorepo

Biblioteca de componentes UI, hooks headless e ferramentas reutilizáveis para projetos React/TypeScript.

## 🎯 Nossa Filosofia

No desenvolvimento de software, frequentemente nos deparamos com a repetição das mesmas lógicas, principalmente em projetos grandes. A engenharia de software desenvolveu paradigmas como a **Programação Orientada a Objetos (POO)** para modelar sistemas com base em entidades do mundo real, promovendo encapsulamento, abstração e reutilização. Posteriormente, surgiram princípios gerais como **Don't Repeat Yourself (DRY)** e, dentro do paradigma OO, os princípios **SOLID** (formulados por Robert C. Martin) como boas práticas.

O ambiente frontend, por sua vez, ainda está se desenvolvendo nessa questão. Daí nasce o **Flowtomic**: uma solução reutilizável com componentes prontos ou customizáveis para acelerar seu desenvolvimento, seguindo as melhores práticas de engenharia de software.

## 🙏 Agradecimentos

O Flowtomic é construído sobre os ombros de projetos incríveis da comunidade open source:

- **[Radix UI](https://www.radix-ui.com/)** - Componentes primitivos acessíveis e sem estilização
- **[TanStack Table](https://tanstack.com/table)** - Tabelas poderosas e flexíveis para React
- **[shadcn/ui](https://ui.shadcn.com/)** - Inspiração e padrões de design para componentes
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário
- **[class-variance-authority](https://cva.style/)** - Gerenciamento de variantes de componentes
- **[Lucide React](https://lucide.dev/)** - Biblioteca de ícones
- **[Sonner](https://sonner.emilkowal.ski/)** - Sistema de notificações toast
- **[Bun](https://bun.sh/)** - Runtime JavaScript rápido e moderno
- **[Biome](https://biomejs.dev/)** - Linter e formatter rápido
- **[Turbo](https://turbo.build/)** - Build system para monorepos
- **[Storybook](https://storybook.js.org/)** - Ambiente de desenvolvimento de componentes

## 📦 Estrutura

```text
flowtomic/
├── packages/
│   ├── ui/          # Componentes UI (flowtomic/ui)
│   │   ├── src/
│   │   │   ├── components/  # Atoms, Molecules, Organisms
│   │   │   └── blocks/      # Blocks pré-construídos
│   │   └── dist/            # Build output
│   └── logic/       # Hooks e lógica (flowtomic/logic)
│       ├── src/
│       │   └── hooks/       # Hooks headless
│       └── dist/            # Build output
├── cli/             # CLI para instalação (flowtomic)
│   ├── src/
│   │   ├── commands/        # Comandos CLI
│   │   └── utils/           # Utilitários
│   └── dist/                # Build output
├── registry/        # Registry para componentes e blocks
├── docs/            # Documentação do projeto
└── .storybook/      # Configuração do Storybook
```

## 🏗️ Arquitetura: Separação UI e Lógica

O Flowtomic segue uma arquitetura de **separação clara entre UI e lógica**, permitindo máxima flexibilidade e reutilização:

### Princípios Fundamentais

- **Componentes UI (`@flowtomic/ui`)**: Focados em apresentação visual, com **mínima ou nenhuma lógica de negócio**
- **Hooks Headless (`@flowtomic/logic`)**: Contêm toda a **lógica complexa, cálculos e gerenciamento de estado**, **sem qualquer markup ou estilos**

### Exemplo Prático: StatCard

O `StatCard` demonstra perfeitamente essa arquitetura:

#### 1. Lógica Separada (`useStatCard` - `@flowtomic/logic`)

```typescript
// packages/logic/src/hooks/useStatCard/useStatCard.ts
// Hook headless - APENAS lógica, SEM UI

import { useStatCard } from "flowtomic/logic";

function MyCustomStatCard() {
  const { formattedValue, trend, getCardProps } = useStatCard({
    value: 122380,
    lastMonth: 105922, // delta calculado automaticamente: +15.5%
  });

  // Você controla o markup e styles
  return (
    <div {...getCardProps()}>
      <span>{formattedValue}</span>
      <Badge variant={trend.variant}>{trend.percentage}</Badge>
    </div>
  );
}
```

**O que o hook fornece:**

- ✅ Cálculo automático de delta/variação percentual
- ✅ Formatação de valores (prefix, suffix, custom format)
- ✅ Informações de tendência (direção, variante, porcentagem)
- ✅ Estado e processamento de dados
- ❌ **NÃO fornece**: markup, styles ou componentes visuais

#### 2. Componente Visual (`StatCard` - `@flowtomic/ui`)

```typescript
// packages/ui/src/components/molecules/data-display/stat-card/stat-card.tsx
// Componente visual - usa o hook headless

import { StatCard } from "flowtomic/ui";
import { useStatCard } from "flowtomic/logic"; // Usa o hook internamente

// Componente pronto para uso com UI completa
<StatCard
  title="Receita Total"
  value={122380}
  lastMonth={105922}
  color="blue"
/>;
```

**O que o componente fornece:**

- ✅ Markup completo (Card, Header, Content)
- ✅ Estilos e animações
- ✅ Ícones e badges visuais
- ✅ Menu de ações (opcional)
- ❌ **NÃO contém**: lógica de cálculo ou processamento complexo

### Benefícios dessa Arquitetura

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

## 🚀 Instalação via CLI

### Uso Direto (Recomendado)

```bash
# Inicializar configuração
npx flowtomic-cli@latest init
# ou
bunx flowtomic-cli@latest init

# Adicionar componentes
npx flowtomic-cli@latest add button card input
# ou
bunx flowtomic-cli@latest add button card input

# Adicionar blocks
npx flowtomic-cli@latest add-block dashboard-01
# ou
bunx flowtomic-cli@latest add-block dashboard-01

# Listar componentes e blocks disponíveis
npx flowtomic-cli@latest list
# ou
bunx flowtomic-cli@latest list
```

### Via shadcn CLI (Compatível)

```bash
# Usar o registry do Flowtomic com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

**Nota:** O CLI automaticamente baixa o repositório do GitHub quando necessário (via variável de ambiente ou caminho local).

## 📦 Instalação dos Packages npm

Os packages do Flowtomic também estão disponíveis diretamente no npm para uso em projetos:

### Instalar Packages

```bash
# Instalar UI e Logic
npm install @flowtomic/ui @flowtomic/logic

# Ou usando yarn/pnpm/bun
yarn add @flowtomic/ui @flowtomic/logic
pnpm add @flowtomic/ui @flowtomic/logic
bun add @flowtomic/ui @flowtomic/logic
```

### Usar os Packages

```typescript
// Componentes UI
import { Button, Card, Input, Badge } from "@flowtomic/ui";

// Hooks headless
import { useStatCard, useIsMobile, useResizable } from "@flowtomic/logic";

// Exemplo de uso
function MyComponent() {
  const { formattedValue, trend } = useStatCard({
    value: 122380,
    lastMonth: 105922,
  });

  return (
    <Card>
      <Button>Clique aqui</Button>
      <Input placeholder="Digite algo..." />
    </Card>
  );
}
```

**Nota:** Ao usar os packages npm, você ainda pode usar o CLI para adicionar componentes individuais que serão copiados para seu projeto, permitindo customização total.

## 📚 Componentes Disponíveis

### Atoms (54)

**Actions:**

- `button` - Botão com variantes
- `badge` - Badge/etiqueta
- `dropdown-menu` - Menu dropdown
- `context-menu` - Menu de contexto

**Animation:**

- `animated-3d` - Componente com animação 3D
- `backdrop-blur` - Componente com efeito de blur no fundo
- `loader` - Loading spinner animado
- `progress` - Barra de progresso
- `shimmer` - Texto com efeito shimmer
- `sliding-number` - Número com animação de deslizamento
- `spinner` - Spinner animado

**Code:**

- `code-block` - Bloco de código com syntax highlighting
- `snippet` - Snippet de código

**Data Display:**

- `calendar` - Calendário
- `carousel` - Carrossel
- `chart` - Gráficos base

**Display:**

- `avatar` - Componente de avatar com imagem e fallback
- `card` - Card container
- `empty` - Estado vazio
- `kbd` - Teclas de atalho
- `separator` - Separador horizontal/vertical
- `skeleton` - Loading skeleton
- `table` - Tabela base

**Feedback:**

- `alert` - Alerta
- `alert-dialog` - Diálogo de confirmação
- `dialog` - Modal/diálogo
- `hover-card` - Card que aparece ao passar o mouse
- `inline-citation` - Citação inline com hover card
- `popover` - Popover flutuante
- `sheet` - Sheet lateral
- `sonner` - Toast notifications
- `tooltip` - Tooltip para informações adicionais

**Forms:**

- `autocomplete` - Autocomplete
- `checkbox` - Checkbox
- `field` - Campo de formulário completo
- `form` - Wrapper de formulário com React Hook Form
- `input` - Campo de entrada
- `input-otp` - Input para códigos OTP
- `label` - Label para formulários
- `radio-group` - Grupo de radio buttons
- `select` - Campo de seleção
- `slider` - Slider de valores
- `switch` - Switch toggle
- `textarea` - Campo de texto multilinha
- `toggle` - Toggle button

**Layout:**

- `accordion` - Container colapsável
- `aspect-ratio` - Container com proporção fixa
- `collapsible` - Container colapsável
- `drawer` - Drawer lateral
- `resizable` - Componente redimensionável com painéis
- `scroll-area` - Área de scroll customizada
- `sidebar` - Sidebar navegável
- `toggle-group` - Grupo de toggles

**Navigation:**

- `breadcrumb` - Breadcrumb navigation
- `command` - Command palette/menu
- `menubar` - Barra de menu
- `navigation-menu` - Menu de navegação
- `pagination` - Paginação
- `tabs` - Abas

### Molecules (36)

**Animation:**

- `animated-modal` - Modal com animações
- `animated-sliding-number` - Número com animação de deslizamento
- `button-counter` - Contador com botões de incremento/decremento

**Auth:**

- `auth-form-error-message` - Mensagem de erro de formulário
- `auth-navigation-link` - Link de navegação de auth
- `password-input` - Input de senha
- `social-login-buttons` - Botões de login social

**Data Display:**

- `artifact` - Container de artifact
- `bar-chart` - Gráfico de barras simples
- `chart-area-interactive` - Gráfico de área interativo
- `chart-bar-interactive` - Gráfico de barras interativo
- `checkpoint` - Checkpoint display
- `circular-progress-chart` - Gráfico circular de progresso
- `data-table` - Tabela avançada
- `message` - Componente de mensagem com branches
- `project-list` - Lista de projetos
- `reminder-card` - Card de lembretes
- `sources` - Lista de fontes colapsável
- `stat-card` - Card de estatística
- `suggestion` - Lista de sugestões
- `task` - Item de task
- `team-member-list` - Lista de membros da equipe
- `time-tracker` - Timer com controles
- `tool` - Display de tool

**Feedback:**

- `confirmation` - Confirmation dialog wrapper

**Flow:**

- `canvas` - Canvas do ReactFlow
- `connection` - Connection do @xyflow/react

**Forms:**

- `button-group` - Grupo de botões
- `image-dropzone` - Upload de imagem
- `input-group` - Grupo de input com addons
- `item` - Item de formulário

**Layout:**

- `dashboard-header` - Header com busca, notificações e perfil

**Navigation:**

- `menu-dock` - Dock de menu
- `sidebar-navigation` - Menu lateral completo

**Theme:**

- `theme-toggle-button` - Botão de toggle de tema

**Typography:**

- `animated-shiny-text` - Texto com efeito shimmer animado

### Organisms (23)

- `chain-of-thought` - Cadeia de raciocínio
- `context` - Uso de contexto/tokens do modelo
- `controls` - Controls do @xyflow/react
- `conversation` - Container de conversa
- `dashboard-header-actions` - Ações do header
- `dashboard-layout` - Layout de dashboard
- `dashboard-movements-section` - Seção de movimentações
- `edge` - Edge do ReactFlow
- `genealogy-canvas` - Canvas de genealogia
- `image` - Display de imagem gerada
- `model-selector` - Seletor de modelo
- `monthly-summary` - Resumo mensal
- `node` - Node do ReactFlow
- `open-in-chat` - Dropdown para abrir em outras plataformas
- `panel` - Panel do @xyflow/react
- `plan` - Exibição de planos do modelo
- `prompt-input` - Input de prompt complexo
- `queue` - Fila de mensagens e tarefas
- `reasoning` - Exibição de raciocínio do modelo
- `resizable-layout` - Componente redimensionável com sidebar
- `script-editor` - Editor de scripts com terminal interativo
- `stats-grid` - Grid de estatísticas
- `toolbar` - Toolbar do @xyflow/react
- `web-preview` - Visualizador de páginas web

### Hooks (11)

- `use-animated-indicator` - Hook para indicadores animados
- `use-genealogy` - Hook para gerenciar genealogia/hierarquia
- `use-mobile` (exportado como `useIsMobile`) - Hook para detectar dispositivos móveis
- `use-project-progress` - Hook para calcular progresso de projetos
- `use-project-stats` - Hook para calcular estatísticas de projetos
- `use-react-table-back` - Hook para tabelas com paginação/ordenação no backend
- `use-react-table-front` - Hook para tabelas com paginação/ordenação no frontend
- `use-resizable` - Hook para componentes redimensionáveis
- `use-script-editor` - Hook para gerenciar editor de scripts com terminal interativo
- `use-stat-card` - Hook para StatCard
- `use-theme-transition` - Hook para transições de tema com View Transitions API
- `use-time-tracker` - Hook para gerenciar timer (start, pause, stop, resume, format)

### Blocks (3)

- `dashboard-01` - Dashboard simples com cards
- `flowtomic-dashboard` - Dashboard completo com sidebar, header, estatísticas, gráficos, listas e timer
- `developer-panel` - Painel de desenvolvedor com informações do sistema, ambiente, ferramentas de desenvolvimento e editor de scripts integrado

## 🛠️ Desenvolvimento

### Setup

```bash
# Instalar dependências
bun install

# Desenvolvimento com watch (todos os packages)
bun run dev

# Build todos os packages
bun run build

# Build específico
bun run build:ui
bun run build:logic
bun run build:cli

# Type check
bun run type-check

# Linting e formatação
bun run lint              # Verificar lint
bun run lint:fix          # Corrigir problemas de lint
bun run format             # Formatar código
bun run format:check       # Verificar formatação
bun run fix:all            # Corrigir lint e formatar tudo

# Testes
bun run test

# Storybook
bun run storybook          # Iniciar Storybook
bun run build-storybook    # Build do Storybook

# Registry
bun run registry:build     # Build do registry
bun run registry:server    # Servidor do registry (desenvolvimento)

# Limpeza
bun run clean              # Limpar builds e node_modules
```

### CLI

```bash
cd cli
bun run dev          # Modo desenvolvimento
bun run build        # Build
bun run type-check   # Verificar tipos
```

## 📖 Documentação

- [📚 Índice de Documentação](./docs/INDEX.md) - Guia central de toda a documentação
- [Guia de Desenvolvimento](./docs/desenvolvimento/guia.md) - Guia completo de uso do monorepo e CLI
- [cli/README.md](./cli/README.md) - Documentação detalhada do CLI

## 🎯 Como Funciona

O Flowtomic fornece um **estilo padrão** que funciona imediatamente, mas permite **customização total** dos
componentes conforme sua preferência.

O Flowtomic segue uma **arquitetura de separação entre UI e lógica** (veja [Arquitetura: Separação UI e Lógica](#️-arquitetura-separação-ui-e-lógica) acima), fornecendo:

- **Componentes UI prontos** (`@flowtomic/ui`) com estilo padrão que funciona imediatamente
- **Hooks headless** (`@flowtomic/logic`) com lógica reutilizável para criar suas próprias UIs
- **Customização total** dos componentes conforme sua preferência

O CLI copia os arquivos dos componentes diretamente para o seu projeto (similar ao shadcn/ui), permitindo customização total. Os imports são automaticamente ajustados para usar os aliases do seu projeto.

### Estilo Padrão vs Customização

- **Estilo Padrão**: Funciona imediatamente após importar os arquivos CSS do Flowtomic
- **Customização**:
  - Via `className` para ajustes pontuais
  - Via variáveis CSS para temas globais
  - Combinando ambos conforme necessário

Para mais detalhes sobre customização, veja [docs/packages/ui.md](./docs/packages/ui.md).

## 📝 Exemplos

### Adicionar Componentes

```bash
# 1. Inicializar
npx flowtomic-cli@latest init

# 2. Adicionar componentes
npx flowtomic-cli@latest add button card input

# 3. Usar no projeto
```

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Adicionar Blocks

```bash
# Adicionar um block completo
npx flowtomic-cli@latest add-block dashboard-01
```

O block será instalado com todos os seus arquivos e dependências.

### Usar com shadcn CLI

```bash
# Instalar via shadcn CLI (compatível)
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

## 🔗 Links

- [Documentação do CLI](./cli/README.md)
- [Guia de Desenvolvimento](./docs/desenvolvimento/guia.md)
- [Guia de Deploy](./docs/deploy/DEPLOYMENT.md)
- [Registry](./registry/README.md)

## 📦 Publicação

### Packages no npm

O Flowtomic está publicado no npm em três packages:

#### 1. CLI (`flowtomic-cli`)

CLI para instalação de componentes, hooks e blocks:

```bash
npx flowtomic-cli@latest init
npx flowtomic-cli@latest add button
npx flowtomic-cli@latest add-block dashboard-01
```

#### 2. UI (`@flowtomic/ui`)

Componentes UI reutilizáveis:

```bash
npm install @flowtomic/ui
```

```typescript
import { Button, Card, Input } from "@flowtomic/ui";
```

#### 3. Logic (`@flowtomic/logic`)

Hooks headless e lógica reutilizável:

```bash
npm install @flowtomic/logic
```

```typescript
import { useStatCard, useIsMobile } from "@flowtomic/logic";
```

### Registry

O registry está disponível em `https://registry.flowtomic.dev`:

```bash
# Usar com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

Para mais informações sobre publicação e deploy, veja [docs/deploy/README.md](./docs/deploy/README.md).

---

Desenvolvido com ❤️ e ☕ por [JaimeJunr](https://github.com/JaimeJunr)
