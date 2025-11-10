import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useReactTableFront } from "./index";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

const sampleData: User[] = Array.from({ length: 50 }, (_, i) => ({
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
 * Story demonstrando o uso do hook useReactTableFront
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useReactTableFront",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica de tabela com paginação e ordenação no frontend (client-side). Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function TableDemo({
  enablePagination = true,
  enableSorting = true,
  enableGlobalFilter = true,
  pageSize = 10,
}: {
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableGlobalFilter?: boolean;
  pageSize?: number;
}) {
  const { table, globalFilter, setGlobalFilter, paginationInfo } = useReactTableFront({
    data: sampleData,
    columns,
    enablePagination,
    pageSize,
    enableSorting,
    enableGlobalFilter,
  });

  return (
    <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-semibold">Tabela com useReactTableFront</h3>
        {enableGlobalFilter && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
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
              disabled={!table.getCanPreviousPage()}
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
              disabled={!table.getCanNextPage()}
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

export const WithoutGlobalFilter: Story = {
  render: () => <TableDemo enableGlobalFilter={false} />,
};

export const CustomPageSize: Story = {
  render: () => <TableDemo pageSize={5} />,
};

export const AllFeatures: Story = {
  render: () => (
    <TableDemo enablePagination={true} enableSorting={true} enableGlobalFilter={true} />
  ),
};
