/**
 * # Switch Component
 *
 * O componente `Switch` é um controle de alternância usado para ativar ou desativar
 * uma opção. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Estados Visuais**: Suporta estados checked, unchecked e disabled
 * - **Animações**: Transições suaves entre estados
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 * - **Customizável**: Pode ser estilizado via className e props HTML padrão
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Switch } from "@flowtomic/ui/components/atoms/forms/switch";
 *
 * function MyComponent() {
 *   const [enabled, setEnabled] = React.useState(false);
 *
 *   return (
 *     <Switch
 *       checked={enabled}
 *       onCheckedChange={setEnabled}
 *     />
 *   );
 * }
 * ```
 *
 * ## Com Label
 *
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <Switch id="notifications" />
 *   <label htmlFor="notifications">Notificações</label>
 * </div>
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (Tab, Espaço)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Switch](https://www.radix-ui.com/primitives/docs/components/switch) para mais detalhes
 */

import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Switch.
 * @see SwitchPrimitive.Root para props disponíveis (checked, onCheckedChange, disabled, etc.)
 */
export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {}

/**
 * Componente Switch para alternância de opções.
 *
 * @component
 * @param {SwitchProps} props - Props do componente
 * @returns {JSX.Element} Elemento Switch renderizado
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * <Switch defaultChecked />
 * <Switch disabled />
 * ```
 */
function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

Switch.displayName = "Switch";

export { Switch };
