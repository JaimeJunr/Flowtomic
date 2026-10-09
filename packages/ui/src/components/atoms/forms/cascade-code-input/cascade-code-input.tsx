/**
 * CascadeCodeInput Component - Flowtomic UI
 *
 * Campo de código de verificação: cada dígito pousa na casa com uma mola, colar
 * o código faz os dígitos pousarem em cascata, o erro esvazia as casas da última
 * para a primeira e o sucesso funde as casas numa faixa. Base: input-otp.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/cascade-code-input.md
 */

"use client";

import { OTPInput, REGEXP_ONLY_DIGITS, type SlotProps } from "input-otp";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { assertCodeLength, drainDelays, landingDelays } from "./cascade-code-input-utils";

type CascadeStatus = "idle" | "error" | "success";
type CascadeSize = "sm" | "default" | "lg";

export type CascadeCodeInputProps = {
  /** Quantidade de casas. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (code: string) => void;
  /** Chamado uma vez quando a última casa é preenchida. */
  onComplete?: (code: string) => void;
  status?: CascadeStatus;
  /** Mostra • no lugar do dígito. */
  mask?: boolean;
  /** Cursor piscando na casa ativa. */
  caret?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  size?: CascadeSize;
  /** Quique da mola do preenchimento (0 a 1). */
  bounce?: number;
  /** Duração do pouso, em segundos. */
  settleS?: number;
  /** Quantos pixels o dígito sobe até o lugar. */
  rise?: number;
  /** Atraso entre casas na cascata, em ms. */
  cascadeMs?: number;
  "aria-label"?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
};

const SLOT_SIZE: Record<CascadeSize, string> = {
  sm: "size-9 text-sm",
  default: "size-11 text-base",
  lg: "size-13 text-lg",
};

const FILL_TONE: Record<CascadeStatus, string> = {
  idle: "bg-primary",
  error: "bg-destructive",
  success: "bg-success",
};

type SlotMotion = {
  reduce: boolean;
  bounce: number;
  settleS: number;
  rise: number;
  landing: number;
  drain: number;
};

type CascadeSlotProps = {
  slot: SlotProps;
  status: CascadeStatus;
  size: CascadeSize;
  mask: boolean;
  caret: boolean;
  motionConfig: SlotMotion;
};

function CascadeSlot({ slot, status, size, mask, caret, motionConfig }: CascadeSlotProps) {
  const { reduce, bounce, settleS, rise, landing, drain } = motionConfig;
  const filled = Boolean(slot.char);
  const draining = status === "error" && !reduce;
  const merged = status === "success";
  return (
    <div
      data-slot="cascade-code-input-slot"
      data-filled={filled}
      data-active={slot.isActive}
      className={cn(
        "bg-muted text-primary-foreground relative flex items-center justify-center overflow-hidden rounded-md font-mono font-semibold transition-shadow",
        SLOT_SIZE[size],
        slot.isActive && "ring-ring ring-2",
        slot.isActive && status === "error" && "ring-destructive",
        merged && "rounded-none first:rounded-l-md last:rounded-r-md"
      )}
    >
      <AnimatePresence initial={false}>
        {filled && (
          <motion.span
            key="fill"
            aria-hidden
            className={cn("absolute inset-0", FILL_TONE[status])}
            initial={reduce ? false : { scale: 0.6 }}
            animate={{ scale: draining ? 0 : 1 }}
            exit={reduce ? undefined : { scale: 0 }}
            transition={{
              type: "spring",
              bounce,
              duration: settleS,
              delay: (draining ? drain : landing) / 1000,
            }}
          />
        )}
      </AnimatePresence>
      {filled && (
        <motion.span
          key={slot.char}
          className="relative"
          initial={reduce ? false : { y: rise, opacity: 0 }}
          animate={{ y: 0, opacity: draining ? 0 : 1 }}
          transition={{ duration: settleS, delay: (draining ? drain : landing) / 1000 }}
        >
          {mask ? "•" : slot.char}
        </motion.span>
      )}
      {caret && slot.hasFakeCaret && (
        <span
          data-slot="cascade-code-input-caret"
          className={cn(
            "bg-foreground pointer-events-none absolute h-1/2 w-px",
            !reduce && "animate-caret-blink"
          )}
        />
      )}
    </div>
  );
}

function liveMessage(count: number, length: number, status: CascadeStatus): string {
  if (status === "error") return "Código incorreto";
  return `${count} de ${length} dígitos`;
}

function CascadeCodeInput({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  status = "idle",
  mask = false,
  caret = true,
  disabled = false,
  autoFocus,
  size = "default",
  bounce = 0.2,
  settleS = 0.3,
  rise = 8,
  cascadeMs = 20,
  "aria-label": ariaLabel = "Código de verificação",
  className,
  ref,
}: CascadeCodeInputProps) {
  assertCodeLength(length);
  const reduce = useShouldReduceMotion();
  const [internal, setInternal] = React.useState(defaultValue);
  const code = (value ?? internal).slice(0, length);

  // Atrasos de pouso calculados na renderização: o pai pode trocar `value` de uma vez.
  const [snapshot, setSnapshot] = React.useState({ code, delays: {} as Record<number, number> });
  if (snapshot.code !== code) {
    setSnapshot({ code, delays: landingDelays(snapshot.code, code, cascadeMs) });
  }

  const onValueChangeRef = React.useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  React.useEffect(() => {
    if (status !== "error") return;
    const wait = reduce ? 0 : (length - 1) * cascadeMs + settleS * 1000;
    const timer = setTimeout(() => {
      setInternal("");
      onValueChangeRef.current?.("");
    }, wait);
    return () => clearTimeout(timer);
  }, [status, reduce, length, cascadeMs, settleS]);

  const handleChange = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
  };

  const drain = drainDelays(length, cascadeMs);

  return (
    <div
      data-slot="cascade-code-input"
      data-status={status}
      className={cn("relative inline-block", className)}
    >
      <OTPInput
        ref={ref}
        maxLength={length}
        value={code}
        onChange={handleChange}
        onComplete={onComplete}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        disabled={disabled || status === "success"}
        aria-label={ariaLabel}
        containerClassName={cn(
          "flex items-center has-disabled:cursor-not-allowed",
          disabled && "opacity-50",
          status === "success" ? "gap-0" : "gap-2",
          !reduce && "transition-[gap] duration-300"
        )}
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <CascadeSlot
                // biome-ignore lint/suspicious/noArrayIndexKey: as casas são posicionais e fixas
                key={index}
                slot={slot}
                status={status}
                size={size}
                mask={mask}
                caret={caret && !disabled}
                motionConfig={{
                  reduce,
                  bounce,
                  settleS,
                  rise,
                  landing: snapshot.delays[index] ?? 0,
                  drain: drain[index],
                }}
              />
            ))}
          </>
        )}
      />
      <span className="sr-only" aria-live="polite">
        {liveMessage(code.length, length, status)}
      </span>
    </div>
  );
}

CascadeCodeInput.displayName = "CascadeCodeInput";

export { CascadeCodeInput };
