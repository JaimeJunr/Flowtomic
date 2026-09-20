import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarRange } from "./calendar-range";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/CalendarRange",
  component: CalendarRange,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Seletor de intervalo de datas em popover com dois calendários e opção de intervalos rápidos. Suporta tooltip em datas desabilitadas.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    showQuickRanges: { control: "boolean" },
  },
} satisfies Meta<typeof CalendarRange>;

export default meta;
type Story = StoryObj<typeof meta>;

function CalendarRangeControlled(props: { showQuickRanges?: boolean }) {
  const [value, setValue] = useState<DateRange | null | undefined>(undefined);
  return (
    <CalendarRange value={value} onChange={setValue} showQuickRanges={props.showQuickRanges} />
  );
}

export const Default: Story = {
  render: () => <CalendarRangeControlled />,
};

export const WithQuickRanges: Story = {
  render: () => <CalendarRangeControlled showQuickRanges />,
  parameters: {
    docs: {
      description: {
        story:
          "Com painel lateral de intervalos rápidos (Hoje, Esta Semana, Últimos 7 dias, etc.).",
      },
    },
  },
};

export const WithDisabledDateTooltip: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange | null | undefined>(undefined);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return (
      <CalendarRange
        value={value}
        onChange={setValue}
        disabled={{ after: nextWeek }}
        disabledDateTooltip={(d) =>
          d > nextWeek ? "Datas após uma semana estão desabilitadas" : undefined
        }
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Datas após uma semana desabilitadas com tooltip explicativo.",
      },
    },
  },
};
