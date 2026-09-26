import type { Meta, StoryObj } from "@storybook/react-vite";
import { Canvas } from "@/components/molecules/flow/canvas";
import { Controls } from "./controls";

const meta = {
  title: "Flowtomic UI/Organisms/Controls",
  component: Controls,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Controls component wrapper do Controls do @xyflow/react. Usado para exibir controles de zoom e pan no canvas do ReactFlow.",
      },
    },
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Controls>;

export default meta;
type Story = StoryObj<typeof meta>;

// Controls depende do zustand store do ReactFlow (useStoreApi), por isso
// precisa renderizar dentro de um Canvas/ReactFlow, nunca isolado.
export const Default: Story = {
  render: (args) => (
    <div className="h-screen w-full">
      <Canvas nodes={[]} edges={[]}>
        <Controls {...args} />
      </Canvas>
    </div>
  ),
  args: {},
};
