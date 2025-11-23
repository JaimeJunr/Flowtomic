import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Code, Layers, Settings, TestTube, Zap } from "lucide-react";
import { type Project, ProjectList } from "./project-list";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ProjectList",
  component: ProjectList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Lista de projetos com ícones, datas e ações.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProjectList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Develop API Endpoints",
    dueDate: new Date(2024, 10, 26),
    icon: <ArrowRight className="h-5 w-5 text-blue-600" />,
    iconColor: "rgba(37, 99, 235, 0.1)",
    status: "active",
  },
  {
    id: "2",
    name: "Onboarding Flow",
    dueDate: new Date(2024, 10, 28),
    icon: <Layers className="h-5 w-5 text-green-600" />,
    iconColor: "rgba(22, 163, 74, 0.1)",
    status: "active",
  },
  {
    id: "3",
    name: "Build Dashboard",
    dueDate: new Date(2024, 10, 30),
    icon: <Code className="h-5 w-5 text-yellow-600" />,
    iconColor: "rgba(202, 138, 4, 0.1)",
    status: "active",
  },
  {
    id: "4",
    name: "Optimize Page Load",
    dueDate: new Date(2024, 11, 5),
    icon: <Zap className="h-5 w-5 text-orange-600" />,
    iconColor: "rgba(234, 88, 12, 0.1)",
    status: "pending",
  },
  {
    id: "5",
    name: "Cross-Browser Testing",
    dueDate: new Date(2024, 11, 6),
    icon: <TestTube className="h-5 w-5 text-purple-600" />,
    iconColor: "rgba(147, 51, 234, 0.1)",
    status: "pending",
  },
];

export const Default: Story = {
  args: {
    projects: sampleProjects,
    title: "Project",
    onAddNew: () => console.log("Add new project"),
  },
};

export const WithClickHandler: Story = {
  args: {
    projects: sampleProjects,
    title: "Project",
    onProjectClick: (project) => console.log("Clicked:", project),
    onAddNew: () => console.log("Add new project"),
  },
};

export const Empty: Story = {
  args: {
    projects: [],
    title: "Project",
    onAddNew: () => console.log("Add new project"),
  },
};

export const CustomTitle: Story = {
  args: {
    projects: sampleProjects.slice(0, 3),
    title: "My Projects",
    addButtonText: "Create Project",
    onAddNew: () => console.log("Add new project"),
  },
};
