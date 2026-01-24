import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./textarea";

/**
 * Stories do componente Textarea.
 *
 * O Textarea é um campo de entrada de texto multilinha usado para textos longos.
 * É baseado no elemento HTML nativo `<textarea>` com estilização customizada.
 *
 * @see [Textarea Component](../textarea.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo de entrada de texto multilinha. Suporta placeholder, desabilitado e número de linhas customizável.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Texto de placeholder exibido quando o campo está vazio",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo",
    },
    rows: {
      control: "number",
      description: "Número de linhas visíveis",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Textarea.
 * Demonstra o uso básico com placeholder.
 */
export const Default: Story = {
  args: {
    placeholder: "Digite sua mensagem...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Digite sua mensagem...");
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).not.toBeDisabled();
  },
};

/**
 * Story demonstrando Textarea com label associado.
 * O label fornece contexto sobre o que deve ser digitado.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-96">
      <label htmlFor="message" className="text-sm font-medium">
        Mensagem
      </label>
      <Textarea id="message" placeholder="Digite sua mensagem..." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Mensagem");
    const textarea = canvas.getByPlaceholderText("Digite sua mensagem...");

    await expect(label).toBeInTheDocument();
    await expect(textarea).toBeInTheDocument();

    // Testa que clicar no label foca o textarea
    await userEvent.click(label);
    await expect(textarea).toHaveFocus();
  },
};

/**
 * Story demonstrando Textarea com número de linhas customizado.
 * O atributo `rows` controla a altura inicial do campo.
 */
export const WithRows: Story = {
  args: {
    placeholder: "Digite uma mensagem longa...",
    rows: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText("Digite uma mensagem longa...");
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveAttribute("rows", "5");
  },
};

/**
 * Story demonstrando Textarea desabilitado.
 * O campo não pode ser editado quando está desabilitado.
 */
export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
    defaultValue: "Não pode editar",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByDisplayValue("Não pode editar");
    await expect(textarea).toBeDisabled();
  },
};

/**
 * Story demonstrando Textarea com valor pré-preenchido.
 * O `defaultValue` define o valor inicial do campo.
 */
export const WithValue: Story = {
  args: {
    defaultValue: "Este é um texto pré-preenchido no textarea.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByDisplayValue("Este é um texto pré-preenchido no textarea.");
    await expect(textarea).toBeInTheDocument();
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
