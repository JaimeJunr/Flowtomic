import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Button } from "../../actions/button/button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Abrir Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>Conteúdo do popover</p>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir Formulário</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Configurações</h4>
            <p className="text-sm text-muted-foreground">Configure suas preferências.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="width" className="text-sm font-medium">
              Largura
            </label>
            <input
              id="width"
              type="number"
              defaultValue="100"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <Button className="w-full">Salvar</Button>
        </div>
      </PopoverContent>
    </Popover>
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
