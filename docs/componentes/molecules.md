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

Mensagem de erro para formulários de autenticação, com `role="alert"` (o leitor de tela anuncia ao aparecer). `animated` entra com um fade curto por CSS (`tw-animate-css`) e some para quem pede menos movimento.

**Dependências**: `clsx`, `tailwind-merge`

### `social-login-buttons`

Botões de login social (Google, GitHub, etc.).

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `input-group`

Grupo de input com addons e botões integrados.

**Dependências**: `clsx`, `tailwind-merge`

### `numeric-filter-field`

Campo de filtro numérico que combina um operador (`eq`, `gt`, `lt`, `gte`, `lte`) com um valor formatado. Suporta número puro, moeda (BRL) e percentual, com separadores pt-BR. O operador tem nome acessível (“Operador”, cada símbolo lido por extenso) e o valor usa o `placeholder` como nome, ou “Valor”; `error` liga `aria-invalid` nos dois.

**Dependências**: `react-number-format`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/forms/numeric-filter-field`

### `text-editor`

Editor de texto com modo visual (TipTap), Markdown e prévia, em abas “Visual”, “Markdown” e “Prévia”. Botões da barra com nome acessível e `aria-pressed`; o seletor “Cor do texto” tem amostras nomeadas e “Remover cor”. As cores das amostras são valores fixos de propósito: são a cor que a pessoa escolhe para o próprio texto, não cor de interface.

**Dependências**: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-color`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`, `@tiptap/extension-text-align`, `@tiptap/extension-text-style`, `tiptap-markdown`, `streamdown`, `lucide-react`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/forms/text-editor`

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

Contêiner de resultado com cabeçalho, ações e conteúdo. Usa cantos de 10px, borda
semântica e nenhuma sombra em repouso; o cabeçalho usa `bg-surface`. A ação de fechar
tem nome acessível “Fechar”. As stories mostram o resultado dos testes do DataTable.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `message`

Mensagem com versões de resposta e anexos. A mensagem do usuário usa bolha `bg-muted`
com cantos de 10px; a resposta do assistente fica sem bolha. A navegação usa “Versão
anterior”, “Próxima versão” e contador em mono (“2 de 3”). Anexos sem nome usam
“Imagem” ou “Anexo”; a ação “Remover anexo” aparece no hover e no foco pelo teclado.

**Dependências**: `streamdown`, `lucide-react`, `clsx`, `tailwind-merge`, `ai`

### `chat-message`

Linha de log de chat com suporte a markdown: remetente na cor do texto, tipo como ponto de cor e rótulo (Narração, Ação, Fala por padrão; as chaves `STORY`, `ACTION` e `SAY` não mudam), horário em mono sem segundos e menu “Mais opções” que abre com clique e teclado. `badgeClassName` de um tipo pinta o ponto.

**Dependências**: `react-markdown`, `lucide-react`, `@radix-ui/react-dropdown-menu`, `clsx`, `tailwind-merge`

**Localização**: `packages/ui/src/components/molecules/data-display/chat-message`

**Características**:

- Suporte a markdown via ReactMarkdown
- Tipos de mensagem customizáveis (STORY, ACTION, SAY, etc.)
- Tipos e cores configuráveis
- Menu para editar, ver contexto e excluir
- Timestamp formatável
- Suporte a diferentes senders (Sistema, Mestre, NPC, etc.)

### `chat-input`

Caixa de mensagem de chat. Tipo de mensagem e modo são escolhas de rádio (não botões sólidos), então Enviar é o único sólido. Contador em mono com milhar pt-BR, que fica âmbar perto do limite, e atalhos curtos (`Ctrl+Enter` envia, `Esc` limpa).

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
- Cabeçalho opcional com título e descrição

### `edit-chat-message-modal`

Modal para editar uma mensagem de chat. Metadados (remetente, tipo, horário em mono) numa lista de definição; aviso de alterações não salvas; Cancelar contornado e Salvar sólido.

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

Lista de sugestões com rolagem horizontal. Por padrão, as ações são outline, têm
36px de altura e cantos de 8px, sem formato de pílula. `onClick` recebe o texto da
sugestão; `variant`, `size` e conteúdo customizado continuam disponíveis.

**Dependências**: `clsx`, `tailwind-merge`

### `sources`

Lista de fontes colapsável com contador em pt-BR (“Usou 1 fonte” / “Usou 2 fontes”).
O trigger usa texto neutro de 13px; os caminhos das fontes aparecem em mono com
ícone de link externo.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `tool`

Ferramenta colapsável com nome em mono e seções “Parâmetros”, “Resultado” e “Erro”.
Os estados são “Preparando”, “Executando”, “Aguardando aprovação”, “Respondida”,
“Concluída”, “Falhou” e “Negada”. O estado usa ponto de 7px e texto, com ícone girando
durante a execução. Sucesso, falha e aprovação usam seus tons semânticos; os demais
estados usam `muted-foreground`. O contêiner tem cantos de 10px e nenhuma sombra.

**Dependências**: `ai`, `lucide-react`, `clsx`, `tailwind-merge`

### `task`

Tarefa colapsável para mostrar as etapas de uma consulta. Os chips de arquivo usam
mono. As stories acompanham a revisão de ordenação e busca do DataTable.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `checkpoint`

Ponto de restauração com régua dos dois lados e ação ghost com ícone Bookmark.
As stories usam “Restaurar até aqui”. `CheckpointTrigger` inclui seu próprio
`TooltipProvider` quando recebe `tooltip`; o consumidor não precisa adicionar um.

**Dependências**: `lucide-react`, `clsx`, `tailwind-merge`

### `confirmation`

Pedido de aprovação de uma ação (“Permitir” / “Negar”), com os estados pedido, aceito e negado. `className` de `ConfirmationAction` soma com o padrão em vez de substituí-lo.

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
