import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../actions/button";
import { ScrollArea, ScrollBar } from "./scroll-area";

const meta = {
  title: "Flowtomic UI/Atoms/Layout/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
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
