/**
 * Sonner Component - Flowtomic UI
 *
 * Componente Sonner próprio do design-system
 * Implementação padronizada seguindo os padrões do design system
 * Baseado em: https://ui.shadcn.com/docs/components/sonner
 *
 * NOTA: Este componente requer que o tema seja passado como prop
 * ou que o projeto use um hook de tema compatível
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
