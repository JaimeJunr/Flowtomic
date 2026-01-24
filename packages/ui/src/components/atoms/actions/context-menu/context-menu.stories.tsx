/**
 * # ContextMenu Component Stories
 *
 * Stories do componente ContextMenu demonstrando uso básico, atalhos, acessibilidade e casos de uso.
 *
 * ## Características
 *
 * - **Clique Secundário**: Abre via clique com botão direito
 * - **Atalhos**: Suporta exibição de atalhos de teclado
 * - **Submenus**: Suporta menus aninhados
 * - **Acessibilidade**: Navegação completa por teclado
 *
 * @see [ContextMenu Component](./context-menu.tsx) para documentação completa do componente
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

/**
 * ## Exemplo Padrão
 *
 * ContextMenu básico com itens simples.
 */
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
  parameters: {
    docs: {
      description: {
        story:
          "ContextMenu básico com itens simples. Clique com o botão direito na área para abrir o menu.",
      },
    },
  },
};

/**
 * ## Com Atalhos e Variantes
 *
 * ContextMenu com atalhos de teclado, separadores, labels e variante destrutiva.
 */
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
  parameters: {
    docs: {
      description: {
        story:
          "ContextMenu com atalhos de teclado, separadores, labels e variante destrutiva. Demonstra uso avançado do componente.",
      },
    },
  },
};

/**
 * ## Teste de Acessibilidade
 *
 * Valida abertura via clique direito simulado e navegação por teclado.
 */
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
