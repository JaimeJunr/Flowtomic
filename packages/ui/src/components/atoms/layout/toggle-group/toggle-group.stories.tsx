import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Italic, Underline } from "lucide-react";
import { expect, within } from "storybook/test";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

/**
 * Stories do componente ToggleGroup.
 *
 * O ToggleGroup é usado para agrupar múltiplos toggles em um grupo onde
 * apenas um ou múltiplos podem estar selecionados.
 *
 * @see [ToggleGroup Component](../toggle-group.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Grupo de toggles para seleção. Suporta modos single (um item) ou multiple (múltiplos itens). Herda variantes e tamanhos do Toggle.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
      description: "Tipo de seleção (single ou multiple)",
    },
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "Variante visual do toggle group",
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do ToggleGroup.
 * Demonstra o uso básico com modo multiple (múltiplos itens podem estar selecionados).
 */
export const Default: Story = {
  render: () => (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="option1" aria-label="Option 1">
        Opção 1
      </ToggleGroupItem>
      <ToggleGroupItem value="option2" aria-label="Option 2">
        Opção 2
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option1 = canvas.getByRole("button", { name: "Option 1" });
    const option2 = canvas.getByRole("button", { name: "Option 2" });
    await expect(option1).toBeInTheDocument();
    await expect(option2).toBeInTheDocument();
  },
};

/**
 * Story demonstrando ToggleGroup com modo single.
 * Apenas um item pode estar selecionado por vez.
 */
export const Single: Story = {
  render: () => (
    <ToggleGroup type="single">
      <ToggleGroupItem value="left" aria-label="Left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Center">
        Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Right">
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const left = canvas.getByRole("button", { name: "Left" });
    const center = canvas.getByRole("button", { name: "Center" });
    const right = canvas.getByRole("button", { name: "Right" });
    await expect(left).toBeInTheDocument();
    await expect(center).toBeInTheDocument();
    await expect(right).toBeInTheDocument();
  },
};

export const WithSpacing: Story = {
  render: () => (
    <ToggleGroup type="multiple" spacing={2}>
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="multiple" variant="outline">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
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
