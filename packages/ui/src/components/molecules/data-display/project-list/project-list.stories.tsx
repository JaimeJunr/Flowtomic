import type { Meta, StoryObj } from "@storybook/react-vite";
import { Globe, Layers, Package, Palette, Terminal } from "lucide-react";
import { type Project, ProjectList } from "./project-list";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ProjectList",
  component: ProjectList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Lista densa de projetos: nome, prazo em pt-BR e estado. Prazo passado de projeto não concluído aparece como "venceu".',
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProjectList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Datas relativas a hoje, para a story sempre ter um prazo vencido e os outros no futuro.
const daysFromNow = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Release 0.9.0 do @flowtomic/ui",
    dueDate: daysFromNow(9),
    icon: <Package />,
    status: "active",
  },
  {
    id: "2",
    name: "Registry de volta no ar",
    dueDate: daysFromNow(-5),
    icon: <Globe />,
    status: "pending",
  },
  {
    id: "3",
    name: "Molecules sem template",
    dueDate: daysFromNow(6),
    icon: <Layers />,
    status: "active",
  },
  {
    id: "4",
    name: "flowtomic-cli com proveniência",
    dueDate: daysFromNow(20),
    icon: <Terminal />,
    status: "on-hold",
  },
  {
    id: "5",
    name: "Tema Urucum",
    dueDate: daysFromNow(-1),
    icon: <Palette />,
    status: "completed",
  },
];

export const Default: Story = {
  args: {
    projects: sampleProjects,
    onAddNew: () => console.log("Novo projeto"),
  },
};

export const WithClickHandler: Story = {
  args: {
    projects: sampleProjects,
    onProjectClick: (project) => console.log("Projeto:", project),
    onAddNew: () => console.log("Novo projeto"),
  },
};

export const Empty: Story = {
  args: {
    projects: [],
    onAddNew: () => console.log("Novo projeto"),
  },
};

export const CustomTitle: Story = {
  args: {
    projects: sampleProjects.slice(0, 3),
    title: "Em andamento",
    addButtonText: "Criar",
    onAddNew: () => console.log("Novo projeto"),
  },
};
