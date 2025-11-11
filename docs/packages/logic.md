# flowtomic/logic

Biblioteca de hooks headless e lógica reutilizável para React.

## Instalação

```bash
bunx flowtomic add use-stat-card
```

## Uso

```tsx
import { useStatCard } from '@flowtomic/logic'

function MyComponent() {
  const { value, formattedValue, isLoading } = useStatCard({
    initialValue: 1000,
    format: "currency",
  })
  
  return (
    <div>
      <p>Valor: {formattedValue}</p>
      {isLoading && <p>Carregando...</p>}
    </div>
  )
}
```

## Hooks Disponíveis

### `useStatCard`
Hook para gerenciar estado e lógica do componente StatCard.

### `useIsMobile`
Hook para detectar dispositivos móveis baseado em breakpoint (768px).

### `useReactTableBack`
Hook headless para TanStack Table com paginação e ordenação no backend (server-side).

### `useReactTableFront`
Hook headless para TanStack Table com paginação e ordenação no frontend (client-side).

### `useResizable`
Hook headless para gerenciar lógica de componentes redimensionáveis com sidebar.

### `useThemeTransition`
Hook para gerenciar transições suaves de tema usando View Transitions API.

## Padrão Headless UI

Todos os hooks seguem o padrão **Headless UI**:
- ✅ Fornecem apenas lógica, estado e API
- ❌ Não fornecem markup ou styles
- 🎨 Você controla completamente a apresentação

Para mais detalhes sobre cada hook, consulte a [documentação completa de hooks](../componentes/hooks.md).

