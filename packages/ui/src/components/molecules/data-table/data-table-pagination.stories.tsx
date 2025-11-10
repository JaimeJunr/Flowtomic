import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { useReactTableFront } from "flowtomic/logic";
import { DataTablePagination } from "./data-table-pagination";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Dados de exemplo para criar tabela
const sampleData: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Usuário ${i + 1}`,
  email: `usuario${i + 1}@exemplo.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Moderador" : "Usuário",
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
];

// Componente wrapper para criar tabela real
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
    <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold">Tabela de Exemplo</h3>
      </div>
      <div className="p-4">
        <div className="text-sm text-muted-foreground">
          Esta é uma tabela de exemplo para demonstrar a paginação. A tabela contém{" "}
          {sampleData.length} itens.
        </div>
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

// ============================================================================
// DataTablePagination Stories
// ============================================================================

const paginationMeta = {
  title: "Flowtomic UI/Molecules/DataTablePagination",
  component: DataTablePagination,
  parameters: {
    layout: "centered",
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
} satisfies Meta<typeof DataTablePagination<User>>;

export default paginationMeta;
type PaginationStory = StoryObj<typeof paginationMeta>;

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
      start: 21,
      end: 40,
      total: 150,
      pageCount: 8,
    },
  },
};

export const WithCustomFooter: PaginationStory = {
  render: (args) => (
    <PaginationWrapper
      {...args}
      footerContent={
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-muted-foreground">Conteúdo customizado do footer</div>
          <div className="text-sm text-muted-foreground">Total: {sampleData.length} itens</div>
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
  render: (args) => {
    // Criar dados para muitas páginas
    const manyData = Array.from({ length: 200 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Usuário ${i + 1}`,
      email: `usuario${i + 1}@exemplo.com`,
      role: "Usuário",
    }));

    function ManyPagesWrapper() {
      const { table } = useReactTableFront({
        data: manyData,
        columns,
        enablePagination: true,
        pageSize: 10,
        enableSorting: false,
        enableGlobalFilter: false,
      });

      return (
        <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-semibold">Tabela com Muitas Páginas</h3>
          </div>
          <div className="p-4">
            <div className="text-sm text-muted-foreground">
              Esta tabela contém {manyData.length} itens para demonstrar a paginação com muitas
              páginas.
            </div>
          </div>
          <DataTablePagination
            table={table}
            size={args.size}
            paginationType={args.paginationType}
            enablePageSizeSelector={args.enablePageSizeSelector}
            pageSizeOptions={args.pageSizeOptions}
          />
        </div>
      );
    }

    return <ManyPagesWrapper />;
  },
  args: {
    paginationType: "buttons",
    size: "md",
    enablePageSizeSelector: false,
  },
};
