import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Node as ReactFlowNode } from "@xyflow/react";
import { useEdgesState, useNodesState } from "@xyflow/react";
import type { ReactNode } from "react";
import { Canvas } from "@/components/molecules/flow/canvas";
import { Node, NodeContent, NodeHeader, NodeTitle } from "./node";

const meta = {
  title: "Flowtomic UI/Organisms/Node",
  component: Node,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Componente Node para ReactFlow baseado em Card. Suporta conexões em todas as direções (cima, baixo, esquerda, direita). Use o modo avançado para controle completo de cada direção.",
      },
      canvas: {
        sourceState: "shown",
      },
    },
    chromatic: { disableSnapshot: true },
  },
  tags: ["autodocs"],
  argTypes: {
    handles: {
      description:
        "Configuração dos handles de conexão. Controle completo de todas as direções: { top, bottom, left, right }. Cada direção pode ser boolean (usa tipo padrão) ou { type: 'target' | 'source' }.",
      control: false,
      table: {
        type: {
          summary: "NodeHandlesConfig",
          detail: `{
  top?: boolean | { type: "target" | "source" },
  bottom?: boolean | { type: "target" | "source" },
  left?: boolean | { type: "target" | "source" },
  right?: boolean | { type: "target" | "source" }
}`,
        },
      },
    },
    className: {
      description: "Classes CSS adicionais para o componente",
      control: "text",
    },
    children: {
      description: "Conteúdo do node (geralmente NodeHeader, NodeContent, etc.)",
      control: false,
    },
  },
} satisfies Meta<typeof Node>;

export default meta;
type Story = StoryObj<typeof meta>;

// Componente wrapper para usar Node dentro do Canvas
const NodeInCanvas = ({ handles, children }: { handles: any; children: ReactNode }) => {
  const [nodes, _setNodes, onNodesChange] = useNodesState<ReactFlowNode[]>([
    {
      id: "1",
      type: "custom",
      position: { x: 250, y: 250 },
      data: { handles, children },
    },
  ]);
  const [edges, _setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = {
    custom: ({ data }: { data: { handles: any; children: ReactNode } }) => (
      <Node handles={data.handles}>{data.children}</Node>
    ),
  };

  return (
    <Canvas
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
};

export const Default: Story = {
  render: () => (
    <div className="h-screen w-full">
      <NodeInCanvas
        handles={{
          top: { type: "target" },
          bottom: { type: "source" },
          left: { type: "target" },
          right: { type: "source" },
        }}
      >
        <NodeHeader>
          <NodeTitle>Node Title</NodeTitle>
        </NodeHeader>
        <NodeContent>
          <p className="text-sm">Node content goes here</p>
        </NodeContent>
      </NodeInCanvas>
    </div>
  ),
};

export const AllDirections: Story = {
  render: () => (
    <div className="h-screen w-full">
      <NodeInCanvas
        handles={{
          top: { type: "target" },
          bottom: { type: "source" },
          left: { type: "target" },
          right: { type: "source" },
        }}
      >
        <NodeHeader>
          <NodeTitle>Node com todas as direções</NodeTitle>
        </NodeHeader>
        <NodeContent>
          <p className="text-sm">Este node tem handles em todas as direções</p>
        </NodeContent>
      </NodeInCanvas>
    </div>
  ),
};

export const VerticalOnly: Story = {
  render: () => (
    <div className="h-screen w-full">
      <NodeInCanvas
        handles={{
          top: { type: "target" },
          bottom: { type: "source" },
        }}
      >
        <NodeHeader>
          <NodeTitle>Node Vertical</NodeTitle>
        </NodeHeader>
        <NodeContent>
          <p className="text-sm">Apenas conexões verticais (cima e baixo)</p>
        </NodeContent>
      </NodeInCanvas>
    </div>
  ),
};
