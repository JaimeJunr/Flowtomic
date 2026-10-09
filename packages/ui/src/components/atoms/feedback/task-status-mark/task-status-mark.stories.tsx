import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { type TaskStatus, TaskStatusMark } from "./task-status-mark";

const meta = {
  title: "Flowtomic UI/Atoms/Feedback/TaskStatusMark",
  component: TaskStatusMark,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Marca de estado de tarefa que muda de forma no lugar. Sem `role=status` na raiz: o estado vai em texto `sr-only` ao lado do rótulo.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["pending", "running", "done", "failed", "cancelled"],
    },
    progress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    dashes: { control: "number" },
    spinMs: { control: "number" },
    arcLength: { control: { type: "range", min: 0.1, max: 0.9, step: 0.02 } },
    drawMs: { control: "number" },
    strike: { control: "boolean" },
    strikeDelayMs: { control: "number" },
  },
  args: { label: "Ler extratos de setembro", status: "pending" },
} satisfies Meta<typeof TaskStatusMark>;

export default meta;
type Story = StoryObj<typeof meta>;

const CYCLE: TaskStatus[] = ["pending", "running", "done"];

function CicloDemo() {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-start gap-4">
      <TaskStatusMark status={CYCLE[index]} label="Ler extratos de setembro" />
      <button
        type="button"
        className="rounded-md border border-input px-3 py-1.5 text-sm"
        onClick={() => setIndex((current) => (current + 1) % CYCLE.length)}
      >
        Avançar estado
      </button>
    </div>
  );
}

export const CicloDeVida: Story = {
  render: () => <CicloDemo />,
};

export const Default: Story = {};

export const Lista: Story = {
  render: () => (
    <ul className="flex flex-col gap-3">
      <li>
        <TaskStatusMark status="done" label="Ler extratos de setembro" />
      </li>
      <li>
        <TaskStatusMark status="running" progress={0.4} label="Conciliar 42 lançamentos" />
      </li>
      <li>
        <TaskStatusMark status="pending" label="Enviar relatório ao gestor" />
      </li>
    </ul>
  ),
};

export const Progresso: Story = {
  args: { status: "running", progress: 0.62, label: "Conciliar 42 lançamentos" },
};

export const Falhou: Story = {
  args: { status: "failed", label: "Enviar relatório ao gestor" },
};

export const Cancelado: Story = {
  args: { status: "cancelled", label: "Enviar relatório ao gestor" },
};

export const Tamanhos: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <TaskStatusMark size="sm" status="running" label="Ler extratos de setembro" />
      <TaskStatusMark size="default" status="running" label="Conciliar 42 lançamentos" />
      <TaskStatusMark size="lg" status="running" label="Enviar relatório ao gestor" />
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <MotionConfig reducedMotion="always">
      <ul className="flex flex-col gap-3">
        <li>
          <TaskStatusMark status="done" label="Ler extratos de setembro" />
        </li>
        <li>
          <TaskStatusMark status="running" label="Conciliar 42 lançamentos" />
        </li>
      </ul>
    </MotionConfig>
  ),
};
