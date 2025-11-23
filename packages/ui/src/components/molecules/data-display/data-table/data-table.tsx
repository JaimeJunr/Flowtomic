/**
 * DataTable Component - Design System Flowtomic UI
 *
 * Componente de tabela avançado baseado em TanStack Table
 * Integra funcionalidades avançadas (sorting, filtering, pagination)
 * com a estrutura visual do table.tsx base
 */

import {
  type Cell,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  type HeaderGroup,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useReactTableBack, useReactTableFront } from "flowtomic/logic";
import { ArrowDown, ChevronsUpDown, HelpCircle } from "lucide-react";
import type { ComponentPropsWithRef, HTMLAttributes, ReactNode } from "react";
import React, { createContext, useContext, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge, Checkbox, Input } from "../../../atoms";
import { DataTablePagination } from "./data-table-pagination";

// ============================================================================
// Context
// ============================================================================

const DataTableContext = createContext<{ size: "sm" | "md" }>({ size: "md" });

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: unknown, item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  tooltip?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  /** Título da tabela */
  title?: string;
  /** Dados da tabela */
  data: T[];
  /** Definição das colunas usando TanStack Table ColumnDef */
  columns: ColumnDef<T, unknown>[];
  /** Callback quando um item é editado */
  onEdit?: (item: T) => void;
  /** Callback quando um item é deletado */
  onDelete?: (item: T) => void;
  /** Callback quando um item é visualizado */
  onView?: (item: T) => void;
  /** Classe CSS adicional */
  className?: string;
  /** Mensagem quando não há dados */
  emptyMessage?: string;
  /** Estado de carregamento */
  loading?: boolean;
  /** Tamanho da tabela */
  size?: "sm" | "md";
  /** Habilitar seleção de linhas */
  enableRowSelection?: boolean;
  /** Callback quando a seleção muda */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Habilitar paginação */
  enablePagination?: boolean;
  /** Tipo de visualização da paginação */
  paginationType?: "text" | "buttons";
  /** Tamanho da página */
  pageSize?: number;
  /** Opções de tamanho de página disponíveis */
  pageSizeOptions?: number[];
  /** Habilitar seletor de tamanho de página */
  enablePageSizeSelector?: boolean;
  /** Habilitar filtro global */
  enableGlobalFilter?: boolean;
  /** Placeholder do filtro global */
  globalFilterPlaceholder?: string;
  /** Habilitar ordenação */
  enableSorting?: boolean;
  /** Estado inicial de ordenação */
  initialSorting?: SortingState;
  /** Estado inicial de filtros */
  initialColumnFilters?: ColumnFiltersState;
  /** Estado inicial de visibilidade de colunas */
  initialColumnVisibility?: VisibilityState;
  /** Modo de paginação: 'client' (frontend) ou 'server' (backend) */
  paginationMode?: "client" | "server";
  /** Total de itens (necessário para paginação server-side) */
  totalCount?: number;
  /** Callback quando paginação muda (para server-side) */
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  /** Modo de ordenação: 'client' (frontend) ou 'server' (backend) */
  sortingMode?: "client" | "server";
  /** Callback quando ordenação muda (para server-side) */
  onSortingChange?: (sorting: SortingState) => void;
  /** Renderizar ações customizadas no header */
  headerActions?: ReactNode;
  /** Renderizar conteúdo customizado no footer */
  footerContent?: ReactNode;
}

// ============================================================================
// Table Card Components
// ============================================================================

interface TableCardRootProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md";
}

const TableCardRoot: React.FC<TableCardRootProps> = ({
  children,
  className,
  size = "md",
  ...props
}) => {
  return (
    <DataTableContext.Provider value={{ size }}>
      <div
        {...props}
        className={cn("overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border", className)}
      >
        {children}
      </div>
    </DataTableContext.Provider>
  );
};

interface TableCardHeaderProps {
  title?: string;
  badge?: ReactNode;
  description?: string;
  contentTrailing?: ReactNode;
  className?: string;
}

const TableCardHeader: React.FC<TableCardHeaderProps> = ({
  title,
  badge,
  description,
  contentTrailing,
  className,
}) => {
  const { size } = useContext(DataTableContext);

  return (
    <div
      className={cn(
        "relative flex flex-col items-start gap-4 border-b border-border bg-card px-4 md:flex-row",
        size === "sm" ? "py-4 md:px-5" : "py-5 md:px-6",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-0.5">
        {title && (
          <div className="flex items-center gap-2">
            <h2
              className={cn(
                "font-semibold text-foreground",
                size === "sm" ? "text-base" : "text-lg"
              )}
            >
              {title}
            </h2>
            {badge && (
              <Badge variant="default" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
        )}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {contentTrailing}
    </div>
  );
};

// ============================================================================
// Table Components
// ============================================================================

interface TableRootProps extends Omit<ComponentPropsWithRef<"table">, "className"> {
  size?: "sm" | "md";
  className?: string | ((state: Record<string, unknown>) => string);
}

const TableRoot: React.FC<TableRootProps> = ({ className, size = "md", ...props }) => {
  const context = useContext(DataTableContext);

  return (
    <DataTableContext.Provider value={{ size: context?.size ?? size }}>
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full overflow-x-hidden",
            typeof className === "function" ? className({}) : className
          )}
          {...props}
        />
      </div>
    </DataTableContext.Provider>
  );
};

interface TableHeaderProps extends ComponentPropsWithRef<"thead"> {
  bordered?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  bordered = true,
  className,
  ...props
}) => {
  const { size } = useContext(DataTableContext);

  return (
    <thead
      {...props}
      className={cn(
        "relative bg-muted",
        size === "sm" ? "h-9" : "h-11",
        bordered &&
          "[&>tr>th]:after:pointer-events-none [&>tr>th]:after:absolute [&>tr>th]:after:inset-x-0 [&>tr>th]:after:bottom-0 [&>tr>th]:after:h-px [&>tr>th]:after:bg-border [&>tr>th]:focus-visible:after:bg-transparent",
        className
      )}
    >
      {children}
    </thead>
  );
};

interface TableHeadProps extends ComponentPropsWithRef<"th"> {
  label?: string;
  tooltip?: string;
  sortable?: boolean;
  sorted?: false | "asc" | "desc";
  onSort?: () => void;
}

const TableHead: React.FC<TableHeadProps> = ({
  className,
  tooltip,
  label,
  children,
  sortable = false,
  sorted = false,
  onSort,
  ...props
}) => {
  // Se tem children (conteúdo do TanStack Table), renderizar diretamente
  const hasChildren = React.Children.count(children) > 0;

  return (
    <th
      {...props}
      className={cn(
        "relative p-0 px-6 py-2 outline-hidden focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-inset",
        sortable && "cursor-pointer",
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          {hasChildren ? (
            // Renderizar children diretamente (conteúdo do TanStack Table)
            typeof children === "string" ? (
              <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
                {children}
              </span>
            ) : (
              <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
                {children}
              </span>
            )
          ) : (
            // Renderizar label se não houver children
            label && (
              <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
                {label}
              </span>
            )
          )}
        </div>

        {tooltip && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 cursor-pointer text-muted-foreground transition duration-100 ease-linear hover:text-foreground focus:text-foreground" />
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
              {tooltip}
            </div>
          </div>
        )}

        {sortable &&
          (sorted ? (
            <ArrowDown
              className={cn(
                "h-3 w-3 stroke-[3px] text-muted-foreground",
                sorted === "asc" && "rotate-180"
              )}
            />
          ) : (
            <ChevronsUpDown size={12} strokeWidth={3} className="text-muted-foreground" />
          ))}
      </div>
    </th>
  );
};

interface TableRowProps extends ComponentPropsWithRef<"tr"> {
  highlightSelectedRow?: boolean;
  selected?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  highlightSelectedRow = true,
  selected = false,
  ...props
}) => {
  const { size } = useContext(DataTableContext);

  return (
    <tr
      {...props}
      className={cn(
        "relative outline-ring transition-colors after:pointer-events-none hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2",
        size === "sm" ? "h-14" : "h-18",
        highlightSelectedRow && selected && "bg-muted",
        "[&>td]:after:absolute [&>td]:after:inset-x-0 [&>td]:after:bottom-0 [&>td]:after:h-px [&>td]:after:w-full [&>td]:after:bg-border last:[&>td]:after:hidden [&>td]:focus-visible:after:opacity-0",
        className
      )}
    >
      {children}
    </tr>
  );
};

const TableCell: React.FC<ComponentPropsWithRef<"td">> = ({ className, children, ...props }) => {
  const { size } = useContext(DataTableContext);

  return (
    <td
      {...props}
      className={cn(
        "relative text-sm text-muted-foreground outline-ring focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2",
        size === "sm" && "px-5 py-3",
        size === "md" && "px-6 py-4",
        className
      )}
    >
      {children}
    </td>
  );
};

const TableBody: React.FC<ComponentPropsWithRef<"tbody">> = ({ children, className, ...props }) => {
  return (
    <tbody className={cn(className)} {...props}>
      {children}
    </tbody>
  );
};

// ============================================================================
// DataTable Component
// ============================================================================

function DataTable<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  className,
  emptyMessage = "Nenhum item encontrado",
  loading = false,
  size = "md",
  enableRowSelection = false,
  onSelectionChange,
  enablePagination = true,
  paginationType = "text",
  pageSize = 10,
  pageSizeOptions = [20, 25, 50, 100, 200],
  enablePageSizeSelector = false,
  enableGlobalFilter = true,
  globalFilterPlaceholder = "Buscar...",
  enableSorting = true,
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
  paginationMode = "client",
  totalCount,
  onPaginationChange,
  sortingMode = "client",
  onSortingChange,
  headerActions,
  footerContent,
}: DataTableProps<T>) {
  // Adicionar coluna de seleção se habilitada e garantir que todas as colunas tenham id
  const tableColumns = useMemo(() => {
    // Garantir que todas as colunas tenham id
    const columnsWithId = columns.map((column, index) => {
      // Se a coluna já tem id, retornar como está
      if (column.id) {
        return column;
      }

      // Se não tem id mas tem accessorKey, usar o accessorKey como id
      if ("accessorKey" in column && column.accessorKey && typeof column.accessorKey === "string") {
        return { ...column, id: column.accessorKey };
      }

      // Se não tem id nem accessorKey, mas tem accessorFn, tentar inferir do header
      if ("accessorFn" in column) {
        const headerId =
          typeof column.header === "string"
            ? column.header.toLowerCase().replace(/\s+/g, "_")
            : `column_${index}`;
        return { ...column, id: headerId };
      }

      // Se o header é string, usar como id base
      if (typeof column.header === "string") {
        return { ...column, id: column.header.toLowerCase().replace(/\s+/g, "_") };
      }

      // Último recurso: gerar id baseado no índice
      return { ...column, id: `column_${index}` };
    });

    if (!enableRowSelection) return columnsWithId;

    const selectionColumn: ColumnDef<T, unknown> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-start">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked: boolean) => table.toggleAllPageRowsSelected(checked)}
            aria-label="Selecionar todos"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-end">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked: boolean) => row.toggleSelected(checked)}
            aria-label="Selecionar linha"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columnsWithId];
  }, [columns, enableRowSelection]);

  // Usar hook apropriado baseado no modo
  const useServerSide = paginationMode === "server" || sortingMode === "server";

  const tableHookFront = useReactTableFront({
    data,
    columns: tableColumns,
    enablePagination,
    pageSize,
    enableSorting,
    initialSorting,
    enableGlobalFilter,
    initialColumnFilters,
    initialColumnVisibility,
    enableRowSelection,
    onSelectionChange,
  });

  const tableHookBack = useReactTableBack({
    data,
    columns: tableColumns,
    totalCount: totalCount ?? data.length,
    enablePagination,
    pageSize,
    onPaginationChange,
    enableSorting,
    initialSorting,
    onSortingChange,
    initialColumnFilters,
    initialColumnVisibility,
    enableRowSelection,
    onSelectionChange,
  });

  // Escolher hook baseado no modo (mas sempre chamar ambos para evitar problemas de hooks)
  // O hook não usado será ignorado pelo React
  const tableHook = useServerSide ? tableHookBack : tableHookFront;
  const { table, globalFilter, setGlobalFilter, paginationInfo } = tableHook;

  if (loading) {
    return (
      <TableCardRoot size={size} className={className}>
        {title && <TableCardHeader title={title} />}
        <div className="p-6">
          <div className="space-y-4">
            {["loading-row-0", "loading-row-1", "loading-row-2"].map((id) => (
              <div key={id} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </TableCardRoot>
    );
  }

  return (
    <TableCardRoot size={size} className={className}>
      {(title || enableGlobalFilter || headerActions) && (
        <TableCardHeader
          title={title}
          contentTrailing={
            <div className="flex items-center gap-2">
              {enableGlobalFilter && (
                <Input
                  placeholder={globalFilterPlaceholder}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="max-w-sm"
                />
              )}
              {headerActions}
            </div>
          }
        />
      )}

      <div className="overflow-x-auto">
        <TableRoot size={size}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnDef = header.column.columnDef;
                  const isSortable = enableSorting && columnDef.enableSorting !== false;
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      sortable={isSortable}
                      sorted={sorted === false ? false : sorted === "asc" ? "asc" : "desc"}
                      onSort={header.column.getToggleSortingHandler() as (() => void) | undefined}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                      }}
                    >
                      {!header.isPlaceholder && flexRender(columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: Row<T>) => (
                <TableRow
                  key={row.id}
                  selected={enableRowSelection ? row.getIsSelected() : false}
                  highlightSelectedRow={enableRowSelection}
                >
                  {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </div>

      {(enablePagination || footerContent) && (
        <DataTablePagination
          table={table}
          size={size}
          paginationType={paginationType}
          enablePageSizeSelector={enablePageSizeSelector}
          pageSizeOptions={pageSizeOptions}
          footerContent={footerContent}
          paginationInfo={paginationInfo}
        />
      )}
    </TableCardRoot>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { DataTable };

// Re-export TanStack Table types for convenience
export type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
