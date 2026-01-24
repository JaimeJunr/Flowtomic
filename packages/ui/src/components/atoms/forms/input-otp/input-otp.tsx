/**
 * # InputOTP Component
 *
 * O componente `InputOTP` é um campo de entrada usado para códigos de verificação
 * (One-Time Password). Fornece uma interface visual com slots individuais para cada dígito.
 *
 * ## Características Principais
 *
 * - **Slots Visuais**: Cada dígito é exibido em um slot individual
 * - **Auto-foco**: Foco automático entre slots
 * - **Validação**: Suporte a validação de formato
 * - **Acessível**: Estrutura semântica para acessibilidade
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 *
 * ## Componentes
 *
 * - **InputOTP**: Container principal do OTP
 * - **InputOTPGroup**: Agrupa slots
 * - **InputOTPSlot**: Slot individual para dígito
 * - **InputOTPSeparator**: Separador visual entre grupos
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { InputOTP, InputOTPGroup, InputOTPSlot } from "@flowtomic/ui/components/atoms/forms/input-otp";
 *
 * function MyComponent() {
 *   return (
 *     <InputOTP maxLength={6}>
 *       <InputOTPGroup>
 *         <InputOTPSlot index={0} />
 *         <InputOTPSlot index={1} />
 *         <InputOTPSlot index={2} />
 *         <InputOTPSlot index={3} />
 *         <InputOTPSlot index={4} />
 *         <InputOTPSlot index={5} />
 *       </InputOTPGroup>
 *     </InputOTP>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente entre slots
 *
 * @see [input-otp](https://github.com/guilhermerodz/input-otp) para mais detalhes
 */

import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente InputOTP.
 *
 * @property {string} [containerClassName] - Classes CSS para o container
 */
export type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
	/** Classes CSS para o container */
	containerClassName?: string;
};

function InputOTP({ className, containerClassName, maxLength, ...props }: InputOTPProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      maxLength={maxLength}
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

InputOTP.displayName = "InputOTP";

export interface InputOTPGroupProps extends React.ComponentProps<"div"> {}

function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <div data-slot="input-otp-group" className={cn("flex items-center", className)} {...props} />
  );
}

InputOTPGroup.displayName = "InputOTPGroup";

/**
 * Props do componente InputOTPSlot.
 *
 * @property {number} index - Índice do slot (0-based)
 */
export interface InputOTPSlotProps extends React.ComponentProps<"div"> {
	/** Índice do slot (0-based) */
	index: number;
}

function InputOTPSlot({ index, className, ...props }: InputOTPSlotProps) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

InputOTPSlot.displayName = "InputOTPSlot";

export interface InputOTPSeparatorProps extends React.ComponentProps<"div"> {}

function InputOTPSeparator({ ...props }: InputOTPSeparatorProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Usar div para manter flexibilidade de estilização
    <div
      data-slot="input-otp-separator"
      role="separator"
      aria-valuenow={0}
      tabIndex={-1}
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
