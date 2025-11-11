# ⚛️ Atoms - Componentes Básicos

Componentes atômicos básicos do Flowtomic. São os blocos fundamentais da interface.

Os atoms estão organizados em categorias lógicas para facilitar a navegação e manutenção:

- **Actions** - Componentes de ação (botões, badges, menus)
- **Forms** - Componentes de formulário (inputs, selects, checkboxes)
- **Display** - Componentes de exibição (cards, tabelas, avatares)
- **Navigation** - Componentes de navegação (tabs, command)
- **Feedback** - Componentes de feedback (alerts, dialogs, tooltips)
- **Animation** - Componentes de animação (loaders, progress, shimmer)
- **Typography** - Componentes de tipografia (textos animados)
- **Code** - Componentes de código (code blocks)
- **Layout** - Componentes de layout (collapsible, scroll-area, resizable)

## 📦 Componentes Disponíveis

### Actions

#### `button`

Botão com variantes de estilo e tamanho.

**Dependências**: `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/actions/button`

#### `badge`

Badge/etiqueta para destacar informações.

**Dependências**: `class-variance-authority`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/actions/badge`

#### `dropdown-menu`

Menu dropdown para ações e navegação.

**Dependências**: `@radix-ui/react-dropdown-menu`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/actions/dropdown-menu`

### Forms

#### `input`

Campo de entrada de texto.

**Dependências**: `@radix-ui/react-label`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/input`

#### `select`

Campo de seleção com suporte a grupos e busca.

**Dependências**: `@radix-ui/react-select`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/select`

#### `checkbox`

Checkbox para seleção múltipla.

**Dependências**: `@radix-ui/react-checkbox`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/checkbox`

#### `autocomplete`

Campo de autocomplete com busca e filtragem.

**Dependências**: `@radix-ui/react-popover`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/autocomplete`

### Display

#### `card`

Container de card para agrupar conteúdo.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/card`

#### `table`

Tabela base para exibição de dados.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/table`

#### `separator`

Separador horizontal ou vertical.

**Dependências**: `@radix-ui/react-separator`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/separator`

#### `skeleton`

Componente de loading skeleton.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/skeleton`

#### `avatar`

Componente de avatar com imagem e fallback.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/avatar`

### Navigation

#### `tabs`

Sistema de abas para organização de conteúdo.

**Dependências**: `@radix-ui/react-tabs`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/tabs`

#### `command`

Command palette/menu para busca e navegação rápida.

**Dependências**: `cmdk`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/command`

### Feedback

#### `alert`

Alerta para exibir mensagens importantes.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/alert`

#### `alert-dialog`

Diálogo de confirmação para ações importantes.

**Dependências**: `@radix-ui/react-alert-dialog`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/alert-dialog`

#### `dialog`

Modal/diálogo para exibir conteúdo sobreposto.

**Dependências**: `@radix-ui/react-dialog`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/dialog`

#### `sonner`

Sistema de notificações toast.

**Dependências**: `sonner`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/sonner`

#### `tooltip`

Tooltip para exibir informações adicionais ao passar o mouse.

**Dependências**: `@radix-ui/react-tooltip`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/tooltip`

#### `hover-card`

Card que aparece ao passar o mouse sobre um elemento.

**Dependências**: `@radix-ui/react-hover-card`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/hover-card`

#### `inline-citation`

Citação inline com hover card para exibir fontes.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/inline-citation`

### Animation

#### `animated-3d`

Componente com animação 3D.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/animated-3d`

#### `backdrop-blur`

Componente com efeito de blur no fundo.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/backdrop-blur`

#### `loader`

Componente de loading spinner animado.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/loader`

#### `progress`

Barra de progresso animada.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/progress`

#### `shimmer`

Texto com efeito shimmer animado usando motion.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/shimmer`

#### `sliding-number`

Número com animação de deslizamento.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/sliding-number`

#### `counter`

Contador com botões de incremento/decremento.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/counter`

### Typography

#### `animated-number`

Número animado com transições suaves.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/typography/animated-number`

### Code

#### `code-block`

Bloco de código com syntax highlighting usando Shiki.

**Dependências**: `shiki`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/code/code-block`

### Layout

#### `collapsible`

Container colapsável para mostrar/ocultar conteúdo.

**Dependências**: `@radix-ui/react-collapsible`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/collapsible`

#### `scroll-area`

Área de scroll customizada com scrollbar estilizada.

**Dependências**: `@radix-ui/react-scroll-area`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/scroll-area`

#### `resizable`

Componente redimensionável com painéis.

**Dependências**: `react-resizable-panels`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/resizable`

## 🚀 Instalação

```bash
# Instalar um atom específico
npx flowtomic@latest add button

# Instalar múltiplos atoms
npx flowtomic@latest add button badge input card
```

## 📖 Exemplos de Uso

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite algo..." />
        <Button>Enviar</Button>
      </CardContent>
    </Card>
  );
}
```

## 📁 Estrutura de Pastas

Os atoms estão organizados em categorias dentro de `packages/ui/src/components/atoms/`:

```
atoms/
├── actions/          # Componentes de ação
├── forms/            # Componentes de formulário
├── display/          # Componentes de exibição
├── navigation/       # Componentes de navegação
├── feedback/         # Componentes de feedback
├── animation/         # Componentes de animação
├── typography/        # Componentes de tipografia
├── code/              # Componentes de código
└── layout/            # Componentes de layout
```

Cada componente possui sua própria pasta com:
- Arquivo principal do componente (`.tsx`)
- Arquivo de story (`.stories.tsx`)
- Arquivo de exportação (`index.ts`)
