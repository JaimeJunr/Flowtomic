"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";
import { useFrameLoop } from "@/lib/use-frame-loop";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  barHeight,
  energyFromSpeed,
  handlePosition,
  litCount,
  smoothSpeed,
  type WaveDirection,
  type WaveShape,
} from "./wave-bar-slider-utils";

export type WaveBarSliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "orientation" | "children"
> & {
  value?: number;
  /** @default 50 */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Quantidade de barras. @default 32 */
  bars?: number;
  /** Teto da onda, em px. @default 48 */
  height?: number;
  /** Altura das barras em repouso, em px. @default 10 */
  restHeight?: number;
  /** Quanto a velocidade do arrasto vira altura da onda. @default 1 */
  sensitivity?: number;
  /** Meia-largura da onda em velocidade máxima, em barras. @default 6 */
  reach?: number;
  /** 0 = simétrica; >0 = mais larga atrás da alça. @default 0.6 */
  skew?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  "aria-label"?: string;
};

// Abaixo disso a onda é imperceptível e o loop de quadros pode parar.
const SETTLED_ENERGY = 0.002;
const FIRST_FRAME_MS = 16;

function WaveBarSlider({
  value: valueProp,
  defaultValue = 50,
  onValueChange,
  bars = 32,
  height = 48,
  restHeight = 10,
  sensitivity = 1,
  reach = 6,
  skew = 0.6,
  showValue = false,
  formatValue,
  min = 0,
  max = 100,
  className,
  "aria-label": ariaLabel = "Valor",
  ref,
  ...props
}: WaveBarSliderProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const value = valueProp ?? internal;
  const reduced = useShouldReduceMotion();
  const [active, setActive] = React.useState(false);
  const barRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const motion = React.useRef({ prev: value, speed: 0, last: 0, direction: 0 as WaveDirection });
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const shape = React.useMemo<WaveShape>(
    () => ({ height, restHeight, reach, skew }),
    [height, restHeight, reach, skew]
  );
  const restScale = restHeight / height;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `value` só reativa o loop de quadros
  React.useEffect(() => {
    if (!reduced) setActive(true);
  }, [value, reduced]);

  const paint = (energy: number) => {
    const pos = handlePosition(valueRef.current, min, max, bars);
    barRefs.current.forEach((bar, index) => {
      if (!bar) return;
      const h = barHeight(index, pos, motion.current.direction, energy, shape);
      bar.style.transform = `scaleY(${h / height})`;
    });
  };

  useFrameLoop((now) => {
    const m = motion.current;
    const dt = m.last ? now - m.last : FIRST_FRAME_MS;
    m.last = now;
    const delta = valueRef.current - m.prev;
    m.prev = valueRef.current;
    if (delta !== 0) m.direction = delta > 0 ? 1 : -1;
    const instant = Math.abs(delta) / (max - min) / (dt / 1000);
    m.speed = smoothSpeed(m.speed, instant, dt);
    const energy = energyFromSpeed(m.speed, sensitivity);
    paint(energy);
    if (energy < SETTLED_ENERGY && delta === 0) {
      m.speed = 0;
      m.last = 0;
      paint(0);
      setActive(false);
    }
  }, active && !reduced);

  const lit = litCount(value, min, max, bars);
  const text = formatValue ? formatValue(value) : String(value);

  return (
    <SliderPrimitive.Root
      ref={ref}
      data-slot="wave-bar-slider"
      value={[value]}
      min={min}
      max={max}
      onValueChange={([next]) => {
        if (valueProp === undefined) setInternal(next);
        onValueChange?.(next);
      }}
      className={cn(
        "relative flex w-full touch-none items-center gap-3 select-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="wave-bar-slider-track"
        className="relative flex grow items-center"
        style={{ height }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 flex items-end gap-0.5">
          {Array.from({ length: bars }, (_, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: lista fixa de barras posicionais
              key={index}
              ref={(node) => {
                barRefs.current[index] = node;
              }}
              data-slot="wave-bar-slider-bar"
              data-lit={index < lit}
              className="flex-1 origin-bottom rounded-full bg-muted data-[lit=true]:bg-primary"
              style={{ height, transform: `scaleY(${restScale})` }}
            />
          ))}
        </span>
        <SliderPrimitive.Thumb
          data-slot="wave-bar-slider-thumb"
          aria-label={ariaLabel}
          aria-valuetext={text}
          className="block w-1 rounded-full bg-foreground opacity-0 transition-opacity focus-visible:opacity-100 focus-visible:outline-hidden active:opacity-100"
          style={{ height }}
        />
      </SliderPrimitive.Track>
      {showValue && <span className="min-w-[3ch] text-right tabular-nums">{text}</span>}
    </SliderPrimitive.Root>
  );
}

WaveBarSlider.displayName = "WaveBarSlider";

export { WaveBarSlider };
