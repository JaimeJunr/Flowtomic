import type { Meta, StoryObj } from "@storybook/react-vite";
import { Panel } from "./panel";

const meta = {
  title: "Flowtomic UI/Organisms/Panel",
  component: Panel,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Panel component wrapper do @xyflow/react. Usado para posicionar elementos sobre o canvas do ReactFlow.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Panel Content",
  },
};

export const WithButton: Story = {
  args: {
    children: (
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm"
        >
          Action
        </button>
      </div>
    ),
  },
};
