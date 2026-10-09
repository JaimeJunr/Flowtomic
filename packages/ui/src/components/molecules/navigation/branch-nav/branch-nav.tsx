/**
 * BranchNav Component - Flowtomic UI
 *
 * Menu lateral em árvore: um tronco fino à esquerda e galhos curvos até cada
 * filho das seções abertas. Ao escolher um item, uma linha de destaque percorre
 * o tronco e o galho até ele. Seções dobram com altura animada.
 * Teclado: ordem natural de tab (sem roving tabindex nem setas).
 * Baseado em motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/branch-nav.md
 */

"use client";

import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { useId, useState } from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  activePath,
  activePathLength,
  branchPath,
  initialValue,
  normalizeOpen,
  trunkPath,
} from "./branch-nav-utils";

export type BranchNavLeaf = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
};
export type BranchNavSection = {
  label: string;
  icon?: React.ReactNode;
  children: BranchNavLeaf[];
};
export type BranchNavItem = BranchNavSection | (BranchNavLeaf & { children?: undefined });

export type BranchNavProps = Omit<React.ComponentProps<"nav">, "onSelect"> & {
  items: BranchNavItem[];
  value?: string;
  /** Vazio = primeiro filho da primeira seção aberta. */
  defaultValue?: string;
  /** Índice(s) das seções abertas no início. -1 = nenhuma. */
  defaultOpen?: number | number[];
  onValueChange?: (value: string, item: BranchNavLeaf) => void;
  onToggle?: (index: number, open: boolean) => void;
  /** Altura de cada linha, em px. */
  rowHeight?: number;
  /** Recuo dos filhos em relação ao tronco, em px. */
  indent?: number;
  /** Posição horizontal do tronco, em px. */
  trunkX?: number;
  /** Raio da curva dos galhos, em px. */
  radius?: number;
  /** Duração do desenho do destaque, em ms. */
  drawMs?: number;
  /** Duração de abrir/fechar uma seção, em ms. */
  foldMs?: number;
};

type Geometry = { rowHeight: number; indent: number; trunkX: number; radius: number };

const LINE_WIDTH = 1.5;
const ACTIVE_LINE_WIDTH = 2;
const MARKER_SIZE = 6;
const MARKER_GAP = 4;
const ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-sm text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0";

function isSection(item: BranchNavItem): item is BranchNavSection {
  return item.children !== undefined;
}

type LinesProps = Geometry & {
  count: number;
  activeIndex: number;
  drawMs: number;
  reduced: boolean;
};

function Lines({ count, activeIndex, drawMs, reduced, ...geo }: LinesProps) {
  const { rowHeight, indent, trunkX, radius } = geo;
  const length =
    activeIndex >= 0 ? activePathLength(activeIndex, rowHeight, trunkX, indent, radius) : 0;
  const branchIds = Array.from({ length: count }, (_, i) => `branch-${i}`);
  const lineProps = {
    "data-slot": "branch-nav-active-line",
    d: activeIndex >= 0 ? activePath(activeIndex, rowHeight, trunkX, indent, radius) : "",
    fill: "none",
    strokeWidth: ACTIVE_LINE_WIDTH,
    strokeLinecap: "round" as const,
    strokeDasharray: length,
    className: "stroke-primary",
  };
  return (
    <svg
      aria-hidden="true"
      data-slot="branch-nav-lines"
      className="pointer-events-none absolute top-0 left-0 overflow-visible"
      width={indent}
      height={count * rowHeight}
      viewBox={`0 0 ${indent} ${count * rowHeight}`}
    >
      <g className="stroke-border" fill="none" strokeWidth={LINE_WIDTH} strokeLinecap="round">
        <path d={trunkPath(count, rowHeight, trunkX)} />
        {branchIds.map((id, i) => (
          <path key={id} d={branchPath(i, rowHeight, trunkX, indent, radius)} />
        ))}
      </g>
      {activeIndex >= 0 &&
        (reduced ? (
          <path {...lineProps} strokeDashoffset={0} />
        ) : (
          // key: troca de item reinicia o desenho a partir do tronco
          <motion.path
            key={activeIndex}
            {...lineProps}
            initial={{ strokeDashoffset: length }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: drawMs / 1000, ease: "easeInOut" }}
          />
        ))}
    </svg>
  );
}

type LeafProps = {
  leaf: BranchNavLeaf;
  active: boolean;
  onSelect: (leaf: BranchNavLeaf) => void;
  className?: string;
};

function LeafControl({ leaf, active, onSelect, className }: LeafProps) {
  const classes = cn(ITEM_CLASS, active && "font-medium text-foreground", className);
  const content = (
    <>
      {leaf.icon}
      <span>{leaf.label}</span>
    </>
  );
  if (leaf.href !== undefined) {
    return (
      <a
        href={leaf.href}
        className={classes}
        aria-current={active ? "page" : undefined}
        onClick={() => onSelect(leaf)}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      aria-current={active ? "page" : undefined}
      onClick={() => onSelect(leaf)}
    >
      {content}
    </button>
  );
}

type SectionProps = Geometry & {
  section: BranchNavSection;
  open: boolean;
  value: string | undefined;
  reduced: boolean;
  drawMs: number;
  foldMs: number;
  onToggle: () => void;
  onSelect: (leaf: BranchNavLeaf) => void;
};

function SectionPanel(props: SectionProps) {
  const { section, value, reduced, drawMs, onSelect, ...geo } = props;
  const { rowHeight, indent } = geo;
  const activeIndex = section.children.findIndex((child) => child.value === value);
  return (
    <div className="relative">
      <Lines
        count={section.children.length}
        activeIndex={activeIndex}
        drawMs={drawMs}
        reduced={reduced}
        {...geo}
      />
      <ul>
        {section.children.map((child, i) => (
          <li
            key={child.value}
            data-slot="branch-nav-item"
            className="relative flex items-center"
            style={{ height: rowHeight, paddingLeft: indent }}
          >
            {i === activeIndex && (
              <span
                aria-hidden="true"
                className="absolute rounded-full bg-primary"
                style={{
                  width: MARKER_SIZE,
                  height: MARKER_SIZE,
                  left: indent - MARKER_GAP - MARKER_SIZE / 2,
                }}
              />
            )}
            <LeafControl leaf={child} active={i === activeIndex} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section(props: SectionProps) {
  const panelId = useId();
  const { section, open, reduced, foldMs, onToggle, rowHeight } = props;
  const panel = <SectionPanel {...props} />;
  return (
    <li data-slot="branch-nav-section">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(ITEM_CLASS, "gap-2 font-medium text-[0.9375rem] text-foreground")}
        style={{ height: rowHeight }}
      >
        {section.icon}
        <span>{section.label}</span>
      </button>
      {reduced ? (
        open && <div id={panelId}>{panel}</div>
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="panel"
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: foldMs / 1000, ease: "easeInOut" }}
            >
              {panel}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </li>
  );
}

/** Menu de documentação em árvore, com tronco, galhos e destaque desenhado até o item ativo. */
function BranchNav({
  ref,
  className,
  items,
  value,
  defaultValue,
  defaultOpen = 0,
  onValueChange,
  onToggle,
  rowHeight = 32,
  indent = 32,
  trunkX = 12,
  radius = 8,
  drawMs = 400,
  foldMs = 300,
  "aria-label": ariaLabel = "Navegação",
  ...props
}: BranchNavProps) {
  const reduced = useShouldReduceMotion();
  const [open, setOpen] = useState(() => normalizeOpen(defaultOpen, items.length));
  const [inner, setInner] = useState(() => initialValue(items, open, defaultValue));
  const current = value ?? inner;
  const geo: Geometry = { rowHeight, indent, trunkX, radius };

  const select = (leaf: BranchNavLeaf) => {
    setInner(leaf.value);
    onValueChange?.(leaf.value, leaf);
  };
  const toggle = (index: number) => {
    const next = new Set(open);
    const willOpen = !next.has(index);
    if (willOpen) next.add(index);
    else next.delete(index);
    setOpen(next);
    onToggle?.(index, willOpen);
  };

  return (
    <nav
      ref={ref}
      data-slot="branch-nav"
      aria-label={ariaLabel}
      className={cn("select-none", className)}
      {...props}
    >
      <ul>
        {items.map((item, index) =>
          isSection(item) ? (
            <Section
              key={item.label}
              section={item}
              open={open.has(index)}
              value={current}
              reduced={reduced}
              drawMs={drawMs}
              foldMs={foldMs}
              onToggle={() => toggle(index)}
              onSelect={select}
              {...geo}
            />
          ) : (
            <li key={item.value} data-slot="branch-nav-item" style={{ height: rowHeight }}>
              <LeafControl
                leaf={item}
                active={item.value === current}
                onSelect={select}
                className="h-full font-medium text-[0.9375rem]"
              />
            </li>
          )
        )}
      </ul>
    </nav>
  );
}

BranchNav.displayName = "BranchNav";

export { BranchNav };
