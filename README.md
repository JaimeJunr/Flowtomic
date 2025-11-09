# ⚛️ Flowtomic Monorepo

Biblioteca de componentes UI e hooks reutilizáveis para projetos React/TypeScript.

## 📦 Estrutura

```text
flowtomic/
├── packages/
│   ├── ui/          # Componentes UI (flowtomic/ui)
│   └── logic/       # Hooks e lógica (flowtomic/logic)
└── cli/             # CLI para instalação (flowtomic)
```

## 🚀 Instalação via CLI

### Uso Direto (Recomendado)

```bash
# Inicializar configuração
npx flowtomic@latest init
# ou
bunx flowtomic@latest init

# Adicionar componentes
npx flowtomic@latest add button card input
# ou
bunx flowtomic@latest add button card input

# Adicionar blocks
npx flowtomic@latest add-block dashboard-01
# ou
bunx flowtomic@latest add-block dashboard-01

# Listar componentes e blocks disponíveis
npx flowtomic@latest list
# ou
bunx flowtomic@latest list
```

### Via shadcn CLI (Compatível)

```bash
# Usar o registry do Flowtomic com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

**Nota:** O CLI automaticamente baixa o repositório do GitHub quando necessário (via variável de ambiente ou caminho local).

## 📚 Componentes Disponíveis

### Atoms (13)

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

### Molecules (10)

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

### Organisms (5)

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações

### Hooks (1)

- `use-stat-card` - Hook para StatCard

### Blocks (1)

- `dashboard-01` - Dashboard simples com cards

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

# Servidor do registry (para desenvolvimento)
bun run registry:server
```

### CLI

```bash
cd cli
bun run dev      # Modo desenvolvimento
bun run build    # Build
bun run type-check
```

## 📖 Documentação

- [docs/USAGE.md](./docs/USAGE.md) - Guia completo de uso do monorepo e CLI
- [cli/README.md](./cli/README.md) - Documentação detalhada do CLI

## 🎯 Como Funciona

O CLI copia os arquivos dos componentes diretamente para o seu projeto (similar ao shadcn/ui), permitindo customização total. Os imports são automaticamente ajustados para usar os aliases do seu projeto.

## 📝 Exemplos

### Adicionar Componentes

```bash
# 1. Inicializar
npx flowtomic@latest init

# 2. Adicionar componentes
npx flowtomic@latest add button card input

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
npx flowtomic@latest add-block dashboard-01
```

O block será instalado com todos os seus arquivos e dependências.

### Usar com shadcn CLI

```bash
# Instalar via shadcn CLI (compatível)
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

## 🔗 Links

- [Documentação do CLI](./cli/README.md)
- [Guia de Uso Completo](./docs/USAGE.md)
- [Guia de Deploy](./docs/DEPLOYMENT.md)
- [Registry](./registry/README.md)

## 📦 Publicação

### CLI no npm

O CLI está publicado como `flowtomic`:

```bash
npx flowtomic@latest init
npx flowtomic@latest add button
npx flowtomic@latest add-block dashboard-01
```

### Registry

O registry está disponível em `https://registry.flowtomic.dev`:

```bash
# Usar com shadcn CLI
npx shadcn@latest add https://registry.flowtomic.dev/all.json
```

Para mais informações sobre publicação e deploy, veja [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).
