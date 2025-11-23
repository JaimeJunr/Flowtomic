import type { Meta, StoryObj } from "@storybook/react-vite";
import { type Project, useProjectStats } from "./index";

/**
 * Story demonstrando o uso do hook useProjectStats
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useProjectStats",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica para calcular estatísticas de projetos. Você controla o markup e styles.",
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
function ProjectStatsDemo({ projects }: { projects: Project[] }) {
  const { total, ended, running, pending, onHold, cancelled, stats } = useProjectStats({
    projects,
  });

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <div className="text-sm text-muted-foreground">Running</div>
          <div className="text-2xl font-bold">{running}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-muted-foreground">Ended</div>
          <div className="text-2xl font-bold">{ended}</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold">{pending}</div>
        </div>
        <div className="p-4 bg-orange-50 rounded">
          <div className="text-sm text-muted-foreground">On Hold</div>
          <div className="text-2xl font-bold">{onHold}</div>
        </div>
        <div className="p-4 bg-red-50 rounded">
          <div className="text-sm text-muted-foreground">Cancelled</div>
          <div className="text-2xl font-bold">{cancelled}</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <div className="text-sm font-semibold mb-2">By Status:</div>
        <pre className="text-xs">{JSON.stringify(stats.byStatus, null, 2)}</pre>
      </div>
    </div>
  );
}

const sampleProjects: Project[] = [
  { id: "1", status: "running", name: "Project A" },
  { id: "2", status: "running", name: "Project B" },
  { id: "3", status: "ended", name: "Project C" },
  { id: "4", status: "ended", name: "Project D" },
  { id: "5", status: "pending", name: "Project E" },
  { id: "6", status: "on-hold", name: "Project F" },
  { id: "7", status: "cancelled", name: "Project G" },
];

export const Default: Story = {
  render: () => <ProjectStatsDemo projects={sampleProjects} />,
};

export const WithFilter: Story = {
  render: () => {
    const { total, running, ended } = useProjectStats({
      projects: sampleProjects,
      filter: (project) => project.status === "running" || project.status === "ended",
    });

    return (
      <div className="flex flex-col gap-4 p-6 border rounded-lg">
        <div className="text-sm text-muted-foreground">Filtered (Running + Ended only)</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <div className="text-sm">Total</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <div className="text-sm">Running</div>
            <div className="text-2xl font-bold">{running}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <div className="text-sm">Ended</div>
            <div className="text-2xl font-bold">{ended}</div>
          </div>
        </div>
      </div>
    );
  },
};

export const WithGroupBy: Story = {
  render: () => {
    const { grouped } = useProjectStats({
      projects: sampleProjects,
      groupBy: (project) => project.status,
    });

    return (
      <div className="flex flex-col gap-4 p-6 border rounded-lg">
        <div className="text-sm font-semibold mb-2">Grouped by Status:</div>
        <pre className="text-xs bg-gray-50 p-4 rounded">{JSON.stringify(grouped, null, 2)}</pre>
      </div>
    );
  },
};
