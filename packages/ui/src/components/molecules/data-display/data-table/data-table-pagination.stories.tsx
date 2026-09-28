import { useReactTableFront } from "@flowtomic/logic";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTablePagination, type DataTablePaginationProps } from "./data-table-pagination";

type ComponentItem = {
  id: string;
  name: string;
  category: "atom" | "molecule" | "organism" | "block";
  version: string;
  status: "Publicado" | "Em revisão" | "Rascunho";
};

const components: Pick<ComponentItem, "name" | "category">[] = [
  { name: "stats-grid", category: "block" },
  { name: "team-member-list", category: "organism" },
  { name: "project-list", category: "organism" },
  { name: "developer-panel", category: "block" },
  { name: "data-table", category: "molecule" },
  { name: "button", category: "atom" },
  { name: "chart-area-interactive", category: "molecule" },
  { name: "sidebar-navigation", category: "molecule" },
];
const suffixes = [
  "",
  "-compacto",
  "-responsivo",
  "-com-filtro",
  "-denso",
  "-detalhado",
  "-com-selecao",
];
const versions = ["0.7.2", "0.8.0", "0.9.0"];
const statuses: ComponentItem["status"][] = ["Publicado", "Em revisão", "Rascunho"];

const sampleData: ComponentItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  name: `${components[i % components.length].name}${suffixes[Math.floor(i / components.length)]}`,
  category: components[i % components.length].category,
  version: versions[i % versions.length],
  status: statuses[i % statuses.length],
}));

const columns: ColumnDef<ComponentItem>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "category",
    header: "Categoria",
  },
  {
    accessorKey: "version",
    header: "Versão",
  },
  {
    accessorKey: "status",
    header: "Estado",
  },
];

function PaginationWrapper({
  paginationType = "text",
  enablePageSizeSelector = false,
  size = "md",
  pageSize = 10,
  pageSizeOptions = [10, 20, 25, 50, 100],
  paginationInfo,
  footerContent,
}: {
  paginationType?: "text" | "buttons";
  enablePageSizeSelector?: boolean;
  size?: "sm" | "md";
  pageSize?: number;
  pageSizeOptions?: number[];
  paginationInfo?: {
    start: number;
    end: number;
    total: number;
    pageCount: number;
  };
  footerContent?: React.ReactNode;
}) {
  const { table } = useReactTableFront({
    data: sampleData,
    columns,
    enablePagination: true,
    pageSize,
    enableSorting: false,
    enableGlobalFilter: false,
  });

  return (
    <div className="w-full max-w-4xl rounded-[10px] border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold">Componentes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Categoria</th>
              <th className="px-4 py-2 font-medium">Versão</th>
              <th className="px-4 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map(({ original }) => (
              <tr key={original.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-mono">{original.name}</td>
                <td className="px-4 py-2">{original.category}</td>
                <td className="px-4 py-2 font-mono">{original.version}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        original.status === "Publicado"
                          ? "bg-success"
                          : original.status === "Em revisão"
                            ? "bg-warning"
                            : "bg-muted-foreground"
                      }`}
                    />
                    {original.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        table={table}
        size={size}
        paginationType={paginationType}
        enablePageSizeSelector={enablePageSizeSelector}
        pageSizeOptions={pageSizeOptions}
        paginationInfo={paginationInfo}
        footerContent={footerContent}
      />
    </div>
  );
}

const paginationMeta = {
  title: "Flowtomic UI/Molecules/Data Display/DataTablePagination",
  component: DataTablePagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Navega pelas páginas de uma lista de componentes do Flowtomic.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    paginationType: {
      control: "select",
      options: ["text", "buttons"],
    },
    enablePageSizeSelector: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DataTablePagination<ComponentItem>>;

export default paginationMeta;
type PaginationStory = StoryObj<Omit<DataTablePaginationProps<ComponentItem>, "table">>;

export const Default: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "text",
    size: "md",
    enablePageSizeSelector: false,
  },
};

export const TextType: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "text",
    size: "md",
    enablePageSizeSelector: false,
  },
};

export const ButtonsType: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "buttons",
    size: "md",
    enablePageSizeSelector: false,
  },
};

export const WithPageSizeSelector: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "text",
    size: "md",
    enablePageSizeSelector: true,
    pageSizeOptions: [10, 20, 25, 50, 100],
  },
};

export const ButtonsWithPageSizeSelector: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "buttons",
    size: "md",
    enablePageSizeSelector: true,
    pageSizeOptions: [10, 20, 25, 50, 100],
  },
};

export const Small: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "text",
    size: "sm",
    enablePageSizeSelector: false,
  },
};

export const SmallWithButtons: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "buttons",
    size: "sm",
    enablePageSizeSelector: false,
  },
};

export const WithCustomPageSizeOptions: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "text",
    size: "md",
    enablePageSizeSelector: true,
    pageSizeOptions: [5, 10, 15, 30],
  },
};

export const WithServerSidePagination: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} />,
  args: {
    paginationType: "text",
    size: "md",
    enablePageSizeSelector: false,
    paginationInfo: {
      start: 1,
      end: 10,
      total: 50,
      pageCount: 5,
    },
  },
};

export const WithCustomFooter: PaginationStory = {
  render: (args) => (
    <PaginationWrapper
      {...args}
      footerContent={
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-muted-foreground">Catálogo do Flowtomic</div>
          <div className="text-sm text-muted-foreground">{sampleData.length} componentes</div>
        </div>
      }
    />
  ),
  args: {
    paginationType: "text",
    size: "md",
    enablePageSizeSelector: false,
  },
};

export const ManyPages: PaginationStory = {
  render: (args) => <PaginationWrapper {...args} pageSize={5} />,
  args: {
    paginationType: "buttons",
    size: "md",
    enablePageSizeSelector: false,
  },
};
