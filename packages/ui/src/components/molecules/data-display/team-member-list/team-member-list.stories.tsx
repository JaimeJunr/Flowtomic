import type { Meta, StoryObj } from "@storybook/react-vite";
import { type TeamMember, TeamMemberList } from "./team-member-list";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/TeamMemberList",
  component: TeamMemberList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Lista de membros da equipe com avatares, nomes, tarefas e status.",
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
    title: "Team Collaboration",
    onAddMember: () => console.log("Add member"),
  },
};

export const WithClickHandler: Story = {
  args: {
    members: sampleMembers,
    title: "Team Collaboration",
    onMemberClick: (member) => console.log("Clicked:", member),
    onAddMember: () => console.log("Add member"),
  },
};

export const Empty: Story = {
  args: {
    members: [],
    title: "Team Collaboration",
    onAddMember: () => console.log("Add member"),
  },
};

export const CustomTitle: Story = {
  args: {
    members: sampleMembers.slice(0, 2),
    title: "My Team",
    addButtonText: "Invite Member",
    onAddMember: () => console.log("Add member"),
  },
};
