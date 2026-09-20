import type { Meta, StoryObj } from "@storybook/react-vite";
import { ptBR } from "date-fns/locale";
import React from "react";
import { fn } from "storybook/test";
import { Calendar } from "./calendar";

/**
 * # Calendar Component
 *
 * O componente `Calendar` é um calendário interativo construído sobre a biblioteca `react-day-picker`.
 * Ele oferece uma interface moderna e acessível para seleção de datas individuais ou intervalos de datas.
 *
 * ## Características Principais
 *
 * - **Seleção de Data Única**: Modo `single` para selecionar uma única data
 * - **Seleção de Intervalo**: Modo `range` para selecionar um intervalo de datas
 * - **Navegação Intuitiva**: Botões de navegação para mudar mês/ano
 * - **Layouts Flexíveis**: Suporta diferentes layouts de cabeçalho (botões, dropdowns)
 * - **Personalizável**: Suporta customização de estilos, variantes de botão e formatação
 * - **Acessível**: Segue padrões WAI-ARIA e suporta navegação por teclado
 * - **Internacionalização**: Suporta diferentes locales e formatação de datas
 *
 * ## Layouts de Cabeçalho
 *
 * O calendário suporta três layouts diferentes para o cabeçalho:
 *
 * - **`captionLayout="buttons"`** (padrão): Apenas botões de navegação (anterior/próximo). Útil para interfaces mais compactas.
 * - **`captionLayout="dropdown"`**: Dropdowns de mês e ano sempre visíveis. Útil quando a seleção rápida de mês/ano é frequente.
 * - **`captionLayout="dropdown-months"`**: Apenas dropdown de meses sempre visível.
 * - **`captionLayout="dropdown-years"`**: Apenas dropdown de anos sempre visível.
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Calendar } from "@flowtomic/ui/components/atoms/data-display/calendar";
 *
 * function MyComponent() {
 *   const [date, setDate] = React.useState<Date | undefined>();
 *
 *   return (
 *     <Calendar
 *       mode="single"
 *       selected={date}
 *       onSelect={setDate}
 *     />
 *   );
 * }
 * ```
 *
 * ## Props Principais
 *
 * - `mode`: Modo de seleção (`"single"` | `"range"` | `"multiple"`)
 * - `selected`: Data ou intervalo selecionado
 * - `onSelect`: Callback chamado quando uma data é selecionada
 * - `captionLayout`: Layout do cabeçalho (`"buttons"` | `"dropdown"` | `"dropdown-months"` | `"dropdown-years"`)
 * - `buttonVariant`: Variante dos botões de navegação
 * - `locale`: Locale para formatação de datas
 * - `disabled`: Datas desabilitadas
 * - `modifiers`: Modificadores customizados para estilização
 *
 * @see [react-day-picker Documentation](https://react-day-picker.js.org/) para mais detalhes sobre props avançadas
 */
const meta = {
  title: "Flowtomic UI/Atoms/DataDisplay/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Componente de calendário interativo para seleção de datas. Suporta seleção única, intervalos e múltiplas datas. Inclui navegação intuitiva com diferentes layouts de cabeçalho (botões ou dropdowns).",
      },
    },
    controls: {
      sort: "requiredFirst",
      expanded: true,
    },
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["single", "range", "multiple"],
      description:
        "Modo de seleção do calendário. 'single' para uma data, 'range' para intervalo, 'multiple' para múltiplas datas.",
      table: {
        type: { summary: '"single" | "range" | "multiple"' },
        defaultValue: { summary: '"single"' },
      },
    },
    captionLayout: {
      control: "select",
      options: ["buttons", "dropdown", "dropdown-months", "dropdown-years"],
      description:
        "Layout do cabeçalho do calendário. 'buttons' apenas botões de navegação (padrão), 'dropdown' sempre mostra dropdowns, 'dropdown-months' apenas dropdown de meses, 'dropdown-years' apenas dropdown de anos.",
      table: {
        type: { summary: '"buttons" | "dropdown" | "dropdown-months" | "dropdown-years"' },
        defaultValue: { summary: '"buttons"' },
      },
    },
    buttonVariant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Variante dos botões de navegação do calendário.",
      table: {
        type: { summary: "ButtonVariant" },
        defaultValue: { summary: '"ghost"' },
      },
    },
    showOutsideDays: {
      control: "boolean",
      description: "Exibe dias de meses adjacentes no calendário.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    selected: {
      description: "Data ou intervalo de datas selecionado.",
      table: {
        type: { summary: "Date | { from: Date; to?: Date } | Date[] | undefined" },
      },
    },
    onSelect: {
      description: "Callback chamado quando uma data é selecionada.",
      action: "date-selected",
      table: {
        type: { summary: "(date: Date | { from: Date; to?: Date } | Date[] | undefined) => void" },
      },
    },
    onMonthChange: {
      description: "Callback chamado quando o mês é alterado (navegação ou seleção).",
      action: "month-changed",
      table: {
        type: { summary: "(month: Date) => void" },
      },
    },
    locale: {
      description: "Locale para formatação de datas (ex: ptBR, enUS).",
      table: {
        type: { summary: "Locale" },
      },
    },
    disabled: {
      description: "Datas que devem ser desabilitadas.",
      table: {
        type: { summary: "Matcher | Matcher[]" },
      },
    },
    modifiers: {
      description: "Modificadores customizados para estilização de datas específicas.",
      table: {
        type: { summary: "Modifiers" },
      },
    },
    className: {
      control: "text",
      description: "Classes CSS adicionais para o componente.",
      table: {
        type: { summary: "string" },
      },
    },
  },
  args: {
    onSelect: fn(),
    onMonthChange: fn(),
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ## Exemplo Padrão
 *
 * Calendário básico sem configurações adicionais. Por padrão, apenas os botões de navegação são exibidos.
 */
export const Default: Story = {
  name: "Padrão",
  render: () => <Calendar />,
  parameters: {
    docs: {
      description: {
        story:
          "Exemplo básico do componente Calendar. Por padrão, apenas os botões de navegação (anterior/próximo) são exibidos. Use captionLayout='dropdown' para exibir dropdowns de seleção rápida de mês/ano.",
      },
    },
  },
};

/**
 * ## Calendário com Data Selecionada
 *
 * Exemplo de calendário no modo `single` com uma data pré-selecionada.
 * A data selecionada é destacada visualmente.
 */
export const WithSelectedDate: Story = {
  name: "Com Data Selecionada",
  parameters: {
    docs: {
      description: {
        story:
          "Calendário no modo 'single' com uma data pré-selecionada. A data selecionada é destacada com a cor primária. Use os botões de navegação ou configure `captionLayout=\"dropdown\"` para seleção rápida de mês/ano.",
      },
    },
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
      <div className="space-y-4">
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <div className="text-sm text-muted-foreground">
          Data selecionada: {date ? date.toLocaleDateString("pt-BR") : "Nenhuma"}
        </div>
      </div>
    );
  },
};

/**
 * ## Calendário com Intervalo de Datas
 *
 * Exemplo de calendário no modo `range` para seleção de intervalos de datas.
 * O usuário seleciona uma data inicial e uma data final.
 */
export const WithDateRange: Story = {
  name: "Com Intervalo de Datas",
  parameters: {
    docs: {
      description: {
        story:
          "Calendário no modo 'range' permite selecionar um intervalo de datas. Clique na primeira data para iniciar o intervalo e na segunda para finalizar. O intervalo selecionado é destacado visualmente.",
      },
    },
  },
  render: () => {
    const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date } | undefined>();
    return (
      <div className="space-y-4">
        <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
        <div className="text-sm text-muted-foreground">
          {dateRange?.from && dateRange?.to ? (
            <>
              De: {dateRange.from.toLocaleDateString("pt-BR")} até:{" "}
              {dateRange.to.toLocaleDateString("pt-BR")}
            </>
          ) : dateRange?.from ? (
            <>A partir de: {dateRange.from.toLocaleDateString("pt-BR")}</>
          ) : (
            "Nenhum intervalo selecionado"
          )}
        </div>
      </div>
    );
  },
};

/**
 * ## Dropdowns Sempre Visíveis
 *
 * Quando `captionLayout="dropdown"` é passado, os dropdowns de mês e ano ficam sempre visíveis,
 * sem necessidade de clicar no label.
 */
export const AlwaysVisibleDropdowns: Story = {
  name: "Dropdowns Sempre Visíveis",
  parameters: {
    docs: {
      description: {
        story:
          'Com captionLayout="dropdown", os dropdowns de mês e ano ficam sempre visíveis no cabeçalho do calendário, sem necessidade de clicar no label. Útil quando a seleção rápida de mês/ano é uma ação frequente.',
      },
    },
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" />
        <div className="text-sm text-muted-foreground">
          Os dropdowns de mês e ano estão sempre visíveis.
        </div>
      </div>
    );
  },
};

/**
 * ## Apenas Botões de Navegação (Padrão)
 *
 * Comportamento padrão do calendário. Quando `captionLayout="buttons"` é passado (ou não especificado),
 * apenas os botões de navegação são exibidos, sem label ou dropdowns.
 * Útil para interfaces mais compactas.
 */
export const ButtonsOnly: Story = {
  name: "Apenas Botões de Navegação (Padrão)",
  parameters: {
    docs: {
      description: {
        story:
          'Comportamento padrão do calendário. Com captionLayout="buttons" (ou quando não especificado), apenas os botões de navegação (anterior/próximo) são exibidos, sem label ou dropdowns. Útil para interfaces mais compactas.',
      },
    },
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <div className="text-sm text-muted-foreground">
          Este é o comportamento padrão. Apenas botões de navegação são exibidos.
        </div>
      </div>
    );
  },
};

/**
 * ## Datas Desabilitadas
 *
 * Exemplo de calendário com algumas datas desabilitadas.
 * As datas desabilitadas aparecem com opacidade reduzida e não podem ser selecionadas.
 */
export const WithDisabledDates: Story = {
  name: "Com Datas Desabilitadas",
  parameters: {
    docs: {
      description: {
        story:
          "Calendário com datas desabilitadas. Use a prop `disabled` para desabilitar datas específicas, intervalos ou usar funções customizadas. Datas desabilitadas aparecem com opacidade reduzida e não podem ser selecionadas.",
      },
    },
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Desabilita datas passadas e amanhã
    const disabledDates = [
      { before: today }, // Todas as datas antes de hoje
      tomorrow, // Amanhã específico
    ];

    return (
      <div className="space-y-4">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledDates} />
        <div className="text-sm text-muted-foreground">
          Datas passadas e amanhã estão desabilitadas.
        </div>
      </div>
    );
  },
};

/**
 * ## Múltiplas Datas Selecionadas
 *
 * Exemplo de calendário no modo `multiple` para seleção de múltiplas datas.
 */
export const MultipleDates: Story = {
  name: "Múltiplas Datas",
  parameters: {
    docs: {
      description: {
        story:
          "Calendário no modo 'multiple' permite selecionar múltiplas datas independentes. Cada data selecionada é destacada individualmente.",
      },
    },
  },
  render: () => {
    const [dates, setDates] = React.useState<Date[] | undefined>();
    return (
      <div className="space-y-4">
        <Calendar mode="multiple" selected={dates} onSelect={setDates} />
        <div className="text-sm text-muted-foreground">
          {dates && dates.length > 0 ? (
            <>
              {dates.length} data(s) selecionada(s):{" "}
              {dates.map((d) => d.toLocaleDateString("pt-BR")).join(", ")}
            </>
          ) : (
            "Nenhuma data selecionada"
          )}
        </div>
      </div>
    );
  },
};

/**
 * ## Variantes de Botão
 *
 * Exemplo de diferentes variantes de botão para os controles de navegação.
 */
export const ButtonVariants: Story = {
  name: "Variantes de Botão",
  parameters: {
    docs: {
      description: {
        story:
          "Diferentes variantes de botão para os controles de navegação do calendário. Use a prop `buttonVariant` para personalizar o estilo dos botões.",
      },
    },
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>();
    const variants: Array<React.ComponentProps<typeof Calendar>["buttonVariant"]> = [
      "ghost",
      "outline",
      "secondary",
    ];

    return (
      <div className="space-y-8">
        {variants.map((variant) => (
          <div key={variant} className="space-y-2">
            <p className="text-sm font-medium">Variante: {variant}</p>
            <Calendar mode="single" selected={date} onSelect={setDate} buttonVariant={variant} />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * ## Calendário com Locale Português
 *
 * Exemplo de calendário configurado com locale português brasileiro.
 */
export const WithPortugueseLocale: Story = {
  name: "Com Locale Português",
  parameters: {
    docs: {
      description: {
        story:
          "Calendário configurado com locale português brasileiro. Os nomes dos meses e dias da semana são exibidos em português. Use a prop `locale` para configurar diferentes idiomas.",
      },
    },
  },
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>();
    return (
      <div className="space-y-4">
        <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} />
        <div className="text-sm text-muted-foreground">
          Calendário configurado com locale português brasileiro. Os nomes dos meses e dias da
          semana são exibidos em português.
        </div>
      </div>
    );
  },
};

/**
 * ## Casos de Uso Empresariais
 *
 * Exemplos de uso comum em aplicações empresariais.
 */
export const BusinessUseCases: Story = {
  name: "Casos de Uso Empresariais",
  parameters: {
    docs: {
      description: {
        story:
          "Exemplos de uso comum do calendário em aplicações empresariais, incluindo seleção de períodos, datas de vencimento e agendamentos.",
      },
    },
  },
  render: () => {
    const [startDate, setStartDate] = React.useState<Date | undefined>();
    const [endDate, setEndDate] = React.useState<{ from?: Date; to?: Date } | undefined>();
    const [dueDate, setDueDate] = React.useState<Date | undefined>();

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Seleção de Data Inicial</h3>
          <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
          <div className="text-sm text-muted-foreground">
            Data selecionada: {startDate ? startDate.toLocaleDateString("pt-BR") : "Nenhuma"}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Período de Relatório</h3>
          <Calendar mode="range" selected={endDate} onSelect={setEndDate} />
          <div className="text-sm text-muted-foreground">
            {endDate?.from && endDate?.to ? (
              <>
                Período: {endDate.from.toLocaleDateString("pt-BR")} até{" "}
                {endDate.to.toLocaleDateString("pt-BR")}
              </>
            ) : (
              "Selecione um período"
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Data de Vencimento</h3>
          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
          <div className="text-sm text-muted-foreground">
            Vencimento: {dueDate ? dueDate.toLocaleDateString("pt-BR") : "Não definido"}
          </div>
        </div>
      </div>
    );
  },
};
