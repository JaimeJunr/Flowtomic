import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

const meta = {
  title: "Flowtomic UI/Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "error", "success"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Digite o texto...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "E-mail",
    placeholder: "email@exemplo.com",
    type: "email",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Senha",
    type: "password",
    helperText: "Deve ter pelo menos 8 caracteres",
  },
};

export const ErrorState: Story = {
  args: {
    label: "E-mail",
    variant: "error",
    error: "Endereço de e-mail inválido",
    placeholder: "email@exemplo.com",
  },
};

export const Success: Story = {
  args: {
    label: "E-mail",
    variant: "success",
    placeholder: "email@exemplo.com",
    defaultValue: "valido@email.com",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "Input pequeno",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    placeholder: "Input grande",
  },
};

export const Disabled: Story = {
  args: {
    label: "Input Desabilitado",
    disabled: true,
    defaultValue: "Não pode editar",
  },
};
