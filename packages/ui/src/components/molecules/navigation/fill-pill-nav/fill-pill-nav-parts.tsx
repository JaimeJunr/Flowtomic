"use client";

import { animate, motion, useMotionValue } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { FillPillNavItem } from "./fill-pill-nav-types";
import { FILL_DURATION, FILL_EASE, fillCircle, isHoverPointer } from "./fill-pill-nav-utils";
import { useElementSize } from "./use-element-size";

const FALLBACK_HEIGHT = 36;
const TRANSITION = { duration: FILL_DURATION, ease: FILL_EASE };

type PillProps = {
  item: FillPillNavItem;
  active: boolean;
  reduced: boolean;
};

export function NavPill({ item, active, reduced }: PillProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const size = useElementSize(ref);
  const [pointerOver, setPointerOver] = useState(false);
  const [focused, setFocused] = useState(false);
  const hovered = pointerOver || focused;
  const height = size?.height ?? FALLBACK_HEIGHT;
  const circle = size && size.height > 0 ? fillCircle(size.width, size.height) : null;

  return (
    <li className="relative">
      <a
        ref={ref}
        data-slot="fill-pill-nav-item"
        data-hovered={hovered ? "true" : undefined}
        href={item.href}
        aria-label={item.ariaLabel}
        aria-current={active ? "page" : undefined}
        onPointerEnter={(event) => isHoverPointer(event.pointerType) && setPointerOver(true)}
        onPointerLeave={() => setPointerOver(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "relative inline-flex h-9 items-center overflow-hidden rounded-full bg-background px-5 font-semibold text-foreground text-xs uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring",
          reduced && "data-[hovered=true]:bg-foreground data-[hovered=true]:text-background"
        )}
      >
        {!reduced && circle && (
          <motion.span
            data-slot="fill-pill-nav-fill"
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-foreground"
            style={{
              width: circle.diameter,
              height: circle.diameter,
              left: circle.left,
              bottom: circle.bottom,
              originX: 0.5,
              originY: circle.originY,
            }}
            initial={false}
            animate={{ scale: hovered ? 1 : 0 }}
            transition={TRANSITION}
          />
        )}
        <span className="relative z-10 inline-flex items-center whitespace-nowrap">
          <motion.span
            className="block"
            initial={false}
            animate={{ y: !reduced && hovered ? -(height + 4) : 0 }}
            transition={TRANSITION}
          >
            {item.label}
          </motion.span>
          {!reduced && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 flex items-center text-background"
              initial={false}
              animate={{ y: hovered ? 0 : height }}
              transition={TRANSITION}
            >
              {item.label}
            </motion.span>
          )}
        </span>
      </a>
      {active && (
        // O ponto fica abaixo da cápsula (que tem a mesma cor) para não sumir sobre ela.
        <span
          aria-hidden="true"
          className="-translate-x-1/2 absolute top-[calc(100%+0.75rem)] left-1/2 size-1.5 rounded-full bg-foreground"
        />
      )}
    </li>
  );
}

type LogoProps = {
  href: string;
  label: string;
  intro: boolean;
  reduced: boolean;
  children: ReactNode;
};

export function NavLogo({ href, label, intro, reduced, children }: LogoProps) {
  const rotate = useMotionValue(0);

  const spin = () => {
    // Cada entrada soma uma volta; assim o giro nunca volta de ré ao sair.
    if (!reduced) animate(rotate, rotate.get() + 360, { duration: 0.6, ease: FILL_EASE });
  };

  return (
    <motion.a
      data-slot="fill-pill-nav-logo"
      href={href}
      aria-label={label}
      onPointerEnter={(event) => isHoverPointer(event.pointerType) && spin()}
      initial={intro ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      transition={{ duration: 0.6, ease: FILL_EASE }}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <motion.span className="inline-flex" style={{ rotate }}>
        {children}
      </motion.span>
    </motion.a>
  );
}
