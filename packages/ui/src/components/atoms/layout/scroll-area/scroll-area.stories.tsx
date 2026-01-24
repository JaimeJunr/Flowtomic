import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { Button } from "../../actions/button";
import { ScrollArea, ScrollBar } from "./scroll-area";

/**
 * Stories do componente ScrollArea.
 *
 * O ScrollArea é usado para criar uma área de scroll customizada com
 * scrollbars estilizadas. Suporta scroll vertical e horizontal.
 *
 * @see [ScrollArea Component](../scroll-area.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Área de scroll customizada com scrollbars estilizadas. Suporta scroll vertical e horizontal com suporte aprimorado para roda do mouse.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const _content = Array.from({ length: 50 }, (_, i) => {
  const itemId = `scroll-item-${i + 1}`;
  return (
    <div key={itemId} className="p-4 border-b">
      Item {i + 1}
    </div>
  );
});

/**
 * Story padrão do ScrollArea.
 * Demonstra o uso básico com scroll vertical.
 */
export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[300px] rounded-md border">
      <div className="p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`scroll-item-${i + 1}`} className="p-2">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item1 = canvas.getByText("Item 1");
    const item10 = canvas.getByText("Item 10");
    await expect(item1).toBeInTheDocument();
    await expect(item10).toBeInTheDocument();
  },
};

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border">
      <div className="flex h-full w-max items-center space-x-4 p-4">
        {Array.from({ length: 20 }, (_, i) => {
          const itemId = `scroll-horizontal-item-${i + 1}`;
          return (
            <div
              key={itemId}
              className="shrink-0 w-[200px] h-[120px] p-4 border rounded flex items-center justify-center"
            >
              Item {i + 1}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  ),
};

export const SuggestionStyle: Story = {
  render: () => (
    <ScrollArea className="w-full overflow-x-auto whitespace-nowrap">
      <div className="flex w-max flex-nowrap items-center gap-2 p-4">
        <Button variant="outline" size="sm" className="rounded-full">
          Sugestão 1
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Sugestão 2
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Sugestão 3
        </Button>
      </div>
      <ScrollBar className="hidden" orientation="horizontal" />
    </ScrollArea>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo de uso customizado do ScrollArea como no Suggestion, usado para exibir lista horizontal de sugestões com scroll oculto.",
      },
    },
  },
};
