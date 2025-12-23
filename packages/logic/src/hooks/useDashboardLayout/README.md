# useDashboardLayout

Hook headless para gerenciar layout de dashboards com drag and drop.

## Características

- **Headless UI**: Fornece apenas lógica, sem markup ou styles
- **Genérico**: Funciona com qualquer tipo de widget
- **Snap to Grid**: Alinhamento automático ao grid
- **Validação**: Verifica colisões e limites do grid
- **Type Safe**: Totalmente tipado com TypeScript

## Uso

```tsx
import { useDashboardLayout } from "@flowtomic/logic";
import type { WidgetLayout, GridConfig } from "@flowtomic/logic";

function MyDashboard() {
  const [widgets, setWidgets] = useState<WidgetLayout[]>([]);
  const gridConfig: GridConfig = { columns: 12, cellSize: 50, gap: 16 };

  const {
    getWidgetGridPosition,
    moveWidget,
    resizeWidget,
    findNextAvailablePosition,
  } = useDashboardLayout({
    widgetsLayout: widgets,
    gridConfig,
    onUpdateLayout: setWidgets,
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)" }}>
      {widgets.map((widget) => (
        <div style={getWidgetGridPosition(widget)}>
          Widget Content
        </div>
      ))}
    </div>
  );
}
```

## API

### Props

- `widgetsLayout`: Array de widgets com posição e tamanho
- `gridConfig`: Configuração do grid (colunas, cellSize, gap)
- `onUpdateLayout`: Callback para atualizar o layout

### Retorno

- `gridConfig`: Configuração normalizada do grid
- `getWidgetGridPosition`: Calcula posição CSS Grid
- `isPositionOccupied`: Verifica se posição está ocupada
- `findNextAvailablePosition`: Encontra próxima posição livre
- `canMoveToPosition`: Valida se widget pode ser movido
- `canResize`: Valida se widget pode ser redimensionado
- `moveWidget`: Move widget para nova posição
- `resizeWidget`: Redimensiona widget
- `updateLayout`: Atualiza layout completo

