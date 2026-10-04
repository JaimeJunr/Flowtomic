import { render, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import {
  Node,
  NodeAction,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
} from "./node";

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

describe("Node: direção e tipo dos handles", () => {
  const handleEm = (container: HTMLElement, lado: string) =>
    container.querySelector(`.react-flow__handle[data-handlepos="${lado}"]`);

  it("modo simples: target fica à esquerda e source à direita", () => {
    const { container } = renderNode(<Node handles={{ target: true, source: true }} />);
    expect(handleEm(container, "left")).toHaveClass("target");
    expect(handleEm(container, "right")).toHaveClass("source");
  });

  it("modo simples com só um lado renderiza só aquele handle", () => {
    const { container } = renderNode(<Node handles={{ target: false, source: true }} />);
    expect(handleEm(container, "left")).toBeNull();
    expect(handleEm(container, "right")).toHaveClass("source");
  });

  it("modo avançado com true usa o tipo padrão de cada lado", () => {
    const { container } = renderNode(
      <Node handles={{ top: true, bottom: true, left: true, right: true }} />
    );
    expect(handleEm(container, "top")).toHaveClass("target");
    expect(handleEm(container, "bottom")).toHaveClass("source");
    expect(handleEm(container, "left")).toHaveClass("target");
    expect(handleEm(container, "right")).toHaveClass("source");
  });

  it("modo avançado deixa inverter o tipo de cada lado", () => {
    const { container } = renderNode(
      <Node
        handles={{
          top: { type: "source" },
          bottom: { type: "target" },
          left: { type: "source" },
          right: { type: "target" },
        }}
      />
    );
    expect(handleEm(container, "top")).toHaveClass("source");
    expect(handleEm(container, "bottom")).toHaveClass("target");
    expect(handleEm(container, "left")).toHaveClass("source");
    expect(handleEm(container, "right")).toHaveClass("target");
  });

  it("modo avançado só renderiza os lados pedidos", () => {
    const { container } = renderNode(<Node handles={{ left: true }} />);
    expect(container.querySelectorAll(".react-flow__handle")).toHaveLength(1);
    expect(handleEm(container, "left")).not.toBeNull();
  });

  it("junta className própria à do contêiner", () => {
    const { container } = renderNode(<Node className="minha-classe" handles={{}} />);
    expect(container.querySelector(".node-container")).toHaveClass("minha-classe");
  });
});

describe("Node: partes do cartão", () => {
  it("mostra cabeçalho com título, descrição e ação, conteúdo e rodapé", () => {
    renderNode(
      <Node handles={{ target: true, source: true }}>
        <NodeHeader>
          <NodeTitle>Deploy</NodeTitle>
          <NodeDescription>Publica o registry</NodeDescription>
          <NodeAction>
            <button type="button">Rodar</button>
          </NodeAction>
        </NodeHeader>
        <NodeContent className="conteudo-extra">Passo único</NodeContent>
        <NodeFooter className="rodape-extra">Última execução: ontem</NodeFooter>
      </Node>
    );
    expect(screen.getByText("Deploy")).toBeInTheDocument();
    expect(screen.getByText("Publica o registry")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rodar" })).toBeInTheDocument();
    expect(screen.getByText("Passo único")).toHaveClass("conteudo-extra");
    expect(screen.getByText("Última execução: ontem")).toHaveClass("rodape-extra");
  });
});
