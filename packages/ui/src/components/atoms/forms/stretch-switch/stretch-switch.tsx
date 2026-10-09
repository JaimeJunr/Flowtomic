/**
 * StretchSwitch Component - Flowtomic UI
 *
 * Interruptor cujo thumb corre numa mola, estica na direção do movimento
 * (como uma gota, área constante) e pode ser arrastado. O Radix continua dono
 * do estado e do teclado. Baseado em @radix-ui/react-switch e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/stretch-switch.md
 */

"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { motion, useSpring, useTransform, useVelocity } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  dampingFromStiffness,
  dragPosition,
  isRealDrag,
  resolveDragRelease,
  SIZE_SPECS,
  type StretchSwitchSize,
  stiffnessFromSpeed,
  stretchScale,
  thumbTravel,
} from "./stretch-switch-utils";

export type StretchSwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  "onChange"
> & {
  /** Rótulo ao lado, ligado ao switch por id/htmlFor. Sem ele, passe `aria-label`. */
  label?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  size?: StretchSwitchSize;
  /** 0..100. Rigidez da mola de assentar. Baixo = preguiçoso. */
  speed?: number;
  /** 0..100. Quanto o thumb estica com a velocidade. 0 = não estica. */
  stretch?: number;
  hoverScale?: number;
  colorDurationMs?: number;
};

type DragState = { pointerId: number; startClientX: number; startX: number; moved: boolean };

/** Estado "checked" controlado ou interno, espelhando o contrato do Radix. */
function useCheckedState(
  checkedProp: boolean | undefined,
  defaultChecked: boolean | undefined,
  onCheckedChange: ((checked: boolean) => void) | undefined
) {
  const [inner, setInner] = React.useState(defaultChecked ?? false);
  const checked = checkedProp ?? inner;
  const setChecked = (next: boolean) => {
    if (next === checked) return;
    if (checkedProp === undefined) setInner(next);
    onCheckedChange?.(next);
  };
  return { checked, setChecked };
}

function StretchSwitch({
  ref,
  className,
  style,
  label,
  id,
  size = "default",
  speed = 50,
  stretch = 36,
  hoverScale = 1.035,
  colorDurationMs = 320,
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  onClick,
  disabled = false,
  ...props
}: StretchSwitchProps) {
  const reduced = useShouldReduceMotion();
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  const { checked, setChecked } = useCheckedState(checkedProp, defaultChecked, onCheckedChange);
  const spec = SIZE_SPECS[size];
  const travel = thumbTravel(size);
  const target = checked ? travel : 0;

  const stiffness = stiffnessFromSpeed(speed);
  const position = useSpring(target, { stiffness, damping: dampingFromStiffness(stiffness) });
  const velocity = useVelocity(position);
  const scaleX = useTransform(velocity, (v) => stretchScale(v, stretch).scaleX);
  const scaleY = useTransform(velocity, (v) => stretchScale(v, stretch).scaleY);

  const drag = React.useRef<DragState | null>(null);
  const swallowClick = React.useRef(false);

  const settle = React.useCallback(
    (to: number) => (reduced ? position.jump(to) : position.set(to)),
    [position, reduced]
  );
  React.useEffect(() => settle(target), [settle, target]);

  const handlePointerDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (disabled || event.button !== 0) return;
    swallowClick.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startX: position.get(),
      moved: false,
    };
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const delta = event.clientX - current.startClientX;
    if (!isRealDrag(delta) && !current.moved) return;
    current.moved = true;
    position.jump(dragPosition(current.startX, delta, travel));
  };
  const handlePointerUp = (event: React.PointerEvent<HTMLSpanElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current || current.pointerId !== event.pointerId) return;
    if (!current.moved) return settle(target);
    // O click que o navegador dispara depois do arrasto não pode alternar de novo.
    swallowClick.current = true;
    const next = resolveDragRelease(position.get(), travel);
    setChecked(next);
    settle(next ? travel : 0);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
  };

  return (
    <span
      data-slot="stretch-switch"
      data-state={checked ? "checked" : "unchecked"}
      className="inline-flex items-center gap-2"
    >
      <SwitchPrimitive.Root
        ref={ref}
        id={controlId}
        data-slot="stretch-switch-control"
        checked={checked}
        disabled={disabled}
        onCheckedChange={setChecked}
        onClick={handleClick}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none transition-colors",
          "bg-input data-[state=checked]:bg-primary",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          width: spec.trackWidth,
          height: spec.trackHeight,
          transitionDuration: `${colorDurationMs}ms`,
          ...style,
        }}
        {...props}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            data-slot="stretch-switch-thumb"
            className={cn(
              "absolute block touch-none rounded-full bg-background shadow-xs transition-colors data-[state=checked]:bg-primary-foreground",
              !disabled && "cursor-grab active:cursor-grabbing"
            )}
            style={{
              top: spec.padding,
              left: spec.padding,
              width: spec.thumb,
              height: spec.thumb,
              x: position,
              scaleX: reduced ? 1 : scaleX,
              scaleY: reduced ? 1 : scaleY,
              transitionDuration: `${colorDurationMs}ms`,
            }}
            whileHover={reduced || disabled ? undefined : { scale: hoverScale }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
      {label !== undefined && (
        <label
          htmlFor={controlId}
          className={cn(
            "select-none text-sm text-foreground",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </label>
      )}
    </span>
  );
}

StretchSwitch.displayName = "StretchSwitch";

export { StretchSwitch };
