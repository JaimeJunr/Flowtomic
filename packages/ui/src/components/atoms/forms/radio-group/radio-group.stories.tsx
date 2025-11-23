import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "Flowtomic UI/Atoms/Forms/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium cursor-pointer">
          Opção 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm font-medium cursor-pointer">
          Opção 2
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="flex gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="h-option1" />
        <label htmlFor="h-option1" className="text-sm font-medium cursor-pointer">
          Opção 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="h-option2" />
        <label htmlFor="h-option2" className="text-sm font-medium cursor-pointer">
          Opção 2
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="h-option3" />
        <label htmlFor="h-option3" className="text-sm font-medium cursor-pointer">
          Opção 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="d-option1" />
        <label htmlFor="d-option1" className="text-sm font-medium cursor-pointer">
          Opção 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="d-option2" disabled />
        <label htmlFor="d-option2" className="text-sm font-medium cursor-pointer opacity-50">
          Opção 2 (Desabilitada)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="d-option3" />
        <label htmlFor="d-option3" className="text-sm font-medium cursor-pointer">
          Opção 3
        </label>
      </div>
    </RadioGroup>
  ),
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
