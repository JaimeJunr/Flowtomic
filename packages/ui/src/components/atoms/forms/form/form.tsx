/**
 * # Form Component
 *
 * O componente `Form` é um sistema de composição para formulários baseado em React Hook Form.
 * Fornece integração completa com validação, gerenciamento de estado e acessibilidade.
 *
 * ## Características Principais
 *
 * - **React Hook Form**: Integração completa com React Hook Form
 * - **Validação**: Suporte a validação via Zod ou outras bibliotecas
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 * - **Acessível**: Estrutura semântica e mensagens de erro acessíveis
 *
 * ## Componentes
 *
 * - **Form**: Provider do formulário (FormProvider)
 * - **FormField**: Campo controlado do formulário
 * - **FormItem**: Container de item do formulário
 * - **FormLabel**: Label do campo
 * - **FormControl**: Controle do campo
 * - **FormDescription**: Descrição do campo
 * - **FormMessage**: Mensagem de erro/validação
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { useForm } from "react-hook-form";
 * import { zodResolver } from "@hookform/resolvers/zod";
 * import { Form, FormField, FormItem, FormLabel, FormControl } from "@flowtomic/ui/components/atoms/forms/form";
 * import { Input } from "@flowtomic/ui/components/atoms/forms/input";
 *
 * function MyComponent() {
 *   const form = useForm({
 *     resolver: zodResolver(schema),
 *   });
 *
 *   return (
 *     <Form {...form}>
 *       <FormField
 *         control={form.control}
 *         name="email"
 *         render={({ field }) => (
 *           <FormItem>
 *             <FormLabel>E-mail</FormLabel>
 *             <FormControl>
 *               <Input {...field} />
 *             </FormControl>
 *           </FormItem>
 *         )}
 *       />
 *     </Form>
 *   );
 * }
 * ```
 *
 * @see [React Hook Form](https://react-hook-form.com/) para mais detalhes
 */

import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "../label/label";

/**
 * Componente Form (FormProvider) para gerenciamento de formulários.
 */
const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerProps<TFieldValues, TName>;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

FormField.displayName = "FormField";

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

export interface FormItemProps extends React.ComponentProps<"div"> {}

function FormItem({ className, ...props }: FormItemProps) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

FormItem.displayName = "FormItem";

export interface FormLabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {}

function FormLabel({ className, ...props }: FormLabelProps) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

FormLabel.displayName = "FormLabel";

export interface FormControlProps extends React.ComponentProps<typeof Slot> {}

function FormControl({ ...props }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

FormControl.displayName = "FormControl";

export interface FormDescriptionProps extends React.ComponentProps<"p"> {}

function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

FormDescription.displayName = "FormDescription";

export interface FormMessageProps extends React.ComponentProps<"p"> {}

function FormMessage({ className, ...props }: FormMessageProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

FormMessage.displayName = "FormMessage";

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
};
