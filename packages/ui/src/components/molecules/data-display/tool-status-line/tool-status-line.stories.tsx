import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code2, FileText, Globe } from "lucide-react";
import { ToolStatusLine } from "./tool-status-line";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ToolStatusLine",
  component: ToolStatusLine,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Uma linha por chamada de ferramenta, dentro da resposta do assistente. Mostra o resultado, não o mecanismo; para ver parâmetros e JSON, use o `Tool`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    state: { control: "inline-radio", options: ["running", "done", "error"] },
    label: { control: "text" },
    detail: { control: "text" },
    meta: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-[560px] max-w-[calc(100vw-2rem)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToolStatusLine>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Busca feita",
  args: {
    state: "done",
    icon: <Globe />,
    label: "Buscou na web por",
    detail: "aria-sort table header",
  },
};

export const Rodando: Story = {
  args: {
    state: "running",
    label: "Buscando na web por",
    detail: "aria-sort table header",
  },
};

export const Erro: Story = {
  args: {
    state: "error",
    label: "Não conseguiu ler",
    detail: "github.com/acme/privado",
    meta: "403",
  },
};

export const NaResposta: Story = {
  name: "Na resposta",
  args: { state: "done", label: "Leu" },
  render: () => (
    <div className="flex flex-col gap-1">
      <ToolStatusLine state="done" icon={<FileText />} label="Leu" detail="data-table.tsx" />
      <ToolStatusLine
        state="done"
        icon={<Globe />}
        label="Buscou na web por"
        detail="aria-sort table header"
      />
      <ToolStatusLine
        state="done"
        icon={<Code2 />}
        label="Abriu"
        detail={
          <a className="text-link hover:underline" href="https://github.com/radix-ui/primitives">
            radix-ui/primitives
          </a>
        }
        meta="TypeScript"
      />
    </div>
  ),
};
