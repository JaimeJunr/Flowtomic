import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { fn } from "storybook/test";
import { Button } from "../../actions/button";
import { Toaster, toast } from "./sonner";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() => {
          toast("Toast padrão", {
            description: "Descrição do toast",
          });
        }}
      >
        Mostrar Toast
      </Button>
    </>
  ),
};

export const WithAction: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() => {
          toast("Evento foi criado", {
            description: "Sexta-feira, 10 de fevereiro de 2023 às 17:57",
            action: {
              label: "Desfazer",
              onClick: fn(),
            },
          });
        }}
      >
        Toast com Ação
      </Button>
    </>
  ),
};

export const WithCancel: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() => {
          toast("Evento foi criado", {
            description: "Sexta-feira, 10 de fevereiro de 2023 às 17:57",
            action: {
              label: "Desfazer",
              onClick: fn(),
            },
            cancel: {
              label: "Cancelar",
              onClick: fn(),
            },
          });
        }}
      >
        Toast com Cancelar
      </Button>
    </>
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
