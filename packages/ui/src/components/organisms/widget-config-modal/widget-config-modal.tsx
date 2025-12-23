/**
 * WidgetConfigModal - Organism Component
 *
 * Modal de configuração de widgets com render prop pattern.
 * Totalmente extensível e genérico.
 */

import * as React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms";
import { cn } from "@/lib/utils";

export interface WidgetConfigModalProps {
  /**
   * Se o modal está aberto
   */
  open: boolean;

  /**
   * Widget a ser configurado
   */
  widget: { id: string; type: string; config?: Record<string, unknown> } | null;

  /**
   * Callback quando configuração é salva
   */
  onSave: (widgetId: string, config: Record<string, unknown>) => void;

  /**
   * Callback quando modal é fechado
   */
  onClose: () => void;

  /**
   * Render prop para renderizar formulário de configuração customizado
   */
  renderConfigForm?: (
    widget: { id: string; type: string; config?: Record<string, unknown> },
    config: Record<string, unknown>,
    onUpdate: (config: Record<string, unknown>) => void
  ) => React.ReactNode;

  /**
   * Título do modal (opcional)
   */
  title?: string;

  /**
   * Descrição do modal (opcional)
   */
  description?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Modal de configuração de widget
 *
 * Componente genérico que usa render prop pattern para permitir
 * formulários de configuração totalmente customizados.
 */
export function WidgetConfigModal({
  open,
  widget,
  onSave,
  onClose,
  renderConfigForm,
  title,
  description,
  className,
}: WidgetConfigModalProps) {
  const [config, setConfig] = React.useState<Record<string, unknown>>(widget?.config || {});

  // Atualiza config quando widget muda
  React.useEffect(() => {
    if (widget) {
      setConfig(widget.config || {});
    }
  }, [widget]);

  if (!widget) return null;

  const handleSave = () => {
    onSave(widget.id, config);
    onClose();
  };

  const handleUpdate = (newConfig: Record<string, unknown>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{title || `Configurar Widget`}</DialogTitle>
          <DialogDescription>
            {description || `Personalize os dados e configurações do widget "${widget.type}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {renderConfigForm ? (
            renderConfigForm(widget, config, handleUpdate)
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Forneça uma função renderConfigForm para personalizar o formulário.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
