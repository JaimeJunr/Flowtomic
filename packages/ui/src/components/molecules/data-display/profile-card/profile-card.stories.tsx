import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { ProfileCard } from "./profile-card";

function Portrait({ initials }: { initials: string }) {
  return (
    <div
      aria-hidden
      className="flex h-full w-full items-end justify-center bg-gradient-to-t from-primary to-accent pb-24 font-display text-8xl font-semibold text-primary-foreground"
    >
      {initials}
    </div>
  );
}

function MiniPortrait({ initials }: { initials: string }) {
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center bg-primary text-sm font-semibold text-primary-foreground"
    >
      {initials}
    </div>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/ProfileCard",
  component: ProfileCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cartão de perfil holográfico que inclina em 3D com o ponteiro. Pensado para a página do gestor de conta e para equipes de atendimento. Só mouse e caneta reagem; em toque e com movimento reduzido o cartão fica parado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    maxTilt: { control: { type: "range", min: 0, max: 30, step: 1 } },
    showInfo: { control: "boolean" },
    glow: { control: "boolean" },
    tilt: { control: "boolean" },
  },
  args: {
    avatar: <Portrait initials="MA" />,
    miniAvatar: <MiniPortrait initials="MA" />,
    name: "Marina Albuquerque",
    title: "Gestora de relacionamento",
    handle: "marina.albuquerque",
    status: "Atendimento a fundos",
    contactLabel: "Falar",
  },
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SemBarraDeContato: Story = {
  args: { showInfo: false },
};

export const SemHalo: Story = {
  args: { glow: false },
};

export const SemInclinacao: Story = {
  args: { tilt: false },
};

export const InclinacaoForte: Story = {
  args: {
    maxTilt: 24,
    name: "Rafael Nogueira",
    title: "Assessor de investimentos",
    status: "Atendimento a gestoras",
    handle: "rafael.nogueira",
    avatar: <Portrait initials="RN" />,
    miniAvatar: <MiniPortrait initials="RN" />,
  },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <ProfileCard {...args} />
    </MotionConfig>
  ),
};
