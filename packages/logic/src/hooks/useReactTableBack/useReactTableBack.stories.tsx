import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useState } from "react";
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
    // Simular delay de API
    setTimeout(() => {
      setLoading(false);
    }, 300);
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

  return (
    <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold">Tabela com useReactTableBack (Server-side)</h3>
        <div className="mt-2 text-sm text-gray-600">
          Total de itens no servidor: {allServerData.length} | Página atual: {currentPage + 1}
        </div>
        {loading && (
          <div className="mt-2 text-sm text-blue-600">Carregando dados do servidor...</div>
        )}
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
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.length === 0 ? (
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
          <div className="text-sm text-gray-700">
            Mostrando {paginationInfo.start} a {paginationInfo.end} de {paginationInfo.total} itens
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
