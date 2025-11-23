import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimeTracker } from "./time-tracker";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/TimeTracker",
  component: TimeTracker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Timer com controles usando o hook headless useTimeTracker.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initialTime: {
      control: { type: "number", min: 0, step: 1 },
    },
    format: {
      control: { type: "select" },
      options: ["HH:mm:ss", "mm:ss", "ss"],
    },
  },
} satisfies Meta<typeof TimeTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Time Tracker",
    initialTime: 0,
    format: "HH:mm:ss",
  },
};

export const WithInitialTime: Story = {
  args: {
    title: "Time Tracker",
    initialTime: 3661, // 1h 1m 1s
    format: "HH:mm:ss",
  },
};

export const FormatMMSS: Story = {
  args: {
    title: "Time Tracker",
    initialTime: 125, // 2m 5s
    format: "mm:ss",
  },
};

export const CustomBackground: Story = {
  args: {
    title: "Time Tracker",
    initialTime: 0,
    format: "HH:mm:ss",
    backgroundColor: "hsl(var(--primary))",
    className: "text-primary-foreground",
  },
};
