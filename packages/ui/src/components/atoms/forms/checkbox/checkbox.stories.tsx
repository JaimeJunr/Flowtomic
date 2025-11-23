import { Label } from "@radix-ui/react-label";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "checkbox-default",
  },
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label
        htmlFor="checked"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Já marcado
      </Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled" disabled />
      <Label
        htmlFor="disabled"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Checkbox desabilitado
      </Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-checked" disabled defaultChecked />
      <Label
        htmlFor="disabled-checked"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Desabilitado e marcado
      </Label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" />
        <Label
          htmlFor="option1"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Opção 1
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" defaultChecked />
        <Label
          htmlFor="option2"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Opção 2
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" />
        <Label
          htmlFor="option3"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Opção 3
        </Label>
      </div>
    </div>
  ),
};

export const DataTableStyle: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="row-select" />
      <Label
        htmlFor="row-select"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only"
      >
        Selecionar linha
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Checkbox como no DataTable, usado para seleção de linhas com label oculto para acessibilidade.",
      },
    },
  },
};
