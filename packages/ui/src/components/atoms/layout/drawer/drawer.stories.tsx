import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import React from "react";
import { Button } from "../../actions/button/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

/**
 * Stories do componente Drawer.
 *
 * O Drawer é usado para exibir conteúdo em um painel deslizante que aparece
 * da borda da tela. Suporta gestos de arrastar para fechar.
 *
 * @see [Drawer Component](../drawer.tsx) para documentação completa do componente
 */
const meta = {
  title: "Flowtomic UI/Atoms/Layout/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Painel deslizante que aparece da borda da tela. Suporta direções (top, bottom, left, right) e gestos de arrastar para fechar.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Story padrão do Drawer.
 * Demonstra o uso básico com título, descrição e footer.
 */
export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Abrir Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Título</DrawerTitle>
          <DrawerDescription>Descrição</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Conteúdo</p>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Abrir Drawer" });
    await expect(button).toBeInTheDocument();
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
