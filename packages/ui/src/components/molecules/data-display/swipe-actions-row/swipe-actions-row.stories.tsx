import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Trash2 } from "lucide-react";
import { MotionConfig } from "motion/react";
import * as React from "react";
import { fn } from "storybook/test";
import { type SwipeAction, SwipeActionsRow } from "./swipe-actions-row";

type InboxItem = { id: string; title: string; detail: string; time: string };

const INBOX: InboxItem[] = [
  { id: "notas", title: "Notas da revisão de design", detail: "editado há 2 min", time: "9:41" },
  { id: "voo", title: "Voo para Lisboa", detail: "portão mudou para B12", time: "ter" },
  { id: "fatura", title: "Fatura nº 1042", detail: "vence em 3 dias", time: "R$ 1.280,00" },
];

const ACTIONS: SwipeAction[] = [
  { id: "excluir", label: "Excluir", icon: <Trash2 className="size-4" />, tone: "destructive" },
  { id: "arquivar", label: "Arquivar", icon: <Archive className="size-4" />, tone: "neutral" },
];

function RowContent({ item }: { item: InboxItem }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground text-sm">{item.title}</p>
        <p className="truncate text-muted-foreground text-xs">{item.detail}</p>
      </div>
      <span className="shrink-0 font-mono text-muted-foreground text-xs">{item.time}</span>
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/SwipeActionsRow",
  component: SwipeActionsRow,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Linha de lista com ações atrás. Arraste para revelar a gaveta; passando de 60% da largura, solte para executar a ação principal e a linha dobra. Sem mouse, o botão Ações (visível no foco) abre a gaveta.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[26rem] max-w-full overflow-hidden rounded-lg border border-border">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    direction: { control: "inline-radio", options: ["left", "right"] },
    actionWidth: { control: "number" },
    snapBounce: { control: "number" },
    resistance: { control: "number" },
    collapseMs: { control: "number" },
    commitAt: { control: "number" },
    fullSwipe: { control: "boolean" },
    closeOnAction: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    actions: ACTIONS,
    children: <RowContent item={INBOX[0]} />,
    onAction: fn(),
    onCommit: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof SwipeActionsRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lista: Story = {
  render: (args) => <InboxList {...args} />,
};

function InboxList(args: React.ComponentProps<typeof SwipeActionsRow>) {
  const [items, setItems] = React.useState(INBOX);
  return (
    <div className="divide-y divide-border">
      {items.map((item) => (
        <SwipeActionsRow
          key={item.id}
          {...args}
          label={item.title}
          onCommit={(action) => {
            args.onCommit?.(action);
            setItems((current) => current.filter((entry) => entry.id !== item.id));
          }}
        >
          <RowContent item={item} />
        </SwipeActionsRow>
      ))}
      {items.length === 0 && (
        <p className="px-4 py-6 text-center text-muted-foreground text-sm">
          Caixa vazia. Recarregue a página para ver a lista de novo.
        </p>
      )}
    </div>
  );
}

export const ParaDireita: Story = {
  args: { direction: "right", children: <RowContent item={INBOX[1]} /> },
};

export const SemSwipeCompleto: Story = {
  args: { fullSwipe: false, children: <RowContent item={INBOX[2]} /> },
};

export const UmaAcao: Story = {
  args: { actions: [ACTIONS[0]], children: <RowContent item={INBOX[0]} /> },
};

export const Disabled: Story = {
  args: { disabled: true, children: <RowContent item={INBOX[1]} /> },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <SwipeActionsRow {...args} />
    </MotionConfig>
  ),
};
