import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./reasoning";

const meta = {
  title: "Flowtomic UI/Organisms/Reasoning",
  component: Reasoning,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isStreaming: false,
    defaultOpen: true,
    children: (
      <>
        <ReasoningTrigger />
        <ReasoningContent>
          O componente stat-card já existe em `packages/ui/src/components/atoms/stat-card`. Falta
          registrá-lo em `cli/src/utils/component-map.ts` e adicionar a story antes de publicar.
        </ReasoningContent>
      </>
    ),
  },
};

export const Streaming: Story = {
  args: {
    isStreaming: true,
    defaultOpen: true,
    children: (
      <>
        <ReasoningTrigger />
        <ReasoningContent>Rodando `bunx flowtomic-cli add stats-grid`…</ReasoningContent>
      </>
    ),
  },
};
