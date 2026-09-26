import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Node as ReactFlowNode } from "@xyflow/react";
import { useEdgesState, useNodesState } from "@xyflow/react";
import { Canvas } from "@/components/molecules/flow/canvas";
import { Node, NodeContent, NodeHeader, NodeTitle } from "@/components/organisms/node";
import { Edge } from "./edge";

const meta = {
  title: "Flowtomic UI/Organisms/Edge",
  component: Edge.Temporary,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Edge components para ReactFlow. Edge.Temporary para linhas temporárias e Edge.Animated para linhas animadas.",
      },
    },
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Edge.Temporary>;

export default meta;
type Story = StoryObj<typeof meta>;

const edgeTypes = {
  temporary: Edge.Temporary,
  animated: Edge.Animated,
};

const nodeTypes = {
  custom: ({ data }: { data: { label: string } }) => (
    <Node handles={{ target: true, source: true }}>
      <NodeHeader>
        <NodeTitle>{data.label}</NodeTitle>
      </NodeHeader>
      <NodeContent>
        <p className="text-sm text-muted-foreground">Conteúdo do node</p>
      </NodeContent>
    </Node>
  ),
};

const initialNodes: ReactFlowNode[] = [
  { id: "1", type: "custom", position: { x: 60, y: 150 }, data: { label: "Node 1" } },
  { id: "2", type: "custom", position: { x: 560, y: 150 }, data: { label: "Node 2" } },
];

// Edge é renderizado pelo <svg> interno do ReactFlow: fora de um Canvas com
// nodes conectados, a story não tem o que desenhar e fica em branco.
const EdgeInCanvas = ({ edgeType }: { edgeType: keyof typeof edgeTypes }) => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([
    { id: "e1-2", source: "1", target: "2", type: edgeType },
  ]);

  return (
    <div className="h-screen w-full">
      <Canvas
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
};

export const Temporary: Story = {
  render: () => <EdgeInCanvas edgeType="temporary" />,
};

export const Animated: Story = {
  render: () => <EdgeInCanvas edgeType="animated" />,
};
