import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import React from "react";
import { Badge } from "./badge";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/Badge",
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

export const Simple: Story = {
  args: {
    children: "Badge simples",
  },
  parameters: {
    docs: {
      description: {
        story: "Exemplo básico do componente Badge sem estilização customizada.",
      },
    },
  },
};

export const StatCardStyle: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Badge
        variant="success"
        className="text-xs font-semibold inline-flex items-center gap-1 w-fit"
      >
        <ArrowUp className="h-4 w-4" />
        +17.2%
      </Badge>
      <Badge
        variant="destructive"
        className="text-xs font-semibold inline-flex items-center gap-1 w-fit"
      >
        <ArrowDown className="h-4 w-4" />
        -8.5%
      </Badge>
      <Badge
        variant="secondary"
        className="text-xs font-semibold inline-flex items-center gap-1 w-fit"
      >
        <Minus className="h-4 w-4" />
        0%
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Badge como no StatCard, com ícones de tendência e classes customizadas para alinhamento e espaçamento.",
      },
    },
  },
};
