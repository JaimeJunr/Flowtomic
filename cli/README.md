# flowtomic

CLI para instalação de componentes e hooks do Flowtomic em projetos.

## Instalação e Uso

### Via GitHub (sem publicar no npm)

```bash
# Inicializar configuração
bunx github:JaimeJunr/Flowtomic/cli init

# Ou se o repositório for privado/local
bunx /caminho/para/flowtomic/cli init
```

### Via npx (se publicado no npm)

```bash
npx flowtomic init
```

## Comandos

### `init`

Inicializa a configuração do Flowtomic no projeto, criando o arquivo `components.json`.

```bash
bunx github:JaimeJunr/Flowtomic/cli init
```

### `add`

Adiciona componentes ou hooks ao projeto. Os arquivos são copiados diretamente para o seu projeto, permitindo customização total (similar ao shadcn/ui).

```bash
# Adicionar um componente específico
bunx github:JaimeJunr/Flowtomic/cli add button

# Adicionar múltiplos componentes
bunx github:JaimeJunr/Flowtomic/cli add button card input

# Modo interativo (sem especificar componentes)
bunx github:JaimeJunr/Flowtomic/cli add
```

### `list`

Lista todos os componentes e hooks disponíveis.

```bash
bunx github:JaimeJunr/Flowtomic/cli list
```

## Como Funciona

O CLI copia os arquivos dos componentes/hooks do repositório Flowtomic diretamente para o seu projeto, permitindo customização total (similar ao shadcn/ui).

### Resolução do Repositório

O CLI tenta encontrar o repositório Flowtomic de várias formas:

1. **Variável de ambiente** `FLOWTOMIC_REPO_PATH`

   ```bash
   export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic
   bunx github:JaimeJunr/Flowtomic/cli add button
   ```

2. **Caminho relativo** (se executado do repositório)

3. **Caminhos padrão** (desenvolvimento local)

## Configuração

O comando `init` cria um arquivo `components.json` na raiz do projeto:

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

## Componentes Disponíveis

### Atoms

- button
- badge
- input
- card
- checkbox
- skeleton
- table
- tabs
- alert
- alert-dialog
- dialog
- dropdown-menu
- sonner

### Molecules

- button-group
- password-input
- image-dropzone
- stat-card
- data-table
- menu-dock
- theme-toggle-button

### Organisms

- dashboard-layout
- stats-grid
- monthly-summary
- dashboard-header-actions
- dashboard-movements-section

### Hooks

- use-stat-card

## Exemplo de Uso

```bash
# 1. Inicializar
bunx github:JaimeJunr/Flowtomic/cli init

# 2. Adicionar componentes
bunx github:JaimeJunr/Flowtomic/cli add button card input

# 3. Usar no projeto
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

## Desenvolvimento

Para desenvolver o CLI localmente:

```bash
cd flowtomic/cli
bun install
bun run dev
bun run build
```
