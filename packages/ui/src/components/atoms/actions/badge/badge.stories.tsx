/**
 * Storybook: Badge - Padrão Flowtomic
 * Padronização: título consistente, argTypes enriquecidos, remoção de redundâncias
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "./badge";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Badge destaca informações concisas como status e métricas. Variantes: default, secondary, destructive, outline, success, warning, info. Tamanhos: sm, md, lg. Use para rotulagem não interativa ou suporte visual a outros componentes (ex: StatCard).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "info"],
      description: "Variante visual (semântica) que define cores da Badge.",
      table: {
        type: {
          summary:
            "'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'",
        },
        category: "Estilo",
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamanho da Badge (altura, padding, fonte).",
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        category: "Layout",
        defaultValue: { summary: "md" },
      },
    },
    children: {
      description: "Conteúdo textual ou nó React interno.",
      table: { type: { summary: "React.ReactNode" }, category: "Conteúdo" },
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Badge" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Secundário" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Destrutivo" } };
export const Outline: Story = { args: { variant: "outline", children: "Contorno" } };
export const Success: Story = { args: { variant: "success", children: "Sucesso" } };
export const Warning: Story = { args: { variant: "warning", children: "Aviso" } };
export const Info: Story = { args: { variant: "info", children: "Informação" } };
export const Small: Story = { args: { size: "sm", children: "Pequeno" } };
export const Large: Story = { args: { size: "lg", children: "Grande" } };

export const UsageInStatCard: Story = {
  args: { children: "" },
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
        story: "Uso contextual em StatCard mostrando tendência com ícones e estilo utilitário.",
      },
    },
  },
};
