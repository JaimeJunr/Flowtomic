import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardHeader, type DashboardUser, type Notification } from "./dashboard-header";

const meta = {
  title: "Flowtomic UI/Molecules/Layout/DashboardHeader",
  component: DashboardHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Header com busca, mensagens, notificações e o usuário. O atalho de busca só aparece se for passado; o menu do perfil, só com onProfileClick.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUser: DashboardUser = {
  name: "Mantenedor Flowtomic",
  email: "mantenedor@flowtomic.dev",
};

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "Build do registry falhou",
    description: "registry:build, há 12 min",
    unread: true,
  },
  {
    id: "2",
    title: "PR #29 mergeado",
    description: "docs: trusted publishing",
    unread: true,
  },
  {
    id: "3",
    title: "@flowtomic/ui 0.8.0 publicado",
    description: "ontem",
    unread: false,
  },
];

const sampleMessages: Notification[] = [
  {
    id: "1",
    title: "Nova mensagem da Revisora",
    description: "Deixei dois comentários no PR do tema.",
    unread: true,
  },
  {
    id: "2",
    title: "Revisão pedida",
    description: "PR #30, molecules sem template",
    unread: false,
  },
];

export const Default: Story = {
  args: {
    user: sampleUser,
    notifications: sampleNotifications,
    messages: sampleMessages,
    onSearchChange: (value) => console.log("Busca:", value),
    onNotificationClick: (notification) => console.log("Notificação:", notification),
    onMessageClick: (message) => console.log("Mensagem:", message),
    onProfileClick: () => console.log("Perfil"),
  },
};

export const WithoutNotifications: Story = {
  args: {
    user: sampleUser,
    onSearchChange: (value) => console.log("Busca:", value),
  },
};

export const WithSearch: Story = {
  args: {
    user: sampleUser,
    searchValue: "stats-grid",
    searchPlaceholder: "Buscar componente",
    searchShortcut: "Ctrl+K",
    onSearchChange: (value) => console.log("Busca:", value),
  },
};
