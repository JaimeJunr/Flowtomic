import { render, screen } from "@testing-library/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { Panel } from "./panel";

// Panel usa o hook useStore do ReactFlow para se posicionar, então precisa
// renderizar dentro de um <ReactFlow>.
const renderPanel = (children: React.ReactNode) =>
  render(
    <ReactFlowProvider>
      <div style={{ width: 300, height: 200 }}>
        <ReactFlow nodes={[]} edges={[]}>
          <Panel position="top-right">{children}</Panel>
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );

describe("Panel", () => {
  it("renderiza o conteúdo passado, ex.: o comando do CLI", () => {
    renderPanel("flowtomic-cli add");
    expect(screen.getByText("flowtomic-cli add")).toBeInTheDocument();
  });

  it("aceita um botão de ação real dentro do painel", () => {
    renderPanel(
      <button type="button" className="bg-primary">
        Executar
      </button>
    );
    expect(screen.getByRole("button", { name: "Executar" })).toBeInTheDocument();
  });
});
