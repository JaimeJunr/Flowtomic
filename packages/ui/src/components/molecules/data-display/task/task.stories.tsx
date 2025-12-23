import type { Meta, StoryObj } from "@storybook/react-vite";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "./task";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Task",
  component: Task,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Task>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Task className="w-[400px]">
      <TaskTrigger title="Search for information" />
      <TaskContent>
        <TaskItem>
          Searching for information about React hooks
          <TaskItemFile>file.tsx</TaskItemFile>
        </TaskItem>
        <TaskItem>Found 5 relevant results</TaskItem>
      </TaskContent>
    </Task>
  ),
};

export const Closed: Story = {
  render: () => (
    <Task defaultOpen={false} className="w-[400px]">
      <TaskTrigger title="Completed task" />
      <TaskContent>
        <TaskItem>This task is closed by default</TaskItem>
      </TaskContent>
    </Task>
  ),
};
