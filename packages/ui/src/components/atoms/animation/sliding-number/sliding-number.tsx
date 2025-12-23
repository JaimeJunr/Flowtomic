/**
 * SlidingNumber Component - Flowtomic UI
 *
 * Componente para exibir números com animação de deslizamento
 * Baseado em motion/react para animações suaves
 */

"use client";

import {
  type MotionValue,
  motion,
  type SpringOptions,
  type UseInViewOptions,
  useInView,
  useSpring,
  useTransform,
} from "motion/react";
import * as React from "react";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/utils";

type SlidingNumberRollerProps = {
  prevValue: number;
  value: number;
  place: number;
  transition: SpringOptions;
};

function SlidingNumberRoller({ prevValue, value, place, transition }: SlidingNumberRollerProps) {
  const startNumber = Math.floor(prevValue / place) % 10;
  const targetNumber = Math.floor(value / place) % 10;
  const animatedValue = useSpring(startNumber, transition);

  React.useEffect(() => {
    animatedValue.set(targetNumber);
  }, [targetNumber, animatedValue]);

  const [measureRef, { height }] = useMeasure();

  return (
    <span
      ref={measureRef}
      data-slot="sliding-number-roller"
      className="relative inline-block shrink-0 w-[1ch] h-[1em] overflow-hidden leading-none tabular-nums"
      style={{
        color: "var(--animated-number-color, inherit)",
        lineHeight: 1,
      }}
    >
      <span className="invisible">0</span>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <SlidingNumberDisplay
          key={`sliding-digit-${digit}`}
          motionValue={animatedValue}
          number={digit}
          height={height ?? 0}
          transition={transition}
        />
      ))}
    </span>
  );
}

type SlidingNumberDisplayProps = {
  motionValue: MotionValue<number>;
  number: number;
  height: number;
  transition: SpringOptions;
};

function SlidingNumberDisplay({
  motionValue,
  number,
  height,
  transition,
}: SlidingNumberDisplayProps) {
  const y = useTransform(motionValue, (latest) => {
    if (!height) return 0;
    const currentNumber = latest % 10;
    const offset = (10 + number - currentNumber) % 10;
    let translateY = offset * height;
    if (offset > 5) translateY -= 10 * height;
    return translateY;
  });

  if (!height) {
    return (
      <span className="invisible absolute top-0 left-0 w-full h-[1em] leading-none">{number}</span>
    );
  }

  return (
    <motion.span
      data-slot="sliding-number-display"
      style={{
        y,
        color: "var(--animated-number-color, inherit)",
      }}
      className="absolute top-0 left-0 w-full h-[1em] flex items-center justify-center leading-none"
      transition={{ ...transition, type: "spring" }}
    >
      {number}
    </motion.span>
  );
}

export interface SlidingNumberProps extends React.ComponentProps<"span"> {
  number: number | string;
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  inViewOnce?: boolean;
  padStart?: boolean;
  decimalSeparator?: string;
  decimalPlaces?: number;
  transition?: SpringOptions;
}

function SlidingNumber({
  ref,
  number,
  className,
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  padStart = false,
  decimalSeparator = ".",
  decimalPlaces = 0,
  transition = {
    stiffness: 200,
    damping: 20,
    mass: 0.4,
  },
  ...props
}: SlidingNumberProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => {
    if (!localRef.current) {
      throw new Error("SlidingNumber ref is not available");
    }
    return localRef.current;
  });

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  const prevNumberRef = React.useRef<number>(0);

  const effectiveNumber = React.useMemo(
    () => (!isInView ? 0 : Math.abs(Number(number))),
    [number, isInView]
  );

  const formatNumber = React.useCallback(
    (num: number) => (decimalPlaces != null ? num.toFixed(decimalPlaces) : num.toString()),
    [decimalPlaces]
  );

  const numberStr = formatNumber(effectiveNumber);
  const [newIntStrRaw, newDecStrRaw = ""] = numberStr.split(".");
  const newIntStr = padStart && newIntStrRaw?.length === 1 ? `0${newIntStrRaw}` : newIntStrRaw;

  const prevFormatted = formatNumber(prevNumberRef.current);
  const [prevIntStrRaw = "", prevDecStrRaw = ""] = prevFormatted.split(".");
  const prevIntStr = padStart && prevIntStrRaw.length === 1 ? `0${prevIntStrRaw}` : prevIntStrRaw;

  const adjustedPrevInt = React.useMemo(() => {
    return prevIntStr.length > (newIntStr?.length ?? 0)
      ? prevIntStr.slice(-(newIntStr?.length ?? 0))
      : prevIntStr.padStart(newIntStr?.length ?? 0, "0");
  }, [prevIntStr, newIntStr]);

  const adjustedPrevDec = React.useMemo(() => {
    if (!newDecStrRaw) return "";
    return prevDecStrRaw.length > newDecStrRaw.length
      ? prevDecStrRaw.slice(0, newDecStrRaw.length)
      : prevDecStrRaw.padEnd(newDecStrRaw.length, "0");
  }, [prevDecStrRaw, newDecStrRaw]);

  React.useEffect(() => {
    if (isInView) prevNumberRef.current = effectiveNumber;
  }, [effectiveNumber, isInView]);

  const intDigitCount = newIntStr?.length ?? 0;
  const intPlaces = React.useMemo(
    () => Array.from({ length: intDigitCount }, (_, i) => 10 ** (intDigitCount - i - 1)),
    [intDigitCount]
  );
  const decPlaces = React.useMemo(
    () =>
      newDecStrRaw
        ? Array.from({ length: newDecStrRaw.length }, (_, i) => 10 ** (newDecStrRaw.length - i - 1))
        : [],
    [newDecStrRaw]
  );

  const newDecValue = newDecStrRaw ? parseInt(newDecStrRaw, 10) : 0;
  const prevDecValue = adjustedPrevDec ? parseInt(adjustedPrevDec, 10) : 0;

  return (
    <span
      ref={localRef}
      data-slot="sliding-number"
      className={cn("flex flex-row flex-nowrap items-center", className)}
      style={{
        color: "inherit",
        ...(props.style as React.CSSProperties),
      }}
      {...props}
    >
      {isInView && Number(number) < 0 && (
        <span className="mr-1" style={{ color: "var(--animated-number-color, inherit)" }}>
          -
        </span>
      )}

      {intPlaces.map((place) => (
        <SlidingNumberRoller
          key={`int-${place}`}
          prevValue={parseInt(adjustedPrevInt, 10)}
          value={parseInt(newIntStr ?? "0", 10)}
          place={place}
          transition={transition}
        />
      ))}

      {newDecStrRaw && (
        <>
          <span style={{ color: "var(--animated-number-color, inherit)" }}>{decimalSeparator}</span>
          {decPlaces.map((place) => (
            <SlidingNumberRoller
              key={`dec-${place}`}
              prevValue={prevDecValue}
              value={newDecValue}
              place={place}
              transition={transition}
            />
          ))}
        </>
      )}
    </span>
  );
}

export { SlidingNumber };
