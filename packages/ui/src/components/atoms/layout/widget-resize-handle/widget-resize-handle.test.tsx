import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WidgetResizeHandle } from "./widget-resize-handle";

describe("WidgetResizeHandle", () => {
  describe("Renderização", () => {
    it("deve renderizar o WidgetResizeHandle", () => {
      const handleResize = vi.fn();
      render(
        <div className="relative group">
          <WidgetResizeHandle
            widgetId="widget-1"
            currentWidth={4}
            currentHeight={4}
            onResize={handleResize}
          />
        </div>
      );
      const handle = screen.getByLabelText("Redimensionar widget");
      expect(handle).toBeInTheDocument();
    });

    it("deve aplicar className customizada", () => {
      const handleResize = vi.fn();
      const { container } = render(
        <div className="relative group">
          <WidgetResizeHandle
            widgetId="widget-1"
            currentWidth={4}
            currentHeight={4}
            onResize={handleResize}
            className="custom-class"
          />
        </div>
      );
      const handle = container.querySelector('[aria-label="Redimensionar widget"]');
      expect(handle).toHaveClass("custom-class");
    });
  });

  describe("Limites", () => {
    it("deve respeitar minWidth e minHeight", () => {
      const handleResize = vi.fn();
      render(
        <div className="relative group">
          <WidgetResizeHandle
            widgetId="widget-1"
            currentWidth={2}
            currentHeight={2}
            onResize={handleResize}
            minWidth={2}
            minHeight={2}
          />
        </div>
      );
      const handle = screen.getByLabelText("Redimensionar widget");
      expect(handle).toBeInTheDocument();
    });

    it("deve respeitar maxWidth e maxHeight", () => {
      const handleResize = vi.fn();
      render(
        <div className="relative group">
          <WidgetResizeHandle
            widgetId="widget-1"
            currentWidth={10}
            currentHeight={10}
            onResize={handleResize}
            maxWidth={12}
            maxHeight={20}
          />
        </div>
      );
      const handle = screen.getByLabelText("Redimensionar widget");
      expect(handle).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter aria-label", () => {
      const handleResize = vi.fn();
      render(
        <div className="relative group">
          <WidgetResizeHandle
            widgetId="widget-1"
            currentWidth={4}
            currentHeight={4}
            onResize={handleResize}
          />
        </div>
      );
      const handle = screen.getByLabelText("Redimensionar widget");
      expect(handle).toBeInTheDocument();
    });
  });
});

describe("WidgetResizeHandle - arrastar para redimensionar", () => {
  function renderHandle(props: Partial<React.ComponentProps<typeof WidgetResizeHandle>> = {}) {
    const onResize = vi.fn();
    render(
      <div className="relative group">
        <WidgetResizeHandle
          widgetId="widget-7"
          currentWidth={4}
          currentHeight={4}
          onResize={onResize}
          {...props}
        />
      </div>
    );
    return { onResize, handle: screen.getByRole("button", { name: "Redimensionar widget" }) };
  }

  // célula 50 + espaçamento 16 = 66px por unidade de grade
  it("deve pedir o novo tamanho em unidades de grade ao arrastar", () => {
    const { onResize, handle } = renderHandle();

    fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 100 + 66 * 2, clientY: 100 + 66 });

    expect(onResize).toHaveBeenCalledWith("widget-7", 6, 5);
  });

  it("deve encolher ao arrastar para cima e para a esquerda", () => {
    const { onResize, handle } = renderHandle();

    fireEvent.mouseDown(handle, { clientX: 300, clientY: 300 });
    fireEvent.mouseMove(document, { clientX: 300 - 66, clientY: 300 - 66 });

    expect(onResize).toHaveBeenCalledWith("widget-7", 3, 3);
  });

  it("não deve redimensionar com movimento menor que meia célula", () => {
    const { onResize, handle } = renderHandle();

    fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 100 + 20, clientY: 100 + 20 });

    expect(onResize).not.toHaveBeenCalled();
  });

  it("não deve redimensionar sem antes pressionar o botão do mouse", () => {
    const { onResize } = renderHandle();

    fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });

    expect(onResize).not.toHaveBeenCalled();
  });

  it("deve parar de redimensionar ao soltar o mouse", () => {
    const { onResize, handle } = renderHandle();

    fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(document);
    fireEvent.mouseMove(document, { clientX: 400, clientY: 400 });

    expect(onResize).not.toHaveBeenCalled();
  });

  it("não deve passar do tamanho máximo", () => {
    const { onResize, handle } = renderHandle({
      currentWidth: 11,
      currentHeight: 19,
      maxWidth: 12,
      maxHeight: 20,
    });

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 66 * 5, clientY: 66 * 5 });

    expect(onResize).toHaveBeenCalledWith("widget-7", 12, 20);
  });

  it("não deve ficar menor que o tamanho mínimo", () => {
    const { onResize, handle } = renderHandle({
      currentWidth: 3,
      currentHeight: 3,
      minWidth: 2,
      minHeight: 2,
    });

    fireEvent.mouseDown(handle, { clientX: 1000, clientY: 1000 });
    fireEvent.mouseMove(document, { clientX: 0, clientY: 0 });

    expect(onResize).toHaveBeenCalledWith("widget-7", 2, 2);
  });

  it("não deve avisar quando o limite já foi atingido e nada muda", () => {
    const { onResize, handle } = renderHandle({
      currentWidth: 12,
      currentHeight: 20,
      maxWidth: 12,
      maxHeight: 20,
    });

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 300, clientY: 300 });

    expect(onResize).not.toHaveBeenCalled();
  });

  it("deve respeitar cellSize e gap customizados", () => {
    const { onResize, handle } = renderHandle({ cellSize: 100, gap: 0 });

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });

    expect(onResize).toHaveBeenCalledWith("widget-7", 5, 6);
  });

  it("deve ficar visível enquanto arrasta", () => {
    const { handle } = renderHandle();
    expect(handle).not.toHaveClass("bg-primary/40");

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    expect(handle).toHaveClass("bg-primary/40");

    fireEvent.mouseUp(document);
    expect(handle).not.toHaveClass("bg-primary/40");
  });

  it("teclas que não são setas não redimensionam nem são bloqueadas", () => {
    const { onResize, handle } = renderHandle();

    // fireEvent devolve false quando o evento teve preventDefault chamado
    expect(fireEvent.keyDown(handle, { key: "Enter" })).toBe(true);
    expect(fireEvent.keyDown(handle, { key: " " })).toBe(true);
    expect(fireEvent.keyDown(handle, { key: "a" })).toBe(true);
    expect(fireEvent.keyDown(handle, { key: "ArrowRight" })).toBe(false);
    expect(onResize).toHaveBeenCalledTimes(1);
  });

  describe("Teclado", () => {
    function renderHandle(w: number, h: number) {
      const onResize = vi.fn();
      render(
        <WidgetResizeHandle
          widgetId="widget-1"
          currentWidth={w}
          currentHeight={h}
          onResize={onResize}
          minWidth={2}
          maxWidth={6}
          minHeight={2}
          maxHeight={6}
        />
      );
      const handle = screen.getByRole("button", { name: "Redimensionar widget" });
      handle.focus();
      return { onResize, handle };
    }

    it("as setas mudam largura e altura de uma célula", async () => {
      const { onResize } = renderHandle(4, 4);
      await userEvent.keyboard("{ArrowRight}");
      expect(onResize).toHaveBeenLastCalledWith("widget-1", 5, 4);
      await userEvent.keyboard("{ArrowLeft}");
      expect(onResize).toHaveBeenLastCalledWith("widget-1", 3, 4);
      await userEvent.keyboard("{ArrowDown}");
      expect(onResize).toHaveBeenLastCalledWith("widget-1", 4, 5);
      await userEvent.keyboard("{ArrowUp}");
      expect(onResize).toHaveBeenLastCalledWith("widget-1", 4, 3);
    });

    it("no limite, a seta não chama onResize", async () => {
      const { onResize } = renderHandle(6, 2);
      await userEvent.keyboard("{ArrowRight}{ArrowUp}");
      expect(onResize).not.toHaveBeenCalled();
    });

    it("aparece quando recebe foco do teclado, não só no hover", () => {
      const { handle } = renderHandle(4, 4);
      expect(handle).toHaveClass("focus-visible:opacity-100");
    });
  });
});
