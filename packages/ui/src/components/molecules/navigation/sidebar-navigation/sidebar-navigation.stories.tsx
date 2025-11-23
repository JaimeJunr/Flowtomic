import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { SidebarProvider } from "../../../atoms/layout";
import { type NavigationItem, SidebarNavigation } from "./sidebar-navigation";

const meta = {
  title: "Flowtomic UI/Molecules/Navigation/SidebarNavigation",
  component: SidebarNavigation,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Menu lateral completo com logo, seções de navegação e card de download mobile.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof SidebarNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const menuItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    active: true,
  },
  { id: "tasks", label: "Tasks", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
];

const generalItems: NavigationItem[] = [
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  { id: "help", label: "Help", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "logout", label: "Logout", icon: <LogOut className="h-4 w-4" /> },
];

export const Default: Story = {
  args: {
    appName: "Flowtomic",
    menuItems,
    generalItems,
    mobileAppCard: {
      title: "Download our Mobile App",
      description: "Get the app for a better experience",
      buttonText: "Download",
      onDownload: () => console.log("Download app"),
    },
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};

export const CustomLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">My App</span>
      </div>
    ),
    menuItems,
    generalItems,
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};

export const WithoutMobileCard: Story = {
  args: {
    appName: "Flowtomic",
    menuItems,
    generalItems,
    onNavigate: (item) => console.log("Navigate to:", item),
  },
};
