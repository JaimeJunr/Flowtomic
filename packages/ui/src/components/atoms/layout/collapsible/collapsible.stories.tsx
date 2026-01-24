import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown } from "lucide-react";
import React from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../../actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../display/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

/**
 * Stories do componente Collapsible.
 *
 * O Collapsible é usado para exibir conteúdo que pode ser expandido ou colapsado.
 * É baseado em Radix UI para garantir acessibilidade completa.
 *
 * @see [Collapsible Component](../collapsible.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente collapsible para exibir conteúdo expandível/colapsável. Suporta estado controlado e não controlado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Estado aberto do collapsible",
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Collapsible.
 * Demonstra o uso básico com trigger e conteúdo.
 */
export const Default: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="ghost">Toggle</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p>Conteúdo colapsável</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Toggle" });
    await expect(button).toBeInTheDocument();
  },
};

export const WithCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Collapsible Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Click to expand
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-2">
            <div className="rounded-md border p-4">
              <p className="text-sm">This is the collapsible content.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  ),
};

/**
 * Story demonstrando Collapsible com estado defaultOpen.
 * O collapsible inicia aberto por padrão.
 */
export const ToolStyle: Story = {
  render: () => (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          Tool Name
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border p-4">
          <p className="text-sm">Conteúdo da ferramenta</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Tool Name" });
    const content = canvas.getByText("Conteúdo da ferramenta");
    await expect(button).toBeInTheDocument();
    await expect(content).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Collapsible como no Tool, usado para exibir conteúdo de ferramentas com trigger customizado e conteúdo estruturado.",
      },
    },
  },
};
