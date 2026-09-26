import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plan, PlanContent, PlanDescription, PlanHeader, PlanTitle, PlanTrigger } from "./plan";

const meta = {
  title: "Flowtomic UI/Organisms/Plan",
  component: Plan,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Plan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultOpen: false,
    children: (
      <>
        <PlanHeader>
          <div>
            <PlanTitle>Publicar o logic 0.9.0</PlanTitle>
            <PlanDescription>
              Trusted publishing via workflow Publish, sem tocar a máquina
            </PlanDescription>
          </div>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent>
          <p>
            1. Subir a versão em `packages/logic/package.json`. 2. Rodar `bun install` pro bun.lock
            acompanhar. 3. Abrir PR e mergear na main. 4. GitHub Actions → Publish → logic.
          </p>
        </PlanContent>
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
        <PlanHeader>
          <div>
            <PlanTitle>Publicar o logic 0.9.0</PlanTitle>
            <PlanDescription>
              Trusted publishing via workflow Publish, sem tocar a máquina
            </PlanDescription>
          </div>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent>
          <p>Montando o plano…</p>
        </PlanContent>
      </>
    ),
  },
};
