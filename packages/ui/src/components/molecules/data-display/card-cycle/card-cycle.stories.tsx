import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeftRight, BellRing, CalendarClock, FileText, Link2, TrendingUp } from "lucide-react";
import { MotionConfig } from "motion/react";
import * as React from "react";

import { Button } from "@/components/atoms/actions/button";
import { cn } from "@/lib/utils";
import { CardCycle, type CardCycleHandle, type CardCycleItem } from "./card-cycle";

function Bar({ value, tone = "bg-primary" }: { value: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{value}</span>
      {hint ? <span className="font-mono text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function Line({ left, right, tone }: { left: string; right: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 text-xs last:border-b-0">
      <span className="truncate">{left}</span>
      <span className={cn("shrink-0 font-mono tabular-nums", tone)}>{right}</span>
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col gap-3 p-4">{children}</div>;
}

function ReconciliationScreen() {
  return (
    <Screen>
      <div className="flex items-end justify-between">
        <Metric label="Posições conciliadas" value="98,4%" hint="1.842 de 1.872" />
        <span className="font-mono text-xs text-muted-foreground">D-1 10:42</span>
      </div>
      <Bar value={98} />
      <div>
        <Line left="Saldo em custódia" right="R$ 48.210.304,15" />
        <Line left="Saldo no controle interno" right="R$ 48.210.304,15" />
        <Line left="Divergência de preço (3)" right="R$ 12.480,00" tone="text-warning" />
        <Line left="Ativos sem lastro (1)" right="R$ 0,00" tone="text-destructive" />
      </div>
    </Screen>
  );
}

function CommitteeScreen() {
  const bars = [38, 52, 44, 61, 58, 73, 69, 84];
  return (
    <Screen>
      <Metric label="Retorno acumulado no ano" value="+11,72%" hint="CDI 10,48%" />
      <div className="flex h-24 items-end gap-2">
        {bars.map((height, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: série estática de demonstração.
            key={index}
            className={cn(
              "flex-1 rounded-t",
              index === bars.length - 1 ? "bg-primary" : "bg-muted"
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Fev</span>
        <span>Set</span>
      </div>
    </Screen>
  );
}

function QuotaScreen() {
  return (
    <Screen>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Fundo</span>
        <span>Cota</span>
        <span>Dia</span>
      </div>
      <div>
        {[
          ["Renda Fixa Soberana", "3,184721", "+0,04%"],
          ["Multimercado Macro", "2,907455", "-0,11%"],
          ["Crédito Privado High Grade", "1,542038", "+0,06%"],
          ["Ações Valor", "5,871002", "+0,82%"],
        ].map(([name, quota, change]) => (
          <Line
            key={name}
            left={name}
            right={`${quota}  ${change}`}
            tone={change.startsWith("-") ? "text-destructive" : undefined}
          />
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">Cotas fechadas às 18:05</p>
    </Screen>
  );
}

function RiskScreen() {
  const limits = [
    { name: "Concentração por emissor", used: 86, tone: "bg-warning" },
    { name: "Exposição cambial", used: 41, tone: "bg-primary" },
    { name: "VaR 1 dia (limite 2,0%)", used: 93, tone: "bg-destructive" },
  ];
  return (
    <Screen>
      <Metric label="Limites em alerta" value="2 de 9" />
      <div className="flex flex-col gap-3">
        {limits.map((limit) => (
          <div key={limit.name} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span>{limit.name}</span>
              <span className="font-mono tabular-nums">{limit.used}%</span>
            </div>
            <Bar value={limit.used} tone={limit.tone} />
          </div>
        ))}
      </div>
    </Screen>
  );
}

function CustodyScreen() {
  return (
    <Screen>
      <Metric label="Conexões ativas" value="4 de 4" />
      <div>
        <Line left="Custódia principal" right="há 2 min" />
        <Line left="Administrador fiduciário" right="há 9 min" />
        <Line left="Banco liquidante" right="há 14 min" />
        <Line left="Registradora de recebíveis" right="há 1 h" tone="text-muted-foreground" />
      </div>
    </Screen>
  );
}

const ICON = "size-4";
const features: CardCycleItem[] = [
  {
    id: "conciliacao",
    title: "Conciliação automática",
    icon: <ArrowLeftRight className={ICON} />,
    content: <ReconciliationScreen />,
  },
  {
    id: "relatorios",
    title: "Relatórios para o comitê",
    icon: <FileText className={ICON} />,
    content: <CommitteeScreen />,
  },
  {
    id: "cotas",
    title: "Cotas diárias",
    icon: <TrendingUp className={ICON} />,
    content: <QuotaScreen />,
  },
  {
    id: "alertas",
    title: "Alertas de risco",
    icon: <BellRing className={ICON} />,
    content: <RiskScreen />,
  },
  {
    id: "custodiantes",
    title: "Integração com custodiantes",
    icon: <Link2 className={ICON} />,
    content: <CustodyScreen />,
  },
];

// A pilha cresce para cima e para a direita: o palco reserva esse espaço.
function Stage({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-end pb-14 pl-6",
        wide ? "h-[600px] w-[900px]" : "h-[520px] w-[760px]"
      )}
    >
      {children}
    </div>
  );
}

const compact = { width: 440, height: 300, stepX: 56, stepY: 56 };

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/CardCycle",
  component: CardCycle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pilha de cartões em 3D para vitrine de recursos: o da frente cai e volta ao fundo, os outros avançam. Arraste o da frente, clique num de trás ou use as setas com foco na pilha. Pausa no hover e no foco; com movimento reduzido não troca sozinha.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    visibleCards: { control: { type: "range", min: 1, max: 8, step: 1 } },
    interval: { control: "number" },
    bounce: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    parallax: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    hoverSpread: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    dim: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    autoplay: { control: "boolean" },
    pauseOnHover: { control: "boolean" },
    draggable: { control: "boolean" },
  },
  args: { items: features, ...compact, "aria-label": "Recursos da plataforma" },
  decorators: [
    (Story) => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
} satisfies Meta<typeof CardCycle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function ManualDemo(args: React.ComponentProps<typeof CardCycle>) {
  const control = React.useRef<CardCycleHandle>(null);
  return (
    <div className="flex flex-col gap-6">
      <CardCycle {...args} controlRef={control} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => control.current?.prev()}>
          Anterior
        </Button>
        <Button onClick={() => control.current?.next()}>Próximo</Button>
      </div>
    </div>
  );
}

export const Manual: Story = {
  args: { autoplay: false },
  decorators: [
    (Story) => (
      <Stage>
        <div className="flex flex-col justify-end">
          <Story />
        </div>
      </Stage>
    ),
  ],
  render: (args) => <ManualDemo {...args} />,
};

export const Wide: Story = {
  args: { width: 520, height: 320, stepX: 96, stepY: 80, depth: 140, visibleCards: 5 },
  decorators: [
    (Story) => (
      <Stage wide>
        <Story />
      </Stage>
    ),
  ],
};

export const SingleVisible: Story = {
  name: "Sem pilha (visibleCards 1)",
  args: { visibleCards: 1, parallax: 0.2 },
  render: (args) => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CalendarClock className="size-4" />
      <CardCycle {...args} />
    </div>
  ),
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <CardCycle {...args} />
    </MotionConfig>
  ),
};
