import type { GenealogyData } from "@flowtomic/logic";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GenealogyCanvas } from "./genealogy-canvas";

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
