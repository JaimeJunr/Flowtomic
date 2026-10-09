import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import * as React from "react";
import {
  DictationButton,
  type DictationButtonProps,
  type DictationStopReason,
} from "./dictation-button";

const meta = {
  title: "Flowtomic UI/Atoms/Actions/DictationButton",
  component: DictationButton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Ditado por voz num campo de mensagem: toque rápido trava gravando, segurar grava só enquanto segura, deslizar para a esquerda cancela. A cápsula cresce para a esquerda com relógio e forma de onda.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    shape: { control: "inline-radio", options: ["pill", "rounded"] },
    mode: { control: "inline-radio", options: ["auto", "hold", "toggle"] },
    source: { control: "inline-radio", options: ["simulated", "mic"] },
    showTime: { control: "boolean" },
    waveform: { control: "boolean" },
    slideToCancel: { control: "boolean" },
    cancelDistance: { control: "number" },
    holdAfterMs: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof DictationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const REASON_LABEL: Record<DictationStopReason, string> = {
  release: "você soltou o botão",
  tap: "você tocou de novo",
  key: "você usou o teclado",
  escape: "você apertou Esc",
  blur: "o foco saiu do botão",
  cancel: "você deslizou para cancelar",
  disabled: "o botão foi desativado",
  "mic-denied": "o navegador negou o microfone",
  unmount: "o botão saiu da tela",
};

/** Compositor de mensagem: mostra o motivo e a duração da última nota ditada. */
function ComposerDemo(props: DictationButtonProps) {
  const [last, setLast] = React.useState<string>("Nenhuma nota ditada ainda.");
  return (
    <div className="flex w-80 flex-col gap-2">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2 pl-4">
        <span className="text-sm text-muted-foreground">Escreva ou dite sua nota…</span>
        <DictationButton
          {...props}
          onStop={({ reason, durationMs }) =>
            setLast(
              `Parou porque ${REASON_LABEL[reason]} após ${(durationMs / 1000).toFixed(1)} s.`
            )
          }
        />
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {last}
      </p>
    </div>
  );
}

const render: Story["render"] = (args) => <ComposerDemo {...args} />;

export const Default: Story = { render };

export const Segurar: Story = { render, args: { mode: "hold" } };

export const Alternar: Story = { render, args: { mode: "toggle" } };

export const Quadrado: Story = { render, args: { shape: "rounded" } };

export const MicrofoneReal: Story = {
  render,
  args: { source: "mic" },
  parameters: {
    docs: {
      description: {
        story:
          "Usa o microfone de verdade: o navegador vai pedir permissão na primeira vez. Se você negar, o botão para com o motivo “microfone negado”.",
      },
    },
  },
};

export const Disabled: Story = { render, args: { disabled: true } };

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ComposerDemo {...args} />
    </MotionConfig>
  ),
};
