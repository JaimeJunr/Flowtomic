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
});
