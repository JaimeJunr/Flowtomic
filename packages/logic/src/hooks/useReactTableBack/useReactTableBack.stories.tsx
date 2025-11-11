import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useState } from "react";
import { Loader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@flowtomic/ui";
import { useReactTableBack } from "./index";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

// Simular dados do servidor
const allServerData: User[] = Array.from({ length: 150 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Usuário ${i + 1}`,
  email: `usuario${i + 1}@exemplo.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Moderador" : "Usuário",
  status: i % 2 === 0 ? "active" : "inactive",
}));

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "role",
    header: "Função",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.status === "active" ? "text-green-600" : "text-gray-500"}>
        {row.original.status === "active" ? "Ativo" : "Inativo"}
      </span>
    ),
  },
];

/**
 * Story demonstrando o uso do hook useReactTableBack
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useReactTableBack",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica de tabela com paginação e ordenação no backend (server-side). Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 * Simula chamadas ao servidor
 */
function TableDemo({
  enablePagination = true,
  enableSorting = true,
  pageSize = 10,
}: {
  enablePagination?: boolean;
  enableSorting?: boolean;
  pageSize?: number;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [currentSorting, setCurrentSorting] = useState<SortingState>([]);
  const [loading, setLoading] = useState(false);

  // Simular busca no servidor
  const fetchData = (_pageIndex: number, _pageSize: number, _sorting: SortingState) => {
    setLoading(true);
    // Simular delay de API (2 segundos)
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  // Obter dados da página atual (simulando resposta do servidor)
  const getPageData = (pageIndex: number, pageSize: number, sorting: SortingState) => {
    const data = [...allServerData];

    // Aplicar ordenação (simulando ordenação no servidor)
    if (sorting.length > 0) {
      const sort = sorting[0];
      data.sort((a, b) => {
        const aValue = a[sort.id as keyof User];
        const bValue = b[sort.id as keyof User];
        if (sort.desc) {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });
    }

    // Aplicar paginação
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  };

  const { table, paginationInfo } = useReactTableBack({
    data: getPageData(currentPage, currentPageSize, currentSorting),
    columns,
    totalCount: allServerData.length,
    enablePagination,
    pageSize: currentPageSize,
    onPaginationChange: ({ pageIndex, pageSize: newPageSize }) => {
      setCurrentPage(pageIndex);
      setCurrentPageSize(newPageSize);
      fetchData(pageIndex, newPageSize, currentSorting);
    },
    enableSorting,
    onSortingChange: (sorting) => {
      setCurrentSorting(sorting);
      setCurrentPage(0); // Resetar para primeira página ao ordenar
      fetchData(0, currentPageSize, sorting);
    },
  });

  // Calcular informações que o backend retornaria (usando estado do table para garantir sincronização)
  const paginationState = enablePagination ? table.getState().pagination : null;
  const pageIndex = paginationState?.pageIndex ?? 0;
  const currentPageSizeValue = paginationState?.pageSize ?? currentPageSize;
  const offset = enablePagination ? pageIndex * currentPageSizeValue : 0;
  const limit = currentPageSizeValue;
  const total = allServerData.length;
  const page = enablePagination ? pageIndex + 1 : 1;
  
  // Informações de ordenação
  const activeSort = currentSorting.length > 0 ? currentSorting[0] : null;
  const sortField = activeSort?.id || null;
  const sortDirection = activeSort?.desc ? "desc" : "asc";

  return (
    <div className="w-full max-w-4xl min-h-[600px] rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold">Tabela com useReactTableBack (Server-side)</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          <div>
            <span className="font-medium">Total:</span> {total} itens no servidor
          </div>
          <div className="flex flex-wrap gap-4">
            {enablePagination && (
              <>
                <span>
                  <span className="font-medium">Page:</span> {page}
                </span>
                <span>
                  <span className="font-medium">Page Size:</span> {limit}
                </span>
                <span>
                  <span className="font-medium">Offset:</span> {offset}
                </span>
              </>
            )}
            {sortField && (
              <span>
                <span className="font-medium">Sort:</span> {sortField} ({sortDirection})
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                      style={{
                        cursor: enableSorting && header.column.getCanSort() ? "pointer" : "default",
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted && (
                          <span className="text-gray-400">{sorted === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className={`divide-y divide-gray-200 bg-white ${loading ? "min-h-[400px]" : ""}`}>
            {loading ? (
              <tr className="h-[400px]">
                <td colSpan={columns.length} className="px-6 py-12 text-center h-full">
                  <div className="flex flex-col items-center justify-center gap-3 h-full">
                    <Loader size={24} />
                    <span className="text-sm text-gray-500">Carregando dados...</span>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  Nenhum item encontrado
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {enablePagination && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              Mostrando {paginationInfo.start} a {paginationInfo.end} de {paginationInfo.total} itens
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Mostrar</span>
              <Select
                value={currentPageSizeValue.toString()}
                onValueChange={(value) => {
                  const newPageSize = Number(value);
                  table.setPageSize(newPageSize);
                  table.setPageIndex(0);
                  setCurrentPageSize(newPageSize);
                  setCurrentPage(0);
                  fetchData(0, newPageSize, currentSorting);
                }}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || loading}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {table.getState().pagination.pageIndex + 1} de {paginationInfo.pageCount}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || loading}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <TableDemo />,
};

export const WithoutPagination: Story = {
  render: () => <TableDemo enablePagination={false} />,
};

export const WithoutSorting: Story = {
  render: () => <TableDemo enableSorting={false} />,
};

export const CustomPageSize: Story = {
  render: () => <TableDemo pageSize={5} />,
};

export const WithSorting: Story = {
  render: () => <TableDemo enableSorting={true} />,
};
