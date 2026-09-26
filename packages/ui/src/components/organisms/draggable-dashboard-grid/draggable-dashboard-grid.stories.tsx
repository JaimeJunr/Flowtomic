import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";
import { useState } from "react";
import type { WidgetLayout } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../../atoms";
import { StatsGrid } from "../stats-grid/stats-grid";
import { DraggableDashboardGrid } from "./draggable-dashboard-grid";

const meta = {
  title: "Flowtomic UI/Organisms/DraggableDashboardGrid",
  component: DraggableDashboardGrid,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    isEditMode: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DraggableDashboardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function NpmDownloadsCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Downloads no npm</CardTitle>
      </CardHeader>
      <CardContent>
        <StatsGrid
          layout="list"
          stats={[
            { id: "ui", title: "@flowtomic/ui", value: 1240, lastMonth: 1074 },
            { id: "logic", title: "@flowtomic/logic", value: 842, lastMonth: 710 },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function RecentBuildsCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Builds recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border text-sm">
          <li className="flex items-center justify-between py-2">
            <span>main</span>
            <span className="font-mono text-success">passou</span>
          </li>
          <li className="flex items-center justify-between py-2">
            <span>feat/organisms-sem-slop</span>
            <span className="font-mono text-success">passou</span>
          </li>
          <li className="flex items-center justify-between py-2">
            <span>fix/registry-build</span>
            <span className="font-mono text-destructive">falhou</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

export const Default: Story = {
  render: (args) => {
    const [widgets, setWidgets] = useState<WidgetLayout[]>([
      { id: "npm-downloads", type: "stats", x: 0, y: 0, w: 6, h: 3 },
      { id: "recent-builds", type: "list", x: 6, y: 0, w: 6, h: 3 },
    ]);

    const content: Record<string, React.ReactNode> = {
      "npm-downloads": <NpmDownloadsCard />,
      "recent-builds": <RecentBuildsCard />,
    };

    return (
      <div className="p-8">
        <DraggableDashboardGrid
          {...args}
          widgets={widgets}
          renderWidget={(widget) => content[widget.id]}
          onMoveWidget={(id, x, y) => {
            setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
          }}
        />
      </div>
    );
  },
  args: {
    isEditMode: true,
  },
};

export const ViewMode: Story = {
  render: (args) => {
    const widgets: WidgetLayout[] = [
      { id: "npm-downloads", type: "stats", x: 0, y: 0, w: 6, h: 3 },
      { id: "recent-builds", type: "list", x: 6, y: 0, w: 6, h: 3 },
    ];

    const content: Record<string, React.ReactNode> = {
      "npm-downloads": <NpmDownloadsCard />,
      "recent-builds": <RecentBuildsCard />,
    };

    return (
      <div className="p-8">
        <DraggableDashboardGrid {...args} widgets={widgets} renderWidget={(w) => content[w.id]} />
      </div>
    );
  },
  args: {
    isEditMode: false,
  },
};

export const EmptyState: Story = {
  render: (args) => {
    return (
      <div className="p-8">
        <DraggableDashboardGrid {...args} widgets={[]} renderWidget={() => null} />
      </div>
    );
  },
  args: {
    isEditMode: true,
  },
};
