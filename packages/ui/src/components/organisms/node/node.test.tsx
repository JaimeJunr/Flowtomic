import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { Node, NodeContent, NodeHeader, NodeTitle } from "./node";

// Node precisa do contexto do ReactFlow (usa <Handle>, que lê o store do zustand).
const renderNode = (ui: React.ReactElement) => render(<ReactFlowProvider>{ui}</ReactFlowProvider>);

describe("Node", () => {
  describe("modo simples de handles", () => {
    it("renderiza handle de target e de source quando target/source são true", () => {
      const { container } = renderNode(
        <Node handles={{ target: true, source: true }}>
          <NodeHeader>
            <NodeTitle>Build do logic</NodeTitle>
          </NodeHeader>
        </Node>
      );
      expect(container.querySelectorAll(".react-flow__handle")).toHaveLength(2);
      expect(screen.getByText("Build do logic")).toBeInTheDocument();
    });

    it("não renderiza handle quando target/source são false", () => {
      const { container } = renderNode(<Node handles={{ target: false, source: false }} />);
      expect(container.querySelectorAll(".react-flow__handle")).toHaveLength(0);
    });
  });

  describe("modo avançado de handles", () => {
    it("renderiza um handle por direção configurada", () => {
      const { container } = renderNode(
        <Node handles={{ top: { type: "target" }, bottom: { type: "source" } }}>
          <NodeContent>Conteúdo</NodeContent>
        </Node>
      );
      expect(container.querySelectorAll(".react-flow__handle")).toHaveLength(2);
    });

    it("não é uma vitrine de card com sombra: usa border hairline, sem shadow", () => {
      const { container } = renderNode(<Node handles={{ top: true }} />);
      const card = container.querySelector(".node-container");
      expect(card).not.toHaveClass("shadow-lg");
      expect(card).not.toHaveClass("shadow-md");
    });
  });
});
