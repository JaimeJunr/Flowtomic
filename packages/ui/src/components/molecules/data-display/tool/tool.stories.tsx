import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tool, ToolContent, ToolHeader, type ToolHeaderProps, ToolInput, ToolOutput } from "./tool";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/Tool",
  component: Tool,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Acompanhe a consulta de um componente, seus parâmetros e o resultado.",
      },
    },
  },
  tags: ["autodocs"],
  args: { defaultOpen: true },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Exibe os detalhes ao abrir a ferramenta." },
  },
} satisfies Meta<typeof Tool>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Consulta concluída",
  render: (args) => (
    <Tool {...args} className="w-[520px] max-w-[calc(100vw-2rem)]">
      <ToolHeader type="tool-buscar_componente" state="output-available" />
      <ToolContent>
        <ToolInput input={{ nome: "data-table" }} />
        <ToolOutput
          output={{
            arquivo: "packages/ui/src/components/molecules/data-display/data-table/data-table.tsx",
            categoria: "molecule",
          }}
          errorText={undefined}
        />
      </ToolContent>
    </Tool>
  ),
};

export const WithError: Story = {
  name: "Falha na consulta",
  render: (args) => (
    <Tool {...args} className="w-[520px] max-w-[calc(100vw-2rem)]">
      <ToolHeader type="tool-buscar_componente" state="output-error" />
      <ToolContent>
        <ToolInput input={{ nome: "data-table" }} />
        <ToolOutput
          output={undefined}
          errorText="Não foi possível consultar o componente. Confira o caminho em docs/componentes/molecules.md."
        />
      </ToolContent>
    </Tool>
  ),
};

const estados = [
  "input-streaming",
  "input-available",
  "approval-requested",
  "approval-responded",
  "output-available",
  "output-error",
  "output-denied",
];
export const AllStates: Story = {
  name: "Estados da ferramenta",
  render: () => (
    <div className="w-[520px] max-w-[calc(100vw-2rem)]">
      {estados.map((state) => (
        <Tool key={state}>
          <ToolHeader type="tool-buscar_componente" state={state as ToolHeaderProps["state"]} />
        </Tool>
      ))}
    </div>
  ),
};
