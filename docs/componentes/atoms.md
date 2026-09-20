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

#### `context-menu`

Menu de contexto que aparece ao clicar com botão direito.

**Dependências**: `@radix-ui/react-context-menu`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/actions/context-menu`

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

#### `field`

Campo de formulário completo com label, input e mensagem de erro.

**Dependências**: `class-variance-authority`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/field`

#### `form`

Wrapper de formulário com React Hook Form e validação.

**Dependências**: `@radix-ui/react-label`, `@radix-ui/react-slot`, `react-hook-form`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/form`

#### `input-otp`

Input para códigos OTP (One-Time Password) com múltiplos campos.

**Dependências**: `input-otp`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/input-otp`

#### `label`

Label para formulários com suporte a Radix UI.

**Dependências**: `@radix-ui/react-label`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/label`

#### `radio-group`

Grupo de radio buttons para seleção única.

**Dependências**: `@radix-ui/react-radio-group`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/radio-group`

#### `slider`

Slider de valores numéricos com controle deslizante.

**Dependências**: `@radix-ui/react-slider`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/slider`

#### `switch`

Switch toggle para alternar estados.

**Dependências**: `@radix-ui/react-switch`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/switch`

#### `textarea`

Campo de texto multilinha.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/textarea`

#### `toggle`

Toggle button para ações de alternância.

**Dependências**: `@radix-ui/react-toggle`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/toggle`

#### `date-input`

Entrada de data (`input type="date"`) com estilo do design system. Quando `disabled`, um overlay bloqueia a interação sem usar o atributo nativo, mantendo o ícone do calendário visível.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/date-input`

#### `time-input`

Entrada de hora (`input type="time"`) com estilo do design system. Segue a mesma estratégia de `date-input` para o estado desabilitado, preservando o ícone nativo do relógio.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/forms/time-input`

### Data Display

#### `calendar`

Calendário para seleção de datas.

**Dependências**: `react-day-picker`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/data-display/calendar`

#### `carousel`

Carrossel para exibir conteúdo em slides.

**Dependências**: `embla-carousel-react`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/data-display/carousel`

#### `chart`

Componente base para gráficos usando Recharts.

**Dependências**: `recharts`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/data-display/chart`

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

#### `empty`

Componente para exibir estado vazio.

**Dependências**: `class-variance-authority`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/empty`

#### `kbd`

Componente para exibir teclas de atalho.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/display/kbd`

### Navigation

#### `tabs`

Sistema de abas para organização de conteúdo.

**Dependências**: `@radix-ui/react-tabs`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/tabs`

#### `command`

Command palette/menu para busca e navegação rápida.

**Dependências**: `cmdk`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/command`

#### `breadcrumb`

Breadcrumb navigation para indicar localização na hierarquia.

**Dependências**: `@radix-ui/react-slot`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/breadcrumb`

#### `menubar`

Barra de menu horizontal para navegação.

**Dependências**: `@radix-ui/react-menubar`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/menubar`

#### `navigation-menu`

Menu de navegação com suporte a dropdowns e links.

**Dependências**: `@radix-ui/react-navigation-menu`, `class-variance-authority`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/navigation-menu`

#### `pagination`

Paginação para navegar entre páginas de resultados.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/navigation/pagination`

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

Tooltip para exibir informações adicionais ao passar o mouse. Suporta dois modos:

- **Modo padrão (Radix UI)**: Tooltip tradicional com posicionamento automático
- **Modo seguimento do mouse (React Aria)**: Tooltip que segue o cursor com posicionamento inteligente e animações do Aceternity UI

**Componentes exportados**:

- `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent`, `TooltipPortal` - API padrão do Radix UI
- `TooltipWithMouseFollow` - Componente standalone com seguimento do mouse usando React Aria

**Dependências**:

- `@radix-ui/react-tooltip` (modo padrão)
- `@react-aria/tooltip`, `@react-aria/interactions`, `@react-aria/overlays`, `@react-stately/tooltip` (modo seguimento do mouse)
- `motion/react` (animações)
- `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/tooltip`

#### `hover-card`

Card que aparece ao passar o mouse sobre um elemento.

**Dependências**: `@radix-ui/react-hover-card`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/hover-card`

#### `inline-citation`

Citação inline com hover card para exibir fontes.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/inline-citation`

#### `popover`

Popover flutuante para exibir conteúdo adicional.

**Dependências**: `@radix-ui/react-popover`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/popover`

#### `sheet`

Sheet lateral deslizante para exibir conteúdo.

**Dependências**: `@radix-ui/react-dialog`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/feedback/sheet`

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

#### `spinner`

Spinner animado para indicar carregamento.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/animation/spinner`

### Code

#### `code-block`

Bloco de código com syntax highlighting usando Shiki.

**Dependências**: `shiki`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/code/code-block`

#### `snippet`

Snippet de código inline com botão de copiar.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/code/snippet`

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

#### `accordion`

Container colapsável em acordeão para organizar conteúdo.

**Dependências**: `@radix-ui/react-accordion`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/accordion`

#### `aspect-ratio`

Container com proporção fixa para manter dimensões.

**Dependências**: `@radix-ui/react-aspect-ratio`

**Localização**: `packages/ui/src/components/atoms/layout/aspect-ratio`

#### `drawer`

Drawer lateral deslizante para mobile.

**Dependências**: `vaul`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/drawer`

#### `sidebar`

Sidebar navegável com suporte a responsividade.

**Dependências**: `@radix-ui/react-slot`, `class-variance-authority`, `lucide-react`, `@flowtomic/logic`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/sidebar`

#### `toggle-group`

Grupo de toggles para seleção múltipla.

**Dependências**: `@radix-ui/react-toggle-group`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/atoms/layout/toggle-group`

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
├── animation/        # Componentes de animação
├── code/             # Componentes de código
├── data-display/     # Componentes de exibição de dados
├── display/          # Componentes de exibição
├── feedback/         # Componentes de feedback
├── forms/            # Componentes de formulário
├── layout/           # Componentes de layout
└── navigation/       # Componentes de navegação
```

Cada componente possui sua própria pasta com:

- Arquivo principal do componente (`.tsx`)
- Arquivo de story (`.stories.tsx`)
- Arquivo de exportação (`index.ts`)
