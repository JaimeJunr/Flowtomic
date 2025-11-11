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

### Atoms (26)

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
- `tooltip` - Tooltip para informações adicionais
- `command` - Command palette/menu
- `collapsible` - Container colapsável
- `scroll-area` - Área de scroll customizada
- `hover-card` - Card que aparece ao passar o mouse
- `separator` - Separador horizontal/vertical
- `loader` - Loading spinner animado
- `shimmer` - Texto com efeito shimmer
- `code-block` - Bloco de código com syntax highlighting
- `inline-citation` - Citação inline com hover card
- `dropdown-menu` - Menu dropdown
- `sonner` - Toast notifications
- `select` - Campo de seleção
- `animated-shiny-text` - Texto com efeito shimmer animado
- `progress` - Barra de progresso

### Molecules (19)

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
- `input-group` - Grupo de input com addons
- `artifact` - Container de artifact
- `message` - Componente de mensagem com branches
- `suggestion` - Lista de sugestões
- `sources` - Lista de fontes colapsável
- `tool` - Display de tool
- `task` - Item de task
- `checkpoint` - Checkpoint display
- `confirmation` - Confirmation dialog wrapper

### Organisms (24)

- `dashboard-layout` - Layout de dashboard
- `stats-grid` - Grid de estatísticas
- `monthly-summary` - Resumo mensal
- `dashboard-header-actions` - Ações do header
- `dashboard-movements-section` - Seção de movimentações
- `resizable` - Componente redimensionável com sidebar
- `conversation` - Container de conversa
- `model-selector` - Seletor de modelo
- `image` - Display de imagem gerada
- `open-in-chat` - Dropdown para abrir em outras plataformas
- `panel` - Panel do @xyflow/react
- `toolbar` - Toolbar do @xyflow/react
- `controls` - Controls do @xyflow/react
- `connection` - Connection do @xyflow/react
- `queue` - Fila de mensagens e tarefas
- `reasoning` - Exibição de raciocínio do modelo
- `plan` - Exibição de planos do modelo
- `web-preview` - Visualizador de páginas web
- `chain-of-thought` - Cadeia de raciocínio
- `context` - Uso de contexto/tokens do modelo
- `prompt-input` - Input de prompt complexo
- `canvas` - Canvas do ReactFlow
- `node` - Node do ReactFlow
- `edge` - Edge do ReactFlow

### Hooks (6)

- `use-stat-card` - Hook para StatCard
- `use-mobile` - Hook para detectar dispositivos móveis
- `use-react-table-back` - Hook para tabelas com paginação/ordenação no backend
- `use-react-table-front` - Hook para tabelas com paginação/ordenação no frontend
- `use-resizable` - Hook para componentes redimensionáveis
- `use-theme-transition` - Hook para transições de tema com View Transitions API

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

O Flowtomic fornece um **estilo padrão** que funciona imediatamente, mas permite **customização total** dos componentes conforme sua preferência.

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
- [Guia de Desenvolvimento](./docs/desenvolvimento/guia.md)
- [Guia de Deploy](./docs/deploy/DEPLOYMENT.md)
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

Para mais informações sobre publicação e deploy, veja [docs/deploy/DEPLOYMENT.md](./docs/deploy/DEPLOYMENT.md).

---

Desenvolvido com ❤️ e ☕ por [JaimeJunr](https://github.com/JaimeJunr)
