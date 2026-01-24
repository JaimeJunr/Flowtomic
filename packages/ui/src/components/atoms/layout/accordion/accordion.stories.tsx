import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

/**
 * Stories do componente Accordion.
 *
 * O Accordion é usado para exibir conteúdo colapsável em seções.
 * Suporta modos single (apenas um item aberto) ou multiple (múltiplos itens abertos).
 *
 * @see [Accordion Component](../accordion.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente accordion para exibir conteúdo colapsável. Suporta modos single (um item) ou multiple (múltiplos itens).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
      description: "Tipo de accordion (single ou multiple)",
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Accordion.
 * Demonstra o uso básico com modo single (apenas um item aberto por vez).
 */
export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Item 1</AccordionTrigger>
        <AccordionContent>Conteúdo do item 1</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Item 2</AccordionTrigger>
        <AccordionContent>Conteúdo do item 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item1 = canvas.getByText("Item 1");
    const item2 = canvas.getByText("Item 2");

    await expect(item1).toBeInTheDocument();
    await expect(item2).toBeInTheDocument();
  },
};

/**
 * Story demonstrando Accordion com modo multiple.
 * Múltiplos itens podem estar abertos simultaneamente.
 */
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Item 1</AccordionTrigger>
        <AccordionContent>
          Conteúdo do item 1. Múltiplos itens podem estar abertos ao mesmo tempo.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Item 2</AccordionTrigger>
        <AccordionContent>Conteúdo do item 2. Este também pode estar aberto.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Item 3</AccordionTrigger>
        <AccordionContent>
          Conteúdo do item 3. Todos podem estar abertos simultaneamente.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item1 = canvas.getByText("Item 1");
    const item2 = canvas.getByText("Item 2");
    const item3 = canvas.getByText("Item 3");

    await expect(item1).toBeInTheDocument();
    await expect(item2).toBeInTheDocument();
    await expect(item3).toBeInTheDocument();
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
