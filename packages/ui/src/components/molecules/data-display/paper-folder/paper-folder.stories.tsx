import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText, Landmark, ReceiptText } from "lucide-react";
import { MotionConfig } from "motion/react";
import { PaperFolder } from "./paper-folder";

function Sheet({ icon: Icon, text }: { icon: typeof FileText; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-0.5 text-center">
      <Icon className="text-muted-foreground" style={{ width: 12, height: 12 }} />
      <span className="text-[6px] leading-tight font-medium">{text}</span>
    </div>
  );
}

const PAPERS = [
  <Sheet key="extrato" icon={ReceiptText} text="Extrato" />,
  <Sheet key="contrato" icon={FileText} text="Contrato" />,
  <Sheet key="informe" icon={Landmark} text="Informe IR" />,
];

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/PaperFolder",
  component: PaperFolder,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pasta de arquivo em CSS. Ao abrir, até três folhas sobem em leque e seguem o ponteiro. Serve de atalho para Documentos ou estado vazio com prévias.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "select", options: ["primary", "secondary", "accent"] },
    size: { control: { type: "range", min: 0.5, max: 3, step: 0.1 } },
    open: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="px-24 pt-32 pb-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PaperFolder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Documentos do cliente", papers: PAPERS, size: 2 },
};

export const Aberta: Story = {
  args: { label: "Relatórios do mês", papers: PAPERS, size: 2, defaultOpen: true },
};

export const UmaFolha: Story = {
  args: { label: "Contratos", papers: [PAPERS[1]], size: 2, tone: "secondary" },
};

export const Destaque: Story = {
  args: { label: "Informes", papers: PAPERS.slice(0, 2), size: 3, tone: "accent" },
};

export const ReducedMotion: Story = {
  args: { label: "Documentos do cliente", papers: PAPERS, size: 2 },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <PaperFolder {...args} />
    </MotionConfig>
  ),
};
