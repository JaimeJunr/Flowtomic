import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnimatedShinyText } from "./animated-shiny-text";

const meta = {
  title: "Flowtomic UI/Molecules/Typography/AnimatedShinyText",
  component: AnimatedShinyText,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    shimmerWidth: {
      control: "number",
      description: "Largura do efeito shimmer em pixels",
      defaultValue: 100,
    },
    duration: {
      control: "number",
      description: "Duração da animação em segundos",
      defaultValue: 2,
    },
    children: {
      control: "text",
      description: "Conteúdo do texto animado",
    },
  },
} satisfies Meta<typeof AnimatedShinyText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Texto Animado",
    className: "text-foreground",
  },
};

export const LongText: Story = {
  args: {
    children: "Este é um texto mais longo para demonstrar o efeito shimmer em múltiplas palavras",
    className: "text-foreground",
  },
};

export const ShortText: Story = {
  args: {
    children: "Shine",
    className: "text-foreground",
  },
};

export const CustomShimmerWidth: Story = {
  args: {
    children: "Largura Customizada",
    shimmerWidth: 200,
    className: "text-foreground",
  },
};

export const SmallShimmerWidth: Story = {
  args: {
    children: "Shimmer Pequeno",
    shimmerWidth: 50,
    className: "text-foreground",
  },
};

export const LargeShimmerWidth: Story = {
  args: {
    children: "Shimmer Grande",
    shimmerWidth: 300,
    className: "text-foreground",
  },
};

export const CustomDuration: Story = {
  args: {
    children: "Animação Lenta",
    duration: 4,
    className: "text-foreground",
  },
};

export const FastAnimation: Story = {
  args: {
    children: "Animação Rápida",
    duration: 1,
    className: "text-foreground",
  },
};

export const InHeading: Story = {
  render: () => (
    <h1 className="text-4xl font-bold text-foreground">
      Bem-vindo ao <AnimatedShinyText className="text-foreground">Flowtomic</AnimatedShinyText>
    </h1>
  ),
};

export const InParagraph: Story = {
  render: () => (
    <p className="text-lg text-foreground">
      Este é um parágrafo com texto normal e{" "}
      <AnimatedShinyText className="text-foreground">texto animado</AnimatedShinyText> no meio.
    </p>
  ),
};

export const MultipleInstances: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">
        <AnimatedShinyText shimmerWidth={120} className="text-foreground">
          Primeiro
        </AnimatedShinyText>
      </h2>
      <h2 className="text-2xl font-semibold text-foreground">
        <AnimatedShinyText shimmerWidth={150} className="text-foreground">
          Segundo
        </AnimatedShinyText>
      </h2>
      <h2 className="text-2xl font-semibold text-foreground">
        <AnimatedShinyText shimmerWidth={180} className="text-foreground">
          Terceiro
        </AnimatedShinyText>
      </h2>
    </div>
  ),
};

export const WithCustomClassName: Story = {
  args: {
    children: "Texto com Classe Customizada",
    className: "text-3xl font-bold text-foreground",
  },
};

export const WithCustomColor: Story = {
  args: {
    children: "Texto com Cor Customizada",
    className: "text-3xl font-bold text-blue-600 dark:text-blue-400",
  },
};

export const BrandColors: Story = {
  args: {
    children: "Flowtomic",
    className: "text-[#5B5FED] dark:text-[#7B7FFF]",
  },
  parameters: {
    backgrounds: {
      default: "light",
    },
  },
};
