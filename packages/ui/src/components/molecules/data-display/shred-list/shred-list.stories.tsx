import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText } from "lucide-react";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { ShredList, type ShredListProps } from "./shred-list";

type FileEntry = { id: string; name: string; meta: string };

const FILES: FileEntry[] = [
  { id: "porto", name: "Porto ao entardecer", meta: "editado ontem · 4,1 MB" },
  { id: "relatorio", name: "Relatório de conciliação", meta: "editado há 3 dias · 820 KB" },
  { id: "contrato", name: "Contrato de prestação", meta: "editado em 12 de setembro · 1,2 MB" },
  { id: "planilha", name: "Planilha de custos", meta: "editado em 2 de setembro · 356 KB" },
];

function FileCard({ file }: { file: FileEntry }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground">
      <FileText className="size-5 text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{file.meta}</span>
      </div>
    </div>
  );
}

type StatefulProps = Omit<
  Partial<ShredListProps<{ id: string }>>,
  "items" | "renderItem" | "onShred" | "onReorder"
>;

function Stateful(props: StatefulProps) {
  const [files, setFiles] = React.useState(FILES);
  return (
    <div className="w-[340px]">
      <ShredList
        aria-label="Arquivos"
        {...props}
        items={files}
        renderItem={(file) => <FileCard file={file} />}
        onShred={(file) => setFiles((current) => current.filter((entry) => entry.id !== file.id))}
        onReorder={setFiles}
      />
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ShredList",
  component: ShredList,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Lista com fenda: arraste um cartão até a fenda para triturá-lo em tiras, ou reordene arrastando acima dela. Teclado: Delete tritura, Alt e setas reordenam. Se o pai não remover o item em `onShred`, ele volta ao topo.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    feedSpeed: { control: "number" },
    bite: { control: "number" },
    autoFeed: { control: "boolean" },
    stripWidth: { control: "number" },
    curl: { control: { type: "range", min: 0, max: 1.5, step: 0.1 } },
    dragTilt: { control: "number" },
    lift: { control: "number" },
    fallHeight: { control: "number" },
    gap: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    items: FILES,
    renderItem: (file: FileEntry) => <FileCard file={file} />,
    onShred: fn(),
    onReorder: fn(),
  },
} satisfies Meta<typeof ShredList<FileEntry>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Stateful {...args} />,
};

export const Reordenar: Story = {
  parameters: {
    docs: { description: { story: "Solte o cartão entre outros para mudar a ordem." } },
  },
  render: (args) => <Stateful {...args} autoFeed={false} />,
};

export const TirasLargas: Story = {
  args: { stripWidth: 24 },
  render: (args) => <Stateful {...args} />,
};

export const SemOndas: Story = {
  args: { curl: 0 },
  render: (args) => <Stateful {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Stateful {...args} />,
};

export const ReducedMotion: Story = {
  parameters: {
    docs: {
      description: { story: "Sem tiras: o cartão some com fade e a lista fecha o espaço." },
    },
  },
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <Stateful {...args} />
    </MotionConfig>
  ),
};
