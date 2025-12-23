/**
 * Storybook: Button - Padrão Flowtomic
 * Padronização: argTypes enriquecidos, renomeação de StatCardStyle, história de acessibilidade.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, MoreHorizontal } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
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
    docs: {
      description: {
        component:
          "O componente Button é um elemento interativo usado para acionar ações ou eventos dentro da interface do usuário. Ele suporta múltiplas variantes de estilo (padrão, destrutivo, contorno, secundário, fantasma, link, sucesso, informação, natural) e tamanhos (padrão, pequeno, grande, ícone em vários tamanhos), permitindo flexibilidade na apresentação conforme o contexto da aplicação. Além disso, o botão pode ser configurado para ser animado ou desabilitado, aprimorando a experiência do usuário.",
      },
    },
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
      description: "Variante semântica de estilo.",
      table: {
        type: {
          summary:
            "'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'info' | 'natural'",
        },
        category: "Estilo",
        defaultValue: { summary: "default" },
      },
    },
    animated: {
      control: "boolean",
      description: "Ativa animações sutis de hover/focus específicas da variante.",
      table: {
        type: { summary: "boolean" },
        category: "Comportamento",
        defaultValue: { summary: "false" },
      },
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
      description: "Tamanho do botão incluindo opção de ícone dedicado.",
      table: {
        type: { summary: "...sizes" },
        category: "Layout",
        defaultValue: { summary: "default" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado sem interação ou foco.",
      table: {
        type: { summary: "boolean" },
        category: "Estado",
        defaultValue: { summary: "false" },
      },
    },
    children: {
      description: "Conteúdo interno (texto e/ou ícones).",
      table: { type: { summary: "React.ReactNode" }, category: "Conteúdo" },
    },
    onClick: {
      description: "Callback de clique (usado em teste de interação).",
      table: { type: { summary: "(event) => void" }, category: "Eventos" },
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

export const UsageInStatCard: Story = {
  args: { children: "" },
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
          "Uso contextual em StatCard como trigger de DropdownMenu com ícone minimalista e estilização utilitária.",
      },
    },
  },
};

export const Accessibility: Story = {
  args: { children: "Acessível" },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra foco via teclado e acionamento por Enter/Espaço para validar acessibilidade básica do botão.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.getByRole("button", { name: /Acessível/i });
    await userEvent.tab(); // move foco
    expect(btn).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    // onClick fn() foi definido em meta.args; podemos verificar chamadas
    if (typeof args.onClick === "function") {
      // @ts-expect-error - fn possui mock.calls
      expect(args.onClick.mock.calls.length).toBeGreaterThan(0);
    }
  },
};
