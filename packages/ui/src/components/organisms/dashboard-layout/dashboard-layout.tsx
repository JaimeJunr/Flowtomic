/**
 * DashboardLayout - Organism Component
 *
 * Layout de conteúdo para páginas do dashboard.
 * Componente genérico e reutilizável para qualquer aplicação.
 */

import React from "react";
import { cn } from "../../../lib/utils";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}

/**
 * Layout de conteúdo para páginas do dashboard.
 *
 * Este componente renderiza apenas o conteúdo da página.
 * Pode ser usado em qualquer aplicação que precise de um layout de dashboard.
 */
const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ children, title, subtitle, actions, className, maxWidth = "7xl", ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "7xl": "max-w-7xl",
      full: "max-w-full",
    };

    return (
      <div className="h-full w-full" ref={ref} {...props}>
        <div className={cn("p-6 h-full", className)}>
          <div className={cn("mx-auto space-y-12", maxWidthClasses[maxWidth])}>
            {/* Page Header */}
            {(title || subtitle || actions) && (
              <div className="mb-8 flex justify-between items-start">
                <div>
                  {title && <h1 className="text-3xl font-bold text-foreground">{title}</h1>}
                  {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center space-x-2">{actions}</div>}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </div>
      </div>
    );
  }
);

DashboardLayout.displayName = "DashboardLayout";

export { DashboardLayout };
