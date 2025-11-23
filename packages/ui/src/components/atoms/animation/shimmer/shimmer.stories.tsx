import type { Meta, StoryObj } from "@storybook/react-vite";
import { Shimmer } from "./shimmer";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/Shimmer",
  component: Shimmer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    duration: {
      control: "number",
      description: "Animation duration in seconds",
    },
    spread: {
      control: "number",
      description: "Spread multiplier for the shimmer effect",
    },
  },
} satisfies Meta<typeof Shimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Shimmer Text Effect",
  },
};

export const LongText: Story = {
  args: {
    children: "This is a longer text to demonstrate the shimmer effect on multiple words",
  },
};

export const AsHeading: Story = {
  args: {
    children: "Shimmer Heading",
    as: "h1",
    className: "text-4xl font-bold",
  },
};

export const CustomDuration: Story = {
  args: {
    children: "Slow Shimmer",
    duration: 4,
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
