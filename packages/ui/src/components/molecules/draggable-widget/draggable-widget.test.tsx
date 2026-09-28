import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DraggableWidget } from "./draggable-widget";

const gridPosition = { gridColumnStart: 1, gridColumnEnd: 5, gridRowStart: 1, gridRowEnd: 3 };

describe("DraggableWidget", () => {
  describe("Borda em repouso é só uma, sem o anel rosa por cima", () => {
    it("em modo de edição parado, não sobra anel de destaque — só a borda fina do conteúdo", () => {
      const { container } = render(
        <DraggableWidget
          widgetId="1"
          isEditMode
          gridPosition={gridPosition}
          currentWidth={4}
          currentHeight={2}
        >
          <p>conteúdo</p>
        </DraggableWidget>
      );
      expect(container.querySelector(".ring-2")).not.toBeInTheDocument();
      expect(container.querySelector(".border-border")).toBeInTheDocument();
    });

    it("em modo de visualização (sem edição) também não tem anel", () => {
      const { container } = render(
        <DraggableWidget
          widgetId="1"
          isEditMode={false}
          gridPosition={gridPosition}
          currentWidth={4}
          currentHeight={2}
        >
          <p>conteúdo</p>
        </DraggableWidget>
      );
      expect(container.querySelector(".ring-2")).not.toBeInTheDocument();
    });
  });

  describe("Sombra só ao arrastar (DESIGN.md, Elevation)", () => {
    it("parado, nem o conteúdo nem os controles têm sombra ou vidro fosco", () => {
      const { container } = render(
        <DraggableWidget
          widgetId="1"
          isEditMode
          gridPosition={gridPosition}
          currentWidth={4}
          currentHeight={2}
          onConfigure={() => {}}
          onRemove={() => {}}
        >
          <p>conteúdo</p>
        </DraggableWidget>
      );
      expect(container.innerHTML).not.toMatch(/shadow-(sm|md)|backdrop-blur/);
    });
  });

  it("os controles de edição têm nome acessível", () => {
    render(
      <DraggableWidget
        widgetId="1"
        isEditMode
        gridPosition={gridPosition}
        currentWidth={4}
        currentHeight={2}
        onConfigure={() => {}}
        onRemove={() => {}}
      >
        <p>conteúdo</p>
      </DraggableWidget>
    );
    for (const name of ["Arrastar widget", "Configurar widget", "Remover widget"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("renderiza o conteúdo do widget", () => {
    render(
      <DraggableWidget
        widgetId="1"
        isEditMode
        gridPosition={gridPosition}
        currentWidth={4}
        currentHeight={2}
      >
        <p>conteúdo do widget</p>
      </DraggableWidget>
    );
    expect(screen.getByText("conteúdo do widget")).toBeInTheDocument();
  });
});
