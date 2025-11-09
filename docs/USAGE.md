# 🦁 Guia de Uso do Flowtomic

## 📦 Estrutura do Monorepo

```
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

1. Criar estrutura em `packages/ui/src/components/button/`:

```bash
mkdir -p packages/ui/src/components/button
```

2. Criar arquivos:

   - `button.tsx` - Componente
   - `index.ts` - Barrel export

3. Exportar em `packages/ui/src/index.ts`:

```ts
export { Button, buttonVariants } from "./components/button";
export type { ButtonProps } from "./components/button";
```

## 🎣 Adicionar Novo Hook

1. Criar estrutura em `packages/logic/src/hooks/useThemeToggle/`:

```bash
mkdir -p packages/logic/src/hooks/useThemeToggle
```

2. Criar arquivos:

   - `useThemeToggle.ts` - Hook
   - `index.ts` - Barrel export

3. Exportar em `packages/logic/src/index.ts`:

```ts
export { useThemeToggle } from "./hooks/useThemeToggle";
export type { UseThemeToggleReturn } from "./hooks/useThemeToggle";
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

**Molecules (10)**

- `button-group` - Grupo de botões
- `password-input` - Input de senha
- `image-dropzone` - Upload de imagem
- `stat-card` - Card de estatística
- `data-table` - Tabela avançada
- `menu-dock` - Dock de menu
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

**Erro: "components.json não encontrado"**

```bash
npx flowtomic init
# ou
bunx flowtomic init
```

**Erro: "Não foi possível encontrar o repositório Flowtomic"**

```bash
# Definir variável de ambiente
export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
npx flowtomic add button
# ou
bunx flowtomic add button
```

**Erro: "Componente não encontrado"**

```bash
# Ver lista de componentes disponíveis
npx flowtomic list
# ou
bunx flowtomic list
```

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

- [ ] Criar estrutura de pastas
- [ ] Implementar componente/hook
- [ ] Adicionar tipos TypeScript
- [ ] Exportar em `index.ts` do package
- [ ] Criar testes (opcional)
- [ ] Documentar no README do package
- [ ] Atualizar documentação principal
