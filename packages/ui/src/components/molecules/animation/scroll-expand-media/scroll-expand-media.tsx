"use client";

import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";
import * as React from "react";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { expandProgress, type FrameOptions, frameAt } from "./scroll-expand-media-utils";

export type ScrollExpandMediaProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Mídia: um nó React (img, video, componente). O componente só a enquadra. */
  media: React.ReactNode;
  title?: React.ReactNode;
  scrollHint?: React.ReactNode;
  /** Largura e altura da moldura em repouso, em % da área visível. */
  startWidth?: number;
  startHeight?: number;
  /** Raio em px em repouso e expandido. */
  startRadius?: number;
  endRadius?: number;
  /** Zoom da mídia em repouso; vai a 1 ao expandir. */
  mediaZoom?: number;
  /** Comprimento da rolagem da expansão, em alturas de tela. */
  scrollDistance?: number;
  /** Rolagem extra presa em tela cheia, em alturas de tela. */
  holdDistance?: number;
  /** Força do degradê por baixo do conteúdo final, 0..1. */
  overlayScrim?: number;
  /** Conteúdo que aparece sobre a mídia em tela cheia. */
  children?: React.ReactNode;
};

const MEDIA_CLASS = "size-full [&>*]:size-full [&>*]:object-cover";
const TITLE_CLASS =
  "pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center font-display text-display-md text-background mix-blend-difference";

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

function renderTitle(title: React.ReactNode): React.ReactNode {
  return typeof title === "string" ? <h2>{title}</h2> : title;
}

function scrimBackground(strength: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, strength)) * 100);
  return `linear-gradient(to top, color-mix(in oklab, var(--foreground) ${pct}%, transparent), transparent 60%)`;
}

function ReducedMotionView({
  media,
  title,
  endRadius,
  children,
  ref,
  className,
  ...rest
}: ScrollExpandMediaProps) {
  const {
    scrollHint: _hint,
    startWidth: _w,
    startHeight: _h,
    startRadius: _r,
    mediaZoom: _z,
    scrollDistance: _s,
    holdDistance: _d,
    overlayScrim: _o,
    ...section
  } = rest;
  return (
    <section
      ref={ref}
      data-slot="scroll-expand-media"
      className={cn("relative h-auto", className)}
      {...section}
    >
      {title ? (
        <div
          data-slot="scroll-expand-media-title"
          className="px-6 py-8 text-center font-display text-display-md"
        >
          {renderTitle(title)}
        </div>
      ) : null}
      <div
        data-slot="scroll-expand-media-frame"
        className="relative aspect-video w-full overflow-hidden bg-muted"
        style={{ borderRadius: endRadius }}
      >
        <div className={MEDIA_CLASS}>{media}</div>
        <div data-slot="scroll-expand-media-content" className="absolute inset-0 text-background">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: scrimBackground(rest.overlayScrim ?? 0.45) }}
          />
          <div className="relative flex size-full items-end p-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

function useExpansion(
  progress: MotionValue<number>,
  opts: FrameOptions
): {
  width: MotionValue<string>;
  height: MotionValue<string>;
  borderRadius: MotionValue<number>;
  scale: MotionValue<number>;
} {
  const { startWidth, startHeight, startRadius, endRadius, mediaZoom } = opts;
  const frame = (p: number) =>
    frameAt(p, { startWidth, startHeight, startRadius, endRadius, mediaZoom });
  return {
    width: useTransform(progress, (p) => `${frame(p).widthPct}%`),
    height: useTransform(progress, (p) => `${frame(p).heightPct}%`),
    borderRadius: useTransform(progress, (p) => frame(p).radius),
    scale: useTransform(progress, (p) => frame(p).zoom),
  };
}

function ExpandingView(props: ScrollExpandMediaProps) {
  const {
    media,
    title,
    scrollHint,
    startWidth = 42,
    startHeight = 58,
    startRadius = 24,
    endRadius = 0,
    mediaZoom = 1.35,
    scrollDistance = 1.2,
    holdDistance = 0.35,
    overlayScrim = 0.45,
    children,
    ref,
    className,
    style,
    ...section
  } = props;
  const rootRef = React.useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, (raw) =>
    expandProgress(raw, scrollDistance, holdDistance)
  );
  const frameStyle = useExpansion(progress, {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
  });
  const titleOpacity = useTransform(progress, (p) => Math.max(0, 1 - p / 0.4));
  const titleY = useTransform(progress, (p) => -40 * p);
  const hintOpacity = useTransform(progress, (p) => Math.max(0, 1 - p / 0.08));
  const contentOpacity = useTransform(progress, (p) => Math.min(1, Math.max(0, (p - 0.85) / 0.15)));
  const [shown, setShown] = React.useState(false);
  useMotionValueEvent(contentOpacity, "change", (v) => setShown(v >= 1));

  return (
    <section
      ref={mergeRefs(rootRef, ref)}
      data-slot="scroll-expand-media"
      className={cn("relative", className)}
      style={{ ...style, height: `calc(100vh * ${1 + scrollDistance + holdDistance})` }}
      {...section}
    >
      <div className="sticky top-0 grid h-screen place-items-center overflow-hidden bg-background">
        <motion.div
          data-slot="scroll-expand-media-frame"
          className="relative overflow-hidden bg-muted"
          style={{
            width: frameStyle.width,
            height: frameStyle.height,
            borderRadius: frameStyle.borderRadius,
          }}
        >
          <motion.div className={MEDIA_CLASS} style={{ scale: frameStyle.scale }}>
            {media}
          </motion.div>
          <motion.div
            data-slot="scroll-expand-media-content"
            aria-hidden={shown ? undefined : true}
            inert={!shown}
            className={cn("absolute inset-0 text-background", !shown && "pointer-events-none")}
            style={{ opacity: contentOpacity }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: scrimBackground(overlayScrim) }}
            />
            <div className="relative flex size-full items-end p-6 sm:p-10">{children}</div>
          </motion.div>
        </motion.div>
        {title ? (
          <motion.div
            data-slot="scroll-expand-media-title"
            className={TITLE_CLASS}
            style={{ opacity: titleOpacity, y: titleY }}
          >
            {renderTitle(title)}
          </motion.div>
        ) : null}
        {scrollHint ? (
          <motion.div
            data-slot="scroll-expand-media-hint"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm text-muted-foreground"
            style={{ opacity: hintOpacity }}
          >
            {scrollHint}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

function ScrollExpandMedia(props: ScrollExpandMediaProps) {
  const reduce = useShouldReduceMotion();
  return reduce ? <ReducedMotionView {...props} /> : <ExpandingView {...props} />;
}
ScrollExpandMedia.displayName = "ScrollExpandMedia";

export { ScrollExpandMedia };
