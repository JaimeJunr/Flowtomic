import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { TextPressure } from "./text-pressure";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/TextPressure",
  component: TextPressure,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Palavra que preenche a largura do bloco. Cada letra engorda conforme a proximidade do ponteiro, que é suavizado por lerp. Exige fonte variável (Public Sans no tema, wght 100 a 900); eixos que a fonte não tem são ignorados. Com movimento reduzido as letras ficam no meio da faixa.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    alpha: { control: "boolean" },
    stroke: { control: "boolean" },
    italic: { control: "boolean" },
    scaleToHeight: { control: "boolean" },
    minFontSizePx: { control: { type: "number", min: 8, max: 96 } },
  },
} satisfies Meta<typeof TextPressure>;

export default meta;
type Story = StoryObj<typeof meta>;

const word = "font-display text-foreground";

export const Default: Story = {
  args: { text: "Faturamento" },
  render: (args) => <TextPressure {...args} className={word} />,
};

export const ComOpacidade: Story = {
  args: { text: "Inadimplência", alpha: true },
  render: (args) => <TextPressure {...args} className={word} />,
};

export const ComContorno: Story = {
  args: { text: "Conciliação", stroke: true, weightRange: [300, 900] },
  render: (args) => <TextPressure {...args} className={word} />,
};

export const EsticadoNaAltura: Story = {
  args: { text: "Caixa", scaleToHeight: true },
  render: (args) => <TextPressure {...args} className={`${word} h-64`} />,
};

export const ReducedMotion: Story = {
  args: { text: "Faturamento" },
  render: (args) => <TextPressure {...args} className={word} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
