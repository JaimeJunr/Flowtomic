import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { DepthText } from "./depth-text";

const meta = {
  title: "Flowtomic UI/Atoms/Typography/DepthText",
  component: DepthText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Palavra extrudada em 3D por cópias empilhadas em Z. Inclina na direção do ponteiro fino e, sem ponteiro, orbita devagar. O loop para fora da tela. Com movimento reduzido fica só a extrusão estática.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    layers: { control: { type: "number", min: 1, max: 60 } },
    depthPx: { control: { type: "number", min: 1, max: 6, step: 0.5 } },
    tiltDeg: { control: { type: "number", min: 0, max: 30 } },
    smoothing: { control: { type: "number", min: 0.02, max: 1, step: 0.02 } },
    perspectivePx: { control: { type: "number", min: 300, max: 2000, step: 50 } },
    autoOrbit: { control: "boolean" },
    orbitSpeed: { control: { type: "number", min: 0, max: 1, step: 0.05 } },
    shadow: { control: "boolean" },
  },
} satisfies Meta<typeof DepthText>;

export default meta;
type Story = StoryObj<typeof meta>;

const headline = "font-display text-7xl font-semibold text-foreground";

export const Default: Story = {
  args: { text: "Resultado" },
  render: (args) => <DepthText {...args} className={headline} />,
};

export const ExtrusaoProfunda: Story = {
  args: { text: "Margem", layers: 48, depthPx: 3, tiltDeg: 12 },
  render: (args) => <DepthText {...args} className={headline} />,
};

export const SemOrbita: Story = {
  args: { text: "Caixa", autoOrbit: false, shadow: false },
  render: (args) => <DepthText {...args} className={headline} />,
};

export const ReducedMotion: Story = {
  args: { text: "Resultado" },
  render: (args) => <DepthText {...args} className={headline} />,
  decorators: [
    (Story) => (
      <MotionConfig reducedMotion="always">
        <Story />
      </MotionConfig>
    ),
  ],
};
