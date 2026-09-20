import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

describe("Resizable", () => {
  describe("Renderização", () => {
    it("deve renderizar o ResizablePanelGroup", () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>Panel 1</ResizablePanel>
        </ResizablePanelGroup>
      );
      const panel = screen.getByText("Panel 1");
      expect(panel).toBeInTheDocument();
    });

    it("deve renderizar múltiplos ResizablePanels", () => {
      render(
        <ResizablePanelGroup>
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      );
      const panel1 = screen.getByText("Panel 1");
      const panel2 = screen.getByText("Panel 2");
      expect(panel1).toBeInTheDocument();
      expect(panel2).toBeInTheDocument();
    });

    it("deve renderizar ResizableHandle", () => {
      const { container } = render(
        <ResizablePanelGroup>
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      );
      const handle = container.querySelector('[data-slot="resizable-handle"]');
      expect(handle).toBeInTheDocument();
    });
  });

  describe("Orientação", () => {
    it("deve renderizar com direção horizontal", () => {
      const { container } = render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      );
      const group = container.querySelector('[data-slot="resizable-panel-group"]');
      expect(group).toBeInTheDocument();
    });

    it("deve renderizar com direção vertical", () => {
      const { container } = render(
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      );
      const group = container.querySelector('[data-slot="resizable-panel-group"]');
      expect(group).toBeInTheDocument();
    });
  });
});
