import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { Calendar } from "./calendar";

const meta = {
  title: "Flowtomic UI/Atoms/Data Display/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "O componente Calendar é utilizado para exibir um calendário interativo, permitindo a seleção de datas individuais ou intervalos de datas. Ele é construído sobre a biblioteca `react-day-picker`, oferecendo uma interface amigável e personalizável para navegação e seleção de datas.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Calendar />,
  name: "Default",
  parameters: {
    docs: {
      description: {
        story: "Exemplo padrão do componente Calendar sem nenhuma configuração adicional.",
      },
    },
  },
};

export const WithSelectedDate: Story = {
  name: "Com Data Selecionada",
  parameters: {
    docs: {
      description: {
        story: "Exemplo de calendário com uma data selecionada no modo single.",
      },
    },
  },
  args: {},
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return <Calendar mode="single" selected={date} onSelect={setDate} />;
  },
};

export const WithDateRange: Story = {
  name: "Com Date Range",
  parameters: {
    docs: {
      description: {
        story: "Exemplo de calendário com um intervalo de datas selecionado no modo range.",
      },
    },
  },
  args: {},
  argTypes: {},
  render: () => {
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>();
    return <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />;
  },
};

// Quando for usado adicionar um story para este componente, descomente o código abaixo e preencha as informações necessárias.

// export const NoKnownUsage: Story = {

//   render: () => (
//     <div className="p-4 text-sm text-muted-foreground">
//       Este componente ainda não possui uso conhecido em componentes mais complexos.
//     </div>
//   ),
//   parameters: {
//     docs: {
//       description: {
//         story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
//       },
//     },
//   },
// };
