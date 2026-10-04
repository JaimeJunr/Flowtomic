/**
 * Skeleton Component - Flowtomic UI
 *
 * Componente Skeleton próprio do design-system
 * Implementação direta sem dependência de componentes externos
 */

import type * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.ComponentProps<"div"> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Skeleton - Componente base de skeleton
 */
function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      // Sem conteúdo é só enfeite; com conteúdo, o texto precisa continuar legível
      aria-hidden={children ? undefined : true}
      className={cn("animate-pulse motion-reduce:animate-none rounded-md bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  );
}
Skeleton.displayName = "Skeleton";

/**
 * CardSkeleton - Skeleton específico para cards
 */
const CardSkeleton: React.FC = () => {
  return (
    <div data-slot="card-skeleton" className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
};
CardSkeleton.displayName = "CardSkeleton";

/**
 * TableSkeleton - Skeleton específico para tabelas
 */
const TableSkeleton: React.FC = () => {
  // IDs estáticos para skeletons - array nunca muda, então índices são seguros
  const skeletonIds = ["skeleton-0", "skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];
  return (
    <div data-slot="table-skeleton" className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
      <Skeleton className="h-10 w-full" />
      {skeletonIds.map((id) => (
        <Skeleton key={id} className="h-8 w-full" />
      ))}
    </div>
  );
};
TableSkeleton.displayName = "TableSkeleton";

export { Skeleton, CardSkeleton, TableSkeleton };
