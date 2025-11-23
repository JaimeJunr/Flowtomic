# 🪝 Hooks - Hooks Headless

Hooks headless do Flowtomic para lógica reutilizável sem dependências de UI.

## 📦 Hooks Disponíveis (11)

### `use-animated-indicator`

Hook para gerenciar indicadores animados com estados e transições.

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useAnimatedIndicator`

**Características**:

- Estados de indicador (idle, loading, success, error)
- Transições suaves entre estados
- Callbacks para mudanças de estado
- Controle de animação

### `use-genealogy`

Hook para gerenciar genealogia/hierarquia de elementos com relacionamentos.

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useGenealogy`

**Características**:

- Gerenciamento de hierarquia de elementos
- Relacionamentos pai-filho
- Navegação entre elementos
- Busca e filtragem

### `use-stat-card`

Hook para gerenciar estado e lógica do componente StatCard.

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useStatCard`

### `use-mobile`

Hook para detectar dispositivos móveis baseado em breakpoint (768px).

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useMoblile`

**Nota**: O nome da pasta contém um typo (`useMoblile`), mas o hook exportado é `useIsMobile`.

### `use-react-table-back`

Hook headless para TanStack Table com paginação e ordenação no backend (server-side).

**Dependências**: `@tanstack/react-table`, `react`

**Localização**: `packages/logic/src/hooks/useReactTableBack`

**Características**:

- Paginação controlada pelo servidor
- Ordenação controlada pelo servidor
- Callbacks para mudanças de paginação e ordenação
- Informações de paginação (total de páginas, total de itens, etc.)

### `use-react-table-front`

Hook headless para TanStack Table com paginação e ordenação no frontend (client-side).

**Dependências**: `@tanstack/react-table`, `react`

**Localização**: `packages/logic/src/hooks/useReactTableFront`

**Características**:

- Paginação no cliente
- Ordenação no cliente
- Filtros no cliente
- Processamento de dados local

### `use-resizable`

Hook headless para gerenciar lógica de componentes redimensionáveis com sidebar.

**Dependências**: `react-resizable-panels`, `react`

**Localização**: `packages/logic/src/hooks/useResizable`

**Características**:

- Persistência de tamanho no localStorage
- Suporte a snap automático
- Detecção de mobile
- Suporte a modo drawer em mobile
- Controle de tamanhos mínimo e máximo

### `use-theme-transition`

Hook para gerenciar transições suaves de tema usando View Transitions API com fallback automático.

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useThemeTransition`

**Características**:

- Usa View Transitions API quando disponível
- Fallback automático para navegadores sem suporte
- Transições suaves de tema

### `use-time-tracker`

Hook headless para gerenciar timer com start, pause, stop, resume e formatação de tempo.

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useTimeTracker`

**Características**:

- Iniciar, pausar, parar e retomar timer
- Formatação de tempo customizável (HH:mm:ss, mm:ss, ss)
- Callbacks para eventos do timer
- Estado de running, paused e stopped

### `use-project-stats`

Hook headless para calcular estatísticas de projetos (totais, filtros, agregações).

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useProjectStats`

**Características**:

- Calcular totais por status (running, ended, pending, on-hold, cancelled)
- Filtros customizados
- Agrupamento por critérios
- Distribuição por status

### `use-project-progress`

Hook headless para calcular progresso de projetos (porcentagem, status, distribuição).

**Dependências**: `react`

**Localização**: `packages/logic/src/hooks/useProjectProgress`

**Características**:

- Calcular porcentagem total de progresso
- Determinar status geral (completed, in-progress, pending, on-hold)
- Distribuição de projetos por status
- Função customizada para calcular progresso individual

## 🚀 Instalação

```bash
# Instalar um hook específico
npx flowtomic@latest add use-stat-card

# Instalar múltiplos hooks
npx flowtomic@latest add use-stat-card use-mobile use-resizable
```

## 📖 Exemplos de Uso

### useStatCard

```typescript
import { useStatCard } from "@/hooks/use-stat-card";

export function StatCardExample() {
  const { value, formattedValue, isLoading } = useStatCard({
    initialValue: 1000,
    format: "currency",
  });

  return (
    <div>
      <p>Valor: {formattedValue}</p>
      {isLoading && <p>Carregando...</p>}
    </div>
  );
}
```

### useIsMobile

```typescript
import { useIsMobile } from "@/hooks/use-mobile";

export function ResponsiveComponent() {
  const isMobile = useIsMobile();

  return <div>{isMobile ? <p>Versão Mobile</p> : <p>Versão Desktop</p>}</div>;
}
```

### useReactTableBack

```typescript
import { useReactTableBack } from "@/hooks/use-react-table-back";

export function ServerTable() {
  const { table, sorting, pagination, setPagination, paginationInfo } =
    useReactTableBack({
      data: pageData,
      columns: columnDefs,
      totalCount: 1000,
      onPaginationChange: ({ pageIndex, pageSize }) => {
        fetchData({ page: pageIndex + 1, pageSize });
      },
      onSortingChange: (sorting) => {
        fetchData({ sorting });
      },
    });

  return (
    <table>
      {/* Usar table.getHeaderGroups(), table.getRowModel(), etc. */}
    </table>
  );
}
```

### useReactTableFront

```typescript
import { useReactTableFront } from "@/hooks/use-react-table-front";

export function ClientTable() {
  const { table, sorting, pagination, setPagination, paginationInfo } =
    useReactTableFront({
      data: allData,
      columns: columnDefs,
      enablePagination: true,
      enableSorting: true,
    });

  return (
    <table>
      {/* Usar table.getHeaderGroups(), table.getRowModel(), etc. */}
    </table>
  );
}
```

### useResizable

```typescript
import { useResizable } from "@/hooks/use-resizable";

export function ResizableLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    handleDoubleClick,
    shouldUseMobileDrawer,
    containerRef,
    autoSaveId,
    handleLayout,
    sidebarPanelRef,
    sidebarSize,
    minSize,
    maxSize,
    handleResizeEnd,
  } = useResizable({
    sidebarOpen,
    setSidebarOpen,
    side: "left",
    persistKey: "main-sidebar",
    defaultSidebarPct: 0.28,
    minPx: 250,
    maxPct: 0.6,
    maxPxCap: 500,
    mobileDrawer: true,
  });

  // Usar com react-resizable-panels
  return (
    <div ref={containerRef}>
      {/* Implementação com react-resizable-panels */}
    </div>
  );
}
```

### useThemeTransition

```typescript
import { useThemeTransition } from "@/hooks/use-theme-transition";

export function ThemeToggle() {
  const { startTransition } = useThemeTransition();
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    startTransition(() => {
      toggleTheme();
    });
  };

  return (
    <button onClick={handleToggle}>{theme === "dark" ? "☀️" : "🌙"}</button>
  );
}
```

### useAnimatedIndicator

```typescript
import { useAnimatedIndicator } from "@/hooks/use-animated-indicator";

export function TabsWithIndicator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { indicatorStyle, registerElement } = useAnimatedIndicator({
    containerRef,
    activeSelector: '[data-state="active"]',
  });

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-4">
        <button data-state="active" ref={(el) => registerElement("tab1", el)}>
          Tab 1
        </button>
        <button data-state="inactive" ref={(el) => registerElement("tab2", el)}>
          Tab 2
        </button>
      </div>
      {/* Indicador animado */}
      <div
        className="absolute bottom-0 h-1 bg-primary transition-all"
        style={indicatorStyle}
      />
    </div>
  );
}
```

### useGenealogy

```typescript
import { useGenealogy } from "@/hooks/use-genealogy";

export function GenealogyTree() {
  const { nodes, edges, addEntity, addRelationship, findAncestors } =
    useGenealogy({
      initialData: {
        people: [
          { id: "1", name: "João", gender: "male" },
          { id: "2", name: "Maria", gender: "female" },
        ],
        relationships: [{ from: "1", to: "2", type: "child" }],
      },
    });

  // Usar nodes e edges com ReactFlow
  return (
    <ReactFlow nodes={nodes} edges={edges}>
      {/* Renderizar árvore genealógica */}
    </ReactFlow>
  );
}
```

## 🎯 Filosofia dos Hooks

Os hooks do Flowtomic são **headless**, ou seja, não possuem dependências de UI. Isso permite:

- Reutilização em diferentes contextos
- Testabilidade facilitada
- Separação de lógica e apresentação
- Flexibilidade na implementação da UI
