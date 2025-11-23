import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileQuestion } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

const meta = {
  title: "Flowtomic UI/Atoms/Display/Empty",
  component: Empty,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Nenhum item encontrado</EmptyTitle>
        <EmptyDescription>Não há itens para exibir no momento.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestion />
        </EmptyMedia>
        <EmptyTitle>Nenhum resultado</EmptyTitle>
        <EmptyDescription>Não encontramos nenhum resultado para sua busca.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestion />
        </EmptyMedia>
        <EmptyTitle>Lista vazia</EmptyTitle>
        <EmptyDescription>Comece adicionando seu primeiro item à lista.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Adicionar Item
        </button>
      </EmptyContent>
    </Empty>
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
