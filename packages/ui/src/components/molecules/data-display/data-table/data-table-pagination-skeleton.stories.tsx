import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTablePaginationSkeleton } from "./data-table-pagination";

const meta = {
  title: "Flowtomic UI/Molecules/DataDisplay/DataTablePaginationSkeleton",
  component: DataTablePaginationSkeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof DataTablePaginationSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold">Tabela de Exemplo</h3>
      </div>
      <div className="p-4">
        <div className="text-sm text-muted-foreground">Carregando dados da tabela...</div>
      </div>
      <DataTablePaginationSkeleton {...args} />
    </div>
  ),
  args: {
    size: "md",
  },
};

export const Small: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold">Tabela de Exemplo</h3>
      </div>
      <div className="p-4">
        <div className="text-sm text-muted-foreground">Carregando dados da tabela...</div>
      </div>
      <DataTablePaginationSkeleton {...args} />
    </div>
  ),
  args: {
    size: "sm",
  },
};
