import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Calendar } from "./calendar";

const meta = {
  title: "Flowtomic UI/Atoms/Data Display/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Calendar />,
};

export const WithSelectedDate: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return <Calendar mode="single" selected={date} onSelect={setDate} />;
  },
};

export const WithDateRange: Story = {
  render: () => {
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>();
    return <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />;
  },
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
