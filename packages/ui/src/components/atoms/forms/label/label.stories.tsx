import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Label } from "./label";

/**
 * Stories do componente Label.
 *
 * O Label é um componente de texto usado para identificar campos de formulário.
 * Ele fornece associação semântica com inputs através do atributo `htmlFor`.
 *
 * @see [Label Component](../label.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Label",
  component: Label,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente de label para campos de formulário. Fornece associação semântica com inputs através do atributo `htmlFor`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    htmlFor: {
      control: "text",
      description: "ID do elemento associado",
    },
    className: {
      control: "text",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Label.
 * Demonstra o uso básico do componente sem associação com input.
 */
export const Default: Story = {
  args: {
    children: "Label padrão",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Label padrão");
    await expect(label).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Label associado a um input.
 * Quando o label é clicado, o input recebe foco automaticamente.
 */
export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">E-mail</Label>
      <input
        id="email"
        type="email"
        placeholder="email@exemplo.com"
        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("E-mail");
    const input = canvas.getByPlaceholderText("email@exemplo.com");

    await expect(label).toBeInTheDocument();
    await expect(input).toBeInTheDocument();

    // Testa que clicar no label foca o input
    await userEvent.click(label);
    await expect(input).toHaveFocus();
  },
};

/**
 * Story demonstrando Label com indicador de campo obrigatório.
 * Usa um asterisco vermelho para indicar que o campo é obrigatório.
 */
export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name">
        Nome <span className="text-destructive">*</span>
      </Label>
      <input
        id="name"
        type="text"
        placeholder="Seu nome"
        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText(/Nome/);
    await expect(label).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Label para campo desabilitado.
 * O label também é estilizado para indicar que o campo está desabilitado.
 */
export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="disabled-input" className="opacity-50">
        Campo Desabilitado
      </Label>
      <input
        id="disabled-input"
        type="text"
        disabled
        placeholder="Não pode editar"
        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background opacity-50 cursor-not-allowed"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Campo Desabilitado");
    const input = canvas.getByPlaceholderText("Não pode editar");

    await expect(label).toBeInTheDocument();
    await expect(input).toBeDisabled();
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
