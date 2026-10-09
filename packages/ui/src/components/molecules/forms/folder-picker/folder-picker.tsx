/**
 * FolderPicker Component - Flowtomic UI
 *
 * Pasta de papel que, ao abrir, solta as opções como pílulas flutuando em
 * nuvem acima dela; depois de pousar elas boiam e podem ser arrastadas.
 * Sem física de colisão: as pílulas podem se sobrepor ao serem arrastadas.
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/folder-picker.md
 */

"use client";

import { motion } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  CLOUD_LIFT_PX,
  cloudHeight,
  defaultSublabel,
  estimatePillWidth,
  type FolderPickerItem,
  floatMotion,
  PILL_HEIGHT_PX,
  packRows,
  type ResolvedItem,
  ROW_HEIGHT_PX,
  resolveItems,
  tiltFor,
} from "./folder-picker-utils";

export type { FolderPickerItem } from "./folder-picker-utils";

export type FolderPickerProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: FolderPickerItem[];
  /** Texto na aba da pasta; também nomeia o grupo de opções. */
  label: string;
  /** Vazio = "N notas". */
  sublabel?: string;
  trigger?: "hover" | "click";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  /** Boiar e arrastar na nuvem depois que as pílulas pousam. */
  float?: boolean;
  /** 0..1, amplitude do boiar. */
  drift?: number;
  onSelect?: (value: string, index: number) => void;
  /** Meia-largura da nuvem, em px. */
  spread?: number;
  /** Inclinação máxima das pílulas, em graus. */
  tilt?: number;
  openMs?: number;
  staggerMs?: number;
  bounce?: number;
};

const REST_ANGLE = 12;
const OPEN_ANGLE = 30;
const PILL_GAP_PX = 8;
const CLOSE_RATIO = 0.6;
const FOLDER_DROP_PX = 56;
const REDUCED_FADE_S = 0.15;

function useOpenState(
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined
): [boolean, (next: boolean) => void] {
  const [inner, setInner] = React.useState(defaultOpen);
  const controlled = open !== undefined;
  const set = (next: boolean) => {
    if (!controlled) setInner(next);
    onOpenChange?.(next);
  };
  return [controlled ? open : inner, set];
}

function usePillWidths(items: ResolvedItem[]) {
  const refs = React.useRef<Array<HTMLElement | null>>([]);
  const estimates = items.map((item) => estimatePillWidth(item.label));
  const [widths, setWidths] = React.useState<number[]>(estimates);
  const key = items.map((item) => item.label).join("\u0000");
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` resume o conteúdo dos rótulos.
  React.useLayoutEffect(() => {
    const measured = items.map(
      (item, i) => refs.current[i]?.offsetWidth || estimatePillWidth(item.label)
    );
    setWidths((prev) => (prev.join() === measured.join() ? prev : measured));
  }, [key]);
  return { refs, widths: widths.length === items.length ? widths : estimates };
}

type PillProps = {
  item: ResolvedItem;
  index: number;
  count: number;
  slot: { x: number; row: number };
  width: number;
  open: boolean;
  reduced: boolean;
  draggable: boolean;
  float: boolean;
  drift: number;
  tilt: number;
  openMs: number;
  staggerMs: number;
  bounce: number;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  buttonRef: (node: HTMLButtonElement | null) => void;
  onPick: () => void;
};

function Pill(props: PillProps) {
  const { item, index, count, slot, width, open, reduced, draggable, float } = props;
  const dragged = React.useRef(false);
  const targetY = -(CLOUD_LIFT_PX + slot.row * ROW_HEIGHT_PX);
  const x = slot.x - width / 2;
  const delay = (open ? index : count - 1 - index) * (props.staggerMs / 1000);
  const landing = delay + props.openMs / 1000;
  const shown = {
    opacity: 1,
    x,
    y: targetY,
    scale: 1,
    rotate: reduced ? 0 : tiltFor(index, props.tilt),
  };
  const hidden = reduced
    ? { ...shown, opacity: 0 }
    : { opacity: 0, x: -width / 2, y: FOLDER_DROP_PX, scale: 0.5, rotate: 0 };
  const seconds = (props.openMs / 1000) * (open ? 1 : CLOSE_RATIO);
  const transition = reduced
    ? { duration: REDUCED_FADE_S }
    : { type: "spring" as const, duration: seconds, bounce: open ? props.bounce : 0, delay };
  const sway = floatMotion(index, props.drift, landing);
  const swaying = float && open && !reduced;

  return (
    <motion.div
      className="absolute bottom-0 left-1/2"
      initial={false}
      animate={open ? shown : hidden}
      transition={transition}
    >
      <motion.div
        animate={swaying ? { x: sway.x, y: sway.y } : { x: 0, y: 0 }}
        transition={
          swaying
            ? {
                duration: sway.duration,
                delay: sway.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
            : { duration: 0.2 }
        }
      >
        <motion.button
          ref={props.buttonRef}
          type="button"
          data-slot="folder-picker-item"
          data-draggable={draggable}
          tabIndex={open ? 0 : -1}
          drag={draggable}
          dragConstraints={props.constraintsRef}
          dragMomentum={false}
          dragElastic={0.1}
          whileDrag={{ scale: 1.06 }}
          onPointerDown={() => {
            dragged.current = false;
          }}
          onDragStart={() => {
            dragged.current = true;
          }}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            props.onPick();
          }}
          style={{ height: PILL_HEIGHT_PX }}
          className={cn(
            "inline-flex select-none items-center whitespace-nowrap rounded-full border bg-card px-4 text-card-foreground text-sm shadow-sm",
            "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            draggable && "cursor-grab active:cursor-grabbing"
          )}
        >
          {item.label}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

type FolderProps = {
  label: string;
  sublabel: string;
  open: boolean;
  reduced: boolean;
  controlsId: string;
  ref: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  onFocus: () => void;
};

function Folder({
  label,
  sublabel,
  open,
  reduced,
  controlsId,
  ref,
  onClick,
  onFocus,
}: FolderProps) {
  const angle = reduced || !open ? REST_ANGLE : OPEN_ANGLE;
  return (
    <button
      ref={ref}
      type="button"
      data-slot="folder-picker-folder"
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onClick}
      onFocus={onFocus}
      className="relative block h-28 w-44 select-none rounded-lg rounded-tl-none bg-muted text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span aria-hidden="true" className="absolute -top-2 left-0 h-3 w-16 rounded-t-md bg-muted" />
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-2 top-2 h-16 rounded-md border bg-card"
        initial={false}
        animate={{ y: open ? -10 : 0 }}
        transition={{ duration: reduced ? REDUCED_FADE_S : 0.25 }}
      />
      <motion.span
        className="absolute inset-x-0 bottom-0 flex h-20 flex-col justify-end rounded-lg bg-secondary p-3 text-secondary-foreground"
        style={{ transformPerspective: 600, transformOrigin: "50% 100%" }}
        initial={false}
        animate={{ rotateX: -angle, opacity: 1 }}
        transition={{ duration: reduced ? REDUCED_FADE_S : 0.3 }}
      >
        <span className="truncate font-medium text-sm">{label}</span>
        <span className="truncate text-secondary-foreground/70 text-xs">{sublabel}</span>
      </motion.span>
    </button>
  );
}

/** Pasta que solta as opções em nuvem flutuante. */
function FolderPicker({
  ref,
  className,
  items,
  label,
  sublabel,
  trigger = "hover",
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  closeOnSelect = true,
  float = true,
  drift = 0.5,
  onSelect,
  spread = 180,
  tilt = 8,
  openMs = 520,
  staggerMs = 45,
  bounce = 0.3,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  onBlur,
  ...props
}: FolderPickerProps) {
  const reduced = useShouldReduceMotion();
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange);
  const resolved = React.useMemo(() => resolveItems(items), [items]);
  const { refs, widths } = usePillWidths(resolved);
  const packed = packRows(widths, spread, PILL_GAP_PX);
  const rows = packed.reduce((max, p) => Math.max(max, p.row + 1), 0);
  const groupId = React.useId();
  const folderRef = React.useRef<HTMLButtonElement | null>(null);
  const cloudRef = React.useRef<HTMLDivElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const skipFocusOpen = React.useRef(false);
  const hover = trigger === "hover";

  const closeAndFocusFolder = () => {
    setOpen(false);
    // Devolver o foco à pasta dispararia o onFocus que abre no modo hover.
    skipFocusOpen.current = true;
    folderRef.current?.focus();
    skipFocusOpen.current = false;
  };

  React.useEffect(() => {
    if (!open || hover) return;
    const onOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  });

  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a raiz só delega hover, Escape e blur dos filhos interativos.
    <div
      ref={setRoot}
      data-slot="folder-picker"
      data-state={open ? "open" : "closed"}
      className={cn("relative inline-block", className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (hover && event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (hover && event.pointerType === "mouse") setOpen(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          closeAndFocusFolder();
        }
      }}
      onBlur={(event) => {
        onBlur?.(event);
        const target = event.relatedTarget as Node | null;
        if (hover && open && target && !event.currentTarget.contains(target)) setOpen(false);
      }}
      {...props}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: sem borda nem legend do fieldset */}
      <div
        ref={cloudRef}
        id={groupId}
        role="group"
        aria-label={label}
        aria-hidden={open ? undefined : true}
        inert={!open}
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2",
          !open && "pointer-events-none"
        )}
        style={{ width: spread * 2, height: cloudHeight(rows) }}
      >
        {resolved.map((item, i) => (
          <Pill
            // biome-ignore lint/suspicious/noArrayIndexKey: valores podem repetir e a ordem é fixa.
            key={i}
            item={item}
            index={i}
            count={resolved.length}
            slot={packed[i]}
            width={widths[i]}
            open={open}
            reduced={reduced}
            draggable={float && open && !reduced}
            float={float}
            drift={drift}
            tilt={tilt}
            openMs={openMs}
            staggerMs={staggerMs}
            bounce={bounce}
            constraintsRef={cloudRef}
            buttonRef={(node) => {
              refs.current[i] = node;
            }}
            onPick={() => {
              onSelect?.(item.value, i);
              if (closeOnSelect) closeAndFocusFolder();
            }}
          />
        ))}
      </div>
      <Folder
        ref={folderRef}
        label={label}
        sublabel={sublabel || defaultSublabel(resolved.length)}
        open={open}
        reduced={reduced}
        controlsId={groupId}
        onClick={() => setOpen(hover ? true : !open)}
        onFocus={() => {
          if (hover && !skipFocusOpen.current) setOpen(true);
        }}
      />
    </div>
  );
}

FolderPicker.displayName = "FolderPicker";

export { FolderPicker };
