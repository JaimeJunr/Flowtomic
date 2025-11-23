import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ProjectWithProgress, useProjectProgress } from "./index";

/**
 * Story demonstrando o uso do hook useProjectProgress
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useProjectProgress",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica para calcular progresso de projetos. Você controla o markup e styles.",
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
function ProjectProgressDemo({ projects }: { projects: ProjectWithProgress[] }) {
  const { percentage, status, distribution, total, completed, inProgress, pending, onHold } =
    useProjectProgress({
      projects,
    });

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-lg">
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">{percentage}%</div>
        <div className="text-sm text-muted-foreground">Overall Progress</div>
        <div className="text-xs text-muted-foreground mt-1">Status: {status}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 rounded">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold">{completed}</div>
        </div>
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-2xl font-bold">{inProgress}</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold">{pending}</div>
        </div>
        <div className="p-4 bg-orange-50 rounded">
          <div className="text-sm text-muted-foreground">On Hold</div>
          <div className="text-2xl font-bold">{onHold}</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <div className="text-sm font-semibold mb-2">Distribution:</div>
        <pre className="text-xs">{JSON.stringify(distribution, null, 2)}</pre>
        <div className="text-xs text-muted-foreground mt-2">Total: {total} projects</div>
      </div>
    </div>
  );
}

const sampleProjects: ProjectWithProgress[] = [
  { id: "1", status: "completed", progress: 100, name: "Project A" },
  { id: "2", status: "completed", progress: 100, name: "Project B" },
  { id: "3", status: "in-progress", progress: 75, name: "Project C" },
  { id: "4", status: "in-progress", progress: 50, name: "Project D" },
  { id: "5", status: "pending", name: "Project E" },
  { id: "6", status: "pending", name: "Project F" },
  { id: "7", status: "on-hold", name: "Project G" },
];

export const Default: Story = {
  render: () => <ProjectProgressDemo projects={sampleProjects} />,
};

export const AllCompleted: Story = {
  render: () => {
    const projects: ProjectWithProgress[] = [
      { id: "1", status: "completed", progress: 100 },
      { id: "2", status: "completed", progress: 100 },
      { id: "3", status: "completed", progress: 100 },
    ];
    return <ProjectProgressDemo projects={projects} />;
  },
};

export const AllPending: Story = {
  render: () => {
    const projects: ProjectWithProgress[] = [
      { id: "1", status: "pending" },
      { id: "2", status: "pending" },
      { id: "3", status: "pending" },
    ];
    return <ProjectProgressDemo projects={projects} />;
  },
};

export const MixedProgress: Story = {
  render: () => {
    const projects: ProjectWithProgress[] = [
      { id: "1", status: "completed", progress: 100 },
      { id: "2", status: "in-progress", progress: 60 },
      { id: "3", status: "in-progress", progress: 30 },
      { id: "4", status: "pending" },
    ];
    return <ProjectProgressDemo projects={projects} />;
  },
};
