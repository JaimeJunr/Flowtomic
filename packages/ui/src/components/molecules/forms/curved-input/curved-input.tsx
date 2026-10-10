"use client";

import { Mail } from "lucide-react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { ButtonShape, ChipShape, computeLayout } from "./curved-input-parts";
import { barOutline, centerPath, pointAtX, scrollOffset, viewBoxFor } from "./curved-input-utils";

export type CurvedInputProps = Omit<React.ComponentProps<"form">, "onChange" | "onSubmit"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  type?: "email" | "text" | "search";
  name?: string;
  "aria-label"?: string;
  width?: number;
  bend?: number;
  height?: number;
  radius?: number;
  showButton?: boolean;
  icon?: React.ReactNode | false;
};

// Sem layout (jsdom) nao ha medida de texto; estima a largura por caractere.
const FALLBACK_CHAR_WIDTH = 8;

function useCaretLength(
  textRef: React.RefObject<SVGTextElement | null>,
  text: string,
  caret: number
): number {
  const [length, setLength] = React.useState(0);
  React.useLayoutEffect(() => {
    const node = textRef.current;
    const measured =
      node && typeof node.getSubStringLength === "function" && text
        ? node.getSubStringLength(0, Math.min(caret, text.length))
        : Math.min(caret, text.length) * FALLBACK_CHAR_WIDTH;
    setLength(measured);
  }, [textRef, text, caret]);
  return length;
}

function CurvedInput({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder = "Seu melhor e-mail",
  buttonLabel = "Começar",
  type = "email",
  name,
  "aria-label": ariaLabel,
  width = 450,
  bend = 28,
  height = 64,
  radius = 18,
  showButton = true,
  icon,
  className,
  style,
  ref,
  ...props
}: CurvedInputProps): React.JSX.Element {
  const reduced = useShouldReduceMotion();
  const trackId = `${React.useId()}-track`;
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = isControlled ? value : inner;
  const [focused, setFocused] = React.useState(false);
  const [caret, setCaret] = React.useState(current.length);
  const textRef = React.useRef<SVGTextElement>(null);
  const hasIcon = icon !== false;
  const layout = computeLayout(width, height, hasIcon, showButton);
  const geo = { width, height, bend, radius };
  const shown = current || placeholder;
  const caretLen = useCaretLength(textRef, current, caret);
  const trackLen = layout.trackEnd - layout.trackStart;
  const offset = scrollOffset(current.length, caretLen, trackLen);
  const vb = viewBoxFor(width, height, bend);
  const caretPoint = pointAtX(layout.trackStart + Math.min(caretLen, trackLen), width, bend);
  const pct = (x: number) => `${(x / width) * 100}%`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInner(event.target.value);
    setCaret(event.target.selectionStart ?? event.target.value.length);
    onValueChange?.(event.target.value);
  };
  const syncCaret = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setCaret(event.currentTarget.selectionStart ?? current.length);

  return (
    <form
      ref={ref}
      data-slot="curved-input"
      data-focused={focused}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(current);
      }}
      className={cn("relative select-none", className)}
      style={{ width, maxWidth: "100%", ...style }}
      {...props}
    >
      <svg
        data-slot="curved-input-shape"
        aria-hidden="true"
        width="100%"
        viewBox={`0 ${vb.minY} ${vb.width} ${vb.height}`}
        className="block overflow-visible"
      >
        <path
          d={barOutline(width, height, bend, radius)}
          fill="var(--card)"
          stroke="var(--border)"
        />
        {hasIcon && <ChipShape geo={geo} layout={layout} icon={icon ?? <Mail />} />}
        {showButton && <ButtonShape geo={geo} layout={layout} label={buttonLabel} />}
        <defs>
          <path id={trackId} d={centerPath(layout.trackStart, layout.trackEnd, width, bend)} />
        </defs>
        <text
          ref={textRef}
          data-slot="curved-input-text"
          dominantBaseline="central"
          fill={current ? "var(--foreground)" : "var(--muted-foreground)"}
          className="text-base"
        >
          <textPath href={`#${trackId}`} startOffset={-offset}>
            {shown}
          </textPath>
        </text>
        {focused && (
          <>
            <path
              data-slot="curved-input-ring"
              d={barOutline(width, height, bend, radius)}
              fill="none"
              stroke="var(--ring)"
              strokeWidth={2}
            />
            <line
              data-slot="curved-input-caret"
              x1={0}
              x2={0}
              y1={-10}
              y2={10}
              stroke="var(--foreground)"
              strokeWidth={1.5}
              transform={`translate(${caretPoint.x} ${caretPoint.y}) rotate(${caretPoint.angle})`}
              className={reduced ? undefined : "animate-pulse [animation-duration:1s]"}
            />
          </>
        )}
      </svg>
      <input
        data-slot="curved-input-field"
        type={type}
        name={name}
        value={current}
        aria-label={ariaLabel ?? placeholder}
        autoComplete={type === "email" ? "email" : "off"}
        onChange={handleChange}
        onSelect={syncCaret}
        onKeyUp={syncCaret}
        onClick={syncCaret}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-y-0 bg-transparent text-transparent caret-transparent outline-none"
        style={{ left: pct(layout.trackStart), width: pct(trackLen) }}
      />
      {showButton && (
        <button
          data-slot="curved-input-button"
          type="submit"
          aria-label={buttonLabel}
          className="absolute inset-y-0 cursor-pointer bg-transparent outline-none"
          style={{
            left: pct(layout.buttonStart),
            width: pct(layout.buttonEnd - layout.buttonStart),
          }}
        />
      )}
    </form>
  );
}
CurvedInput.displayName = "CurvedInput";

export { CurvedInput };
