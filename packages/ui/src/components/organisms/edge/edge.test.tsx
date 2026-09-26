import { render } from "@testing-library/react";
import { Position, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { Edge } from "./edge";

// ReactFlow só computa a posição de um edge a partir dos handleBounds do node,
// que normalmente vêm de um ResizeObserver medindo o DOM real. O setup de
// teste mocka ResizeObserver como no-op (evita flake em outros componentes),
// então aqui os nodes declaram `handles` explicitamente para não depender de
// medição — é a mesma saída que o ResizeObserver real produziria.
const sourceNode = {
  id: "1",
  position: { x: 0, y: 0 },
  data: {},
  measured: { width: 100, height: 50 },
  handles: [
    {
      id: null,
      type: "source" as const,
      position: Position.Right,
      x: 100,
      y: 25,
      width: 1,
      height: 1,
    },
  ],
};
const targetNode = {
  id: "2",
  position: { x: 400, y: 0 },
  data: {},
  measured: { width: 100, height: 50 },
  handles: [
    {
      id: null,
      type: "target" as const,
      position: Position.Left,
      x: 0,
      y: 25,
      width: 1,
      height: 1,
    },
  ],
};
const nodes = [sourceNode, targetNode];

const renderCanvas = (edgeType: "temporary" | "animated") =>
  render(
    <ReactFlowProvider>
      <div style={{ width: 500, height: 300 }}>
        <ReactFlow
          nodes={nodes}
          edges={[{ id: "e1-2", source: "1", target: "2", type: edgeType }]}
          edgeTypes={{ temporary: Edge.Temporary, animated: Edge.Animated }}
        />
      </div>
    </ReactFlowProvider>
  );

describe("Edge", () => {
  it("Edge.Temporary desenha um path tracejado (linha de conexão em andamento)", () => {
    const { container } = renderCanvas("temporary");
    const path = container.querySelector(".react-flow__edge-path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass("stroke-ring");
  });

  it("Edge.Animated desenha o path e o círculo animado que percorre a conexão", () => {
    const { container } = renderCanvas("animated");
    expect(container.querySelector(".react-flow__edge-path")).toBeInTheDocument();
    expect(container.querySelector("circle animateMotion")).toBeInTheDocument();
  });
});
