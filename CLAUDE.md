# ⚛️ Regras do Projeto Flowtomic

## Estrutura do Monorepo

Este é um monorepo gerenciado com Bun workspaces contendo:

- **`packages/ui/`** - `@flowtomic/ui`: Componentes UI reutilizáveis (atoms, molecules, organisms, blocks)
- **`packages/logic/`** - `@flowtomic/logic`: Hooks headless e lógica reutilizável
- **`packages/styles/`** - Estilos globais (globals.css, theme.css, typography.css)
- **`cli/`** - `@flowtomic/cli`: CLI para instalação de componentes em projetos externos
- **`registry/`** - Registry para componentes e blocks (compatível com shadcn CLI)

## Padrões de Desenvolvimento

### Estrutura de Componentes

- **Atoms**: Componentes básicos em `packages/ui/src/components/atoms/` (15 componentes)
- **Molecules**: Componentes compostos em `packages/ui/src/components/molecules/` (10 componentes)
- **Organisms**: Componentes complexos em `packages/ui/src/components/organisms/` (6 componentes)
- **Blocks**: Componentes pré-construídos em `packages/ui/src/blocks/` (1 block)
- **Hooks**: Hooks headless em `packages/logic/src/hooks/` (6 hooks)

### Convenções de Arquivos

Cada componente/hook deve seguir a estrutura padrão:

```text
component-name/
├── component-name.tsx      # Componente principal (ou hook.ts para hooks)
├── component-name.stories.tsx  # Storybook story (OBRIGATÓRIO)
└── index.ts                # Barrel export
```

**Estrutura obrigatória**:

- Arquivo principal (ex: `button.tsx`, `useMobile.ts`)
- Arquivo `index.ts` para barrel exports
- Arquivo `*.stories.tsx` para Storybook (OBRIGATÓRIO)
- Tipos TypeScript exportados

**Exemplo de estrutura**:

```text
button/
├── button.tsx
├── button.stories.tsx
└── index.ts

useMobile/
├── useMobile.ts
├── useMobile.stories.tsx
└── index.ts
```

### Exports

- Sempre exportar tipos junto com componentes/hooks
- Usar barrel exports em `index.ts` de cada package
- Manter exports organizados por categoria (atoms, molecules, organisms, hooks)

### Dependências

- **UI**: Baseado em Radix UI, Tailwind CSS v4.1.14, class-variance-authority, clsx, tailwind-merge
- **Logic**: Hooks headless sem dependências de UI (apenas React e dependências específicas como @tanstack/react-table, react-resizable-panels)
- **CLI**: Usa Bun para execução
- **Estilos**: Tailwind CSS v4 com `@tailwindcss/postcss`, suporte a variáveis CSS customizáveis

### Component Map

Ao adicionar novos componentes/hooks:

1. Adicionar entrada em `cli/src/utils/component-map.ts`
2. Incluir tipo (`atom`, `molecule`, `organism`)
3. Especificar dependências necessárias
4. Atualizar documentação em `README.md`

### Build e Desenvolvimento

- Usar `bun run build` para build de todos os packages
- Usar `bun run dev` para desenvolvimento com watch
- Sempre executar `bun run type-check` antes de commits
- CLI deve funcionar via `bunx` sem necessidade de publicação no npm

### CLI

- CLI copia arquivos diretamente para projetos (estilo shadcn/ui)
- Ajusta imports automaticamente para aliases do projeto
- Resolve repositório via `FLOWTOMIC_REPO_PATH` ou caminhos padrão
- Suporta instalação via GitHub sem publicação no npm
- Comandos disponíveis: `init`, `add`, `add-block`, `list`
- Compatível com shadcn CLI via registry: `https://registry.flowtomic.dev/all.json`
- Publicado no npm como `flowtomic` (uso: `npx flowtomic@latest` ou `bunx flowtomic@latest`)

### TypeScript

- Usar TypeScript estrito
- Exportar tipos junto com implementações
- Manter compatibilidade com React 18 e 19
- Usar `peerDependencies` para React

### Testes e Qualidade

- Manter componentes agnósticos de negócio
- Organisms podem ser específicos mas devem ser documentados
- Sempre verificar se imports estão corretos após mudanças
- Manter documentação atualizada

### Storybook e Stories

**SEMPRE criar** uma story para cada componente ou hook.

#### Estrutura de Stories

**Padrão obrigatório**:

1. **Localização**: Mesma pasta do componente/hook
2. **Nomenclatura**: `{component-name}.stories.tsx` ou `{hook-name}.stories.tsx`
3. **Framework**: Usar `@storybook/react-vite`
4. **Tags**: Sempre incluir `tags: ["autodocs"]`

#### Stories para Componentes UI

**Estrutura padrão**:

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComponentName } from "./component-name";

const meta = {
  title: "Flowtomic UI/{Atoms|Molecules|Organisms}/ComponentName",
  component: ComponentName,
  parameters: {
    layout: "centered", // ou "fullscreen" para componentes grandes
  },
  tags: ["autodocs"],
  argTypes: {
    // Definir controles para props
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Props padrão
  },
};
```

**Hierarquia de títulos**:

- **Atoms**: `"Flowtomic UI/Atoms/ComponentName"`
- **Molecules**: `"Flowtomic UI/Molecules/ComponentName"`
- **Organisms**: `"Flowtomic UI/Organisms/ComponentName"`
- **Subcategorias**: `"Flowtomic UI/Atoms/Typography/AnimatedShinyText"`

#### Stories para Hooks

**Estrutura padrão** (hooks são headless, precisam de componente wrapper):

```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useHookName } from "./index";

const meta = {
  title: "Flowtomic Logic/Hooks/useHookName",
  component: () => null, // Hooks não têm componente direto
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Descrição do hook e seu propósito",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Componente de demonstração
function HookDemo() {
  const hookValue = useHookName();
  return <div>{/* UI de demonstração */}</div>;
}

export const Default: Story = {
  render: () => <HookDemo />,
};
```

**Diretrizes para hooks**:

- **SEMPRE criar** um componente wrapper que demonstre o uso do hook
- **SEMPRE incluir** múltiplas variações de uso quando aplicável
- **SEMPRE documentar** o comportamento e propósito do hook na descrição

#### Configuração do Storybook

**Localização de stories**:

- Componentes UI: `packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)`
- Hooks Logic: `packages/logic/src/**/*.stories.@(js|jsx|ts|tsx)`

**Comandos**:

```bash
# Executar Storybook em modo desenvolvimento
bun run storybook

# Build estático do Storybook
bun run build-storybook
```

#### Boas Práticas de Stories

1. **SEMPRE incluir** story `Default` com configuração básica
2. **SEMPRE criar** múltiplas variações quando o componente tem variantes
3. **SEMPRE documentar** props importantes em `argTypes`
4. **SEMPRE usar** `satisfies Meta<typeof Component>` para type safety
5. **SEMPRE incluir** exemplos de uso real quando relevante
6. **NUNCA criar** componente sem story correspondente

### Estilos e Customização

- **Estilos padrão**: Funcionam imediatamente após importar CSS do Flowtomic
- **Ordem de importação obrigatória**:
  1. `globals.css` - Inicializa Tailwind v4
  2. `theme.css` - Define variáveis do tema usando @theme
  3. `typography.css` - Estilos de tipografia que dependem das variáveis
- **Customização**: Via `className` (ajustes pontuais) ou variáveis CSS (temas globais)
- **Requisitos**: Tailwind CSS v4.1.14 com `@tailwindcss/postcss`
- **Variáveis CSS**: Customizáveis via `:root` e `.dark` (--primary, --radius, etc.)

### Documentação

- Atualizar `README.md` ao adicionar componentes
- Atualizar `docs/INDEX.md` com nova documentação
- Manter `docs/cli/README.md` atualizado com novos comandos
- Documentar dependências e requisitos
- **SEMPRE criar** story para cada novo componente/hook
- **SEMPRE consultar** `docs/` antes de implementar para identificar padrões estabelecidos

## Comandos Importantes

```bash
# Desenvolvimento
bun run dev              # Watch mode para todos os packages
bun run build            # Build de todos os packages
bun run type-check       # Verificar tipos TypeScript

# Packages específicos
bun run build:ui         # Build apenas @flowtomic/ui
bun run build:logic      # Build apenas @flowtomic/logic
bun run build:cli        # Build apenas @flowtomic/cli

# Linting e Formatação
bun run lint             # Verificar lint
bun run lint:fix          # Corrigir problemas de lint
bun run format            # Formatar código
bun run format:check      # Verificar formatação
bun run fix:all           # Corrigir lint e formatar tudo

# Storybook
bun run storybook         # Executar Storybook em modo desenvolvimento
bun run build-storybook   # Build estático do Storybook

# Registry
bun run registry:build    # Build do registry
bun run registry:server   # Servidor do registry (desenvolvimento)

# Limpeza
bun run clean             # Limpar builds e node_modules

# Testes
bun run test              # Executar testes
```

## Componentes Disponíveis

### Atoms (15)

- `button` - Botão com variantes
- `badge` - Badge/etiqueta
- `input` - Campo de entrada
- `card` - Card container
- `checkbox` - Checkbox
- `skeleton` - Loading skeleton
- `table` - Tabela base
- `tabs` - Abas
- `alert` - Alerta
- `alert-dialog` - Diálogo de confirmação
- `dialog` - Modal/diálogo
- `dropdown-menu` - Menu dropdown
- `sonner` - Toast notifications
- `select` - Campo de seleção
- `animated-shiny-text` - Texto com efeito shimmer animado (em `atoms/typography/`)

### Molecules (10)

- `button-group` - Grupo de botões
- `password-input` - Input de senha
- `image-dropzone` - Upload de imagem
- `stat-card` - Card de estatística
- `data-table` - Tabela avançada
- `menu-dock` - Dock de menu
- `theme-toggle-button` - Botão de toggle de tema (em `molecules/theme/`)
- `auth-navigation-link` - Link de navegação de auth (em `molecules/auth/`)
- `auth-form-error-message` - Mensagem de erro de formulário (em `molecules/auth/`)
- `social-login-buttons` - Botões de login social

### Organisms (6)

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações
- `resizable-layout` - Componente redimensionável com sidebar

### Hooks (6)

- `use-stat-card` - Hook para StatCard
- `use-mobile` (exportado como `useIsMobile`) - Hook para detectar dispositivos móveis
- `use-react-table-back` - Hook para tabelas com paginação/ordenação no backend
- `use-react-table-front` - Hook para tabelas com paginação/ordenação no frontend
- `use-resizable` - Hook para componentes redimensionáveis
- `use-theme-transition` - Hook para transições de tema com View Transitions API

### Blocks (1)

- `dashboard-01` - Dashboard simples com cards

## Registry

- **Localização**: `registry/` na raiz do projeto
- **URL de produção**: `https://registry.flowtomic.dev`
- **Compatibilidade**: Compatível com shadcn CLI
- **Uso**: `npx shadcn@latest add https://registry.flowtomic.dev/all.json`
- **Comandos**: `bun run registry:build` e `bun run registry:server`

## Ferramentas e Tecnologias

- **Runtime**: Bun 1.3.0+
- **Build System**: Turbo
- **Linter/Formatter**: Biome
- **CSS Framework**: Tailwind CSS v4.1.14 com `@tailwindcss/postcss`
- **Componentes Base**: Radix UI
- **Ícones**: Lucide React
- **Notificações**: Sonner
- **Tabelas**: TanStack Table
- **Formulários**: React Hook Form + Zod
- **Temas**: next-themes
- **Storybook**: @storybook/react-vite v10.0.6

## Regras Específicas

1. **Nunca** adicionar dependências de negócio específico em atoms ou molecules
2. **Sempre** manter hooks headless (sem UI)
3. **Sempre** atualizar `cli/src/utils/component-map.ts` ao adicionar componentes
4. **Sempre** verificar se o CLI funciona após mudanças
5. **Nunca** quebrar a API pública sem documentar mudanças
6. **Sempre** manter compatibilidade com React 18 e 19
7. **Sempre** usar Tailwind CSS v4 para estilização
8. **Sempre** usar Radix UI para acessibilidade em componentes interativos
9. **SEMPRE criar** story (`.stories.tsx`) para cada componente ou hook
10. **NUNCA criar** componente/hook sem story correspondente
11. **SEMPRE seguir** o padrão de estrutura: `pasta/index.ts + story + component`
12. **SEMPRE usar** nomenclatura correta de títulos no Storybook (`Flowtomic UI/...` ou `Flowtomic Logic/...`)
13. **SEMPRE consultar** `docs/INDEX.md` antes de implementar para identificar padrões estabelecidos
14. **SEMPRE seguir** ordem de importação dos estilos: globals.css → theme.css → typography.css
15. **SEMPRE usar** Biome para linting e formatação (não ESLint/Prettier)
16. **SEMPRE atualizar** `docs/` ao adicionar novos componentes ou funcionalidades
