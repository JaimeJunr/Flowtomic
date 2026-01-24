/**
 * # Sonner Component (Toaster)
 *
 * O componente `Toaster` (Sonner) é usado para exibir notificações toast
 * na aplicação. Fornece feedback visual para ações do usuário com diferentes
 * tipos de mensagens (success, error, warning, info, loading).
 *
 * ## Características Principais
 *
 * - **Múltiplos Tipos**: Suporta success, error, warning, info e loading
 * - **Posicionamento**: Configurável (padrão: top-right)
 * - **Tema**: Suporta light e dark
 * - **Ícones**: Ícones customizados para cada tipo
 * - **Ações**: Suporta botões de ação e cancelamento
 *
 * ## Tipos de Toast
 *
 * - **success**: Mensagens de sucesso (verde)
 * - **error**: Mensagens de erro (vermelho)
 * - **warning**: Avisos (amarelo)
 * - **info**: Informações (azul)
 * - **loading**: Carregamento (spinner)
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Toaster, toast } from "@flowtomic/ui/components/atoms/feedback/sonner";
 *
 * function App() {
 *   return (
 *     <>
 *       <Toaster />
 *       <button onClick={() => toast.success("Operação realizada com sucesso!")}>
 *         Mostrar Toast
 *       </button>
 *     </>
 *   );
 * }
 * ```
 *
 * ## Exemplos de Uso
 *
 * ```tsx
 * // Success
 * toast.success("Operação realizada com sucesso!");
 *
 * // Error
 * toast.error("Erro ao processar requisição");
 *
 * // Warning
 * toast.warning("Atenção: ação irreversível");
 *
 * // Info
 * toast.info("Nova atualização disponível");
 *
 * // Loading
 * const toastId = toast.loading("Processando...");
 * // Depois atualizar para success
 * toast.success("Concluído!", { id: toastId });
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta leitores de tela
 * - Navegação por teclado
 * - Foco gerenciado automaticamente
 *
 * @see [Sonner Documentation](https://sonner.emilkowal.ski/) para mais detalhes
 * @see [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/sonner) para referência
 */

"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as SonnerToaster, type ToasterProps as SonnerToasterProps } from "sonner";

export interface ToasterProps extends Omit<SonnerToasterProps, "theme"> {
  /**
   * Tema do toaster ('light' | 'dark')
   * Se não fornecido, usa 'light' como padrão
   */
  theme?: "light" | "dark";
}

/**
 * Toaster - Componente principal do Sonner
 * Integrado com o sistema de tema do design system
 */
export function Toaster({ theme = "light", ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme={theme === "dark" ? "dark" : "light"}
      position="top-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg cursor-pointer",
          success:
            "group-[.toast]:!bg-success group-[.toast]:!text-success-foreground group-[.toast]:!border-success",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--success))",
          "--success-text": "hsl(var(--success-foreground))",
          "--success-border": "hsl(var(--success))",
          "--border-radius": "calc(var(--radius) - 2px)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

// Re-exportar toast do sonner
export { toast } from "sonner";
