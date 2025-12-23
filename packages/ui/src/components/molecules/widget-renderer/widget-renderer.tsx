/**
 * WidgetRenderer - Molecule Component
 *
 * Renderizador base para widgets com render prop pattern.
 * Totalmente extensível e genérico.
 */

import { memo, Suspense } from "react";
import { CardSkeleton } from "@/components/atoms";
import type { WidgetLayout } from "@/types/dashboard";

export interface WidgetRendererProps {
  /**
   * Layout do widget a ser renderizado
   */
  widget: WidgetLayout;

  /**
   * Dados para o widget (opcional, depende do tipo)
   */
  data?: unknown;

  /**
   * Se está carregando
   */
  isLoading?: boolean;

  /**
   * Render prop para renderizar widget customizado
   * Tem prioridade sobre widgetRegistry
   */
  renderWidget?: (widget: WidgetLayout, data?: unknown) => React.ReactNode;

  /**
   * Registry de componentes por tipo de widget
   * Usado quando renderWidget não é fornecido
   */
  widgetRegistry?: Map<string, React.ComponentType<{ widget: WidgetLayout; data?: unknown }>>;

  /**
   * Fallback quando widget não é encontrado
   */
  fallback?: React.ReactNode;
}

/**
 * Renderiza widget baseado no tipo
 *
 * Componente genérico que usa render prop pattern ou registry pattern
 * para renderizar widgets. Totalmente extensível.
 */
export const WidgetRenderer = memo<WidgetRendererProps>(
  ({ widget, data, isLoading = false, renderWidget, widgetRegistry, fallback }) => {
    if (isLoading) {
      return <CardSkeleton />;
    }

    // Prioridade 1: Render prop
    if (renderWidget) {
      return <Suspense fallback={<CardSkeleton />}>{renderWidget(widget, data)}</Suspense>;
    }

    // Prioridade 2: Registry
    if (widgetRegistry) {
      const WidgetComponent = widgetRegistry.get(widget.type);
      if (WidgetComponent) {
        return (
          <Suspense fallback={<CardSkeleton />}>
            <WidgetComponent widget={widget} data={data} />
          </Suspense>
        );
      }
    }

    // Fallback: Widget não encontrado
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4">
        <p className="text-muted-foreground">Tipo de widget desconhecido: {widget.type}</p>
      </div>
    );
  }
);

WidgetRenderer.displayName = "WidgetRenderer";
