import type { Meta, StoryObj } from "@storybook/react-vite";
import { type TeamMember, TeamMemberList } from "./team-member-list";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/TeamMemberList",
  component: TeamMemberList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lista densa de quem está na equipe: nome, tarefa atual e estado. A foto só aparece quando todas as pessoas têm `avatar`.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TeamMemberList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMembers: TeamMember[] = [
  {
    id: "1",
    name: "Mantenedor",
    task: "Tema Urucum no theme.css",
    status: "completed",
  },
  {
    id: "2",
    name: "Revisora",
    task: "Revisão do PR do flowtomic-cli init",
    status: "in-progress",
  },
  {
    id: "3",
    name: "Você",
    task: "Story do date-range-picker",
    status: "pending",
  },
  {
    id: "4",
    name: "Colaboradora",
    task: "Build do registry na Vercel",
    status: "in-progress",
  },
];

export const Default: Story = {
  args: {
    members: sampleMembers,
    onAddMember: () => console.log("Add member"),
  },
};

export const WithClickHandler: Story = {
  args: {
    members: sampleMembers,
    onMemberClick: (member) => console.log("Clicked:", member),
    onAddMember: () => console.log("Add member"),
  },
};

export const Empty: Story = {
  args: {
    members: [],
    onAddMember: () => console.log("Add member"),
  },
};

export const CustomTitle: Story = {
  args: {
    members: sampleMembers.slice(0, 2),
    title: "Revisores",
    addButtonText: "Convidar",
    onAddMember: () => console.log("Add member"),
  },
};
