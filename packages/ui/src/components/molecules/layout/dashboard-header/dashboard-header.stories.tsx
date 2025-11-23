import type { Meta, StoryObj } from "@storybook/react-vite";
import { DashboardHeader, type DashboardUser, type Notification } from "./dashboard-header";

const meta = {
  title: "Flowtomic UI/Molecules/Layout/DashboardHeader",
  component: DashboardHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Header com busca, notificações e perfil do usuário.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUser: DashboardUser = {
  name: "Totok Michael",
  email: "tmichael20@mail.com",
};

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "New project assigned",
    description: "You have been assigned to a new project",
    unread: true,
  },
  {
    id: "2",
    title: "Meeting reminder",
    description: "Team meeting in 30 minutes",
    unread: true,
  },
  {
    id: "3",
    title: "Task completed",
    description: "Your task has been marked as completed",
    unread: false,
  },
];

const sampleMessages: Notification[] = [
  {
    id: "1",
    title: "New message from John",
    description: "Can we discuss the project?",
    unread: true,
  },
  {
    id: "2",
    title: "Team update",
    description: "Weekly team update available",
    unread: false,
  },
];

export const Default: Story = {
  args: {
    user: sampleUser,
    notifications: sampleNotifications,
    messages: sampleMessages,
    onSearchChange: (value) => console.log("Search:", value),
    onNotificationClick: (notification) => console.log("Notification:", notification),
    onMessageClick: (message) => console.log("Message:", message),
    onProfileClick: () => console.log("Profile clicked"),
  },
};

export const WithoutNotifications: Story = {
  args: {
    user: sampleUser,
    onSearchChange: (value) => console.log("Search:", value),
  },
};

export const WithSearch: Story = {
  args: {
    user: sampleUser,
    searchValue: "dashboard",
    searchPlaceholder: "Search anything...",
    searchShortcut: "⌘K",
    onSearchChange: (value) => console.log("Search:", value),
  },
};
