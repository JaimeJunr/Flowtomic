import { render } from "@testing-library/react";
import { type EdgeProps, Position, ReactFlow, ReactFlowProvider } from "@xyflow/react";
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

  it("Edge.Temporary usa traço tracejado e não tem seta nem círculo animado", () => {
    const { container } = renderCanvas("temporary");
    const path = container.querySelector(".react-flow__edge-path") as SVGPathElement;
    expect(path.style.strokeDasharray).toBe("5, 5");
    expect(container.querySelector("circle")).not.toBeInTheDocument();
  });

  it("Edge.Animated liga a saída (direita) do nó de origem à entrada (esquerda) do nó de destino", () => {
    const { container } = renderCanvas("animated");
    const traco = (
      container.querySelector(".react-flow__edge-path") as SVGPathElement
    ).getAttribute("d") as string;
    // Origem: x 0 + handle.x 100 + largura 1 = 101; destino: x 400 + handle.x 0 + 0 = 400. y: 25 + metade da altura.
    expect(traco.startsWith("M101,25.5")).toBe(true);
    expect(traco.endsWith("400,25.5")).toBe(true);
  });

  it("Edge.Animated repassa o estilo recebido ao traço", () => {
    const { container } = render(
      <ReactFlowProvider>
        <div style={{ width: 500, height: 300 }}>
          <ReactFlow
            nodes={nodes}
            edges={[
              { id: "e1-2", source: "1", target: "2", type: "animated", style: { stroke: "red" } },
            ]}
            edgeTypes={{ animated: Edge.Animated }}
          />
        </div>
      </ReactFlowProvider>
    );
    expect((container.querySelector(".react-flow__edge-path") as SVGPathElement).style.stroke).toBe(
      "red"
    );
  });

  it("Edge.Animated sem os nós no canvas não desenha nada", () => {
    const props = { id: "e", source: "x", target: "y" } as EdgeProps;
    const { container } = render(
      <ReactFlowProvider>
        <svg aria-label="vazio">
          <Edge.Animated {...props} />
        </svg>
      </ReactFlowProvider>
    );
    expect(container.querySelector("path")).not.toBeInTheDocument();
    expect(container.querySelector("circle")).not.toBeInTheDocument();
  });

  it("Edge.Animated sem pontos de conexão medidos nos nós ancora a linha na origem do canvas", () => {
    const semHandles = [
      { id: "1", position: { x: 0, y: 0 }, data: {}, measured: { width: 100, height: 50 } },
      { id: "2", position: { x: 400, y: 0 }, data: {}, measured: { width: 100, height: 50 } },
    ];
    const props = { id: "e", source: "1", target: "2" } as EdgeProps;
    const { container } = render(
      <ReactFlowProvider initialNodes={semHandles}>
        <svg aria-label="canvas">
          <Edge.Animated {...props} />
        </svg>
      </ReactFlowProvider>
    );
    const traco = container.querySelector("path")?.getAttribute("d");
    expect(traco).toBe("M0,0 C0,0 0,0 0,0");
  });
});
