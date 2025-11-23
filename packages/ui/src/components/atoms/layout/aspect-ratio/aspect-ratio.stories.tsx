import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./aspect-ratio";

const meta = {
  title: "Flowtomic UI/Atoms/Layout/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
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
};

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
};

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
