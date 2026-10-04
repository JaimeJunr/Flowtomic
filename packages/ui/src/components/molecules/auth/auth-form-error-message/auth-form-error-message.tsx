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
   * Entra com um fade curto (CSS do tw-animate, sem framer-motion). Quem pede menos
   * movimento no sistema não vê a animação.
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

  return (
    <div
      data-slot="auth-form-error-message"
      role="alert"
      className={cn(
        "rounded-md border border-destructive/30 bg-destructive/10 p-3",
        animated &&
          "animate-in fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none",
        className
      )}
    >
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
