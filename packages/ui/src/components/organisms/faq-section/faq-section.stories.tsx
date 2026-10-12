import type { Meta, StoryObj } from "@storybook/react-vite";
import { FaqSection, type FaqSectionProps } from "./faq-section";

const meta = {
  title: "Flowtomic UI/Organisms/FaqSection",
  component: FaqSection,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Seção de perguntas frequentes em Accordion do Radix. `split` (padrão) põe o cabeçalho à esquerda, fixo enquanto a lista rola, com as perguntas numeradas à direita; `grid` põe cabeçalho e caixa de contato em cima e as perguntas em duas colunas de cartões, alternadas para manter a ordem de leitura por linha. Responde ao contêiner (container queries, corte em 768 px). `contact` mostra uma linha de cópia (e-mail ou endereço) ou um link; `searchable` filtra pela pergunta e pela resposta; `hashLink` abre o item apontado por `#faq-<id>`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    layout: { control: "inline-radio", options: ["split", "grid"] },
    icon: { control: "inline-radio", options: ["chevron", "plus"] },
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
    numbered: { control: "boolean" },
    multiple: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    searchable: { control: "boolean" },
    hashLink: { control: "boolean" },
  },
} satisfies Meta<typeof FaqSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: FaqSectionProps["items"] = [
  {
    id: "pacote",
    question: "Preciso instalar o pacote inteiro?",
    answer:
      "Não. O CLI copia só os componentes que você pede, junto com o que eles importam, para a sua pasta de componentes.",
  },
  {
    id: "tailwind",
    question: "Os componentes funcionam sem Tailwind?",
    answer:
      "Não. Os estilos são classes do Tailwind CSS v4, então o projeto precisa do Tailwind com o plugin do PostCSS.",
  },
  {
    id: "marca",
    question: "Como troco a cor da marca?",
    answer:
      "Pelas variáveis CSS do tema, como --primary. Os componentes só usam tokens semânticos, então uma troca no tema chega em todos.",
  },
  {
    id: "cli",
    question: "O CLI sobrescreve arquivos que eu editei?",
    answer:
      "Não. O CLI copia os arquivos para o seu projeto e, se o arquivo já existir, pergunta antes de trocar.",
  },
  {
    id: "react",
    question: "Funciona com React 18?",
    answer: "Não. A biblioteca exige React 19: ref é prop normal e não há forwardRef.",
  },
  {
    id: "licenca",
    question: "Posso usar em projeto comercial?",
    answer: "Pode. O código é copiado para o seu projeto e passa a ser seu.",
  },
];

const contact = {
  description: "Se a resposta não está aqui, a conversa continua no repositório.",
  copy: { label: "Abra uma issue em", value: "github.com/JaimeJunr/Flowtomic/issues" },
};

export const Default: Story = {
  args: {
    title: "Perguntas frequentes",
    description: "O que costuma aparecer antes da primeira instalação.",
    items,
    contact,
  },
};

export const Grade: Story = {
  args: {
    title: "Dúvidas de quem está começando",
    description: "Respostas curtas sobre instalação, estilo e licença.",
    items,
    layout: "grid",
    icon: "plus",
    contact,
  },
};

export const ComBusca: Story = {
  args: {
    title: "Perguntas frequentes",
    items,
    searchable: true,
    contact,
  },
};

export const MultiplasAbertas: Story = {
  args: {
    title: "Perguntas frequentes",
    items,
    multiple: true,
    defaultValue: ["pacote", "marca"],
  },
};

export const ComAcao: Story = {
  args: {
    title: "Perguntas frequentes",
    items,
    contact: {
      title: "Quer ver o código?",
      description: "O repositório tem os componentes e as stories.",
      action: { label: "Abrir o repositório", href: "https://github.com/JaimeJunr/Flowtomic" },
    },
  },
};

export const Estreito: Story = {
  args: { title: "Perguntas frequentes", items, contact },
  render: (args) => (
    <div className="w-[360px] border border-dashed border-border">
      <FaqSection {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: { title: "Perguntas frequentes", items, contact },
  render: (args) => (
    <div className="dark rounded-xl bg-background text-foreground">
      <FaqSection {...args} />
    </div>
  ),
};
