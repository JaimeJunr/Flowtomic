import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, MoreHorizontal } from "lucide-react";
import { fn } from "storybook/test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { Button } from "./button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/Button",
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
        "natural",
      ],
    },
    animated: {
      control: "boolean",
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

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Download />
        Download
      </>
    ),
  },
};

export const Natural: Story = {
  args: {
    variant: "natural",
    children: "Natural",
  },
};

export const Animated: Story = {
  args: {
    variant: "natural",
    animated: true,
    children: "Animado",
  },
};

export const StatCardStyle: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -me-1.5 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuItem>Adicionar Alerta</DropdownMenuItem>
          <DropdownMenuItem>Fixar no Dashboard</DropdownMenuItem>
          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-error">Remover</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Button como no StatCard, usado como trigger de DropdownMenu com ícone e estilização específica.",
      },
    },
  },
};
