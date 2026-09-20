"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDaysIcon, X } from "lucide-react";
import * as React from "react";
import { type DateRange, dateMatchModifiers, type Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../../../atoms/actions/button/button";
import {
  Calendar,
  CalendarDayButton,
  type CalendarDayButtonProps,
} from "../../../atoms/data-display/calendar/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../atoms/feedback/popover/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms/feedback/tooltip/tooltip";

export interface CalendarRangeProps
  extends Omit<
    React.ComponentProps<typeof Calendar>,
    "mode" | "selected" | "onSelect" | "disabled"
  > {
  /** Intervalo de datas selecionado (com `from` e `to`) */
  value: DateRange | null | undefined;
  /** Função chamada ao alterar o intervalo de datas selecionado */
  onChange: (range: DateRange | null | undefined) => void;
  /** Texto exibido quando não há intervalo selecionado */
  placeholder?: string;
  /** ID opcional do botão */
  id?: string;
  /** Props extras para o botão */
  buttonProps?: ButtonProps;
  /** Props extras para o popover */
  popoverProps?: React.ComponentProps<typeof Popover>;
  /** Classe extra para o conteúdo do popover */
  popoverContentClassName?: string;
  /** Classe extra para o botão */
  className?: string;
  /** Desabilita o botão e/ou datas (Matcher do react-day-picker) */
  disabled?: Matcher | Matcher[] | boolean;
  /** Função para retornar mensagem de tooltip para datas desabilitadas */
  disabledDateTooltip?: (date: Date) => string | undefined;
  /** Mês padrão quando nenhuma data está selecionada */
  defaultMonth?: Date;
  /** Exibir opções de intervalos rápidos (Hoje, Esta Semana, etc.) */
  showQuickRanges?: boolean;
}

const quickRanges = [
  { label: "Hoje", getRange: () => ({ from: new Date(), to: new Date() }) },
  {
    label: "Esta Semana",
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Últimos 7 dias",
    getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Últimos 14 dias",
    getRange: () => ({ from: subDays(new Date(), 13), to: new Date() }),
  },
  {
    label: "Últimos 30 dias",
    getRange: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "Mês anterior",
    getRange: () => {
      const previousMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(previousMonth),
        to: endOfMonth(previousMonth),
      };
    },
  },
  {
    label: "Este ano",
    getRange: () => {
      const y = new Date().getFullYear();
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
    },
  },
];

export function CalendarRange({
  value,
  onChange,
  placeholder = "Selecione uma data",
  id = "date",
  buttonProps,
  popoverProps,
  popoverContentClassName,
  className,
  disabled,
  disabledDateTooltip,
  showQuickRanges = false,
  defaultMonth,
  ...props
}: CalendarRangeProps) {
  const [open, setOpen] = React.useState(false);
  const [leftMonth, setLeftMonth] = React.useState<Date>(value?.from ?? defaultMonth ?? new Date());
  const [rightMonth, setRightMonth] = React.useState<Date>(
    value?.to ?? addMonths(value?.from ?? defaultMonth ?? new Date(), 1)
  );

  React.useEffect(() => {
    if (open) {
      const left = value?.from ?? defaultMonth ?? new Date();
      const right = value?.to ?? addMonths(left, 1);
      setLeftMonth(left);
      setRightMonth(right);
    }
  }, [open, value?.from, value?.to, defaultMonth]);

  const isButtonDisabled = typeof disabled === "boolean" ? disabled : false;
  const isRangeDisabled = (range: DateRange) => {
    if (!disabled) return false;
    if (typeof disabled === "boolean") return disabled;
    if (!range.from || !range.to) return false;
    const days = eachDayOfInterval({ start: range.from, end: range.to });
    return days.some((day) => dateMatchModifiers(day, disabled));
  };

  const applyQuickRange = (range: DateRange) => {
    if (isRangeDisabled(range)) return;
    onChange(range);
    const base = range.from ?? new Date();
    setLeftMonth(base);
    setRightMonth(addMonths(base, 1));
  };

  function DayButtonWrapper(innerProps: CalendarDayButtonProps) {
    const { day } = innerProps;
    const tooltip = disabledDateTooltip?.(day.date);
    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <span className="h-full w-full">
                <CalendarDayButton {...innerProps} />
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-secondary text-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <CalendarDayButton {...innerProps} />;
  }

  return (
    <Popover {...popoverProps} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "hover:foreground justify-between text-left font-normal",
            !value && "text-muted-foreground hover:text-muted-foreground",
            className
          )}
          disabled={isButtonDisabled}
          {...buttonProps}
        >
          <div className="flex items-center">
            <CalendarDaysIcon className="mr-2 size-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "P", { locale: ptBR })} -{" "}
                  {format(value.to, "P", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "P", { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          {value?.from && !isButtonDisabled && (
            // biome-ignore lint/a11y/useSemanticElements: clear action inside trigger button; cannot use nested <button>
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(null);
                }
              }}
              className="cursor-pointer p-1"
              aria-label="Limpar seleção"
            >
              <X className="size-4 opacity-50 hover:opacity-100" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-auto p-0", popoverContentClassName)} align="start">
        <div className="flex flex-col sm:flex-row">
          {showQuickRanges && (
            <div className="flex flex-col gap-1 border-r p-2">
              {quickRanges.map((range, index) => {
                const dateRange = range.getRange();
                const isDisabled = isRangeDisabled(dateRange);
                return (
                  <Button
                    key={range.label}
                    variant="ghost"
                    size="sm"
                    className={cn("justify-start font-normal", index % 2 === 0 && "bg-accent/40")}
                    disabled={isDisabled}
                    onClick={() => applyQuickRange(dateRange)}
                  >
                    {range.label}
                  </Button>
                );
              })}
            </div>
          )}
          <div className="flex gap-4 p-3">
            <Calendar
              {...props}
              disabled={disabled}
              autoFocus={false}
              captionLayout="dropdown"
              selected={value ?? undefined}
              onSelect={(r) => onChange(r)}
              locale={ptBR}
              numberOfMonths={1}
              month={leftMonth}
              onMonthChange={setLeftMonth}
              mode="range"
              components={{ DayButton: DayButtonWrapper }}
              modifiersClassNames={{
                disabled: "pointer-events-auto opacity-50 hover:bg-transparent",
              }}
            />
            <Calendar
              {...props}
              disabled={disabled}
              autoFocus={false}
              captionLayout="dropdown"
              selected={value ?? undefined}
              onSelect={(r) => onChange(r)}
              locale={ptBR}
              numberOfMonths={1}
              month={rightMonth}
              onMonthChange={setRightMonth}
              mode="range"
              components={{ DayButton: DayButtonWrapper }}
              modifiersClassNames={{
                disabled: "pointer-events-auto opacity-50 hover:bg-transparent",
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
