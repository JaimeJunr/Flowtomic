/**
 * EditModeToggle - Molecule Component
 *
 * Componente para alternar entre modo de edição e visualização.
 * Genérico e reutilizável para qualquer contexto de edição.
 */

import { Edit2, Eye } from "lucide-react";
import React from "react";
import { Button } from "@/components/atoms";
import { cn } from "@/lib/utils";

export interface EditModeToggleProps {
  /**
   * Se está em modo de edição
   */
  isEditMode: boolean;

  /**
   * Callback quando modo de edição é alterado
   */
  onToggle: (editMode: boolean) => void;

  /**
   * Se está desabilitado
   */
  disabled?: boolean;

  /**
   * Label para o botão quando em modo de edição (padrão: "Visualizar")
   */
  viewLabel?: string;

  /**
   * Label para o botão quando em modo de visualização (padrão: "Editar Dashboard")
   */
  editLabel?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Toggle para alternar modo de edição
 *
 * Componente genérico que permite alternar entre modo de edição e visualização.
 * Pode ser usado em qualquer contexto que precise de toggle de edição.
 */
export const EditModeToggle = React.forwardRef<HTMLButtonElement, EditModeToggleProps>(
  (
    {
      isEditMode,
      onToggle,
      disabled = false,
      viewLabel = "Visualizar",
      editLabel = "Editar Dashboard",
      className,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled) {
        onToggle(!isEditMode);
      }
    };

    return (
      <Button
        ref={ref}
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className={cn("gap-2", className)}
        aria-label={isEditMode ? "Sair do modo de edição" : "Entrar no modo de edição"}
        aria-pressed={isEditMode}
        {...props}
      >
        {isEditMode ? (
          <>
            <Eye className="w-4 h-4" />
            <span>{viewLabel}</span>
          </>
        ) : (
          <>
            <Edit2 className="w-4 h-4" />
            <span>{editLabel}</span>
          </>
        )}
      </Button>
    );
  }
);

EditModeToggle.displayName = "EditModeToggle";
