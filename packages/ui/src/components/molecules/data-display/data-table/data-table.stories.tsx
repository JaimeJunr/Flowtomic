import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { fn } from "storybook/test";
import { DataTable } from "./data-table";

type ComponentItem = {
  id: string;
  name: string;
  category: "atom" | "molecule" | "organism" | "block";
  version: string;
  status: "Publicado" | "Em revisão" | "Rascunho";
};

const sampleData: ComponentItem[] = [
  { id: "1", name: "stats-grid", category: "block", version: "0.9.0", status: "Publicado" },
  {
    id: "2",
    name: "team-member-list",
    category: "organism",
    version: "0.8.0",
    status: "Publicado",
  },
  { id: "3", name: "project-list", category: "organism", version: "0.9.0", status: "Em revisão" },
  { id: "4", name: "developer-panel", category: "block", version: "0.7.2", status: "Rascunho" },
  { id: "5", name: "data-table", category: "molecule", version: "0.9.0", status: "Publicado" },
  { id: "6", name: "button", category: "atom", version: "0.8.0", status: "Publicado" },
  {
    id: "7",
    name: "chart-area-interactive",
    category: "molecule",
    version: "0.9.0",
    status: "Em revisão",
  },
  {
    id: "8",
    name: "sidebar-navigation",
    category: "molecule",
    version: "0.7.2",
    status: "Rascunho",
  },
];

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
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${
            row.original.status === "Publicado"
              ? "bg-success"
              : row.original.status === "Em revisão"
                ? "bg-warning"
                : "bg-muted-foreground"
          }`}
        />
        {row.original.status}
      </span>
    ),
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Lista componentes do Flowtomic com busca, ordenação e seleção opcionais.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    enableRowSelection: {
      control: "boolean",
    },
    enablePagination: {
      control: "boolean",
    },
    enableGlobalFilter: {
      control: "boolean",
    },
    enableSorting: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DataTable<ComponentItem>>;

export default meta;
type Story = StoryObj<typeof DataTable<ComponentItem>>;

export const Default: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
  },
};

export const WithPagination: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
    enablePagination: true,
    pageSize: 3,
  },
};

export const WithRowSelection: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
    enableRowSelection: true,
    onSelectionChange: fn(),
  },
};

export const WithGlobalFilter: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
    enableGlobalFilter: true,
    globalFilterPlaceholder: "Buscar componentes...",
  },
};

export const WithSorting: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
    enableSorting: true,
  },
};

export const Small: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
    size: "sm",
  },
};

export const Loading: Story = {
  args: {
    title: "Componentes",
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    title: "Componentes",
    data: [],
    columns,
    emptyMessage: "Nenhum componente encontrado",
  },
};

export const FullFeatured: Story = {
  args: {
    title: "Componentes",
    data: sampleData,
    columns,
    enableRowSelection: true,
    enablePagination: true,
    enableGlobalFilter: true,
    enableSorting: true,
    onSelectionChange: fn(),
  },
};
