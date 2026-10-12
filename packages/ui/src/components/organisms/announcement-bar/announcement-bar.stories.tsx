import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/atoms/actions/button";
import { AnnouncementBar } from "./announcement-bar";

const meta = {
  title: "Flowtomic UI/Organisms/AnnouncementBar",
  component: AnnouncementBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Faixa de aviso de largura total, logo abaixo do cabeçalho: ícone, texto e link sublinhado centralizados, com botão para fechar. Fechar anima a altura até 0 (some seco com movimento reduzido). Com `storageKey`, o fechamento fica em `localStorage` e a faixa não volta. Pode ser controlada com `open` e `onOpenChange`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    dismissible: { control: "boolean" },
    label: { control: "text" },
    storageKey: { control: "text" },
  },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Sparkles />,
    children: "A 1.0 saiu: React 19 em todos os componentes.",
    action: { label: "Ler o changelog", href: "#changelog" },
  },
};

export const SemLink: Story = {
  args: { children: "Manutenção programada no sábado, das 22h às 23h." },
};

export const NaoDispensavel: Story = {
  args: { ...Default.args, dismissible: false },
};

export const TextoLongo: Story = {
  args: {
    ...Default.args,
    children:
      "Agora todos os componentes aceitam ref como prop e marcam a raiz com data-slot, o que muda a forma de estilizar por fora e exige uma passada nos seus seletores.",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[390px] border-x">
        <Story />
      </div>
    ),
  ],
};

function Controlada() {
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <AnnouncementBar open={open} onOpenChange={setOpen} icon={<Sparkles />}>
        Aviso controlado de fora.
      </AnnouncementBar>
      <div className="p-6">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Mostrar de novo
        </Button>
      </div>
    </div>
  );
}

export const ControladaPorFora: Story = {
  args: { children: "" },
  render: () => <Controlada />,
};
