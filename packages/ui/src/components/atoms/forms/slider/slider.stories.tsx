import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Slider } from "./slider";

/**
 * Stories do componente Slider.
 *
 * O Slider é um controle deslizante usado para selecionar um valor ou intervalo
 * de valores dentro de um range. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * @see [Slider Component](../slider.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controle deslizante para seleção de valores. Suporta valores únicos ou intervalos, com valores min/max configuráveis.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    min: {
      control: "number",
      description: "Valor mínimo do slider",
    },
    max: {
      control: "number",
      description: "Valor máximo do slider",
    },
    defaultValue: {
      control: "array",
      description: "Valor padrão do slider",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Slider.
 * Demonstra o uso básico com valor único.
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="w-[300px]">
        <Slider value={value} onValueChange={setValue} aria-label="Slider" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");
    await expect(slider).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Slider com intervalo (range).
 * O slider permite selecionar um intervalo de valores com dois thumbs.
 */
export const Range: Story = {
  render: () => {
    const [value, setValue] = useState([20, 80]);
    return (
      <div className="w-[300px] space-y-2">
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          aria-label="Range slider"
        />
        <p className="text-sm text-muted-foreground">
          Valores: {value[0]} - {value[1]}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sliders = canvas.getAllByRole("slider");
    await expect(sliders).toHaveLength(2);
  },
};

/**
 * Story demonstrando Slider com valores min/max customizados.
 * O slider está limitado ao range 0-50.
 */
export const WithMinMax: Story = {
  render: () => {
    const [value, setValue] = useState([25]);
    return (
      <div className="w-[300px] space-y-2">
        <Slider
          value={value}
          onValueChange={setValue}
          min={0}
          max={50}
          aria-label="Custom range slider"
        />
        <p className="text-sm text-muted-foreground">Valor: {value[0]} (0-50)</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuemin", "0");
    await expect(slider).toHaveAttribute("aria-valuemax", "50");
  },
};

/**
 * Story demonstrando Slider desabilitado.
 * O slider não pode ser alterado quando está desabilitado.
 */
export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
  },
  render: (args) => (
    <div className="w-[300px]">
      <Slider {...args} aria-label="Disabled slider" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");
    await expect(slider).toBeDisabled();
  },
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
