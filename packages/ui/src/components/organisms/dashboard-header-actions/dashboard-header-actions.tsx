/**
 * DashboardHeaderActions - Organism Component
 *
 * Componente complexo que agrupa todas as ações do header do dashboard.
 * Tornado genérico e reutilizável.
 */

import { RefreshCw, Save, Settings } from "lucide-react";
import React from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../atoms/button/button";
import { ButtonGroup } from "../../molecules/button-group/button-group";

export interface DashboardHeaderActionsProps {
  /**
   * Lista de dashboards/views disponíveis
   */
  dashboards?: Array<{ id: string; name: string }>;
  /**
   * ID do dashboard ativo
   */
  activeDashboardId?: string;
  /**
   * Layout atual (grid ou list)
   */
  layout?: "grid" | "list";
  /**
   * Estado de carregamento
   */
  isLoading?: boolean;
  /**
   * Callback quando o dashboard é alterado
   */
  onSwitchDashboard?: (id: string) => void;
  /**
   * Callback para salvar como novo
   */
  onSaveAsNew?: () => void;
  /**
   * Callback para alternar layout
   */
  onToggleLayout?: () => void;
  /**
   * Callback para atualizar/refresh
   */
  onRefresh?: () => void;
  /**
   * Labels customizáveis
   */
  labels?: {
    saveAsNew?: string;
    gridLayout?: string;
    listLayout?: string;
    refresh?: string;
  };
  className?: string;
}

/**
 * Organismo: DashboardHeaderActions
 *
 * Componente complexo que agrupa todas as ações do header do dashboard
 * Composto por múltiplas moléculas e átomos
 */
export const DashboardHeaderActions = React.forwardRef<HTMLDivElement, DashboardHeaderActionsProps>(
  (
    {
      dashboards = [],
      activeDashboardId,
      layout = "grid",
      isLoading = false,
      onSwitchDashboard,
      onSaveAsNew,
      onToggleLayout,
      onRefresh,
      labels = {},
      className,
      ...props
    },
    ref
  ) => {
    const {
      saveAsNew = "Salvar Como",
      gridLayout = "Grade",
      listLayout = "Lista",
      refresh = "Atualizar",
    } = labels;

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        {/* Seleção de Dashboard */}
        {dashboards.length > 1 && (
          <select
            value={activeDashboardId || ""}
            onChange={(e) => onSwitchDashboard?.(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {dashboards.map((dashboard) => (
              <option key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </option>
            ))}
          </select>
        )}

        {/* Grupo de Botões de Ação (Salvar, Layout, Atualizar) */}
        {(onSaveAsNew || onToggleLayout || onRefresh) && (
          <ButtonGroup equalWidth>
            {onSaveAsNew && (
              <Button variant="outline" size="sm" onClick={onSaveAsNew}>
                <Save className="h-4 w-4 mr-2" />
                {saveAsNew}
              </Button>
            )}

            {onToggleLayout && (
              <Button variant="outline" size="sm" onClick={onToggleLayout}>
                <Settings className="h-4 w-4 mr-2" />
                {layout === "grid" ? listLayout : gridLayout}
              </Button>
            )}

            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                {refresh}
              </Button>
            )}
          </ButtonGroup>
        )}
      </div>
    );
  }
);

DashboardHeaderActions.displayName = "DashboardHeaderActions";
