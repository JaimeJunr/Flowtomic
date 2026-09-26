import { render, screen } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { Node } from "../node";
import { Toolbar } from "./toolbar";

// NodeToolbar (base do Toolbar) só se posiciona quando o node referenciado
// existe de fato no canvas — por isso monta dentro de um <ReactFlow> com um
// node real, como o toolbar.stories.tsx documenta.
const nodeTypes = {
  custom: () => (
    <Node handles={{ target: true, source: true }}>
      <Toolbar nodeId="1" isVisible>
        <button type="button">Editar</button>
        <button type="button">Excluir</button>
      </Toolbar>
    </Node>
  ),
};

const renderToolbarInCanvas = () =>
  render(
    <ReactFlowProvider>
      <div style={{ width: 300, height: 200 }}>
        <ReactFlow
          nodes={[{ id: "1", type: "custom", position: { x: 0, y: 0 }, data: {} }]}
          edges={[]}
          nodeTypes={nodeTypes}
        />
      </div>
    </ReactFlowProvider>
  );

describe("Toolbar", () => {
  it("renderiza as ações passadas, em pt-BR", () => {
    renderToolbarInCanvas();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("não tem sombra de card: border hairline sobre bg-background", () => {
    const { container } = renderToolbarInCanvas();
    const toolbar = container.querySelector(".react-flow__node-toolbar");
    expect(toolbar).toHaveClass("border", "bg-background");
    expect(toolbar?.className).not.toMatch(/shadow-(md|lg|xl)/);
  });
});
