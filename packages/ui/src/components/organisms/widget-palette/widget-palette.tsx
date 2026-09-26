/**
 * WidgetPalette - Organism Component
 *
 * Sidebar com widgets disponíveis para adicionar ao dashboard.
 * Componente genérico e totalmente configurável via props.
 */

import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Traduz a largura em unidades de grid (assume 12 colunas, o padrão do dashboard)
 * para uma palavra que quem não mexe com grid entende. Buckets arbitrários, não
 * frações contínuas — por isso w=3 e w=4 caem no mesmo "um terço".
 */
function widthLabel(w: number): string {
  if (w <= 4) return "um terço da largura";
  if (w <= 6) return "metade da largura";
  if (w <= 9) return "dois terços da largura";
  return "largura inteira";
}

export interface WidgetPaletteItem {
  /**
   * ID único do widget
   */
  id: string;

  /**
   * Tipo do widget (string genérico)
   */
  type: string;

  /**
   * Nome do widget
   */
  name: string;

  /**
   * Descrição do widget
   */
  description: string;

  /**
   * Ícone do widget
   */
  icon: React.ComponentType<{ className?: string }>;

  /**
   * Tamanho padrão do widget (largura x altura)
   */
  defaultSize: { w: number; h: number };
}

export interface WidgetPaletteProps {
  /**
   * Se a paleta está aberta
   */
  isOpen: boolean;

  /**
   * Lista de widgets disponíveis (obrigatória)
   */
  widgets: WidgetPaletteItem[];

  /**
   * Callback para fechar a paleta
   */
  onClose?: () => void;

  /**
   * Título da paleta (opcional)
   */
  title?: string;

  /**
   * Descrição da paleta (opcional)
   */
  description?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Item de widget arrastável da paleta
 */
function DraggableWidgetItem({ widget }: { widget: WidgetPaletteItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${widget.id}`,
    data: {
      type: "palette-widget",
      widgetId: widget.id,
      widgetType: widget.type,
      defaultSize: widget.defaultSize,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 border-t border-border py-3 first:border-t-0",
        "cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors",
        isDragging && "opacity-50 z-50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{widget.name}</p>
        <p className="truncate text-xs text-muted-foreground">{widget.description}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {widthLabel(widget.defaultSize.w)}
      </span>
    </div>
  );
}

/**
 * Paleta de widgets
 *
 * Componente genérico que exibe uma lista de widgets arrastáveis.
 * Totalmente configurável via props, sem widgets hardcoded.
 */
export function WidgetPalette({
  isOpen,
  widgets,
  onClose,
  title = "Widgets Disponíveis",
  description = "Arraste widgets para adicionar ao dashboard",
  className,
}: WidgetPaletteProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 bg-background border-l border-border",
        "shadow-lg z-40 transition-transform duration-300",
        "flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent transition-colors"
              aria-label="Fechar paleta"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Widgets List */}
      <div className="flex-1 overflow-y-auto px-4">
        {widgets.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum widget disponível
          </div>
        ) : (
          widgets.map((widget) => <DraggableWidgetItem key={widget.id} widget={widget} />)
        )}
      </div>
    </div>
  );
}
