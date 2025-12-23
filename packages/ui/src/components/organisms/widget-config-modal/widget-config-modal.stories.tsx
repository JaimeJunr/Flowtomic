import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox, Input } from "../../atoms";
import { WidgetConfigModal } from "./widget-config-modal";

const meta = {
  title: "Flowtomic UI/Organisms/WidgetConfigModal",
  component: WidgetConfigModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof WidgetConfigModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open ?? true);
    const [_config, setConfig] = useState<Record<string, unknown>>({});

    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className="px-4 py-2 border rounded">
          Abrir Modal
        </button>
        <WidgetConfigModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onSave={(_id, newConfig) => {
            setConfig(newConfig);
            console.log("Config salvo:", newConfig);
          }}
          renderConfigForm={(_widget, currentConfig, onUpdate) => (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="dataSource" className="text-sm font-medium">
                  Fonte de Dados
                </label>
                <Input
                  id="dataSource"
                  value={(currentConfig.dataSource as string) || ""}
                  onChange={(e) => onUpdate({ ...currentConfig, dataSource: e.target.value })}
                  placeholder="Selecione ou digite a fonte de dados"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Opções</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showLegend"
                      checked={(currentConfig.showLegend as boolean) || false}
                      onCheckedChange={(checked) =>
                        onUpdate({ ...currentConfig, showLegend: checked })
                      }
                    />
                    <label htmlFor="showLegend" className="text-sm font-normal">
                      Mostrar legenda
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      </>
    );
  },
  args: {
    open: true,
    widget: {
      id: "1",
      type: "chart",
      config: { dataSource: "api/data", showLegend: true },
    },
  },
};

export const CustomTitle: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <WidgetConfigModal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        title="Personalizar Widget"
        description="Configure as opções do seu widget"
        renderConfigForm={(widget, _config, _onUpdate) => (
          <div className="p-4 text-sm text-muted-foreground">
            Formulário customizado para widget {widget.type}
          </div>
        )}
      />
    );
  },
  args: {
    open: true,
    widget: { id: "1", type: "custom" },
  },
};
