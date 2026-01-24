/**
 * # Alert Component
 *
 * O componente `Alert` é usado para exibir mensagens importantes ao usuário,
 * como avisos, erros, sucessos ou informações. Fornece feedback visual claro
 * através de variantes semânticas.
 *
 * ## Características Principais
 *
 * - **Variantes Semânticas**: Suporta múltiplas variantes (default, destructive, success, warning, info)
 * - **Composição**: Alert + AlertTitle + AlertDescription para estrutura flexível
 * - **Ícones**: Suporta ícones para melhor comunicação visual
 * - **Acessível**: Usa role="alert" para leitores de tela
 *
 * ## Variantes
 *
 * - **`default`**: Estilo padrão neutro
 * - **`destructive`**: Para erros e ações destrutivas (ex: "Erro", "Falha")
 * - **`success`**: Para mensagens de sucesso
 * - **`warning`**: Para avisos e alertas (ex: "Atenção", "Aviso")
 * - **`info`**: Para informações gerais
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Alert, AlertTitle, AlertDescription } from "@flowtomic/ui/components/atoms/feedback/alert";
 * import { AlertCircle } from "lucide-react";
 *
 * function MyComponent() {
 *   return (
 *     <Alert>
 *       <AlertCircle className="h-4 w-4" />
 *       <AlertTitle>Atenção</AlertTitle>
 *       <AlertDescription>Mensagem de alerta</AlertDescription>
 *     </Alert>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Usa `role="alert"` para leitores de tela
 * - Estrutura semântica com título e descrição
 * - Suporta ícones para comunicação visual
 *
 * @see [Alert Component Stories](./alert.stories.tsx) para exemplos de uso
 */

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/60 text-destructive-foreground dark:text-destructive [&>svg]:text-destructive bg-destructive/10 dark:bg-destructive/20",
        success:
          "border-success/60 text-success-foreground dark:text-success [&>svg]:text-success bg-success/10 dark:bg-success/20",
        warning:
          "border-warning/60 text-warning-foreground dark:text-warning [&>svg]:text-warning bg-warning/10 dark:bg-warning/20",
        info: "border-info/60 text-info-foreground dark:text-info [&>svg]:text-info bg-info/10 dark:bg-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

/**
 * Props do componente Alert.
 *
 * @property {'default' | 'destructive' | 'success' | 'warning' | 'info'} [variant='default'] - Variante visual do alert
 */
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

/**
 * Alert - Container principal do alert.
 *
 * Componente de alerta usado para exibir mensagens importantes ao usuário.
 * Suporta múltiplas variantes semânticas para diferentes tipos de feedback.
 *
 * @param {AlertProps} props - Props do componente
 * @returns {JSX.Element} Componente Alert
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  )
);
Alert.displayName = "Alert";

/**
 * Props do componente AlertTitle.
 */
export type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

/**
 * AlertTitle - Título do alert.
 *
 * Componente usado para exibir o título do alerta.
 * Deve ser usado dentro de um componente Alert.
 *
 * @param {AlertTitleProps} props - Props do componente
 * @returns {JSX.Element} Componente AlertTitle
 */
const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

/**
 * Props do componente AlertDescription.
 */
export type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

/**
 * AlertDescription - Descrição do alert.
 *
 * Componente usado para exibir a descrição detalhada do alerta.
 * Deve ser usado dentro de um componente Alert.
 *
 * @param {AlertDescriptionProps} props - Props do componente
 * @returns {JSX.Element} Componente AlertDescription
 */
const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
