import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from "./checkpoint";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Checkpoint",
  component: Checkpoint,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Retome a conversa a partir da resposta sobre ordenação. O tooltip funciona sem provider externo.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkpoint>;
export default meta;
type Story = StoryObj<typeof meta>;

function CheckpointExample() {
  const [restaurado, setRestaurado] = useState(false);
  return (
    <div className="w-[520px] max-w-[calc(100vw-2rem)] space-y-4">
      <Checkpoint>
        <CheckpointTrigger
          tooltip="Voltar à resposta sobre ordenação do DataTable"
          onClick={() => setRestaurado(true)}
        >
          <CheckpointIcon />
          Restaurar até aqui
        </CheckpointTrigger>
      </Checkpoint>
      {restaurado && (
        <output className="text-muted-foreground text-[13px]">
          Conversa restaurada até a resposta sobre ordenação.
        </output>
      )}
    </div>
  );
}
export const Default: Story = {
  name: "Restaurar com contexto",
  render: () => <CheckpointExample />,
};
export const WithoutTooltip: Story = {
  name: "Restaurar sem tooltip",
  render: () => (
    <Checkpoint className="w-[520px] max-w-[calc(100vw-2rem)]">
      <CheckpointTrigger>
        <CheckpointIcon />
        Restaurar até aqui
      </CheckpointTrigger>
    </Checkpoint>
  ),
};
