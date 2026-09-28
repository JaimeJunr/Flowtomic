import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTablePaginationSkeleton } from "./data-table-pagination";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/DataTablePaginationSkeleton",
  component: DataTablePaginationSkeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Mostra a paginação em carregamento abaixo de uma lista de componentes.",
      },
    },
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

function ComponentsPreview() {
  return (
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
          {[
            {
              name: "stats-grid",
              category: "block",
              version: "0.9.0",
              status: "Publicado",
              color: "bg-success",
            },
            {
              name: "project-list",
              category: "organism",
              version: "0.8.0",
              status: "Em revisão",
              color: "bg-warning",
            },
            {
              name: "developer-panel",
              category: "block",
              version: "0.7.2",
              status: "Rascunho",
              color: "bg-muted-foreground",
            },
          ].map((item) => (
            <tr key={item.name} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-mono">{item.name}</td>
              <td className="px-4 py-2">{item.category}</td>
              <td className="px-4 py-2 font-mono">{item.version}</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center gap-2">
                  <span className={`size-2 rounded-full ${item.color}`} />
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl rounded-[10px] border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold">Componentes</h3>
      </div>
      <ComponentsPreview />
      <DataTablePaginationSkeleton {...args} />
    </div>
  ),
  args: {
    size: "md",
  },
};

export const Small: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl rounded-[10px] border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold">Componentes</h3>
      </div>
      <ComponentsPreview />
      <DataTablePaginationSkeleton {...args} />
    </div>
  ),
  args: {
    size: "sm",
  },
};
