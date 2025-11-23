import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { Slider } from "./slider";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    min: {
      control: "number",
    },
    max: {
      control: "number",
    },
    defaultValue: {
      control: "array",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return <Slider value={value} onValueChange={setValue} />;
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = useState([20, 80]);
    return (
      <div className="w-[300px] space-y-2">
        <Slider value={value} onValueChange={setValue} min={0} max={100} />
        <p className="text-sm text-muted-foreground">
          Valores: {value[0]} - {value[1]}
        </p>
      </div>
    );
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [value, setValue] = useState([25]);
    return (
      <div className="w-[300px] space-y-2">
        <Slider value={value} onValueChange={setValue} min={0} max={50} />
        <p className="text-sm text-muted-foreground">Valor: {value[0]} (0-50)</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
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
