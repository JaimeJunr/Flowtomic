import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { WidgetConfigModal, type WidgetConfigModalWidget } from "./widget-config-modal";

const widgetBase: WidgetConfigModalWidget = {
  id: "w1",
  type: "chart",
  title: "Gráfico de vendas",
  config: { periodo: "mes", cor: "azul" },
};

// Formulário real de dois campos, para provar que a configuração é mesclada e não substituída
function renderFormulario(
  _widget: WidgetConfigModalWidget,
  config: Record<string, unknown>,
  onUpdate: (config: Record<string, unknown>) => void
) {
  return (
    <div>
      <label htmlFor="periodo">Período</label>
      <input
        id="periodo"
        value={String(config.periodo ?? "")}
        onChange={(e) => onUpdate({ periodo: e.target.value })}
      />
      <p>Cor atual: {String(config.cor ?? "nenhuma")}</p>
    </div>
  );
}

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

  it("sem widget selecionado, não abre nenhum diálogo", () => {
    render(<WidgetConfigModal open widget={null} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fechado, não mostra o diálogo", () => {
    render(
      <WidgetConfigModal open={false} widget={widgetBase} onSave={vi.fn()} onClose={vi.fn()} />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre com o título padrão 'Configurar Widget' e a descrição com o nome do widget", () => {
    render(<WidgetConfigModal open widget={widgetBase} onSave={vi.fn()} onClose={vi.fn()} />);

    const dialogo = screen.getByRole("dialog", { name: "Configurar Widget" });
    expect(dialogo).toHaveAccessibleDescription(
      'Personalize os dados e configurações de "Gráfico de vendas"'
    );
  });

  it("sem título humano, usa a descrição genérica em português", () => {
    render(
      <WidgetConfigModal
        open
        widget={{ id: "w2", type: "chart" }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(
      "Personalize os dados e configurações do widget"
    );
  });

  it("título e descrição customizados vencem os padrões", () => {
    render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        title="Ajustar gráfico"
        description="Escolha o período exibido"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const dialogo = screen.getByRole("dialog", { name: "Ajustar gráfico" });
    expect(dialogo).toHaveAccessibleDescription("Escolha o período exibido");
  });

  it("sem renderConfigForm, orienta quem integra a fornecer o formulário", () => {
    render(<WidgetConfigModal open widget={widgetBase} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(
      screen.getByText("Forneça uma função renderConfigForm para personalizar o formulário.")
    ).toBeInTheDocument();
  });

  it("o formulário customizado recebe a configuração atual do widget", () => {
    render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        renderConfigForm={renderFormulario}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("textbox", { name: "Período" })).toHaveValue("mes");
  });

  it("widget sem config começa com configuração vazia", () => {
    render(
      <WidgetConfigModal
        open
        widget={{ id: "w3", type: "chart" }}
        renderConfigForm={renderFormulario}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("textbox", { name: "Período" })).toHaveValue("");
    expect(screen.getByText("Cor atual: nenhuma")).toBeInTheDocument();
  });

  it("salvar envia o id do widget com a configuração editada, mesclada com a original, e fecha", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        renderConfigForm={renderFormulario}
        onSave={onSave}
        onClose={onClose}
      />
    );

    const campo = screen.getByRole("textbox", { name: "Período" });
    await user.clear(campo);
    await user.type(campo, "ano");
    await user.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    expect(onSave).toHaveBeenCalledWith("w1", { periodo: "ano", cor: "azul" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("cancelar fecha sem salvar", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        renderConfigForm={renderFormulario}
        onSave={onSave}
        onClose={onClose}
      />
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("Esc fecha o diálogo sem salvar", async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<WidgetConfigModal open widget={widgetBase} onSave={onSave} onClose={onClose} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("ao trocar de widget, o formulário passa a mostrar a configuração do novo widget", () => {
    const { rerender } = render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        renderConfigForm={renderFormulario}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByRole("textbox", { name: "Período" })).toHaveValue("mes");

    rerender(
      <WidgetConfigModal
        open
        widget={{ id: "w9", type: "table", config: { periodo: "semana" } }}
        renderConfigForm={renderFormulario}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("textbox", { name: "Período" })).toHaveValue("semana");
  });

  it("aceita classe extra no conteúdo do diálogo", () => {
    render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        className="max-w-sm"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toHaveClass("max-w-sm");
  });

  it("não tem violações de acessibilidade", async () => {
    render(
      <WidgetConfigModal
        open
        widget={widgetBase}
        renderConfigForm={renderFormulario}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const results = await axe.run(screen.getByRole("dialog"), {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
