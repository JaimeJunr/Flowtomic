/**
 * AuthFormErrorMessage - Componente Molecule
 *
 * Componente reutilizável para exibir mensagens de erro em formulários de autenticação
 *
 * Molecule que combina apresentação de erro com animação opcional
 */

import { cn } from "../../../../lib/utils";

export interface AuthFormErrorMessageProps {
  /**
   * Mensagem de erro a ser exibida
   */
  message: string | null | undefined;
  /**
   * Classe CSS adicional (opcional)
   */
  className?: string;
  /**
   * Se deve usar animação (requer framer-motion se true)
   */
  animated?: boolean;
}

/**
 * Componente reutilizável para exibir mensagens de erro em formulários de autenticação
 *
 * Molecule que combina apresentação de erro
 */
export function AuthFormErrorMessage({
  message,
  className = "",
  animated = false,
}: AuthFormErrorMessageProps) {
  if (!message) return null;

  const content = (
    <div className={cn("bg-destructive/10 border border-destructive/30 rounded-md p-3", className)}>
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );

  // Se animated for true, o projeto deve usar framer-motion
  // Por padrão, retornamos sem animação para não forçar dependência
  if (animated) {
    // O projeto pode envolver isso com AnimatePresence e motion.div
    return content;
  }

  return content;
}
