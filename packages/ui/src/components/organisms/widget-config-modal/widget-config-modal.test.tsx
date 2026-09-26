import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WidgetConfigModal } from "./widget-config-modal";

describe("WidgetConfigModal", () => {
  it("mostra o título humano do widget na descrição, quando informado", () => {
    render(
      <WidgetConfigModal
        open
        widget={{ id: "1", type: "chart", title: "Gráfico de vendas" }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Gráfico de vendas/)).toBeInTheDocument();
    expect(screen.queryByText(/"chart"/)).not.toBeInTheDocument();
  });

  it("sem título humano, a descrição não expõe o id interno do widget", () => {
    render(
      <WidgetConfigModal
        open
        widget={{ id: "1", type: "chart" }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText(/"chart"/)).not.toBeInTheDocument();
  });
});
