import type * as React from "react";
import { useId } from "react";
import type { Control, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import {
  CalendarPopover,
  CalendarRange,
  NumericFilterField,
  type NumericFilterValue,
  PasswordInput,
} from "@/components/molecules";
import { cn } from "@/lib/utils";
import {
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Switch,
  Toggle,
} from "../../atoms";

const inputErrorClassName = "border-destructive focus-visible:ring-destructive";

/**
 * Tipos de campo suportados pelo FormLayout
 */
export type FormFieldType =
  | "text"
  | "email"
  | "url"
  | "tel"
  | "password"
  | "textarea"
  | "number"
  | "decimal"
  | "currency"
  | "select"
  | "date"
  | "dateRange"
  | "checkbox"
  | "switch"
  | "radio"
  | "slider"
  | "otp"
  | "toggle"
  | "numericFilter";

/** Valor do campo tipo numericFilter (operador + valor numérico) */
export type { NumericFilterValue } from "@/components/molecules";

/**
 * Configuração de um campo de formulário
 * @template T - Tipo dos valores do formulário (FieldValues)
 */
export interface FormFieldConfig<T extends FieldValues> {
  /** Nome do campo (deve corresponder a uma chave no formulário) */
  name: FieldPath<T>;
  /** Label exibido para o campo */
  label: string;
  /** Tipo do campo de entrada */
  type: FormFieldType;
  /** Texto de placeholder para o campo */
  placeholder?: string;
  /** Descrição auxiliar exibida abaixo do campo */
  description?: string;
  /** Se o campo é obrigatório (exibe asterisco vermelho) */
  required?: boolean;
  /** Se o campo está desabilitado */
  disabled?: boolean;
  /** Número de colunas que o campo deve ocupar (1-3, padrão: 3 = linha inteira) */
  cols?: number;
  /** Classes CSS adicionais */
  className?: string;
  /** Opções para campos do tipo "select" */
  options?: { label: string; value: string | number }[] | string[];
  /** Casas decimais para campos numéricos (padrão: 7) */
  decimalScale?: number;
  /** Prefixo para campos do tipo currency (ex: R$, US$) */
  prefix?: string;
  /** Opções para radio (quando type = "radio") */
  radioOptions?: { label: string; value: string }[];
  /** Quantidade de dígitos para OTP (padrão: 6) */
  otpLength?: number;
  /** Intervalo mínimo/máximo para slider */
  sliderRange?: { min: number; max: number; step?: number };
  /** Para type "numericFilter": permitir negativos */
  allowNegative?: boolean;
  /** Para type "numericFilter": exibir como moeda (R$, 2 decimais) */
  isCurrency?: boolean;
  /** Para type "numericFilter": exibir como percentual (sufixo %) */
  isPercent?: boolean;
  /** Para type "numericFilter": moeda (ex.: "BRL" para R$) */
  currency?: "BRL";
  /** Para type "date": desabilitar datas futuras (padrão false no form = calendário totalmente utilizável). O campo usa CalendarPopover com dropdown de mês e ano. */
  disableFuture?: boolean;
  /** Para type "date": desabilitar fins de semana (padrão false no form = calendário totalmente utilizável) */
  disableWeekends?: boolean;
  /** Para type "dateRange": exibir intervalos rápidos (Hoje, Esta Semana, etc.) */
  showQuickRanges?: boolean;
}

/**
 * Configuração de uma seção do formulário
 * @template T - Tipo dos valores do formulário (FieldValues)
 */
export interface FormSectionConfig<T extends FieldValues> {
  /** Título da seção */
  title?: string;
  /** Descrição opcional da seção */
  description?: string;
  /** Lista de campos da seção */
  fields: FormFieldConfig<T>[];
}

/**
 * Props do componente BaseFormField
 * @template T - Tipo dos valores do formulário (FieldValues)
 */
export interface BaseFormFieldProps<T extends FieldValues> {
  /** Configuração do campo */
  config: FormFieldConfig<T>;
  /** Control do React Hook Form */
  control: Control<T>;
}

/**
 * Campo de formulário base que renderiza diferentes tipos de input
 * baseado na configuração fornecida
 */
export function BaseFormField<T extends FieldValues>({ config, control }: BaseFormFieldProps<T>) {
  const baseId = useId();
  const {
    name,
    label,
    type,
    placeholder,
    description,
    required,
    options,
    decimalScale,
    disabled,
    prefix,
    radioOptions,
    otpLength,
    sliderRange,
    allowNegative,
    isCurrency,
    isPercent,
    currency,
    showQuickRanges,
    disableFuture,
    disableWeekends,
  } = config;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isError = fieldState?.invalid;
        return (
          <FormItem
            className={
              type === "checkbox"
                ? "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                : ""
            }
          >
            {type !== "checkbox" && type !== "switch" && (
              <FormLabel>
                {label}{" "}
                {required && (
                  <span
                    className="text-destructive"
                    style={{
                      float: "none",
                      width: "auto",
                      marginRight: 0,
                      marginTop: 0,
                    }}
                  >
                    *
                  </span>
                )}
              </FormLabel>
            )}

            <FormControl>
              {(() => {
                switch (type) {
                  case "text":
                    return (
                      <Input
                        {...field}
                        placeholder={placeholder}
                        disabled={disabled}
                        value={(field.value as string) || ""}
                        variant={isError ? "error" : "default"}
                      />
                    );

                  case "email":
                    return (
                      <Input
                        {...field}
                        type="email"
                        placeholder={placeholder}
                        disabled={disabled}
                        value={(field.value as string) || ""}
                        variant={isError ? "error" : "default"}
                      />
                    );

                  case "url":
                    return (
                      <Input
                        {...field}
                        type="url"
                        placeholder={placeholder}
                        disabled={disabled}
                        value={(field.value as string) || ""}
                        variant={isError ? "error" : "default"}
                      />
                    );

                  case "tel":
                    return (
                      <Input
                        {...field}
                        type="tel"
                        placeholder={placeholder}
                        disabled={disabled}
                        value={(field.value as string) || ""}
                        variant={isError ? "error" : "default"}
                      />
                    );

                  case "password":
                    return (
                      <PasswordInput
                        id={String(name)}
                        label=""
                        placeholder={placeholder}
                        value={(field.value as string) || ""}
                        register={{
                          name: String(name),
                          onChange: field.onChange,
                          onBlur: field.onBlur,
                          ref: field.ref,
                        }}
                      />
                    );

                  case "textarea":
                    return (
                      <textarea
                        className={cn(
                          "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          isError && inputErrorClassName
                        )}
                        {...field}
                        placeholder={placeholder}
                        disabled={disabled}
                        value={(field.value as string) || ""}
                      />
                    );

                  case "number":
                    return (
                      <NumericFormat
                        customInput={Input}
                        decimalSeparator=","
                        thousandSeparator="."
                        decimalScale={decimalScale ?? 7}
                        value={field.value ?? ""}
                        onValueChange={(values) => {
                          if (values.value === "") {
                            field.onChange(null);
                          } else {
                            field.onChange(values.floatValue);
                          }
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(isError && inputErrorClassName)}
                      />
                    );

                  case "decimal":
                    return (
                      <NumericFormat
                        customInput={Input}
                        decimalSeparator=","
                        thousandSeparator="" // Sem separador de milhares para decimais simples
                        decimalScale={decimalScale ?? 2}
                        value={field.value ?? ""}
                        onValueChange={(values) => {
                          if (values.value === "") {
                            field.onChange(null);
                          } else {
                            field.onChange(values.floatValue);
                          }
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        allowNegative={false}
                        className={cn(isError && inputErrorClassName)}
                      />
                    );

                  case "currency":
                    return (
                      <NumericFormat
                        customInput={Input}
                        decimalSeparator=","
                        thousandSeparator="."
                        decimalScale={decimalScale ?? 2}
                        value={field.value ?? ""}
                        onValueChange={(values) => {
                          if (values.value === "") {
                            field.onChange(null);
                          } else {
                            field.onChange(values.floatValue);
                          }
                        }}
                        placeholder={placeholder}
                        disabled={disabled}
                        prefix={prefix ?? "R$ "}
                        className={cn(isError && inputErrorClassName)}
                      />
                    );

                  case "numericFilter":
                    return (
                      <NumericFilterField
                        value={(field.value as NumericFilterValue | null | undefined) ?? null}
                        onChange={field.onChange}
                        placeholder={placeholder}
                        allowNegative={allowNegative ?? true}
                        isCurrency={isCurrency}
                        isPercent={isPercent}
                        currency={currency}
                        decimalScale={decimalScale ?? (isCurrency ? 2 : 20)}
                        disabled={disabled}
                        error={isError}
                      />
                    );

                  case "select":
                    return (
                      <Select
                        onValueChange={field.onChange}
                        value={String(field.value || "")}
                        disabled={disabled}
                      >
                        <FormControl>
                          <SelectTrigger
                            id={String(name)}
                            className={cn(isError && inputErrorClassName)}
                          >
                            <SelectValue placeholder={placeholder || "Selecione"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {options?.map((opt) => {
                            const val = typeof opt === "object" ? String(opt.value) : opt;
                            const lab = typeof opt === "object" ? opt.label : opt;
                            return (
                              <SelectItem key={val} value={val}>
                                {lab}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    );

                  case "date":
                    return (
                      <CalendarPopover
                        date={field.value}
                        setDate={field.onChange}
                        placeholder={placeholder || "Selecione"}
                        disabled={disabled}
                        disableFuture={disableFuture ?? false}
                        disableWeekends={disableWeekends ?? false}
                        className={cn("w-full", isError && inputErrorClassName)}
                      />
                    );

                  case "dateRange":
                    return (
                      <CalendarRange
                        value={field.value ?? undefined}
                        onChange={field.onChange}
                        placeholder={placeholder || "Selecione o intervalo"}
                        disabled={disabled}
                        showQuickRanges={showQuickRanges ?? false}
                        className={cn(isError && inputErrorClassName)}
                      />
                    );

                  case "checkbox":
                    return (
                      <>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                        <div className="space-y-1 leading-none">
                          <FormLabel>{label}</FormLabel>
                          {description && !isError && (
                            <FormDescription>{description}</FormDescription>
                          )}
                        </div>
                      </>
                    );

                  case "switch":
                    return (
                      <div className="flex items-center justify-between">
                        <FormLabel>{label}</FormLabel>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                      </div>
                    );

                  case "radio":
                    return (
                      <RadioGroup
                        value={String(field.value ?? "")}
                        onValueChange={field.onChange}
                        className="flex flex-col gap-2"
                        disabled={disabled ?? false}
                      >
                        {(radioOptions ?? [])?.map((opt) => {
                          const radioId = `${String(name)}-${opt.value}`;
                          return (
                            <div key={opt.value} className="flex items-center gap-2">
                              <RadioGroupItem value={opt.value} id={radioId} />
                              <Label htmlFor={radioId}>{opt.label}</Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    );

                  case "slider":
                    return (
                      <div className={cn("space-y-2", isError && inputErrorClassName)}>
                        <Slider
                          value={[Number(field.value ?? sliderRange?.min ?? 0)]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          min={sliderRange?.min ?? 0}
                          max={sliderRange?.max ?? 100}
                          step={sliderRange?.step ?? 1}
                          disabled={disabled}
                        />
                        {typeof field.value === "number" && (
                          <p className="text-xs text-muted-foreground">Valor: {field.value}</p>
                        )}
                      </div>
                    );

                  case "otp":
                    return (
                      <InputOTP
                        maxLength={otpLength ?? 6}
                        value={String(field.value ?? "")}
                        onChange={field.onChange}
                        disabled={disabled}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: otpLength ?? 6 }, (_, i) => ({
                            id: `${baseId}-otp-${i}`,
                            index: i,
                          })).map((slot) => (
                            <InputOTPSlot key={slot.id} index={slot.index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    );

                  case "toggle":
                    return (
                      <div className="flex items-center gap-2">
                        <Toggle
                          pressed={!!field.value}
                          onPressedChange={(pressed) => field.onChange(pressed)}
                          disabled={disabled}
                          className={cn(isError && inputErrorClassName)}
                        >
                          {label}
                        </Toggle>
                      </div>
                    );

                  default:
                    return null;
                }
              })()}
            </FormControl>

            {type !== "checkbox" && description && !isError && (
              <FormDescription>{description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

BaseFormField.displayName = "BaseFormField";

/**
 * Props do componente FormLayout
 * @template T - Tipo dos valores do formulário (FieldValues)
 */
export interface FormLayoutProps<T extends FieldValues> {
  /** Instância do useForm do React Hook Form */
  form: UseFormReturn<T>;
  /** Seções do formulário com seus campos */
  sections: FormSectionConfig<T>[];
  /** Callback executado quando o formulário é submetido */
  onSubmit: (values: T) => void;
  /** Callback executado quando a validação falha */
  onError?: (errors: unknown) => void;
  /** ID opcional do formulário (útil para submit externo) */
  formId?: string;
  /** Título opcional do formulário */
  title?: string;
  /** Descrição opcional do formulário */
  description?: string;
  /** Conteúdo adicional no header (ex: botões de ação) */
  headerContent?: React.ReactNode;
  /** Ref opcional para o elemento form */
  formRef?: React.RefObject<HTMLFormElement | null>;
}

/**
 * Layout de formulário com seções e campos configuráveis
 * Suporta múltiplos tipos de campo e layout responsivo em grid
 */
export function FormLayout<T extends FieldValues>({
  form,
  sections,
  onSubmit,
  onError,
  formId,
  title,
  description,
  headerContent,
  formRef,
}: FormLayoutProps<T>) {
  /**
   * Utilitário para classes de grid responsivo
   * @param cols - Número de colunas (1-3)
   * @returns Classes CSS para col-span responsivo
   */
  const getColSpanClass = (cols?: number) => {
    if (!cols || cols === 3) return "col-span-full"; // Padrão: linha inteira
    if (cols === 2) return "md:col-span-2 col-span-full";
    return "col-span-1";
  };

  return (
    <Form {...form}>
      <form
        id={formId}
        ref={formRef as React.RefObject<HTMLFormElement>}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8 p-4 relative"
      >
        {(title || description) && (
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-start">
              <div>
                {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
              </div>
              {headerContent}
            </div>
          </div>
        )}

        {sections.map((section, idx) => (
          <div
            key={section.title ? `${section.title}-${idx}` : `section-${idx}`}
            className="space-y-4"
          >
            {(section.title || section.description) && (
              <div className="flex items-center gap-2">
                {section.title && (
                  <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                )}
                <Separator className="flex-1" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {section.fields.map((config) => (
                <div key={String(config.name)} className={getColSpanClass(config.cols)}>
                  <BaseFormField config={config} control={form.control} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
    </Form>
  );
}

FormLayout.displayName = "FormLayout";
