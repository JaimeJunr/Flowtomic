import type { GenealogyData } from "@flowtomic/logic";
import { fireEvent, render, screen } from "@testing-library/react";
import { Position } from "@xyflow/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenealogyCanvas } from "./genealogy-canvas";

// O ReactFlow só desenha a edge quando o node tem `measured` e `handles` (o ResizeObserver
// do setup é no-op e nunca mede). Este wrapper de useGenealogy, ligado só nos testes de edge,
// acrescenta o que a medição real produziria; fora deles passa o resultado do hook sem mudança.
const medicao = vi.hoisted(() => ({ ligada: false }));
vi.mock("@flowtomic/logic", async (importOriginal) => {
  const real = await importOriginal<typeof import("@flowtomic/logic")>();
  const { useMemo } = await import("react");
  return {
    ...real,
    useGenealogy: (opts: Parameters<typeof real.useGenealogy>[0]) => {
      const resultado = real.useGenealogy(opts);
      const nodes = useMemo(
        () =>
          medicao.ligada
            ? resultado.nodes.map((n) => ({
                ...n,
                measured: { width: 200, height: 100 },
                handles: [
                  {
                    id: null,
                    type: "target" as const,
                    position: Position.Top,
                    x: 100,
                    y: 0,
                    width: 1,
                    height: 1,
                  },
                  {
                    id: null,
                    type: "source" as const,
                    position: Position.Bottom,
                    x: 100,
                    y: 99,
                    width: 1,
                    height: 1,
                  },
                ],
              }))
            : resultado.nodes,
        [resultado.nodes]
      );
      return { ...resultado, nodes };
    },
  };
});

afterEach(() => {
  medicao.ligada = false;
});

// GenealogyCanvas já monta seu próprio <Canvas>/ReactFlowProvider internamente.
const data: GenealogyData = {
  people: [
    { id: "1", name: "Avô paterno", birthDate: "1950-01-01", gender: "male" },
    { id: "2", name: "Pai", birthDate: "1980-05-20", gender: "male" },
  ],
  relationships: [{ from: "1", to: "2", type: "father" }],
};

describe("GenealogyCanvas", () => {
  it("renderiza um node por pessoa, com o papel/geração no lugar de nome fictício", () => {
    render(<GenealogyCanvas data={data} initialExpanded={["1", "2"]} />);
    expect(screen.getByText("Avô paterno")).toBeInTheDocument();
    expect(screen.getByText("Pai")).toBeInTheDocument();
  });

  it("aceita renderNode para customizar o node sem quebrar a API", () => {
    render(
      <GenealogyCanvas
        data={data}
        initialExpanded={["1", "2"]}
        renderNode={(nodeData) => <span>Custom: {nodeData.person.name}</span>}
      />
    );
    expect(screen.getByText("Custom: Avô paterno")).toBeInTheDocument();
  });

  it("formata data de nascimento ISO (yyyy-mm-dd) em pt-BR sem deslocar por fuso", () => {
    render(<GenealogyCanvas data={data} initialExpanded={["1", "2"]} />);
    // "1950-01-01" parseado com `new Date()` cai em 31/12/1949 em UTC-3; o esperado é 01/01/1950.
    expect(screen.getByText("01/01/1950")).toBeInTheDocument();
  });

  it("mantém o texto original quando a data não é uma ISO válida", () => {
    const dataComDataInvalida: GenealogyData = {
      people: [{ id: "3", name: "Bisavô", birthDate: "por volta de 1920" }],
      relationships: [],
    };
    render(<GenealogyCanvas data={dataComDataInvalida} initialExpanded={["3"]} />);
    expect(screen.getByText("por volta de 1920")).toBeInTheDocument();
  });
});

describe("GenealogyCanvas: nós e conexões", () => {
  it("mostra tipo, nascimento e óbito formatados em pt-BR no nó", () => {
    render(
      <GenealogyCanvas
        data={{
          people: [
            {
              id: "1",
              name: "Rex",
              type: "animal",
              birthDate: "2001-02-03",
              deathDate: "2015-12-31",
            },
          ],
          relationships: [],
        }}
        initialExpanded={["1"]}
      />
    );
    expect(screen.getByText("animal")).toBeInTheDocument();
    expect(screen.getByText("03/02/2001 - 31/12/2015")).toBeInTheDocument();
  });

  it("data ISO impossível (31 de fevereiro) fica como veio", () => {
    render(
      <GenealogyCanvas
        data={{ people: [{ id: "1", name: "Ana", birthDate: "2001-02-31" }], relationships: [] }}
        initialExpanded={["1"]}
      />
    );
    expect(screen.getByText("2001-02-31")).toBeInTheDocument();
  });

  it("mostra a foto da pessoa (image ou photo) com o nome como texto alternativo", () => {
    medicao.ligada = true; // nó medido fica visível para a árvore de acessibilidade
    render(
      <GenealogyCanvas
        data={{
          people: [
            { id: "1", name: "Com image", image: "https://exemplo.test/a.png" },
            { id: "2", name: "Com photo", photo: "https://exemplo.test/b.png" },
          ],
          relationships: [],
        }}
        initialExpanded={["1", "2"]}
      />
    );
    expect(screen.getByRole("img", { name: "Com image" })).toHaveAttribute(
      "src",
      "https://exemplo.test/a.png"
    );
    expect(screen.getByRole("img", { name: "Com photo" })).toHaveAttribute(
      "src",
      "https://exemplo.test/b.png"
    );
  });

  it("esconde a imagem quando ela falha ao carregar", () => {
    medicao.ligada = true;
    render(
      <GenealogyCanvas
        data={{
          people: [{ id: "1", name: "Sem foto", image: "https://exemplo.test/quebrada.png" }],
          relationships: [],
        }}
        initialExpanded={["1"]}
      />
    );
    const foto = screen.getByRole("img", { name: "Sem foto" });
    foto.dispatchEvent(new Event("error"));
    expect(foto).toHaveStyle({ display: "none" });
  });

  it("desenha uma conexão animada entre pai e filho quando os dois estão expandidos", () => {
    medicao.ligada = true;
    const { container } = render(<GenealogyCanvas data={data} initialExpanded={["1", "2"]} />);
    const caminho = container.querySelector(".react-flow__edge-path");
    expect(caminho).toBeInTheDocument();
    // parte do handle inferior do pai (nó 1 em 0,0; handle x=100,y=99 + metade da largura e a altura do handle)
    expect(caminho?.getAttribute("d")).toMatch(/^M\s?100\.5[, ]+100\b/);
    expect(container.querySelector("circle animateMotion")).toBeInTheDocument();
  });

  it("relacionamento com pessoa inexistente não gera conexão", () => {
    medicao.ligada = true;
    const { container } = render(
      <GenealogyCanvas
        data={{
          people: data.people,
          relationships: [{ from: "1", to: "999", type: "father" }],
        }}
        initialExpanded={["1", "2"]}
      />
    );
    expect(container.querySelector(".react-flow__edge-path")).not.toBeInTheDocument();
  });

  it("className vai para o contêiner externo", () => {
    const { container } = render(
      <GenealogyCanvas className="minha-arvore" data={data} initialExpanded={["1"]} />
    );
    expect(container.firstElementChild).toHaveClass("minha-arvore");
  });

  it("clicar num nó chama onNodeSelect com o id e a pessoa, e mantém o onNodeClick de quem usa", () => {
    const onNodeSelect = vi.fn();
    const onNodeClick = vi.fn();
    render(
      <div style={{ width: 800, height: 600 }}>
        <GenealogyCanvas data={data} onNodeSelect={onNodeSelect} onNodeClick={onNodeClick} />
      </div>
    );
    const nome = data.people[0].name;
    fireEvent.click(screen.getByText(nome));
    expect(onNodeSelect).toHaveBeenCalledWith(
      data.people[0].id,
      expect.objectContaining({ name: nome })
    );
    expect(onNodeClick).toHaveBeenCalledTimes(1);
  });

  it("o botão do nó recolhe e expande as ligações, avisando onNodeExpand", () => {
    medicao.ligada = true;
    const onNodeExpand = vi.fn();
    const { container } = render(<GenealogyCanvas data={data} onNodeExpand={onNodeExpand} />);
    const botao = screen.getByRole("button", { name: "Recolher ligações de Pai" });
    expect(botao).toHaveAttribute("aria-expanded", "true");
    expect(container.querySelector(".react-flow__edge-path")).toBeInTheDocument();

    fireEvent.click(botao);
    expect(onNodeExpand).toHaveBeenLastCalledWith("2", false);
    expect(container.querySelector(".react-flow__edge-path")).not.toBeInTheDocument();
    const reaberto = screen.getByRole("button", { name: "Expandir ligações de Pai" });
    expect(reaberto).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(reaberto);
    expect(onNodeExpand).toHaveBeenLastCalledWith("2", true);
    expect(onNodeExpand).toHaveBeenCalledTimes(2);
    expect(container.querySelector(".react-flow__edge-path")).toBeInTheDocument();
  });

  it("clicar no botão de expandir não seleciona o nó", () => {
    // sem medição o React Flow deixa o nó com visibility: hidden, fora da árvore acessível
    medicao.ligada = true;
    const onNodeSelect = vi.fn();
    render(<GenealogyCanvas data={data} onNodeSelect={onNodeSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Recolher ligações de Pai" }));
    expect(onNodeSelect).not.toHaveBeenCalled();
  });

  it("com o botão de expandir, o nó não tem violações automáticas de acessibilidade", async () => {
    medicao.ligada = true;
    const { container } = render(<GenealogyCanvas data={data} />);
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it("pessoa sem pais nem filhos não ganha botão de expandir", () => {
    medicao.ligada = true;
    render(
      <GenealogyCanvas data={{ people: [{ id: "9", name: "Sozinho" }], relationships: [] }} />
    );
    expect(screen.queryByRole("button", { name: /ligações de Sozinho/ })).not.toBeInTheDocument();
  });
});
