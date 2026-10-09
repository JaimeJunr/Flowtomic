import type { Meta, StoryObj } from "@storybook/react-vite";
import { MotionConfig } from "motion/react";
import { fn } from "storybook/test";
import { TearOffTicket } from "./tear-off-ticket";

// Arte em SVG inline: faixas de opacidade, uma leitura abstrata de "Spectrum". Num <img>, currentColor vira preto, por isso só opacidade.
const ART =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 200' preserveAspectRatio='xMidYMid slice'><rect x='0' width='15' height='200' fill='currentColor' opacity='0.06'/><rect x='15' width='15' height='200' fill='currentColor' opacity='0.1'/><rect x='30' width='15' height='200' fill='currentColor' opacity='0.16'/><rect x='45' width='15' height='200' fill='currentColor' opacity='0.24'/><rect x='60' width='15' height='200' fill='currentColor' opacity='0.34'/><rect x='75' width='15' height='200' fill='currentColor' opacity='0.24'/><rect x='90' width='15' height='200' fill='currentColor' opacity='0.16'/><rect x='105' width='15' height='200' fill='currentColor' opacity='0.1'/><line x1='0' y1='150' x2='120' y2='150' stroke='currentColor' stroke-opacity='0.3'/></svg>"
  );

function Body() {
  return (
    <>
      <p className="font-display font-semibold text-lg">Spectrum</p>
      <p className="text-muted-foreground text-sm">14 nov · Entrada única</p>
      <p className="text-sm">Galeria do terraço</p>
      <p className="text-muted-foreground text-xs">Válido até 30 nov</p>
    </>
  );
}

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/TearOffTicket",
  component: TearOffTicket,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Ingresso com canhoto picotado: arraste o canhoto para dobrá-lo e rasgar, ou use Enter e Espaço. Depois de usado, a arte fica cinza.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    width: { control: "number" },
    height: { control: "number" },
    stubSize: { control: "number" },
    holes: { control: "number" },
    holeSize: { control: "number" },
    notch: { control: "number" },
    tearAngle: { control: "number" },
    resistance: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    restRotate: { control: "number" },
    tilt: { control: "boolean" },
    tiltMax: { control: "number" },
    recenter: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: <Body />,
    stub: <span className="font-mono text-sm">Nº 284619</span>,
    image: ART,
    imageAlt: "Arte do evento Spectrum",
    onTear: fn(),
  },
  decorators: [
    (Story) => (
      <div className="p-8 text-primary">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TearOffTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical", width: 260, height: 420, stubSize: 110 },
};

export const JaUsado: Story = {
  args: { defaultTorn: true },
};

export const SemInclinacao: Story = {
  args: { tilt: false },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReducedMotion: Story = {
  render: (args) => (
    <MotionConfig reducedMotion="always">
      <TearOffTicket {...args} />
    </MotionConfig>
  ),
};
