import type { GenealogyData } from "@flowtomic/logic";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GenealogyCanvas } from "./genealogy-canvas";

// Dados de exemplo para demonstração (pessoas)
const exampleData: GenealogyData = {
  people: [
    { id: "1", name: "João Silva", birthDate: "1950-01-01", gender: "male" },
    { id: "2", name: "Maria Silva", birthDate: "1952-03-15", gender: "female" },
    { id: "3", name: "Pedro Silva", birthDate: "1980-05-20", gender: "male" },
    { id: "4", name: "Ana Silva", birthDate: "1982-07-10", gender: "female" },
    { id: "5", name: "Carlos Silva", birthDate: "2010-09-01", gender: "male" },
    { id: "6", name: "Sofia Silva", birthDate: "2012-11-15", gender: "female" },
  ],
  relationships: [
    { from: "1", to: "3", type: "father" },
    { from: "2", to: "3", type: "mother" },
    { from: "1", to: "4", type: "father" },
    { from: "2", to: "4", type: "mother" },
    { from: "3", to: "5", type: "father" },
    { from: "3", to: "6", type: "father" },
  ],
};

// Dados de exemplo com animais e ninhadas
const animalsData: GenealogyData = {
  people: [
    {
      id: "animal-1",
      name: "Rex",
      gender: "male",
      birthDate: "2020-01-15",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop",
      species: "dog",
      breed: "Golden Retriever",
    },
    {
      id: "animal-2",
      name: "Luna",
      gender: "female",
      birthDate: "2020-03-20",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop",
      species: "dog",
      breed: "Golden Retriever",
    },
    {
      id: "litter-1",
      name: "Ninhada #1",
      birthDate: "2022-05-10",
    },
    {
      id: "offspring-1",
      name: "Max",
      gender: "male",
      birthDate: "2022-05-10",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop",
      species: "dog",
      breed: "Golden Retriever",
    },
    {
      id: "offspring-2",
      name: "Bella",
      gender: "female",
      birthDate: "2022-05-10",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop",
      species: "dog",
      breed: "Golden Retriever",
    },
  ],
  relationships: [
    // Animais são pais da ninhada
    { from: "animal-1", to: "litter-1", type: "father" },
    { from: "animal-2", to: "litter-1", type: "mother" },
    // Filhotes são filhos da ninhada
    { from: "litter-1", to: "offspring-1", type: "father" },
    { from: "litter-1", to: "offspring-2", type: "father" },
  ],
};

// Dados com adoção
const _adoptionData: GenealogyData = {
  people: [
    { id: "1", name: "Roberto Santos", birthDate: "1970-01-01", gender: "male" },
    { id: "2", name: "Laura Santos", birthDate: "1972-03-15", gender: "female" },
    { id: "3", name: "Lucas Santos", birthDate: "2005-06-20", gender: "male" },
  ],
  relationships: [
    { from: "1", to: "3", type: "father" },
    { from: "2", to: "3", type: "mother" },
  ],
};

const meta = {
  title: "Flowtomic UI/Organisms/GenealogyCanvas",
  component: GenealogyCanvas,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Componente para exibir árvores genealógicas interativas em um canvas. Usa ReactFlow para renderização e permite expandir/colapsar nós, selecionar pessoas e visualizar relacionamentos familiares.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Dados da árvore genealógica (pessoas e relacionamentos)",
    },
    initialExpanded: {
      description: "IDs de nós inicialmente expandidos",
      control: { type: "object" },
    },
    nodeWidth: {
      description: "Largura dos nós em pixels",
      control: { type: "number" },
    },
    nodeHeight: {
      description: "Altura dos nós em pixels",
      control: { type: "number" },
    },
    horizontalSpacing: {
      description: "Espaçamento horizontal entre nós em pixels",
      control: { type: "number" },
    },
    verticalSpacing: {
      description: "Espaçamento vertical entre nós em pixels",
      control: { type: "number" },
    },
    onNodeSelect: {
      description: "Callback quando um nó é selecionado",
      action: "node-selected",
    },
    onNodeExpand: {
      description: "Callback quando um nó é expandido/colapsado",
      action: "node-expanded",
    },
    onAddRelation: {
      description: "Callback para adicionar relacionamento",
      action: "relation-added",
    },
  },
} satisfies Meta<typeof GenealogyCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: exampleData,
    initialExpanded: ["1", "2", "3"],
    nodeWidth: 200,
    nodeHeight: 120,
    horizontalSpacing: 250,
    verticalSpacing: 150,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <GenealogyCanvas {...args} />
    </div>
  ),
};

export const WithAnimals: Story = {
  args: {
    data: animalsData,
    initialExpanded: ["animal-1", "animal-2", "litter-1"],
    nodeWidth: 200,
    nodeHeight: 180,
    horizontalSpacing: 250,
    verticalSpacing: 200,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <GenealogyCanvas {...args} />
    </div>
  ),
};

export const Compact: Story = {
  args: {
    data: exampleData,
    initialExpanded: ["1", "2"],
    nodeWidth: 150,
    nodeHeight: 100,
    horizontalSpacing: 200,
    verticalSpacing: 120,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <GenealogyCanvas {...args} />
    </div>
  ),
};

export const WithCallbacks: Story = {
  args: {
    data: exampleData,
    initialExpanded: ["1", "2"],
    onNodeSelect: (nodeId, person) => {
      console.log("Node selecionado:", nodeId, person);
    },
    onNodeExpand: (nodeId, expanded) => {
      console.log("Node expandido/colapsado:", nodeId, expanded);
    },
    onAddRelation: (fromId, toId, type) => {
      console.log("Relacionamento adicionado:", fromId, toId, type);
    },
  },
  render: (args) => (
    <div className="h-screen w-full">
      <GenealogyCanvas {...args} />
    </div>
  ),
};
