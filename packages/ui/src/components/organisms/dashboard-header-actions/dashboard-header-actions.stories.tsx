import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DashboardHeaderActions } from "./dashboard-header-actions";

const meta = {
  title: "Flowtomic UI/Organisms/DashboardHeaderActions",
  component: DashboardHeaderActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    layout: {
      control: "select",
      options: ["grid", "list"],
    },
    isLoading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DashboardHeaderActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dashboards: [
      { id: "1", name: "Dashboard 1" },
      { id: "2", name: "Dashboard 2" },
      { id: "3", name: "Dashboard 3" },
    ],
    activeDashboardId: "1",
    layout: "grid",
    onSwitchDashboard: fn(),
    onSaveAsNew: fn(),
    onToggleLayout: fn(),
    onRefresh: fn(),
  },
};

export const SingleDashboard: Story = {
  args: {
    dashboards: [{ id: "1", name: "Dashboard Principal" }],
    activeDashboardId: "1",
    layout: "grid",
    onSaveAsNew: fn(),
    onToggleLayout: fn(),
    onRefresh: fn(),
  },
};

export const ListLayout: Story = {
  args: {
    dashboards: [
      { id: "1", name: "Dashboard 1" },
      { id: "2", name: "Dashboard 2" },
    ],
    activeDashboardId: "1",
    layout: "list",
    onSwitchDashboard: fn(),
    onSaveAsNew: fn(),
    onToggleLayout: fn(),
    onRefresh: fn(),
  },
};

export const Loading: Story = {
  args: {
    dashboards: [
      { id: "1", name: "Dashboard 1" },
      { id: "2", name: "Dashboard 2" },
    ],
    activeDashboardId: "1",
    layout: "grid",
    isLoading: true,
    onSwitchDashboard: fn(),
    onSaveAsNew: fn(),
    onToggleLayout: fn(),
    onRefresh: fn(),
  },
};

export const CustomLabels: Story = {
  args: {
    dashboards: [{ id: "1", name: "Dashboard Principal" }],
    activeDashboardId: "1",
    layout: "grid",
    labels: {
      saveAsNew: "Salvar Como Novo",
      gridLayout: "Visualização em Grade",
      listLayout: "Visualização em Lista",
      refresh: "Atualizar",
    },
    onSaveAsNew: fn(),
    onToggleLayout: fn(),
    onRefresh: fn(),
  },
};
