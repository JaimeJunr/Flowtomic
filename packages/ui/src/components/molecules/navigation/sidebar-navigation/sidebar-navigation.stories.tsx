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
        component:
          "Menu lateral: nome do app, navegação principal e itens de conta. O item ativo usa o tom urucum do tema.",
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
    label: "Início",
    icon: <LayoutDashboard className="h-4 w-4" />,
    active: true,
  },
  { id: "tasks", label: "Tarefas", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "calendar", label: "Calendário", icon: <Calendar className="h-4 w-4" /> },
  { id: "analytics", label: "Relatórios", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "team", label: "Equipe", icon: <Users className="h-4 w-4" /> },
];

const generalItems: NavigationItem[] = [
  { id: "settings", label: "Configurações", icon: <Settings className="h-4 w-4" /> },
  { id: "help", label: "Ajuda", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "logout", label: "Sair", icon: <LogOut className="h-4 w-4" /> },
];

export const Default: Story = {
  args: {
    appName: "Flowtomic",
    menuItems,
    generalItems,
    onNavigate: (item) => console.log("Navegar para:", item),
  },
};

export const CustomLogo: Story = {
  args: {
    logo: (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Flowtomic UI</span>
      </div>
    ),
    menuItems,
    generalItems,
    onNavigate: (item) => console.log("Navegar para:", item),
  },
};

export const WithoutMobileCard: Story = {
  args: {
    appName: "Flowtomic",
    menuItems,
    onNavigate: (item) => console.log("Navegar para:", item),
  },
};
