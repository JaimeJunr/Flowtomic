import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./spinner";

const meta = {
  title: "Flowtomic UI/Atoms/Animation/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    className: "size-3",
  },
};

export const Medium: Story = {
  args: {
    className: "size-6",
  },
};

export const Large: Story = {
  args: {
    className: "size-8",
  },
};

export const InButton: Story = {
  render: () => (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      disabled
    >
      <Spinner />
      Carregando...
    </button>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="flex items-center justify-center p-8 border rounded-md">
      <Spinner className="size-6" />
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
