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

Card de estatística com ícone e valor.

**Dependências**: `flowtomic/logic`, `lucide-react`, `clsx`, `tailwind-merge`

### `data-table`

Tabela avançada com funcionalidades de ordenação e filtro.

**Dependências**: `@tanstack/react-table`, `lucide-react`, `clsx`, `tailwind-merge`

### `menu-dock`

Dock de menu para navegação.

**Dependências**: `clsx`, `tailwind-merge`

### `theme-toggle-button`

Botão para alternar entre temas claro/escuro.

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

#### `bar-chart`

Gráfico de barras simples para analytics usando SVG puro.

**Dependências**: `card`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/bar-chart`

#### `circular-progress-chart`

Gráfico circular de progresso usando SVG puro.

**Dependências**: `card`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/circular-progress-chart`

#### `project-list`

Lista de projetos com ícones, datas e ações.

**Dependências**: `card`, `button`, `badge`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/project-list`

#### `team-member-list`

Lista de membros da equipe com avatares, nomes, tarefas e status.

**Dependências**: `card`, `avatar`, `badge`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/team-member-list`

#### `reminder-card`

Card de lembretes com horário e botão de ação.

**Dependências**: `card`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/reminder-card`

#### `time-tracker`

Timer com controles de pause/stop usando o hook headless useTimeTracker.

**Dependências**: `@flowtomic/logic`, `card`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/time-tracker`

### Layout

#### `dashboard-header`

Header com busca, notificações e perfil do usuário.

**Dependências**: `input`, `button`, `avatar`, `badge`, `dropdown-menu`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/layout/dashboard-header`

### Navigation

#### `sidebar-navigation`

Menu lateral completo com logo, seções de navegação e card de download mobile.

**Dependências**: `button`, `card`, `sidebar`, `lucide-react`

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

Gráfico de barras simples para analytics usando SVG puro.

**Dependências**: `card`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/bar-chart`

### `circular-progress-chart` (Data Display)

Gráfico circular de progresso usando SVG puro.

**Dependências**: `card`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/circular-progress-chart`

### `time-tracker` (Data Display)

Timer com controles de pause/stop usando o hook headless useTimeTracker.

**Dependências**: `@flowtomic/logic`, `card`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/time-tracker`

### `project-list` (Data Display)

Lista de projetos com ícones, datas e ações.

**Dependências**: `card`, `button`, `badge`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/project-list`

### `team-member-list` (Data Display)

Lista de membros da equipe com avatares, nomes, tarefas e status.

**Dependências**: `card`, `avatar`, `badge`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/team-member-list`

### `reminder-card` (Data Display)

Card de lembretes com horário e botão de ação.

**Dependências**: `card`, `button`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/data-display/reminder-card`

### `sidebar-navigation` (Navigation)

Menu lateral completo com logo, seções de navegação e card de download mobile.

**Dependências**: `button`, `card`, `sidebar`, `lucide-react`

**Localização**: `packages/ui/src/components/molecules/navigation/sidebar-navigation`

### `dashboard-header` (Layout)

Header com busca, notificações e perfil do usuário.

**Dependências**: `input`, `button`, `avatar`, `badge`, `dropdown-menu`, `lucide-react`

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
