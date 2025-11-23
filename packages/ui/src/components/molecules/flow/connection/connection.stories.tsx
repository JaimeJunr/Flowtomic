import type { Meta, StoryObj } from "@storybook/react-vite";
import { Connection } from "./connection";

const meta = {
  title: "Flowtomic UI/Molecules/Flow/Connection",
  component: Connection,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Connection component do @xyflow/react. Usado para renderizar a linha de conexão temporária ao arrastar edges no ReactFlow.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Connection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fromX: 50,
    fromY: 50,
    toX: 200,
    toY: 200,
  },
  render: (args) => (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style={{ border: "1px solid #e5e7eb" }}
      role="img"
      aria-label="Connection component - Default"
    >
      <title>Connection component - Default</title>
      <Connection {...args} />
    </svg>
  ),
};

export const Horizontal: Story = {
  args: {
    fromX: 50,
    fromY: 150,
    toX: 350,
    toY: 150,
  },
  render: (args) => (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style={{ border: "1px solid #e5e7eb" }}
      role="img"
      aria-label="Connection component - Horizontal"
    >
      <title>Connection component - Horizontal</title>
      <Connection {...args} />
    </svg>
  ),
};

export const Vertical: Story = {
  args: {
    fromX: 200,
    fromY: 50,
    toX: 200,
    toY: 250,
  },
  render: (args) => (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style={{ border: "1px solid #e5e7eb" }}
      role="img"
      aria-label="Connection component - Vertical"
    >
      <title>Connection component - Vertical</title>
      <Connection {...args} />
    </svg>
  ),
};

export const Diagonal: Story = {
  args: {
    fromX: 50,
    fromY: 250,
    toX: 350,
    toY: 50,
  },
  render: (args) => (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      style={{ border: "1px solid #e5e7eb" }}
      role="img"
      aria-label="Connection component - Diagonal"
    >
      <title>Connection component - Diagonal</title>
      <Connection {...args} />
    </svg>
  ),
};
