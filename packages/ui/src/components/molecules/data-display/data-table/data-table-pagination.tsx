/**
 * DataTablePagination Component - Design System Flowtomic UI
 *
 * Componente de paginação para DataTable
 * Suporta dois tipos de visualização: text e buttons
 * Inclui seletor de tamanho de página opcional
 */

import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../atoms";

// ============================================================================
// Types
// ============================================================================

export interface DataTablePaginationProps<TData> {
  /** Instância da tabela do TanStack Table */
  table: Table<TData>;
  /** Tamanho da tabela */
  size?: "sm" | "md";
  /** Tipo de visualização da paginação */
  paginationType?: "text" | "buttons";
  /** Habilitar seletor de tamanho de página */
  enablePageSizeSelector?: boolean;
  /** Opções de tamanho de página disponíveis */
  pageSizeOptions?: number[];
  /** Conteúdo customizado do footer */
  footerContent?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
  /** Informações de paginação (para server-side, opcional) */
  paginationInfo?: {
    start: number;
    end: number;
    total: number;
    pageCount: number;
  };
}

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Gera array de números de página com ellipsis quando necessário
 * Exemplo: [1, 2, 3, 4, 5, '...', 10]
 */
function generatePageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    // Se tem 7 ou menos páginas, mostra todas
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const ellipsis = "...";

  // Sempre mostrar primeira página
  pages.push(1);

  if (currentPage <= 4) {
    // Páginas iniciais: 1, 2, 3, 4, 5, ..., 10
    for (let i = 2; i <= 5; i++) {
      pages.push(i);
    }
    pages.push(ellipsis);
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    // Páginas finais: 1, ..., 6, 7, 8, 9, 10
    pages.push(ellipsis);
    for (let i = totalPages - 4; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Páginas do meio: 1, ..., 4, 5, 6, ..., 10
    pages.push(ellipsis);
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push(ellipsis);
    pages.push(totalPages);
  }

  return pages;
}

// ============================================================================
// DataTablePagination Component
// ============================================================================

function DataTablePagination<TData>({
  table,
  size = "md",
  paginationType = "text",
  enablePageSizeSelector = false,
  pageSizeOptions = [20, 25, 50, 100, 200],
  footerContent,
  className,
  paginationInfo,
}: DataTablePaginationProps<TData>) {
  const pagination = table.getState().pagination;
  const pageSize = pagination.pageSize;

  // Usar paginationInfo se fornecido (server-side), senão calcular do table
  const currentPageInfo = paginationInfo
    ? paginationInfo
    : {
        start:
          table.getRowModel().rows.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0,
        end: Math.min(
          (pagination.pageIndex + 1) * pagination.pageSize,
          table.getFilteredRowModel().rows.length
        ),
        total: table.getFilteredRowModel().rows.length,
        pageCount: Math.max(1, table.getPageCount()),
      };

  // Garantir que o pageSize atual esteja nas opções
  const availablePageSizes = React.useMemo(() => {
    const sizes = new Set(pageSizeOptions);
    if (!sizes.has(pageSize)) {
      sizes.add(pageSize);
    }
    return Array.from(sizes).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  if (footerContent) {
    return (
      <div
        className={cn(
          "flex items-center justify-between border-t border-border bg-card px-4",
          size === "sm" ? "py-3 md:px-5" : "py-4 md:px-6",
          className
        )}
      >
        {footerContent}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border bg-card px-4",
        size === "sm" ? "py-3 md:px-5" : "py-4 md:px-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          {currentPageInfo.start > 0 ? `${currentPageInfo.start} a ${currentPageInfo.end}` : 0} de{" "}
          {currentPageInfo.total} itens
        </div>
        {enablePageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                table.setPageSize(newPageSize);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-[70px]"
                aria-label="Selecionar tamanho de página"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePageSizes.map((sizeOption) => (
                  <SelectItem key={sizeOption} value={sizeOption.toString()}>
                    {sizeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      {paginationType === "text" ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de {currentPageInfo.pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Próxima página"
          >
            Próxima
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            Anterior
          </Button>
          {generatePageNumbers(
            table.getState().pagination.pageIndex + 1,
            currentPageInfo.pageCount
          ).map((page, index, array) => {
            if (page === "...") {
              // Criar key única baseada na posição e valores adjacentes
              const prevPage = index > 0 ? array[index - 1] : null;
              const nextPage = index < array.length - 1 ? array[index + 1] : null;
              const uniqueKey = `ellipsis-${prevPage ?? "start"}-${nextPage ?? "end"}`;
              return (
                <span
                  key={uniqueKey}
                  className="px-2 text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }
            const pageNumber = page as number;
            const isActive = pageNumber === table.getState().pagination.pageIndex + 1;
            return (
              <Button
                key={pageNumber}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(pageNumber - 1)}
                className={cn(isActive && "bg-muted text-foreground hover:bg-muted")}
                aria-label={`Ir para página ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Próxima página"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}

DataTablePagination.displayName = "DataTablePagination";

// ============================================================================
// DataTablePaginationSkeleton Component
// ============================================================================

export interface DataTablePaginationSkeletonProps {
  /** Tamanho da tabela */
  size?: "sm" | "md";
  /** Classe CSS adicional */
  className?: string;
}

function DataTablePaginationSkeleton({ size = "md", className }: DataTablePaginationSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border bg-card px-4",
        size === "sm" ? "py-3 md:px-5" : "py-4 md:px-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 animate-pulse rounded bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

DataTablePaginationSkeleton.displayName = "DataTablePaginationSkeleton";

// ============================================================================
// Exports
// ============================================================================

export { DataTablePagination, DataTablePaginationSkeleton };
