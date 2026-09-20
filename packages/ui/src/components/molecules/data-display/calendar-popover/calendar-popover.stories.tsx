import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CalendarPopover } from "./calendar-popover";

const meta = {
  title: "Flowtomic UI/Molecules/Data Display/CalendarPopover",
  component: CalendarPopover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Seletor de data única em popover. Suporta desabilitar futuro/fins de semana, conjunto de datas bloqueadas, estado de carregamento e data como string ou Date.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    disableFuture: { control: "boolean" },
    disableWeekends: { control: "boolean" },
  },
} satisfies Meta<typeof CalendarPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

function CalendarPopoverControlled(props: { disableFuture?: boolean; disableWeekends?: boolean }) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <CalendarPopover
      date={date}
      setDate={setDate}
      disableFuture={props.disableFuture}
      disableWeekends={props.disableWeekends}
    />
  );
}

export const Default: Story = {
  render: () => <CalendarPopoverControlled />,
};

export const AllowFutureAndWeekends: Story = {
  render: () => <CalendarPopoverControlled disableFuture={false} disableWeekends={false} />,
  parameters: {
    docs: {
      description: {
        story: "Sem desabilitar datas futuras nem fins de semana.",
      },
    },
  },
};

export const WithDisabledDates: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const disabled = new Set<string>(["2025-03-15", "2025-03-16"]);
    return (
      <CalendarPopover
        date={date}
        setDate={setDate}
        disabledDates={disabled}
        defaultMonth={new Date(2025, 2, 1)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Algumas datas bloqueadas via Set (yyyy-MM-dd).",
      },
    },
  },
};

export const Loading: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined);
    return <CalendarPopover date={date} setDate={setDate} isLoading />;
  },
  parameters: {
    docs: {
      description: {
        story: "Estado de carregamento no botão.",
      },
    },
  },
};
