import { render } from "@testing-library/react";
import type { ConnectionLineComponentProps } from "@xyflow/react";
import { describe, expect, it } from "vitest";
import { Connection } from "./connection";

type ConnectionProps = ConnectionLineComponentProps;

// O React Flow passa muitas props para a linha de conexão; a molecule só lê as quatro coordenadas.
function renderLine(coords: Pick<ConnectionProps, "fromX" | "fromY" | "toX" | "toY">) {
  return render(
    <svg aria-label="Canvas" role="img">
      <Connection {...(coords as ConnectionProps)} />
    </svg>
  );
}

describe("Connection", () => {
  it("desenha a curva do ponto de origem até o ponto onde o cursor está", () => {
    const { container } = renderLine({ fromX: 0, fromY: 10, toX: 200, toY: 50 });
    const path = container.querySelector("path") as SVGPathElement;
    expect(path).toHaveAttribute("d", "M0,10 C 100,10 100,50 200,50");
    expect(path).toHaveAttribute("fill", "none");
  });

  it("a curva também funciona quando o destino está à esquerda e acima da origem", () => {
    const { container } = renderLine({ fromX: 300, fromY: 200, toX: 100, toY: 20 });
    expect(container.querySelector("path")).toHaveAttribute(
      "d",
      "M300,200 C 200,200 200,20 100,20"
    );
  });

  it("marca o destino com um círculo, para a pessoa ver onde a ligação vai encaixar", () => {
    const { container } = renderLine({ fromX: 0, fromY: 10, toX: 200, toY: 50 });
    const circle = container.querySelector("circle") as SVGCircleElement;
    expect(circle).toHaveAttribute("cx", "200");
    expect(circle).toHaveAttribute("cy", "50");
  });

  it("usa os tokens do tema no traço e no preenchimento, não cores fixas", () => {
    const { container } = renderLine({ fromX: 0, fromY: 0, toX: 10, toY: 10 });
    expect(container.querySelector("path")).toHaveAttribute("stroke", "var(--color-ring)");
    const circle = container.querySelector("circle") as SVGCircleElement;
    expect(circle).toHaveAttribute("stroke", "var(--color-ring)");
    expect(circle).toHaveAttribute("fill", "var(--background)");
  });
});
