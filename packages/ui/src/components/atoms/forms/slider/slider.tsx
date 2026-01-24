/**
 * # Slider Component
 *
 * O componente `Slider` é um controle deslizante usado para selecionar um valor ou intervalo
 * de valores dentro de um range. É baseado em Radix UI para garantir acessibilidade completa.
 *
 * ## Características Principais
 *
 * - **Acessível**: Baseado em Radix UI com suporte completo a leitores de tela
 * - **Range**: Suporta valores únicos ou intervalos
 * - **Orientação**: Suporta horizontal e vertical
 * - **Customizável**: Valores min/max configuráveis
 * - **Foco Gerenciado**: Foco e navegação por teclado gerenciados automaticamente
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { Slider } from "@flowtomic/ui/components/atoms/forms/slider";
 *
 * function MyComponent() {
 *   const [value, setValue] = React.useState([50]);
 *
 *   return (
 *     <Slider
 *       value={value}
 *       onValueChange={setValue}
 *       min={0}
 *       max={100}
 *     />
 *   );
 * }
 * ```
 *
 * ## Com Intervalo
 *
 * ```tsx
 * <Slider
 *   defaultValue={[20, 80]}
 *   min={0}
 *   max={100}
 * />
 * ```
 *
 * ## Acessibilidade
 *
 * - Suporta navegação por teclado (setas, Home, End)
 * - Segue padrões WAI-ARIA via Radix UI
 * - Suporta leitores de tela
 * - Foco gerenciado automaticamente
 *
 * @see [Radix UI Slider](https://www.radix-ui.com/primitives/docs/components/slider) para mais detalhes
 */

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Props do componente Slider.
 *
 * @property {number} [min=0] - Valor mínimo do slider
 * @property {number} [max=100] - Valor máximo do slider
 */
export interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Valor mínimo do slider */
  min?: number;
  /** Valor máximo do slider */
  max?: number;
}

function Slider({ className, defaultValue, value, min = 0, max = 100, ...props }: SliderProps) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  );

  const thumbKeys = React.useMemo(
    () => _values.map((val, idx) => `slider-thumb-${val}-${idx}`),
    [_values]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {_values.map((_val, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={thumbKeys[index]}
          aria-label={props["aria-label"]}
          className="border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

Slider.displayName = "Slider";

export { Slider };
