/**
 * useReactTableFront - Headless UI Hook
 *
 * Hook headless para TanStack Table com paginação e ordenação no frontend (client-side).
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * @example
 * ```tsx
 * function MyTable() {
 *   const { table, sorting, pagination, setPagination, paginationInfo } = useReactTableFront({
 *     data: allData,
 *     columns: columnDefs,
 *     enablePagination: true,
 *     enableSorting: true,
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
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  type Table,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

export interface UseReactTableFrontOptions<T extends Record<string, unknown>> {
  /** Dados da tabela */
  data: T[];
  /** Definição das colunas */
  columns: ColumnDef<T, unknown>[];
  /** Habilitar paginação */
  enablePagination?: boolean;
  /** Tamanho da página */
  pageSize?: number;
  /** Habilitar ordenação */
  enableSorting?: boolean;
  /** Estado inicial de ordenação */
  initialSorting?: SortingState;
  /** Habilitar filtro global */
  enableGlobalFilter?: boolean;
  /** Estado inicial de filtros de coluna */
  initialColumnFilters?: ColumnFiltersState;
  /** Estado inicial de visibilidade de colunas */
  initialColumnVisibility?: VisibilityState;
  /** Habilitar seleção de linhas */
  enableRowSelection?: boolean;
  /** Callback quando a seleção muda */
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface UseReactTableFrontReturn<T extends Record<string, unknown>> {
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
  /** Estado de filtro global */
  globalFilter: string;
  /** Função para atualizar filtro global */
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
 * Hook Headless UI para TanStack Table com paginação/ordenação client-side
 */
export function useReactTableFront<T extends Record<string, unknown>>(
  options: UseReactTableFrontOptions<T>
): UseReactTableFrontReturn<T> {
  const {
    data,
    columns,
    enablePagination = true,
    pageSize = 10,
    enableSorting = true,
    initialSorting = [],
    enableGlobalFilter = true,
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

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters,
      globalFilter: enableGlobalFilter ? globalFilter : undefined,
      columnVisibility,
      rowSelection: enableRowSelection ? rowSelection : undefined,
      pagination: enablePagination ? pagination : undefined,
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: enableGlobalFilter ? setGlobalFilter : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    onPaginationChange: enablePagination ? setPagination : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    enableSorting,
    enableRowSelection,
    manualPagination: false,
    manualSorting: false,
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
    const filteredCount = table.getFilteredRowModel().rows.length;

    // Se a paginação estiver desabilitada, retornar valores padrão
    if (!enablePagination) {
      return {
        start: 1,
        end: filteredCount,
        total: filteredCount,
        pageCount: 1,
      };
    }

    const start = pagination.pageIndex * pagination.pageSize + 1;
    const end = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount);
    return {
      start,
      end,
      total: filteredCount,
      pageCount: table.getPageCount(),
    };
  }, [table, pagination, enablePagination]);

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
