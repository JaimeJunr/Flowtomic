import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search, Sparkles } from "lucide-react";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { CurvedInput } from "./curved-input";

const meta = {
  title: "Flowtomic UI/Molecules/Forms/CurvedInput",
  component: CurvedInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Captura de e-mail com barra arqueada: o texto, o placeholder e o botao seguem a curva. Ideal para lista de espera e landing pages.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    bend: { control: { type: "range", min: -60, max: 60, step: 2 } },
    width: { control: { type: "range", min: 280, max: 640, step: 10 } },
    height: { control: { type: "range", min: 48, max: 96, step: 2 } },
    radius: { control: { type: "range", min: 0, max: 48, step: 2 } },
    type: { control: "inline-radio", options: ["email", "text", "search"] },
    showButton: { control: "boolean" },
  },
  args: { onSubmit: fn(), onValueChange: fn() },
} satisfies Meta<typeof CurvedInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ListaDeEspera: Story = {
  args: {
    placeholder: "Seu e-mail corporativo",
    buttonLabel: "Entrar na fila",
    icon: <Sparkles />,
    width: 520,
  },
};

export const CurvaInvertida: Story = { args: { bend: -28 } };

export const BuscaSemBotao: Story = {
  args: {
    type: "search",
    placeholder: "Buscar fundo ou carteira",
    showButton: false,
    icon: <Search />,
  },
};

export const SemIcone: Story = { args: { icon: false, bend: 16 } };

export const TextoLongo: Story = {
  args: { defaultValue: "relacionamento.institucional@gestora-exemplo.com.br" },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <CurvedInput {...args} />
    </MotionConfig>
  ),
};
