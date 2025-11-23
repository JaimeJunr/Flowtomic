import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Connection, Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";
import { addEdge, useEdgesState, useNodesState } from "@xyflow/react";
import { useCallback } from "react";
import { Edge } from "@/components/organisms/edge";
import { Node, NodeContent, NodeHeader, NodeTitle } from "@/components/organisms/node";
import { Canvas } from "./canvas";

const initialNodes: ReactFlowNode[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 250, y: 100 },
    data: {
      label: "Node 1",
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 250, y: 300 },
    data: {
      label: "Node 2",
    },
  },
];

const initialEdges: ReactFlowEdge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "animated",
  },
];

const CustomNode = ({ data }: { data: { label: string } }) => (
  <Node handles={{ target: true, source: true }}>
    <NodeHeader>
      <NodeTitle>{data.label}</NodeTitle>
    </NodeHeader>
    <NodeContent>
      <p className="text-sm text-muted-foreground">Conteúdo do node</p>
    </NodeContent>
  </Node>
);

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  animated: Edge.Animated,
  temporary: Edge.Temporary,
};

const meta = {
  title: "Flowtomic UI/Molecules/Flow/Canvas",
  component: Canvas,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Canvas component wrapper do ReactFlow do @xyflow/react. Requer importação de CSS: @xyflow/react/dist/style.css",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Canvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
      (params: Connection) => {
        setEdges((eds) => addEdge({ ...params, type: "animated" }, eds));
      },
      [setEdges]
    );

    return (
      <div className="h-screen w-full">
        <Canvas
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <Canvas {...args} />
    </div>
  ),
};
