import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Flowtomic UI/Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "success",
        "info",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Botão",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destrutivo",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Contorno",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secundário",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Fantasma",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Sucesso",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "Informação",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Botão Pequeno",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Botão Grande",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Desabilitado",
  },
};
