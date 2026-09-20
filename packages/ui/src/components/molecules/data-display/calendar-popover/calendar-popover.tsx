"use client";

import { format, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDaysIcon, LoaderCircleIcon, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../../../atoms/actions/button/button";
import { Calendar } from "../../../atoms/data-display/calendar/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../atoms/feedback/popover/popover";

/** Normaliza data para string yyyy-MM-dd para comparação. */
export function normalizeDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Tenta parsear string ou Date em Date; retorna undefined se inválido. */
function tryParseDate(value: Date | string | undefined | null): Date | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export interface CalendarPopoverProps
  extends Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect"> {
  /** Data selecionada (Date ou string parseável) */
  date: Date | string | undefined | null;
  /** Função chamada ao selecionar uma data */
  setDate: (date: Date | undefined | null) => void;
  /** Texto quando não há data selecionada */
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
  /** Desabilita datas (boolean ou função (date) => boolean) */
  disabled?: boolean | ((date: Date) => boolean);
  /** Exibe estado de carregamento no botão */
  isLoading?: boolean;
  /** Quando true, impede seleção no calendário (ex.: carregando tabela) */
  isLoadingTable?: boolean;
  /** Conjunto de datas desabilitadas (yyyy-MM-dd) */
  disabledDates?: Set<string>;
  /** Mês padrão quando nenhuma data está selecionada */
  defaultMonth?: Date;
  /** Desabilita datas futuras. @default true */
  disableFuture?: boolean;
  /** Desabilita fins de semana. @default true */
  disableWeekends?: boolean;
}

export const CalendarPopover: React.FC<CalendarPopoverProps> = ({
  date,
  setDate,
  placeholder = "Selecione uma data",
  id = "calendar-popover",
  buttonProps,
  popoverProps,
  popoverContentClassName,
  className,
  disabled,
  isLoading,
  disabledDates,
  isLoadingTable,
  disableFuture = true,
  disableWeekends = true,
  defaultMonth,
  ...props
}) => {
  const validDate = tryParseDate(date ?? undefined);
  const [isOpen, setIsOpen] = React.useState(false);
  const [month, setMonth] = React.useState(validDate ?? defaultMonth ?? new Date());

  React.useEffect(() => {
    if (isOpen) {
      setMonth(validDate ?? defaultMonth ?? new Date());
    }
  }, [isOpen, validDate, defaultMonth]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDate(null);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} {...popoverProps}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "hover:text-foreground justify-between text-left font-normal",
            !validDate && "text-muted-foreground hover:text-muted-foreground",
            className
          )}
          disabled={typeof disabled === "boolean" ? disabled : undefined}
          {...buttonProps}
        >
          <div className="flex items-center">
            {isLoading ? (
              <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
            ) : (
              <CalendarDaysIcon className="mr-2 size-4" />
            )}
            {isLoading ? (
              <span>carregando...</span>
            ) : validDate ? (
              format(validDate, "P", { locale: ptBR })
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          {validDate && !disabled && !isLoading && (
            // biome-ignore lint/a11y/useSemanticElements: clear action inside trigger button; cannot use nested <button>
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="cursor-pointer p-1"
              aria-label="Limpar data"
            >
              <X className="size-4 opacity-50 hover:opacity-100" />
            </div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-auto p-0", popoverContentClassName)} align="start">
        <Calendar
          autoFocus
          captionLayout="dropdown"
          selected={validDate ?? undefined}
          onSelect={(d) => {
            setDate(d);
            setIsOpen(false);
          }}
          locale={ptBR}
          numberOfMonths={1}
          fromYear={1900}
          toYear={2100}
          disabled={(currentDate) => {
            if (isLoading || isLoadingTable) return true;
            if (typeof disabled === "function" && disabled(currentDate)) return true;
            const normalized = normalizeDate(currentDate);
            const isHoliday = disabledDates?.has(normalized);
            const isWeekendDay = disableWeekends && isWeekend(currentDate);
            const isFuture = disableFuture && currentDate > new Date();
            return isHoliday || isWeekendDay || isFuture || false;
          }}
          month={month}
          onMonthChange={setMonth}
          defaultMonth={defaultMonth}
          {...props}
          mode="single"
        />
      </PopoverContent>
    </Popover>
  );
};
