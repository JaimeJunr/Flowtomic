import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./context-menu";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/ContextMenu",
  component: ContextMenu,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique com o botão direito aqui
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Item 1</ContextMenuItem>
        <ContextMenuItem>Item 2</ContextMenuItem>
        <ContextMenuItem>Item 3</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Clique com o botão direito aqui
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          Copiar
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Colar
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Recortar
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Mais opções</ContextMenuLabel>
        <ContextMenuItem>Renomear</ContextMenuItem>
        <ContextMenuItem variant="destructive">Deletar</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
