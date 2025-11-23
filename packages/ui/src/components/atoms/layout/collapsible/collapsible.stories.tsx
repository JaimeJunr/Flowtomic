import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown } from "lucide-react";
import { Button } from "../../actions/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../display/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

const meta = {
  title: "Flowtomic UI/Atoms/Layout/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

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
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do Collapsible como no Tool, usado para exibir conteúdo de ferramentas com trigger customizado e conteúdo estruturado.",
      },
    },
  },
};
