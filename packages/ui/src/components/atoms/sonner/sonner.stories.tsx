import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "../button/button";
import { Toaster, toast } from "./sonner";

const meta = {
  title: "Flowtomic UI/Atoms/Sonner",
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
      <div className="space-y-4">
        <Button
          onClick={() => {
            toast("Evento foi criado", {
              description: "Sexta-feira, 10 de fevereiro de 2023 às 17:57",
            });
          }}
        >
          Mostrar Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.success("Sucesso!", {
              description: "Suas alterações foram salvas.",
            });
          }}
        >
          Toast de Sucesso
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            toast.error("Erro ocorrido", {
              description: "Houve um problema com sua solicitação.",
            });
          }}
        >
          Toast de Erro
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.warning("Aviso", {
              description: "Por favor, verifique sua entrada.",
            });
          }}
        >
          Toast de Aviso
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.info("Informação", {
              description: "Novos recursos estão disponíveis.",
            });
          }}
        >
          Toast de Informação
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.loading("Carregando...", {
              description: "Por favor, aguarde enquanto processamos sua solicitação.",
            });
          }}
        >
          Toast de Carregamento
        </Button>
      </div>
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
