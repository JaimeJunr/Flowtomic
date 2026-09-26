import { render } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { Controls } from "./controls";

// Controls lê o zustand store do ReactFlow (useStoreApi), por isso só
// renderiza dentro de um <ReactFlow>, como o controls.stories.tsx documenta.
const renderControls = () =>
  render(
    <ReactFlowProvider>
      <div style={{ width: 300, height: 200 }}>
        <ReactFlow nodes={[]} edges={[]}>
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );

describe("Controls", () => {
  it("renderiza os botões de zoom e fit-view do react-flow", () => {
    const { container } = renderControls();
    expect(container.querySelector(".react-flow__controls")).toBeInTheDocument();
    expect(
      container.querySelectorAll(".react-flow__controls button").length
    ).toBeGreaterThanOrEqual(3);
  });

  it("não usa sombra de card: hairline border, shadow desligada", () => {
    const { container } = renderControls();
    const controls = container.querySelector(".react-flow__controls");
    expect(controls).toHaveClass("border");
    expect(controls?.className).toMatch(/shadow-none/);
  });
});
