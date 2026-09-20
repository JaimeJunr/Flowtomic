# ⚛️ Flowtomic

> Biblioteca de componentes UI, hooks headless e ferramentas reutilizáveis para projetos React/TypeScript.

[![npm version](https://img.shields.io/npm/v/@flowtomic/ui)](https://www.npmjs.com/package/@flowtomic/ui)
[![npm version](https://img.shields.io/npm/v/@flowtomic/logic)](https://www.npmjs.com/package/@flowtomic/logic)
[![npm version](https://img.shields.io/npm/v/flowtomic-cli)](https://www.npmjs.com/package/flowtomic-cli)

## 📋 Sobre o Projeto

O **Flowtomic** é um sistema de design moderno que oferece componentes UI prontos para uso e hooks headless para máxima flexibilidade. Construído sobre [Radix UI](https://www.radix-ui.com/) e inspirado em [shadcn/ui](https://ui.shadcn.com/), o Flowtomic permite que você acelere seu desenvolvimento mantendo controle total sobre customização.

### 🎯 Características Principais

- ✅ **54 Atoms** - Componentes básicos reutilizáveis
- ✅ **36 Molecules** - Componentes compostos
- ✅ **23 Organisms** - Componentes complexos
- ✅ **11 Hooks Headless** - Lógica reutilizável sem UI
- ✅ **3 Blocks** - Templates pré-construídos
- ✅ **Arquitetura Separada** - UI e lógica completamente desacopladas
- ✅ **Customização Total** - Componentes copiados para seu projeto
- ✅ **TypeScript First** - Tipagem completa e type-safe
- ✅ **Acessibilidade** - Baseado em Radix UI (WAI-ARIA compliant)

## 🚀 Quick Start

### Instalação Rápida

```bash
# 1. Inicializar configuração do Flowtomic
npx flowtomic-cli@latest init

# 2. Adicionar componentes desejados
npx flowtomic-cli@latest add button card input

# 3. Usar no seu projeto
```

```typescript
// Importar componentes
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Usar componentes
function MyComponent() {
  return (
    <Card>
      <Input placeholder="Digite algo..." />
      <Button>Enviar</Button>
    </Card>
  );
}
```

### Instalação via npm (Alternativa)

```bash
# Instalar packages npm
npm install @flowtomic/ui @flowtomic/logic

# Usar diretamente
import { Button, Card } from "@flowtomic/ui";
import { useStatCard } from "@flowtomic/logic";
```

> **💡 Dica**: Para customização total, use o CLI. Para uso rápido sem customização, use os packages npm.

## 🎯 Filosofia do Projeto

No desenvolvimento de software, frequentemente nos deparamos com a repetição das mesmas lógicas, principalmente em projetos grandes. A engenharia de software desenvolveu paradigmas como a **Programação Orientada a Objetos (POO)** para modelar sistemas com base em entidades do mundo real, promovendo encapsulamento, abstração e reutilização. Posteriormente, surgiram princípios gerais como **Don't Repeat Yourself (DRY)** e, dentro do paradigma OO, os princípios **SOLID** (formulados por Robert C. Martin) como boas práticas.

O ambiente frontend, por sua vez, ainda está se desenvolvendo nessa questão. Daí nasce o **Flowtomic**: uma solução reutilizável com componentes prontos ou customizáveis para acelerar seu desenvolvimento, seguindo as melhores práticas de engenharia de software.

### Princípios Fundamentais

- **Reutilização**: Componentes e hooks prontos para uso imediato
- **Flexibilidade**: Customização total ou uso direto dos packages
- **Separação de Responsabilidades**: UI e lógica completamente desacopladas
- **Type Safety**: TypeScript em todo o projeto
- **Acessibilidade**: Componentes acessíveis por padrão (WAI-ARIA)
- **Performance**: Otimizado para produção

## 🧩 Composition Pattern

O Flowtomic adota o **Composition Pattern** como abordagem fundamental de design, construindo interfaces complexas a partir de componentes menores e reutilizáveis, em vez de usar herança. Essa técnica promove flexibilidade, reutilização de código e modularidade.

### Conceitos Principais

**Composição sobre Herança**: A abordagem fundamental do React é a composição, onde componentes menores são combinados para criar outros maiores e mais complexos. Isso evita o acoplamento excessivo e a rigidez da herança de classes.

**Reutilização de Componentes**: Ao quebrar a interface em partes pequenas e isoladas, é possível reutilizá-las em diferentes partes do aplicativo, garantindo consistência e economia de tempo.

**Flexibilidade**: A composição permite customizar componentes de forma flexível. Um componente `Card` pode aceitar diferentes tipos de conteúdo através de props e composição de subcomponentes.

**Melhor Gerenciamento de Estado**: Padrões como **Compound Components** ajudam a compartilhar estado e lógica entre componentes filhos sem a necessidade de passar muitas props (Prop Drilling), melhorando desempenho e legibilidade.

**Modularidade**: Cada componente tem sua própria lógica e estilo, tornando o desenvolvimento mais fácil de manter e organizar.

### Padrões de Implementação

#### 1. Props.children

Renderiza conteúdo passado entre as tags de abertura e fechamento de um componente:

```typescript
import { Card } from "@flowtomic/ui";

function MyComponent() {
  return (
    <Card>
      <h2>Título</h2>
      <p>Conteúdo customizado</p>
    </Card>
  );
}
```

#### 2. Compound Components

Componente principal que gerencia estado e fornece dados aos componentes filhos via React.Context:

```typescript
import { Dialog, DialogTrigger, DialogContent } from "@flowtomic/ui";

function MyDialog() {
  return (
    <Dialog>
      <DialogTrigger>Abrir</DialogTrigger>
      <DialogContent>
        <p>Conteúdo do diálogo</p>
      </DialogContent>
    </Dialog>
  );
}
```

#### 3. Composição de Subcomponentes

Em vez de adicionar muitas propriedades a um único componente, criamos componentes menores (subcomponentes) para customizar partes específicas:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@flowtomic/ui";

function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Conteúdo do card</p>
      </CardContent>
    </Card>
  );
}
```

### Benefícios no Flowtomic

1. **Flexibilidade**: Combine componentes de forma dinâmica para criar interfaces complexas
2. **Reutilização**: Componentes pequenos e isolados podem ser reutilizados em diferentes contextos
3. **Manutenibilidade**: Mudanças em um componente não afetam outros componentes compostos
4. **Testabilidade**: Componentes menores são mais fáceis de testar isoladamente
5. **Performance**: Evita prop drilling e permite otimizações mais granulares

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

### Conceitos da Arquitetura

- **Componentes UI (`@flowtomic/ui`)**: Focados em apresentação visual, com **mínima ou nenhuma lógica de negócio**
- **Hooks Headless (`@flowtomic/logic`)**: Contêm toda a **lógica complexa, cálculos e gerenciamento de estado**, **sem qualquer markup ou estilos**

### Exemplo Prático: StatCard

O `StatCard` demonstra perfeitamente essa arquitetura de separação:

#### 1. Hook Headless (`useStatCard` - `@flowtomic/logic`)

```typescript
// Hook headless - APENAS lógica, SEM UI
import { useStatCard } from "@flowtomic/logic";

function MyCustomStatCard() {
  // Hook fornece toda a lógica de cálculo e formatação
  const { formattedValue, trend, getCardProps } = useStatCard({
    value: 122380,
    lastMonth: 105922, // Delta calculado automaticamente: +15.5%
  });

  // Você controla completamente o markup e estilos
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
// Componente visual - usa o hook headless internamente
import { StatCard } from "@flowtomic/ui";

// Componente pronto para uso com UI completa
function Dashboard() {
  return (
    <StatCard
      title="Receita Total"
      value={122380}
      lastMonth={105922}
      color="blue"
    />
  );
}
```

**O que o componente fornece:**

- ✅ Markup completo (Card, Header, Content)
- ✅ Estilos e animações
- ✅ Ícones e badges visuais
- ✅ Menu de ações (opcional)
- ❌ **NÃO contém**: lógica de cálculo ou processamento complexo

### Benefícios da Arquitetura

1. **Reutilização Máxima**: Use a lógica (`useStatCard`) em qualquer UI customizada
2. **Flexibilidade Total**: Crie seu próprio visual mantendo a lógica consistente
3. **Testabilidade**: Teste lógica e UI separadamente
4. **Manutenibilidade**: Mudanças na lógica não afetam o visual e vice-versa
5. **Composição**: Combine múltiplos hooks headless para criar componentes complexos

### Quando Usar Cada Abordagem

**Use o hook headless quando:**

- ✅ Precisa de UI completamente customizada
- ✅ Quer reutilizar a lógica em diferentes contextos
- ✅ Está criando um design system próprio
- ✅ Precisa de controle total sobre o markup

**Use o componente visual quando:**

- ✅ Precisa de uma solução rápida e pronta
- ✅ O design padrão atende suas necessidades
- ✅ Quer customizar apenas estilos (via `className` ou variáveis CSS)
- ✅ Quer começar rápido e iterar depois

## 📦 Instalação

### Método 1: CLI (Recomendado para Customização)

O CLI copia os arquivos dos componentes diretamente para o seu projeto, permitindo customização total:

```bash
# Inicializar configuração do Flowtomic
npx flowtomic-cli@latest init

# Adicionar componentes individuais
npx flowtomic-cli@latest add button card input

# Adicionar blocks completos
npx flowtomic-cli@latest add-block dashboard-01

# Listar todos os componentes e blocks disponíveis
npx flowtomic-cli@latest list
```

**Vantagens do CLI:**

- ✅ Customização total dos componentes
- ✅ Componentes copiados para seu projeto
- ✅ Imports ajustados automaticamente
- ✅ Controle completo sobre o código

### Método 2: Packages npm (Recomendado para Uso Rápido)

Instale os packages diretamente do npm:

```bash
# Instalar packages
npm install @flowtomic/ui @flowtomic/logic

# Ou usando outros gerenciadores
yarn add @flowtomic/ui @flowtomic/logic
pnpm add @flowtomic/ui @flowtomic/logic
bun add @flowtomic/ui @flowtomic/logic
```

**Vantagens dos packages npm:**

- ✅ Instalação rápida
- ✅ Atualizações via npm
- ✅ Sem necessidade de copiar arquivos
- ⚠️ Customização limitada (apenas via `className` e variáveis CSS)

### Método 3: Via shadcn CLI (Compatível)

Use o registry do Flowtomic com o shadcn CLI:

```bash
# Instalar via shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

> **Nota**: O CLI automaticamente baixa o repositório do GitHub quando necessário (via variável de ambiente ou caminho local).

## 💻 Uso dos Packages

### Componentes UI (`@flowtomic/ui`)

```typescript
// Importar componentes UI
import { Button, Card, Input, Badge, Dialog } from "@flowtomic/ui";

// Exemplo de uso
function MyComponent() {
  return (
    <Card>
      <Input placeholder="Digite algo..." />
      <Button variant="default">Enviar</Button>
      <Badge variant="success">Novo</Badge>
    </Card>
  );
}
```

### Hooks Headless (`@flowtomic/logic`)

```typescript
// Importar hooks headless
import { useStatCard, useIsMobile, useResizable } from "@flowtomic/logic";

// Exemplo: Hook useStatCard
function MyStatCard() {
  const { formattedValue, trend, getCardProps } = useStatCard({
    value: 122380,
    lastMonth: 105922, // Delta calculado automaticamente: +15.5%
  });

  return (
    <div {...getCardProps()}>
      <span>{formattedValue}</span>
      <Badge variant={trend.variant}>{trend.percentage}</Badge>
    </div>
  );
}

// Exemplo: Hook useIsMobile
function ResponsiveComponent() {
  const isMobile = useIsMobile();

  return <div>{isMobile ? <MobileView /> : <DesktopView />}</div>;
}
```

> **💡 Dica**: Você pode combinar o uso dos packages npm com o CLI. Use os packages para componentes que não precisa customizar e o CLI para componentes que precisa modificar.

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

O Flowtomic oferece duas formas principais de uso:

### 1. CLI (Customização Total)

O CLI copia os arquivos dos componentes diretamente para o seu projeto (similar ao shadcn/ui), permitindo customização total:

```bash
# Componentes são copiados para seu projeto
npx flowtomic-cli@latest add button

# Arquivo criado: src/components/ui/button/button.tsx
# Você pode modificar completamente o componente
```

**Vantagens:**

- ✅ Customização total do código
- ✅ Imports ajustados automaticamente
- ✅ Controle completo sobre estilos e comportamento
- ✅ Componentes fazem parte do seu projeto

### 2. Packages npm (Uso Rápido)

Os packages npm fornecem componentes prontos para uso:

```typescript
// Importar diretamente do package
import { Button } from "@flowtomic/ui";
```

**Vantagens:**

- ✅ Instalação rápida
- ✅ Atualizações via npm
- ✅ Customização via `className` e variáveis CSS
- ⚠️ Customização limitada (não pode modificar o código fonte)

### Estilo Padrão vs Customização

**Estilo Padrão:**

- Funciona imediatamente após importar os arquivos CSS do Flowtomic
- Baseado em Tailwind CSS com variáveis CSS customizáveis

**Customização:**

- **Via `className`**: Ajustes pontuais em componentes específicos
- **Via variáveis CSS**: Temas globais e personalização de cores/espaçamentos
- **Modificando código fonte** (apenas com CLI): Customização completa do componente

Para mais detalhes sobre customização, consulte a [documentação de estilos](./docs/packages/ui.md).

## 📝 Exemplos Práticos

### Exemplo 1: Formulário com Validação

```typescript
import { Form, Input, Button, Card } from "@/components/ui";
import { useForm } from "react-hook-form";

function LoginForm() {
  const form = useForm();

  return (
    <Card>
      <Form {...form}>
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Senha" required />
        <Button type="submit">Entrar</Button>
      </Form>
    </Card>
  );
}
```

### Exemplo 2: Dashboard com Estatísticas

```typescript
import { StatCard } from "@/components/ui";
import { useStatCard } from "@flowtomic/logic";

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Receita Total"
        value={122380}
        lastMonth={105922}
        color="blue"
      />
      <StatCard
        title="Usuários Ativos"
        value={15420}
        lastMonth={12800}
        color="green"
      />
      <StatCard title="Conversão" value={3.2} lastMonth={2.8} color="purple" />
    </div>
  );
}
```

### Exemplo 3: Tabela com Paginação

```typescript
import { DataTable } from "@/components/ui";
import { useReactTableBack } from "@flowtomic/logic";

function UsersTable() {
  const { table, data, isLoading } = useReactTableBack({
    endpoint: "/api/users",
    columns: userColumns,
  });

  if (isLoading) return <Skeleton />;

  return <DataTable table={table} data={data} />;
}
```

### Exemplo 4: UI Customizada com Hook Headless

```typescript
import { useStatCard } from "@flowtomic/logic";

function CustomStatCard() {
  const { formattedValue, trend } = useStatCard({
    value: 122380,
    lastMonth: 105922,
  });

  // UI completamente customizada
  return (
    <div className="custom-card">
      <div className="value">{formattedValue}</div>
      <div className={`trend ${trend.direction}`}>{trend.percentage}</div>
    </div>
  );
}
```

## 📖 Documentação Completa

### Documentação Principal

- [📚 Índice de Documentação](./docs/INDEX.md) - Guia central de toda a documentação
- [Guia de Desenvolvimento](./docs/desenvolvimento/guia.md) - Guia completo de uso do monorepo e CLI
- [Documentação do CLI](./cli/README.md) - Documentação detalhada do CLI

### Documentação de Componentes

- [Componentes Disponíveis](./docs/componentes/README.md) - Lista completa de componentes
- [Atoms](./docs/componentes/atoms.md) - Componentes básicos (63 componentes)
- [Molecules](./docs/componentes/molecules.md) - Componentes compostos (47 componentes)
- [Organisms](./docs/componentes/organisms.md) - Componentes complexos (23 componentes)
- [Hooks](./docs/componentes/hooks.md) - Hooks headless (11 hooks)
- [Blocks](./docs/componentes/blocks.md) - Blocks pré-construídos (3 blocks)

### Documentação Técnica

- [Arquitetura do Monorepo](./docs/arquitetura/monorepo.md) - Estrutura e organização
- [Package UI](./docs/packages/ui.md) - Detalhes do package UI
- [Package Logic](./docs/packages/logic.md) - Detalhes do package Logic
- [Registry](./registry/README.md) - Sistema de registry
- [Guia de Deploy](./docs/deploy/DEPLOYMENT.md) - Como fazer deploy

## 📦 Packages Publicados

O Flowtomic está publicado no npm em três packages principais:

| Package                | Descrição                          | Instalação                      |
| ---------------------- | ---------------------------------- | ------------------------------- |
| **`flowtomic-cli`**    | CLI para instalação de componentes | `npx flowtomic-cli@latest init` |
| **`@flowtomic/ui`**    | Componentes UI reutilizáveis       | `npm install @flowtomic/ui`     |
| **`@flowtomic/logic`** | Hooks headless e lógica            | `npm install @flowtomic/logic`  |

### Registry

O registry está disponível em `https://registry.flowtomic.dev` e é compatível com o shadcn CLI:

```bash
# Usar com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

Para mais informações sobre publicação e deploy, consulte a [documentação de deploy](./docs/deploy/README.md).

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, consulte a [documentação de desenvolvimento](./docs/desenvolvimento/guia.md) para mais informações sobre como contribuir.

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

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

---

Desenvolvido com ❤️ e ☕ por [JaimeJunr](https://github.com/JaimeJunr)
