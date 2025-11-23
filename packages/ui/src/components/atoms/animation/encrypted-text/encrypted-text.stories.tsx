import type { Meta, StoryObj } from "@storybook/react-vite";
import { EncryptedText } from "./encrypted-text";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/EncryptedText",
  component: EncryptedText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "O texto a ser criptografado e revelado",
    },
    revealDelayMs: {
      control: "number",
      description: "Tempo em milissegundos entre revelar cada caractere real subsequente",
    },
    flipDelayMs: {
      control: "number",
      description: "Tempo em milissegundos entre flips de gibberish para caracteres não revelados",
    },
    charset: {
      control: "text",
      description: "Conjunto de caracteres customizado para usar no efeito gibberish",
    },
    encryptedClassName: {
      control: "text",
      description: "Classe CSS para estilizar caracteres criptografados/scrambled",
    },
    revealedClassName: {
      control: "text",
      description: "Classe CSS para estilizar caracteres revelados",
    },
  },
} satisfies Meta<typeof EncryptedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Texto secreto revelado gradualmente",
  },
};

export const FastReveal: Story = {
  args: {
    text: "Revelação rápida",
    revealDelayMs: 20,
    flipDelayMs: 30,
  },
};

export const SlowReveal: Story = {
  args: {
    text: "Revelação lenta e dramática",
    revealDelayMs: 100,
    flipDelayMs: 80,
  },
};

export const LongText: Story = {
  args: {
    text: "Este é um texto mais longo para demonstrar o efeito de revelação gradual em múltiplas palavras e frases completas.",
    revealDelayMs: 50,
    flipDelayMs: 50,
  },
};

export const WithCustomStyling: Story = {
  args: {
    text: "Texto com estilos customizados",
    encryptedClassName: "text-red-500 font-mono",
    revealedClassName: "text-green-500 font-bold",
    revealDelayMs: 50,
  },
};

export const SpecialCharacters: Story = {
  args: {
    text: "Texto com caracteres especiais: !@#$%^&*()_+-={}[];:,.<>/?",
    revealDelayMs: 40,
    flipDelayMs: 40,
  },
};

export const Quote: Story = {
  args: {
    text: "You are not your job, you're not how much money you have in the bank. You are not the car you drive. You're not the contents of your wallet. You are not your fucking khakis.",
    revealDelayMs: 50,
    flipDelayMs: 50,
    className: "text-lg max-w-2xl",
  },
};

export const CustomCharset: Story = {
  args: {
    text: "Texto com charset customizado",
    charset: "01",
    revealDelayMs: 50,
    flipDelayMs: 50,
  },
};

