# ⚛️ Guia de Desenvolvimento do Flowtomic

> **Objetivo**: Guia completo para desenvolvimento no monorepo Flowtomic, incluindo estrutura, comandos e boas práticas.

## 📦 Estrutura do Monorepo

```text
flowtomic/
├── packages/
│   ├── ui/          # flowtomic/ui - Componentes visuais
│   └── logic/       # flowtomic/logic - Hooks headless
├── cli/             # flowtomic - CLI de instalação
└── package.json     # Configuração do monorepo
```

## 🚀 Desenvolvimento Local

### 1. Instalar Dependências

```bash
cd flowtomic
bun install
```

### 2. Desenvolvimento com Watch

```bash
# Desenvolvimento de todos os packages
bun run dev

# Desenvolvimento específico
cd packages/ui && bun run dev
cd packages/logic && bun run dev
cd cli && bun run dev
```

### 3. Build

```bash
# Build todos os packages
bun run build

# Build específico
bun run build:ui
bun run build:logic
bun run build:cli
```

### 4. Type Check

```bash
bun run type-check
```

## 📝 Adicionar Novo Componente UI

### Checklist Obrigatório

- [ ] **SEMPRE crie** estrutura de pastas adequada
- [ ] **SEMPRE crie** arquivo principal do componente
- [ ] **SEMPRE crie** arquivo `index.ts` para barrel export
- [ ] **SEMPRE crie** arquivo `*.stories.tsx` para Storybook
- [ ] **SEMPRE exporte** em `packages/ui/src/index.ts`
- [ ] **SEMPRE atualize** `component-map.ts` no CLI

### Passos Detalhados

1. **SEMPRE crie** estrutura em `packages/ui/src/components/button/`:

```bash
mkdir -p packages/ui/src/components/button
```

2. **SEMPRE crie** arquivos obrigatórios:

   - `button.tsx` - Componente principal
   - `button.stories.tsx` - Story para Storybook (OBRIGATÓRIO)
   - `index.ts` - Barrel export

3. **SEMPRE exporte** em `packages/ui/src/index.ts`:

```typescript
export { Button, buttonVariants } from "./components/button";
export type { ButtonProps } from "./components/button";
```

4. **SEMPRE atualize** `cli/src/utils/component-map.ts`:

```typescript
{
  name: "button",
  type: "atom",
  dependencies: ["@radix-ui/react-slot", "class-variance-authority"]
}
```

## 🎣 Adicionar Novo Hook

### Checklist Obrigatório

- [ ] **SEMPRE crie** estrutura de pastas adequada
- [ ] **SEMPRE crie** arquivo principal do hook
- [ ] **SEMPRE crie** arquivo `index.ts` para barrel export
- [ ] **SEMPRE crie** arquivo `*.stories.tsx` para Storybook (com componente wrapper)
- [ ] **SEMPRE exporte** em `packages/logic/src/index.ts`
- [ ] **SEMPRE atualize** `component-map.ts` no CLI

### Passos Detalhados

1. **SEMPRE crie** estrutura em `packages/logic/src/hooks/useThemeToggle/`:

```bash
mkdir -p packages/logic/src/hooks/useThemeToggle
```

2. **SEMPRE crie** arquivos obrigatórios:

   - `useThemeToggle.ts` - Hook principal
   - `useThemeToggle.stories.tsx` - Story para Storybook (OBRIGATÓRIO)
   - `index.ts` - Barrel export

3. **SEMPRE exporte** em `packages/logic/src/index.ts`:

```typescript
export { useThemeToggle } from "./hooks/useThemeToggle";
export type { UseThemeToggleReturn } from "./hooks/useThemeToggle";
```

4. **SEMPRE atualize** `cli/src/utils/component-map.ts`:

```typescript
{
  name: "use-theme-toggle",
  type: "hook",
  dependencies: []
}
```

## 🔧 Usar em Projeto

### Opção 1: Link Local (Desenvolvimento)

```bash
# No diretório flowtomic
bun link

# No diretório frontend do Amanhecer
bun link flowtomic/ui
bun link flowtomic/logic
```

### Opção 2: Usar CLI (Recomendado)

O CLI do Flowtomic permite instalar componentes diretamente em projetos externos, similar ao shadcn/ui.

#### 📦 Instalação e Execução

**Via npm/npx (Recomendado)**

```bash
# Inicializar configuração
npx flowtomic init
# ou
bunx flowtomic init

# Adicionar componentes
npx flowtomic add button card input
# ou
bunx flowtomic add button card input

# Listar componentes disponíveis
npx flowtomic list
# ou
bunx flowtomic list
```

**Via Caminho Local (Desenvolvimento)**

```bash
# Se o repositório está localmente
bunx /caminho/para/flowtomic/cli init
bunx /caminho/para/flowtomic/cli add button
```

**Configurar Variável de Ambiente (Opcional)**

Para facilitar, você pode definir a variável de ambiente:

```bash
export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
npx flowtomic add button
```

#### 🚀 Fluxo de Uso

##### 1. Inicializar Projeto

```bash
npx flowtomic init
# ou
bunx flowtomic init
```

Isso cria o arquivo `components.json` na raiz do projeto.

##### 2. Adicionar Componentes

```bash
# Adicionar um componente
npx flowtomic add button
# ou
bunx flowtomic add button

# Adicionar múltiplos
npx flowtomic add button card input badge
# ou
bunx flowtomic add button card input badge

# Modo interativo (seleciona da lista)
npx flowtomic add
# ou
bunx flowtomic add
```

##### 3. Usar no Projeto

```typescript
// Os componentes são copiados para o seu projeto
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

#### 📋 Componentes Disponíveis

**Atoms (13)**

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

**Molecules (12)**

- `button-group` - Grupo de botões
- `password-input` - Input de senha
- `image-dropzone` - Upload de imagem
- `stat-card` - Card de estatística
- `data-table` - Tabela avançada
- `goo-tabs` - Abas com pílula animada (substitui o `menu-dock`)
- `menu-dock` - Dock flutuante com ampliação por proximidade (para abas, use `goo-tabs`)
- `theme-toggle-button` - Botão de toggle de tema
- `auth-navigation-link` - Link de navegação de auth
- `auth-form-error-message` - Mensagem de erro de formulário
- `social-login-buttons` - Botões de login social

**Organisms (5)**

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações

**Hooks (1)**

- `use-stat-card` - Hook para StatCard

#### ⚙️ Configuração

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

**Personalizar Aliases**

Você pode editar o `components.json` para ajustar os caminhos:

```json
{
  "aliases": {
    "components": "@/src/components",
    "utils": "@/src/lib/utils",
    "ui": "@/src/components/ui",
    "hooks": "@/src/hooks"
  }
}
```

#### 🔧 Como Funciona

1. **Resolução do Repositório**: O CLI encontra o repositório Flowtomic via:

   - Variável `FLOWTOMIC_REPO_PATH`
   - Caminho relativo
   - Caminhos padrão

2. **Cópia de Arquivos**: Os arquivos são copiados do repositório para o seu projeto

3. **Ajuste de Imports**: Os imports são automaticamente ajustados para usar os aliases do seu projeto

4. **Utils**: O arquivo `utils.ts` (função `cn`) é copiado automaticamente se não existir

#### 📝 Exemplo Completo

```bash
# 1. Inicializar
npx flowtomic init
# ou
bunx flowtomic init

# 2. Ver componentes disponíveis
npx flowtomic list
# ou
bunx flowtomic list

# 3. Adicionar componentes
npx flowtomic add button card input
# ou
bunx flowtomic add button card input

# 4. Usar no código
```

```typescript
// src/components/ui/button.tsx (copiado automaticamente)
import { Button } from "@/components/ui/button";

function MyComponent() {
  return (
    <Button variant="default" size="sm">
      Clique aqui
    </Button>
  );
}
```

#### 🐛 Troubleshooting

### Problemas Comuns

- **Erro: "components.json não encontrado"**

  - **Solução**: **SEMPRE execute** `npx flowtomic init` ou `bunx flowtomic init` primeiro

- **Erro: "Não foi possível encontrar o repositório Flowtomic"**

  - **Solução**: **SEMPRE defina** a variável de ambiente `FLOWTOMIC_REPO_PATH` ou use caminho local

- **Erro: "Componente não encontrado"**

  - **Solução**: **SEMPRE verifique** a lista de componentes disponíveis com `npx flowtomic list`

- **Erro: "Imports não estão funcionando"**

  - **Solução**: **SEMPRE verifique** se os aliases no `components.json` estão corretos

- **Erro: "Storybook não encontra componente"**
  - **Solução**: **SEMPRE crie** arquivo `*.stories.tsx` na mesma pasta do componente/hook

### Soluções Detalhadas

#### Erro: "components.json não encontrado"

```bash
# SEMPRE execute init primeiro
npx flowtomic init
# ou
bunx flowtomic init
```

#### Erro: "Não foi possível encontrar o repositório Flowtomic"

```bash
# SEMPRE defina variável de ambiente
export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
npx flowtomic add button
# ou
bunx flowtomic add button
```

#### Erro: "Componente não encontrado"

```bash
# SEMPRE verifique lista de componentes disponíveis
npx flowtomic list
# ou
bunx flowtomic list
```

#### Erro: "Storybook não encontra componente"

- [ ] **SEMPRE verifique** se o arquivo `*.stories.tsx` existe
- [ ] **SEMPRE verifique** se o caminho do import está correto
- [ ] **SEMPRE verifique** se o componente está exportado corretamente

#### 🔗 Próximos Passos

Após adicionar componentes:

1. **Instalar dependências** necessárias (se houver)
2. **Configurar Tailwind CSS** (se ainda não estiver)
3. **Importar e usar** os componentes no seu projeto

## 📚 Publicação (Futuro)

Quando estiver pronto para publicar:

```bash
# Build todos os packages
bun run build

# Publicar (quando configurado)
cd packages/ui && npm publish
cd packages/logic && npm publish
cd cli && npm publish
```

## 🧪 Testes

```bash
# Executar testes
bun test

# Testes específicos
bun test packages/ui
bun test packages/logic
```

## 📋 Checklist para Novo Componente/Hook

### Checklist Obrigatório

- [ ] **SEMPRE crie** estrutura de pastas adequada
- [ ] **SEMPRE implemente** componente/hook com TypeScript
- [ ] **SEMPRE adicione** tipos TypeScript exportados
- [ ] **SEMPRE crie** arquivo `index.ts` para barrel export
- [ ] **SEMPRE crie** arquivo `*.stories.tsx` para Storybook (OBRIGATÓRIO)
- [ ] **SEMPRE exporte** em `index.ts` do package
- [ ] **SEMPRE atualize** `component-map.ts` no CLI
- [ ] **SEMPRE atualize** documentação principal

### Checklist Opcional (Recomendado)

- [ ] Criar testes unitários
- [ ] Documentar no README do package
- [ ] Adicionar exemplos de uso
- [ ] Verificar acessibilidade (para componentes UI)

## 📅 Atualizações

- **Última atualização**: 2025-11-09
- **Versão do guia**: 1.1.0
- **Próxima revisão**: 2025-12-09
