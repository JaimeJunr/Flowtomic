import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type * as React from "react";
import type { Control, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { PasswordInput } from "@/components/molecules";
import { cn } from "@/lib/utils";
import {
  Button,
  Calendar,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  | "currency"
  | "select"
  | "date"
  | "checkbox"
  | "switch"
  | "radio"
  | "slider"
  | "otp"
  | "toggle";

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
  } = config;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={
            type === "checkbox"
              ? "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
              : ""
          }
        >
          {type !== "checkbox" && (
            <FormLabel>
              {label} {required && <span className="text-destructive">*</span>}
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
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      onValueChange={(values) => field.onChange(values.floatValue)}
                      placeholder={placeholder}
                      disabled={disabled}
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
                      onValueChange={(values) => field.onChange(values.floatValue)}
                      placeholder={placeholder}
                      disabled={disabled}
                      prefix={prefix ?? "R$ "}
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
                        <SelectTrigger>
                          <SelectValue placeholder={placeholder || "Selecione"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={disabled}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>{placeholder || "Selecione"}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
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
                        {description && <FormDescription>{description}</FormDescription>}
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
                      disabled={disabled as any}
                    >
                      {(radioOptions ?? [])?.map((opt) => (
                        <div key={opt.value} className="flex items-center gap-2">
                          <RadioGroupItem value={opt.value} id={`${String(name)}-${opt.value}`} />
                          <label htmlFor={`${String(name)}-${opt.value}`} className="text-sm">
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  );

                case "slider":
                  return (
                    <div className="space-y-2">
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
                        {Array.from({ length: otpLength ?? 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
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

          {type !== "checkbox" && description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
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
  /** ID opcional do formulário (útil para submit externo) */
  formId?: string;
  /** Título opcional do formulário */
  title?: string;
  /** Descrição opcional do formulário */
  description?: string;
  /** Conteúdo adicional no header (ex: botões de ação) */
  headerContent?: React.ReactNode;
}

/**
 * Layout de formulário com seções e campos configuráveis
 * Suporta múltiplos tipos de campo e layout responsivo em grid
 */
export function FormLayout<T extends FieldValues>({
  form,
  sections,
  onSubmit,
  formId,
  title,
  description,
  headerContent,
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
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-4 relative">
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
                <div key={config.name} className={getColSpanClass(config.cols)}>
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
