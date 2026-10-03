import type { Meta, StoryObj } from "@storybook/react-vite";
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "./task";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Task",
  component: Task,
  parameters: {
    layout: "centered",
    docs: { description: { component: "Etapas da consulta ao código e aos testes do DataTable." } },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultOpen: { control: "boolean", description: "Mostra as etapas ao abrir a tarefa." },
  },
} satisfies Meta<typeof Task>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Consultando a ordenação",
  render: () => (
    <Task className="w-[520px] max-w-[calc(100vw-2rem)]">
      <TaskTrigger title="Conferindo a ordenação pelo teclado" />
      <TaskContent>
        <TaskItem>
          Localizando o botão do cabeçalho em <TaskItemFile>data-table.tsx</TaskItemFile>
        </TaskItem>
        <TaskItem>
          Conferindo os nomes acessíveis em <TaskItemFile>data-table.test.tsx</TaskItemFile>
        </TaskItem>
        <TaskItem>
          Comparando o foco com <TaskItemFile>DESIGN.md</TaskItemFile>
        </TaskItem>
      </TaskContent>
    </Task>
  ),
};
export const Closed: Story = {
  name: "Consulta concluída",
  render: () => (
    <Task defaultOpen={false} className="w-[520px] max-w-[calc(100vw-2rem)]">
      <TaskTrigger title="Ordenação e busca conferidas" />
      <TaskContent>
        <TaskItem>O cabeçalho usa um botão; a busca precisa de um nome acessível.</TaskItem>
        <TaskItem>
          Veja os exemplos em <TaskItemFile>data-table.stories.tsx</TaskItemFile>
        </TaskItem>
      </TaskContent>
    </Task>
  ),
};
