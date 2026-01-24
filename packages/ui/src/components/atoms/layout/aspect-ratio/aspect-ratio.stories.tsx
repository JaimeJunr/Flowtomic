import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { AspectRatio } from "./aspect-ratio";

/**
 * Stories do componente AspectRatio.
 *
 * O AspectRatio é usado para manter uma proporção específica de largura para altura
 * em um elemento. É útil para imagens, vídeos e outros elementos que precisam
 * manter proporções consistentes.
 *
 * @see [AspectRatio Component](../aspect-ratio.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente para manter proporção fixa de largura para altura. Suporta proporções comuns como 16:9, 4:3, 1:1, etc.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: "number",
      description: "Proporção (largura/altura)",
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do AspectRatio.
 * Demonstra o uso básico com proporção 16:9 (padrão para vídeos widescreen).
 */
export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span>16:9</span>
        </div>
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("16:9");
    await expect(content).toBeInTheDocument();
  },
};

/**
 * Story demonstrando AspectRatio com proporção 1:1 (quadrado).
 * Útil para avatares, imagens de perfil, etc.
 */
export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span className="text-4xl">1:1</span>
        </div>
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("1:1");
    await expect(content).toBeInTheDocument();
  },
};

/**
 * Story demonstrando AspectRatio com proporção 21:9 (ultra-wide).
 * Útil para displays ultrawide e conteúdo cinematográfico.
 */
export const Wide: Story = {
  render: () => (
    <div className="w-[500px]">
      <AspectRatio ratio={21 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
          <span className="text-2xl">21:9</span>
        </div>
      </AspectRatio>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("21:9");
    await expect(content).toBeInTheDocument();
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
