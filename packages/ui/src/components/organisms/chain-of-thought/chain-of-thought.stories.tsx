import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "./chain-of-thought";

const meta = {
  title: "Flowtomic UI/Organisms/ChainOfThought",
  component: ChainOfThought,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChainOfThought>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultOpen: false,
    children: (
      <>
        <ChainOfThoughtHeader>Passos do raciocínio</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            label="Ler o pedido"
            description="Adicionar o stat-card no dashboard"
            status="complete"
          />
          <ChainOfThoughtStep
            label="Checar o component-map"
            description="stat-card ainda não está em cli/src/utils/component-map.ts"
            status="active"
          />
          <ChainOfThoughtStep
            label="Rodar o CLI"
            description="bunx flowtomic-cli add stat-card"
            status="pending"
          />
        </ChainOfThoughtContent>
      </>
    ),
  },
};
