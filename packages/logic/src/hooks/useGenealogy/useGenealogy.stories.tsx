import type { Meta, StoryObj } from "@storybook/react-vite";
import type { GenealogyData } from "./index";
import { GenealogyCanvas } from "@flowtomic/ui";

const meta = {
  title: "Flowtomic Logic/Hooks/useGenealogy",
  component: () => null,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hook headless para gerenciar árvores genealógicas. Fornece lógica para processar dados de genealogia, gerar nodes e edges para ReactFlow, e gerenciar interações como seleção e expansão de nós. Este exemplo demonstra o hook sendo usado pelo componente GenealogyCanvas.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Dados de exemplo para demonstração
const exampleData: GenealogyData = {
  people: [
    { id: "1", name: "João Silva", birthDate: "1950-01-01", gender: "male" },
    { id: "2", name: "Maria Silva", birthDate: "1952-03-15", gender: "female" },
    { id: "3", name: "Pedro Silva", birthDate: "1980-05-20", gender: "male" },
    { id: "4", name: "Ana Silva", birthDate: "1982-07-10", gender: "female" },
    { id: "5", name: "Carlos Silva", birthDate: "2010-09-01", gender: "male" },
  ],
  relationships: [
    { from: "1", to: "3", type: "father" },
    { from: "2", to: "3", type: "mother" },
    { from: "1", to: "4", type: "father" },
    { from: "2", to: "4", type: "mother" },
    { from: "3", to: "5", type: "father" },
  ],
};

export const Default: Story = {
  args: {
    data: exampleData,
    initialExpanded: ["1", "2", "3"],
    nodeWidth: 200,
    nodeHeight: 120,
    horizontalSpacing: 250,
    verticalSpacing: 150,
    onNodeSelect: (nodeId, person) => {
      console.log("Node selecionado:", nodeId, person);
    },
    onNodeExpand: (nodeId, expanded) => {
      console.log("Node expandido/colapsado:", nodeId, expanded);
    },
  },
  render: (args) => (
    <div className="h-screen w-full">
      <GenealogyCanvas {...args} />
    </div>
  ),
};

