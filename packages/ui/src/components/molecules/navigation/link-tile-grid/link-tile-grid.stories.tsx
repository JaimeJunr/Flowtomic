import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Boxes,
  Code2,
  FormInput,
  Layers,
  LayoutGrid,
  MessageSquare,
  Navigation,
  Palette,
  Sparkles,
  Table2,
  Type,
  Workflow,
} from "lucide-react";
import type { LinkTile } from "./link-tile-grid";
import { LinkTileGrid } from "./link-tile-grid";

const meta = {
  title: "Flowtomic UI/Molecules/LinkTileGrid",
  component: LinkTileGrid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Grade de ladrilhos-link para navegação densa. As colunas (1, 2, 3 e 4) seguem a largura do contêiner, não da janela; `columns` limita o máximo. O título da seção fica por fora e nomeia o `<nav>` por `labelledBy`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "inline-radio", options: [2, 3, 4] },
  },
} satisfies Meta<typeof LinkTileGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE = "https://github.com/JaimeJunr/Flowtomic/tree/main/packages/ui/src/components";

const itens: LinkTile[] = [
  { id: "actions", label: "Ações", href: `${BASE}/atoms/actions`, icon: <Layers /> },
  {
    id: "animation",
    label: "Animações e efeitos de movimento",
    href: `${BASE}/atoms/animation`,
    icon: <Sparkles />,
    badge: "Novo",
  },
  { id: "background", label: "Fundos", href: `${BASE}/atoms/background`, icon: <Palette /> },
  { id: "code", label: "Código", href: `${BASE}/atoms/code`, icon: <Code2 /> },
  { id: "data-display", label: "Dados", href: `${BASE}/atoms/data-display`, icon: <Table2 /> },
  { id: "forms", label: "Formulários", href: `${BASE}/atoms/forms`, icon: <FormInput /> },
  { id: "layout", label: "Layout", href: `${BASE}/atoms/layout`, icon: <LayoutGrid /> },
  {
    id: "navigation",
    label: "Navegação",
    href: `${BASE}/molecules/navigation`,
    icon: <Navigation />,
  },
  { id: "typography", label: "Tipografia", href: `${BASE}/atoms/typography`, icon: <Type /> },
  {
    id: "feedback",
    label: "Feedback",
    href: `${BASE}/molecules/feedback`,
    icon: <MessageSquare />,
  },
  { id: "organisms", label: "Organismos", href: `${BASE}/organisms`, icon: <Boxes /> },
  {
    id: "flow",
    label: "Fluxos",
    href: `${BASE}/molecules/flow`,
    icon: <Workflow />,
    external: true,
  },
];

const descricoes: Record<string, string> = {
  actions: "Botões, selos e gatilhos",
  animation: "Texto e elementos em movimento",
  background: "Fundos de seção",
  code: "Blocos e editores",
  "data-display": "Tabelas, gráficos e cartões",
  forms: "Campos e controles",
  layout: "Grades, painéis e divisórias",
  navigation: "Menus, abas e passos",
  typography: "Títulos, contadores e texto",
  feedback: "Avisos, toasts e estados",
  organisms: "Blocos de tela completos",
  flow: "Nós e arestas do canvas",
};

function Secao(props: { columns?: 2 | 3 | 4; items?: LinkTile[] }) {
  return (
    <section>
      <h2 id="categorias" className="mb-4 text-lg font-semibold text-foreground">
        Categorias de componentes
      </h2>
      <LinkTileGrid items={props.items ?? itens} columns={props.columns} labelledBy="categorias" />
    </section>
  );
}

export const Default: Story = {
  args: { items: itens },
  render: () => <Secao />,
};

export const TresColunas: Story = {
  args: { items: itens, columns: 3 },
  render: () => <Secao columns={3} />,
};

export const ComDescricao: Story = {
  args: { items: itens },
  render: () => (
    <Secao items={itens.map((item) => ({ ...item, description: descricoes[item.id] }))} />
  ),
};

export const Estreito: Story = {
  args: { items: itens },
  render: () => (
    <div className="w-[390px] max-w-full">
      <Secao />
    </div>
  ),
};

export const Escuro: Story = {
  args: { items: itens },
  render: () => (
    <div className="dark rounded-xl bg-background p-6">
      <Secao />
    </div>
  ),
};
