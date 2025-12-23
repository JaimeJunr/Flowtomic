/**
 * Storybook: ContextMenu - Padrão Flowtomic
 * Padronização: descrição, história de acessibilidade.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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
    docs: {
      description: {
        component:
          "ContextMenu exibe ações contextuais ao disparar evento de clique secundário. Útil para listas e áreas de trabalho ricas. Mantém acessibilidade: itens navegáveis por teclado após abertura programática.",
      },
    },
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

export const Accessibility: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger
        data-testid="cm-trigger"
        className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"
      >
        Clique (botão direito) ou simulado
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={fn()}>Ação 1</ContextMenuItem>
        <ContextMenuItem onClick={fn()}>Ação 2</ContextMenuItem>
        <ContextMenuItem onClick={fn()}>Ação 3</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstra abertura via clique direito simulado e foco programático para validar acessibilidade de teclado no ContextMenu.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = await canvas.getByTestId("cm-trigger");

    // Simula clique com botão direito (context menu)
    await userEvent.pointer([{ keys: "[MouseRight>]", target: area }, { keys: "[/MouseRight]" }]);

    // Aguarda um pouco para o menu abrir
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verifica se o menu está aberto através do estado do trigger
    expect(area).toHaveAttribute("data-state", "open");

    // Navega com setas (o menu já deve estar focado)
    await userEvent.keyboard("{ArrowDown}");
  },
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
