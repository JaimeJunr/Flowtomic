# ⚛️ Regras do Projeto Flowtomic

> **⚠️ IMPORTANTE**: Este arquivo contém regras críticas para o agente de IA. Para informações detalhadas sobre componentes, estrutura e desenvolvimento, **SEMPRE consulte** `docs/INDEX.md` e a documentação específica.

## 📚 Documentação Principal

**SEMPRE consulte** a documentação antes de implementar:

- **`docs/INDEX.md`** - Índice central de toda a documentação
- **`docs/componentes/README.md`** - Lista completa de componentes (54 atoms, 36 molecules, 23 organisms, 13 hooks, 3 blocks)
- **`docs/desenvolvimento/README.md`** - Guia completo de desenvolvimento
- **`docs/packages/ui.md`** - Detalhes do package UI
- **`docs/packages/logic.md`** - Detalhes do package Logic
- **`docs/cli/README.md`** - Documentação do CLI
- **`docs/deploy/npm.md`** - Documentação do script de publicação automatizada no NPM

## Estrutura do Monorepo

**SEMPRE consulte** `docs/INDEX.md` e `README.md` para detalhes completos sobre a estrutura do monorepo.

Estrutura básica:

- **`packages/ui/`** - `@flowtomic/ui`: Componentes UI reutilizáveis
- **`packages/logic/`** - `@flowtomic/logic`: Hooks headless e lógica reutilizável
- **`packages/styles/`** - Estilos globais (globals.css, theme.css, typography.css)
- **`cli/`** - `@flowtomic/cli`: CLI para instalação de componentes
- **`registry/`** - Registry para componentes e blocks (compatível com shadcn CLI)
- **`scripts/`** - Scripts de automação (publicação NPM, etc.)

## Padrões de Desenvolvimento

**SEMPRE consulte** `docs/desenvolvimento/README.md` e `docs/componentes/README.md` para padrões completos.

### Estrutura de Componentes

**SEMPRE consulte** `docs/componentes/` para lista completa e detalhes:

- **Atoms**: `docs/componentes/atoms.md` (54 componentes)
- **Molecules**: `docs/componentes/molecules.md` (36 componentes)
- **Organisms**: `docs/componentes/organisms.md` (23 componentes)
- **Blocks**: `docs/componentes/blocks.md` (3 blocks)
- **Hooks**: `docs/componentes/hooks.md` (13 hooks)

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
  - **React Aria**: `@react-aria/tooltip`, `@react-aria/interactions`, `@react-aria/overlays`, `@react-stately/tooltip` (para tooltip com seguimento do mouse)
  - **Animações**: `motion/react` (Framer Motion) para animações avançadas
- **Logic**: Hooks headless sem dependências de UI (apenas React, zustand e dependências específicas como @tanstack/react-table, react-resizable-panels)
- **CLI**: Usa Bun para execução
- **Estilos**: Tailwind CSS v4 com `@tailwindcss/postcss`, suporte a variáveis CSS customizáveis

### Component Map

Ao adicionar novos componentes/hooks:

1. Adicionar entrada em `cli/src/utils/component-map.ts`
2. Incluir tipo (`atom`, `molecule`, `organism`)
3. Especificar dependências necessárias
4. Atualizar documentação em `README.md`

### Build e Desenvolvimento

**SEMPRE consulte** `docs/desenvolvimento/README.md` para comandos completos e guias de desenvolvimento.

Comandos principais:

- `bun run dev` - Desenvolvimento com watch
- `bun run build` - Build de todos os packages
- `bun run type-check` - Verificar tipos TypeScript
- CLI funciona via `bunx` sem necessidade de publicação no npm

### CLI

**SEMPRE consulte** `docs/cli/README.md` e `cli/README.md` para documentação completa do CLI.

Informações essenciais:

- CLI copia arquivos diretamente para projetos (estilo shadcn/ui)
- Ajusta imports automaticamente para aliases do projeto
- Comandos: `init`, `add`, `add-block`, `list`
- Compatível com shadcn CLI via registry: `https://registry.flowtomic.dev/all.json`
- Publicado no npm como `flowtomic-cli`

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

**SEMPRE consulte** `docs/packages/ui.md` para detalhes completos sobre estilos.

Regras críticas:

- **Ordem de importação obrigatória**: `globals.css` → `theme.css` → `typography.css`
- **Requisitos**: Tailwind CSS v4.1.14 com `@tailwindcss/postcss`
- **Customização**: Via `className` (ajustes pontuais) ou variáveis CSS (temas globais)

### Documentação

**SEMPRE siga** estas regras de documentação:

- **SEMPRE consultar** `docs/INDEX.md` antes de implementar para identificar padrões estabelecidos
- **SEMPRE atualizar** `docs/INDEX.md` ao adicionar nova documentação
- **SEMPRE criar** story para cada novo componente/hook (ver seção Storybook abaixo)
- **SEMPRE atualizar** documentação relevante em `docs/` ao adicionar componentes ou funcionalidades

## Comandos Importantes

**SEMPRE consulte** `docs/desenvolvimento/README.md` para lista completa de comandos e guias de uso.

Comandos principais:

- `bun run dev` - Desenvolvimento com watch
- `bun run build` - Build de todos os packages
- `bun run type-check` - Verificar tipos TypeScript
- `bun run storybook` - Executar Storybook
- `bun run fix:all` - Corrigir lint e formatar tudo
- `bun run publish` - Publicar packages no NPM (ver seção abaixo)

### Publicação no NPM

**SEMPRE consulte** `docs/deploy/npm.md` para documentação completa do script de publicação.

**SEMPRE use** o script de publicação automatizada para publicar packages no NPM:

#### Script de Publicação (`scripts/publish.ts`)

O script automatiza o processo completo de publicação:

1. **Executa testes** - Valida que todos os testes passam
2. **Executa build** - Garante que o build está funcionando
3. **Atualiza versão** - Incrementa versão automaticamente (major/minor/patch)
4. **Publica no NPM** - Publica o package selecionado

#### Uso do Script

**Modo Interativo (Recomendado)**:

```bash
bun run publish
```

O script irá:

- Mostrar lista de packages disponíveis (ui, logic, cli)
- Mostrar opções de tipo de versão com preview da nova versão
- Executar validações (testes e build)
- Atualizar versão e publicar

**Modo Não-Interativo**:

```bash
# Sintaxe: <package> <version-type>
bun run publish ui patch
bun run publish logic minor
bun run publish cli major
```

#### Packages Disponíveis para Publicação

- **`ui`** → `@flowtomic/ui` - Componentes UI reutilizáveis
- **`logic`** → `@flowtomic/logic` - Hooks headless e lógica
- **`cli`** → `flowtomic-cli` - CLI para instalação de componentes

#### Tipos de Versão

- **`major`** (1.0.0 → 2.0.0) - Mudanças incompatíveis na API
- **`minor`** (1.0.0 → 1.1.0) - Novas funcionalidades mantendo compatibilidade
- **`patch`** (1.0.0 → 1.0.1) - Correções de bugs mantendo compatibilidade

#### Regras de Publicação

**SEMPRE siga** estas regras ao publicar:

1. **SEMPRE execute** `bun run publish` em vez de publicar manualmente
2. **SEMPRE escolha** o tipo de versão apropriado (major/minor/patch)
3. **SEMPRE aguarde** validações (testes e build) antes da publicação
4. **NUNCA publique** manualmente sem executar testes e build primeiro
5. **SEMPRE verifique** se está autenticado no NPM antes de publicar

#### Fluxo de Publicação

O script executa automaticamente:

1. **Validação**: Verifica package e tipo de versão
2. **Testes**: Executa `bun run test` em todos os packages
3. **Build**: Executa `bun run build` em todos os packages
4. **Atualização**: Atualiza `package.json` do package selecionado
5. **Publicação**: Publica no NPM usando `npm publish --access public`

**⚠️ IMPORTANTE**: Se testes ou build falharem, a publicação **não será executada**.

## Componentes Disponíveis

**🚨 CRÍTICO**: **SEMPRE consulte** `docs/componentes/README.md` para lista completa e detalhada de todos os componentes.

Resumo:

- **Atoms**: 54 componentes - Ver `docs/componentes/atoms.md`
- **Molecules**: 36 componentes - Ver `docs/componentes/molecules.md`
- **Organisms**: 23 componentes - Ver `docs/componentes/organisms.md`
- **Hooks**: 13 hooks - Ver `docs/componentes/hooks.md`
- **Blocks**: 3 blocks - Ver `docs/componentes/blocks.md`

## Registry

**SEMPRE consulte** `docs/registry/README.md` e `registry/README.md` para documentação completa.

Informações essenciais:

- **URL de produção**: `https://registry.flowtomic.dev`
- **Compatibilidade**: Compatível com shadcn CLI
- **Uso**: `npx shadcn@latest add https://registry.flowtomic.dev/all.json`

## Ferramentas e Tecnologias

**SEMPRE consulte** `docs/INDEX.md` e `docs/desenvolvimento/README.md` para detalhes completos sobre tecnologias e padrões.

Stack principal:

- **Runtime**: Bun 1.3.0+
- **Build System**: Turbo
- **Linter/Formatter**: Biome (não ESLint/Prettier)
- **CSS Framework**: Tailwind CSS v4.1.14 com `@tailwindcss/postcss`
- **Componentes Base**: Radix UI
- **Acessibilidade**: React Aria (para componentes com seguimento do mouse)
- **Animações**: motion/react (Framer Motion)
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
17. **SEMPRE usar** `bun run publish` para publicar packages no NPM (nunca publicar manualmente)
18. **SEMPRE executar** testes e build antes de publicar (o script faz isso automaticamente)
19. **SEMPRE escolher** o tipo de versão apropriado (major/minor/patch) ao publicar
