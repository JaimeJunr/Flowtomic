import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "./checkpoint";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Checkpoint",
  component: Checkpoint,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkpoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Checkpoint>
      <CheckpointIcon />
      <CheckpointTrigger tooltip="Checkpoint 1">Checkpoint</CheckpointTrigger>
    </Checkpoint>
  ),
};

export const WithoutTooltip: Story = {
  render: () => (
    <Checkpoint>
      <CheckpointIcon />
      <CheckpointTrigger>Simple Checkpoint</CheckpointTrigger>
    </Checkpoint>
  ),
};
