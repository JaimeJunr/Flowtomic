import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive } from "lucide-react";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { Button } from "../../actions/button/button";
import { FuseToast, type FuseToastProps } from "./fuse-toast";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/FuseToast",
  component: FuseToast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Aviso individual com pavio: uma linha queima até acabar e ele some. Passar o mouse pausa; arrastar de lado dispensa. Não é fila de avisos: para isso use o Sonner.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    fuse: { control: "inline-radio", options: ["bottom", "top", "none"] },
    durationMs: { control: "number" },
    slideMs: { control: "number" },
    settleBounce: { control: "number" },
    swipeDistance: { control: "number" },
    pauseOnHover: { control: "boolean" },
    closeButton: { control: "boolean" },
    dismissible: { control: "boolean" },
    inline: { control: "boolean" },
  },
  args: {
    title: "Conciliação arquivada",
    description: "Movida para Arquivo",
    actionLabel: "Desfazer",
    onAction: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof FuseToast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Reabre o aviso a cada clique, já que ele some sozinho. */
function Reopenable(props: FuseToastProps) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="flex min-h-48 flex-col items-center gap-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Mostrar aviso
      </Button>
      <FuseToast
        {...props}
        open={open}
        onClose={(reason) => {
          setOpen(false);
          props.onClose?.(reason);
        }}
      />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Reopenable {...args} />,
};

export const Inline: Story = {
  args: { inline: true },
  render: (args) => (
    <div className="w-96">
      <Reopenable {...args} />
    </div>
  ),
};

export const PavioNoTopo: Story = {
  args: { fuse: "top", icon: <Archive /> },
  render: (args) => <Reopenable {...args} />,
};

export const SemPavio: Story = {
  args: { fuse: "none" },
  render: (args) => <Reopenable {...args} />,
};

export const ComFechar: Story = {
  args: { closeButton: true },
  render: (args) => <Reopenable {...args} />,
};

export const Persistente: Story = {
  args: { durationMs: 0, closeButton: true },
  render: (args) => <Reopenable {...args} />,
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <Reopenable {...args} />
    </MotionConfig>
  ),
};
