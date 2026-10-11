"use client";

import { animate, motion, useMotionValue } from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { closestEdge, type MarqueeEdge, MIN_REPEATS, repeatsFor } from "./marquee-menu-utils";

export type MarqueeMenuItem = {
  label: string;
  href: string;
  thumbnail?: React.ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE = { duration: 0.6, ease: EASE };
const FADE = { duration: 0.2, ease: "linear" } as const;

function offscreen(edge: MarqueeEdge): string {
  return edge === "top" ? "-101%" : "101%";
}

function opposite(edge: MarqueeEdge): string {
  return edge === "top" ? "101%" : "-101%";
}

function Unit({ item }: { item: MarqueeMenuItem }) {
  return (
    <>
      <span className="whitespace-nowrap px-6">{item.label}</span>
      {item.thumbnail ? (
        <span className="mx-6 aspect-[2/1] h-[60%] shrink-0 overflow-hidden rounded-full">
          {item.thumbnail}
        </span>
      ) : null}
    </>
  );
}

type TrackProps = {
  item: MarqueeMenuItem;
  repeats: number;
  running: boolean;
  speed: number;
  unitRef: React.Ref<HTMLSpanElement>;
};

function Track({ item, repeats, running, speed, unitRef }: TrackProps) {
  const x = useMotionValue("0%");

  React.useEffect(() => {
    if (!running) return;
    x.set("0%");
    const controls = animate(x, "-50%", {
      duration: speed,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
    });
    return () => controls.stop();
  }, [running, speed, x]);

  // Duas metades idênticas: ao chegar em -50% o laço recomeça sem salto visível.
  const half = Array.from({ length: repeats }, (_, i) => i);
  return (
    <motion.div
      data-slot="marquee-menu-track"
      className="flex h-full w-max items-center"
      style={{ x }}
    >
      {[0, 1].map((copy) => (
        <div key={copy} className="flex h-full items-center">
          {half.map((i) => (
            <span
              key={i}
              ref={copy === 0 && i === 0 ? unitRef : undefined}
              className="flex h-full items-center"
            >
              <Unit item={item} />
            </span>
          ))}
        </div>
      ))}
    </motion.div>
  );
}

type ItemViewProps = {
  item: MarqueeMenuItem;
  last: boolean;
  speed: number;
};

export function MarqueeMenuItemView({ item, last, speed }: ItemViewProps) {
  const reduced = useShouldReduceMotion();
  const [active, setActive] = React.useState(false);
  const [edge, setEdge] = React.useState<MarqueeEdge>("top");
  const [repeats, setRepeats] = React.useState(MIN_REPEATS);
  const itemRef = React.useRef<HTMLLIElement>(null);
  const unitRef = React.useRef<HTMLSpanElement>(null);

  const bandY = useMotionValue(reduced ? "0%" : "-101%");
  const bandOpacity = useMotionValue(reduced ? 0 : 1);
  const innerY = useMotionValue("0%");

  const measure = React.useCallback(() => {
    const unit = unitRef.current?.getBoundingClientRect().width ?? 0;
    const width = itemRef.current?.getBoundingClientRect().width ?? 0;
    if (unit > 0 && width > 0) setRepeats(repeatsFor(width, unit));
  }, []);

  const enter = (from: MarqueeEdge) => {
    measure();
    setEdge(from);
    setActive(true);
    if (reduced) {
      bandY.set("0%");
      innerY.set("0%");
      animate(bandOpacity, 1, FADE);
      return;
    }
    bandOpacity.set(1);
    bandY.set(offscreen(from));
    innerY.set(opposite(from));
    animate(bandY, "0%", SLIDE);
    animate(innerY, "0%", SLIDE);
  };

  const leave = (to: MarqueeEdge) => {
    setEdge(to);
    setActive(false);
    if (reduced) {
      animate(bandOpacity, 0, FADE);
      return;
    }
    animate(bandY, offscreen(to), SLIDE);
    animate(innerY, opposite(to), SLIDE);
  };

  const edgeOf = (clientY: number): MarqueeEdge => {
    const rect = itemRef.current?.getBoundingClientRect();
    return rect ? closestEdge(clientY - rect.top, rect.height) : "top";
  };

  return (
    <li
      ref={itemRef}
      data-slot="marquee-menu-item"
      data-active={active ? "" : undefined}
      data-edge={edge}
      className={cn("relative flex-1 overflow-hidden border-border border-t", last && "border-b")}
      onPointerEnter={(e) => enter(edgeOf(e.clientY))}
      onPointerLeave={(e) => leave(edgeOf(e.clientY))}
    >
      <a
        href={item.href}
        className="flex h-full items-center justify-center font-semibold text-[4vh] uppercase outline-none"
        onFocus={() => enter("top")}
        onBlur={() => leave("top")}
      >
        {item.label}
      </a>
      <motion.div
        aria-hidden="true"
        data-slot="marquee-menu-band"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-foreground text-background"
        style={{ y: bandY, opacity: bandOpacity }}
      >
        <motion.div className="h-full font-semibold text-[4vh] uppercase" style={{ y: innerY }}>
          <Track
            item={item}
            repeats={repeats}
            running={active && !reduced}
            speed={speed}
            unitRef={unitRef}
          />
        </motion.div>
      </motion.div>
    </li>
  );
}
