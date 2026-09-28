# 🧬 Molecules - Componentes Compostos

Componentes moleculares do Flowtomic. São combinações de atoms que formam componentes mais complexos.

## 📦 Componentes Disponíveis (36)

### `button-group`

Grupo de botões para ações relacionadas.

**Dependências**: `clsx`, `tailwind-merge`

### `password-input`

Input de senha com toggle de visibilidade.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `image-dropzone`

Área de upload de imagem com drag and drop.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `stat-card`

Uma métrica no desenho da célula do `stats-grid`: rótulo, número em mono na cor do texto e variação colorida pelo sentido do que é bom (`positive: false` quando subir é ruim). `color` está obsoleto e é ignorado.

**Dependências**: `flowtomic/logic`, `lucide-react`, `clsx`, `tailwind-merge`

### `data-table`

Tabela com ordenação (pelo teclado também), busca e paginação. Régua de 1px, sem sombra e sem fundo no cabeçalho.

**Dependências**: `@tanstack/react-table`, `lucide-react`, `clsx`, `tailwind-merge`

### `menu-dock`

Dock de menu para navegação.

**Dependências**: `clsx`, `tailwind-merge`

### `theme-toggle-button`

Botão para alternar entre temas claro/escuro com suporte avançado à API visual de transições "Circle Blur" suavizadas.

**Uso de Estado Externo**:
O componente visual do Flowtomic UI não possui estado interno de controle do tema da aplicação, necessitando que você implemente a integração do estado (`theme`) bem como as chamadas pass-through de atualização (`onThemeChange`).

Exemplo prático de implementação com um hook externo `useThemeToggle`:

```tsx
import { ThemeToggleButton } from "@flowtomic/ui";
import { useThemeToggle } from "@/hooks/useThemeToggle"; // Seu hook de controle local de tema

export function ThemeButton() {
  const { theme, setTheme } = useThemeToggle();

  return <ThemeToggleButton theme={theme} onThemeChange={setTheme} />;
}
```

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `auth-navigation-link`

Link de navegação para páginas de autenticação.

**Dependências**: `clsx`, `tailwind-merge`

### `auth-form-error-message`

Mensagem de erro para formulários de autenticação.

**Dependências**: `clsx`, `tailwind-merge`

### `social-login-buttons`

Botões de login social (Google, GitHub, etc.).

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `input-group`

Grupo de input com addons e botões integrados.

**Dependências**: `clsx`, `tailwind-merge`

### `numeric-filter-field`

Campo de filtro numérico que combina um operador (`eq`, `gt`, `lt`, `gte`, `lte`) com um valor formatado. Suporta número puro, moeda (BRL) e percentual, com separadores pt-BR.

**Dependências**: `react-number-format`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/forms/numeric-filter-field`

### `inline-datetime-editor`

Editor inline de data e hora. Exibe o valor formatado e, ao ativar a edição, alterna para `date-input` + `time-input` com botões Salvar/Cancelar. O estado de edição é controlado pelo parent via `isEditing`/`onStartEdit`; o valor trafega em ISO-8601.

**Dependências**: `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/forms/inline-datetime-editor`

### `autocomplete`

Campo de autocomplete com busca e filtragem avançada. Usa hook headless `useAutocomplete` do `@flowtomic/logic`. Suporta API antiga (options) e composição (Compound Components), filtragem customizada, valores personalizados, loading assíncrono e acessibilidade completa.

**Componentes exportados**:

- `Autocomplete` - Componente principal
- `Autocomplete.List` - Container da lista
- `Autocomplete.Item` - Item individual do autocomplete
- `Autocomplete.Section` - Seção para agrupamento de itens
- `Autocomplete.Empty` - Estado vazio customizável
- `Autocomplete.Loading` - Estado de loading customizável

**Dependências**:

- `@radix-ui/react-popover`
- `flowtomic/logic` (hook `useAutocomplete`)
- `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/forms/autocomplete`

### `artifact`

Container de artifact com header, actions e conteúdo.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `message`

Componente de mensagem com suporte a branches e attachments.

**Dependências**: `streamdown`, `lucide-react`, `clsx`, `tailwind-merge`, `ai`

### `chat-message`

Componente genérico de mensagem de chat com suporte a markdown, tipos de mensagem customizáveis, badges e context menu.

**Dependências**: `react-markdown`, `lucide-react`, `@radix-ui/react-context-menu`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/data-display/chat-message`

**Características**:

- Suporte a markdown via ReactMarkdown
- Tipos de mensagem customizáveis (STORY, ACTION, SAY, etc.)
- Badges e cores configuráveis
- Context menu para editar/visualizar/deletar
- Timestamp formatável
- Suporte a diferentes senders (Sistema, Mestre, NPC, etc.)

### `chat-input`

Componente de input para chat com suporte a tipos de mensagem, modos customizáveis, contador de caracteres e atalhos de teclado.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/forms/chat-input`

**Características**:

- Textarea com auto-resize
- Contador de caracteres
- Seleção de tipo de mensagem (opcional)
- Modos customizáveis (opcional)
- Atalhos de teclado configuráveis (Ctrl+Enter para enviar, ESC para limpar)
- Botão de envio
- Suporte a indicadores customizados (triggers, etc.)
- Header opcional com título e descrição

### `edit-chat-message-modal`

Modal genérico para editar mensagens de chat com validação de alterações não salvas e exibição de metadados.

**Dependências**: `@radix-ui/react-dialog`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/feedback/edit-chat-message-modal`

**Características**:

- Modal para editar mensagens
- Exibição de metadados da mensagem (sender, tipo, timestamp)
- Textarea para edição
- Validação de alterações não salvas
- Callbacks para salvar/cancelar
- Formatação customizável de timestamp e badges

### `suggestion`

Lista de sugestões com scroll horizontal.

**Dependências**: `clsx`, `tailwind-merge`

### `sources`

Lista de fontes colapsável.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `tool`

Display de tool com collapsible para mostrar input/output.

**Dependências**: `ai`, `lucide-react`, `clsx`, `tailwind-merge`

### `task`

Item de task com collapsible para mostrar detalhes.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `checkpoint`

Checkpoint display com ícone e trigger.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `confirmation`

Confirmation dialog wrapper para aprovação de ações.

**Dependências**: `ai`, `clsx`, `tailwind-merge`

### Animation

#### `animated-modal`

Modal com animações suaves de entrada e saída.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/animation/animated-modal`

#### `animated-sliding-number`

Número com animação de deslizamento usando motion.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/animation/animated-sliding-number`

#### `button-counter`

Contador com botões de incremento/decremento.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/animation/button-counter`

### Data Display

#### `calendar-popover`

Seletor de data única em popover, com botão gatilho formatado em pt-BR. Permite desabilitar datas por função ou por conjunto (`disabledDates`), além de estados de carregamento. Por padrão bloqueia datas futuras e fins de semana (`disableFuture` e `disableWeekends`).

**Dependências**: `date-fns`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/data-display/calendar-popover`

#### `calendar-range`

Seletor de intervalo de datas em popover, com atalhos opcionais de intervalo rápido (`showQuickRanges`) e tooltip para datas desabilitadas. Aceita `Matcher` do `react-day-picker` para regras de bloqueio.

**Dependências**: `date-fns`, `react-day-picker`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/data-display/calendar-range`

#### `bar-chart`

Gráfico de barras em SVG puro. `showValues` mostra o número sem unidade; barra de valor zero vira um traço na linha de base.

**Dependências**: nenhuma além do `cn`

**Localização**: `packages/ui/src/components/molecules/data-display/bar-chart`

#### `circular-progress-chart`

Anel de progresso em SVG puro. A porcentagem fica sempre no centro, em mono; `label` e `legend` ficam subordinados.

**Dependências**: nenhuma além do `cn`

**Localização**: `packages/ui/src/components/molecules/data-display/circular-progress-chart`

#### `project-list`

Lista densa de projetos: nome, prazo em pt-BR e estado. Prazo passado de projeto não concluído aparece como "venceu dd/mm/aaaa" em vermelho. `iconColor` está obsoleto e é ignorado.

**Dependências**: `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/project-list`

#### `team-member-list`

Lista densa de quem está na equipe: nome, tarefa atual e estado, com régua de 1px entre as linhas. A foto só aparece quando todas as pessoas têm `avatar`.

**Dependências**: `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/team-member-list`

#### `reminder-card`

Lista de lembretes: horário em mono, título e descrição, e uma ação contornada por linha (não sólida).

**Dependências**: `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/reminder-card`

#### `time-tracker`

Timer com o hook headless useTimeTracker. Mostra o estado (Parado, Contando, Pausado) e o tempo em mono; o botão principal troca de rótulo no mesmo lugar e Parar fica contornado.

**Dependências**: `@flowtomic/logic`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/time-tracker`

#### `chart-area-interactive`

Gráfico de área (Recharts) com o seletor de período (7 dias, 30 dias, 3 meses) em botões sempre visíveis, inclusive no celular. Cores do tema (`--primary`, `--muted-foreground`), preenchimento chapado e datas em pt-BR sem o erro de fuso.

**Dependências**: `recharts`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/data-display/chart-area-interactive`

#### `chart-bar-interactive`

Gráfico de barras (Recharts) com um botão por série, que mostra o total em mono e marca a série ativa com `aria-pressed`. Cores do tema e datas em pt-BR.

**Dependências**: `recharts`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/data-display/chart-bar-interactive`

#### `draggable-widget`

Widget arrastável de painel. Parado, só a borda fina; a sombra aparece só enquanto arrasta. Os controles de edição têm nome acessível e aparecem também pelo teclado.

**Dependências**: `@dnd-kit/core`, `@dnd-kit/utilities`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/draggable-widget`

### Layout

#### `dashboard-header`

Header com busca, mensagens, notificações e o usuário. O atalho de busca só aparece se `searchShortcut` for passado; o menu do perfil só existe com `onProfileClick` e tem apenas "Perfil".

**Dependências**: `input`, `button`, `dropdown-menu`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/layout/dashboard-header`

### Navigation

#### `sidebar-navigation`

Menu lateral: nome do app, navegação principal e itens de conta, com item de 44px. O ativo usa o tom urucum pelos tokens `--sidebar-*` do tema. `mobileAppCard` está obsoleto.

**Dependências**: `button`, `card`, `sidebar`, `separator`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/navigation/sidebar-navigation`

### `connection`

Componente ConnectionLineComponent do @xyflow/react para renderizar linhas de conexão temporárias.

**Dependências**: `@xyflow/react`, `clsx`, `tailwind-merge`

### `canvas`

Wrapper do ReactFlow do @xyflow/react para visualização de grafos.

**Dependências**: `@xyflow/react`

**Nota**: Requer importação de CSS: `@xyflow/react/dist/style.css`

### `animated-shiny-text` (Typography)

Texto com efeito shimmer animado para destacar conteúdo. Implementação especializada que usa o componente atômico Shimmer.

**Dependências**: `motion`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/typography/animated-shiny-text`

### `bar-chart` (Data Display)

Gráfico de barras em SVG puro. `showValues` mostra o número sem unidade; barra de valor zero vira um traço na linha de base.

**Dependências**: nenhuma além do `cn`

**Localização**: `packages/ui/src/components/molecules/data-display/bar-chart`

### `circular-progress-chart` (Data Display)

Anel de progresso em SVG puro. A porcentagem fica sempre no centro, em mono; `label` e `legend` ficam subordinados.

**Dependências**: nenhuma além do `cn`

**Localização**: `packages/ui/src/components/molecules/data-display/circular-progress-chart`

### `time-tracker` (Data Display)

Timer com o hook headless useTimeTracker. Mostra o estado (Parado, Contando, Pausado) e o tempo em mono; o botão principal troca de rótulo no mesmo lugar e Parar fica contornado.

**Dependências**: `@flowtomic/logic`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/time-tracker`

### `project-list` (Data Display)

Lista densa de projetos: nome, prazo em pt-BR e estado. Prazo passado de projeto não concluído aparece como "venceu dd/mm/aaaa" em vermelho. `iconColor` está obsoleto e é ignorado.

**Dependências**: `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/project-list`

### `team-member-list` (Data Display)

Lista densa de quem está na equipe: nome, tarefa atual e estado, com régua de 1px entre as linhas. A foto só aparece quando todas as pessoas têm `avatar`.

**Dependências**: `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/team-member-list`

### `reminder-card` (Data Display)

Lista de lembretes: horário em mono, título e descrição, e uma ação contornada por linha (não sólida).

**Dependências**: `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/reminder-card`

### `sidebar-navigation` (Navigation)

Menu lateral: nome do app, navegação principal e itens de conta, com item de 44px. O ativo usa o tom urucum pelos tokens `--sidebar-*` do tema. `mobileAppCard` está obsoleto.

**Dependências**: `button`, `card`, `sidebar`, `separator`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/navigation/sidebar-navigation`

### `dashboard-header` (Layout)

Header com busca, mensagens, notificações e o usuário. O atalho de busca só aparece se `searchShortcut` for passado; o menu do perfil só existe com `onProfileClick` e tem apenas "Perfil".

**Dependências**: `input`, `button`, `dropdown-menu`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/layout/dashboard-header`

## 🚀 Instalação

```bash
# Instalar uma molecule específica
npx flowtomic@latest add button-group

# Instalar múltiplas molecules
npx flowtomic@latest add button-group password-input stat-card
```

## 📖 Exemplos de Uso

```typescript
import { ButtonGroup } from "@/components/ui/button-group";
import { PasswordInput } from "@/components/ui/password-input";
import { StatCard } from "@/components/ui/stat-card";

export function Example() {
  return (
    <div>
      <ButtonGroup>
        <Button>Opção 1</Button>
        <Button>Opção 2</Button>
        <Button>Opção 3</Button>
      </ButtonGroup>

      <PasswordInput placeholder="Digite sua senha" />

      <StatCard title="Total de Vendas" value="R$ 10.000" icon={TrendingUp} />
    </div>
  );
}
```
