import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Flowtomic UI/Atoms/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "info"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secundário",
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

export const Success: Story = {
  args: {
    variant: "success",
    children: "Sucesso",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Aviso",
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
    children: "Pequeno",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Grande",
  },
};
