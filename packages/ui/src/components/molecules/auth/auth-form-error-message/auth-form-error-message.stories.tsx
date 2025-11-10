import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthFormErrorMessage } from "./auth-form-error-message";

const meta = {
  title: "Flowtomic UI/Molecules/Auth/AuthFormErrorMessage",
  component: AuthFormErrorMessage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      control: "text",
    },
    animated: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof AuthFormErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "E-mail ou senha inválidos. Por favor, tente novamente.",
  },
};

export const LongMessage: Story = {
  args: {
    message:
      "Sua conta foi temporariamente bloqueada devido a múltiplas tentativas de login falhadas. Por favor, tente novamente em 15 minutos ou entre em contato com o suporte se acreditar que isso é um erro.",
  },
};

export const ShortMessage: Story = {
  args: {
    message: "Campo obrigatório",
  },
};

export const WithAnimation: Story = {
  args: {
    message: "Esta mensagem de erro pode ser animada com framer-motion",
    animated: true,
  },
};

export const NoMessage: Story = {
  args: {
    message: null,
  },
};
