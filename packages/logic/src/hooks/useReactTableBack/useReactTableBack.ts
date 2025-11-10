/**
 * useReactTableBack - Headless UI Hook
 *
 * Hook headless para TanStack Table com paginação e ordenação no backend (server-side).
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * @example
 * ```tsx
 * function MyTable() {
 *   const { table, sorting, pagination, setPagination, paginationInfo } = useReactTableBack({
 *     data: pageData,
 *     columns: columnDefs,
 *     totalCount: 1000,
 *     onPaginationChange: ({ pageIndex, pageSize }) => {
 *       fetchData({ page: pageIndex + 1, pageSize });
 *     },
 *     onSortingChange: (sorting) => {
 *       fetchData({ sorting });
 *     },
 *   })
 *
 *   return (
 *     <table>
 *       {/* Usar table.getHeaderGroups(), table.getRowModel(), etc. *\/}
 *     </table>
 *   )
 * }
 * ```
 */

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  type PaginationState,
  type SortingState,
  type Table,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

export interface UseReactTableBackOptions<T extends Record<string, unknown>> {
  /** Dados da tabela (apenas da página atual) */
  data: T[];
  /** Definição das colunas */
  columns: ColumnDef<T, unknown>[];
  /** Total de itens no servidor (necessário para calcular páginas) */
  totalCount: number;
  /** Habilitar paginação */
  enablePagination?: boolean;
  /** Tamanho da página */
  pageSize?: number;
  /** Callback quando paginação muda */
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  /** Habilitar ordenação */
  enableSorting?: boolean;
  /** Estado inicial de ordenação */
  initialSorting?: SortingState;
  /** Callback quando ordenação muda */
  onSortingChange?: (sorting: SortingState) => void;
  /** Estado inicial de filtros de coluna */
  initialColumnFilters?: ColumnFiltersState;
  /** Estado inicial de visibilidade de colunas */
  initialColumnVisibility?: VisibilityState;
  /** Habilitar seleção de linhas */
  enableRowSelection?: boolean;
  /** Callback quando a seleção muda */
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface UseReactTableBackReturn<T extends Record<string, unknown>> {
  /** Instância do TanStack Table */
  table: Table<T>;
  /** Estado de ordenação */
  sorting: SortingState;
  /** Função para atualizar ordenação */
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  /** Estado de paginação */
  pagination: PaginationState;
  /** Função para atualizar paginação */
  setPagination: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => void;
  /** Estado de filtros de coluna */
  columnFilters: ColumnFiltersState;
  /** Função para atualizar filtros de coluna */
  setColumnFilters: (
    filters: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)
  ) => void;
  /** Estado de filtro global (não usado em server-side, mas mantido para compatibilidade) */
  globalFilter: string;
  /** Função para atualizar filtro global (não usado em server-side, mas mantido para compatibilidade) */
  setGlobalFilter: (filter: string) => void;
  /** Estado de visibilidade de colunas */
  columnVisibility: VisibilityState;
  /** Função para atualizar visibilidade de colunas */
  setColumnVisibility: (
    visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState)
  ) => void;
  /** Estado de seleção de linhas */
  rowSelection: Record<string, boolean>;
  /** Função para atualizar seleção de linhas */
  setRowSelection: (
    selection:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
  /** Informações de paginação calculadas */
  paginationInfo: {
    start: number;
    end: number;
    total: number;
    pageCount: number;
  };
}

/**
 * Hook Headless UI para TanStack Table com paginação/ordenação server-side
 */
export function useReactTableBack<T extends Record<string, unknown>>(
  options: UseReactTableBackOptions<T>
): UseReactTableBackReturn<T> {
  const {
    data,
    columns,
    totalCount,
    enablePagination = true,
    pageSize = 10,
    onPaginationChange,
    enableSorting = true,
    initialSorting = [],
    onSortingChange,
    initialColumnFilters = [],
    initialColumnVisibility = {},
    enableRowSelection = false,
    onSelectionChange,
  } = options;

  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Notificar mudanças de paginação (server-side)
  useEffect(() => {
    if (enablePagination && onPaginationChange) {
      onPaginationChange({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
    }
  }, [pagination, enablePagination, onPaginationChange]);

  // Notificar mudanças de ordenação (server-side)
  useEffect(() => {
    if (enableSorting && onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, enableSorting, onSortingChange]);

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters,
      columnVisibility,
      rowSelection: enableRowSelection ? rowSelection : undefined,
      pagination: enablePagination ? pagination : undefined,
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    getCoreRowModel: getCoreRowModel(),
    enableSorting,
    enableRowSelection,
    // Server-side: manual pagination e sorting
    manualPagination: enablePagination,
    manualSorting: enableSorting,
    // Total de páginas calculado do totalCount
    pageCount:
      enablePagination && totalCount !== undefined
        ? Math.ceil(totalCount / pagination.pageSize)
        : undefined,
  });

  // Notificar mudanças na seleção
  useEffect(() => {
    if (onSelectionChange && enableRowSelection) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [table, onSelectionChange, enableRowSelection]);

  // Calcular informações de paginação
  const paginationInfo = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize + 1;
    const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount);
    return {
      start,
      end,
      total: totalCount,
      pageCount:
        enablePagination && totalCount !== undefined
          ? Math.ceil(totalCount / pagination.pageSize)
          : 1,
    };
  }, [pagination, totalCount, enablePagination]);

  return {
    table,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    paginationInfo,
  };
}
