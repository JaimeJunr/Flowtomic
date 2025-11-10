import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { fn } from "storybook/test";
import { DataTable } from "./data-table";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

const sampleData: User[] = [
  { id: "1", name: "João Silva", email: "joao@exemplo.com", role: "Admin", status: "active" },
  { id: "2", name: "Maria Santos", email: "maria@exemplo.com", role: "Usuário", status: "active" },
  { id: "3", name: "Pedro Costa", email: "pedro@exemplo.com", role: "Usuário", status: "inactive" },
  { id: "4", name: "Ana Oliveira", email: "ana@exemplo.com", role: "Moderador", status: "active" },
  {
    id: "5",
    name: "Carlos Souza",
    email: "carlos@exemplo.com",
    role: "Usuário",
    status: "inactive",
  },
];

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
      <span className={row.original.status === "active" ? "text-success" : "text-muted-foreground"}>
        {row.original.status === "active" ? "Ativo" : "Inativo"}
      </span>
    ),
  },
];

const meta = {
  title: "Flowtomic UI/Molecules/DataTable",
  component: DataTable,
  parameters: {
    layout: "centered",
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
} satisfies Meta<typeof DataTable<User>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
  },
};

export const WithPagination: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
    enablePagination: true,
    pageSize: 3,
  },
};

export const WithRowSelection: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
    enableRowSelection: true,
    onSelectionChange: fn(),
  },
};

export const WithGlobalFilter: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
    enableGlobalFilter: true,
    globalFilterPlaceholder: "Buscar usuários...",
  },
};

export const WithSorting: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
    enableSorting: true,
  },
};

export const Small: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
    size: "sm",
  },
};

export const Loading: Story = {
  args: {
    title: "Usuários",
    data: [],
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    title: "Usuários",
    data: [],
    columns,
    emptyMessage: "Nenhum usuário encontrado",
  },
};

export const FullFeatured: Story = {
  args: {
    title: "Usuários",
    data: sampleData,
    columns,
    enableRowSelection: true,
    enablePagination: true,
    enableGlobalFilter: true,
    enableSorting: true,
    onSelectionChange: fn(),
  },
};
