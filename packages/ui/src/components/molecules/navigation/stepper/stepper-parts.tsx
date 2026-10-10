"use client";

import { motion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { type IndicatorStatus, indicatorStatus } from "./stepper-utils";

const CIRCLE_BASE =
  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default";

const CIRCLE_BY_STATUS: Record<IndicatorStatus, string> = {
  upcoming: "bg-muted text-muted-foreground",
  active: "bg-primary text-primary-foreground",
  complete: "bg-primary text-primary-foreground",
};

/** Mesmo tracado do Check do lucide, desenhado por pathLength. */
function CheckMark({ reduced }: { reduced: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

function IndicatorFace({
  status,
  index,
  reduced,
}: {
  status: IndicatorStatus;
  index: number;
  reduced: boolean;
}) {
  if (status === "complete") return <CheckMark reduced={reduced} />;
  if (status === "active") return <span className="size-3 rounded-full bg-primary-foreground" />;
  return <span>{index}</span>;
}

function Connector({ filled, reduced }: { filled: boolean; reduced: boolean }) {
  const width = filled ? "100%" : "0%";
  return (
    <div data-slot="stepper-connector" className="relative mx-2 h-0.5 flex-1 rounded bg-muted">
      <motion.div
        className="absolute inset-y-0 left-0 rounded bg-primary"
        initial={false}
        animate={{ width }}
        transition={reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

export type StepperIndicatorsProps = {
  labels: string[];
  step: number;
  reduced: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
};

export function StepperIndicators({
  labels,
  step,
  reduced,
  disabled,
  onSelect,
}: StepperIndicatorsProps) {
  return (
    <ol className="flex items-center">
      {labels.map((label, i) => {
        const index = i + 1;
        const status = indicatorStatus(index, step);
        return (
          <React.Fragment key={`${index}-${label}`}>
            <li className="flex items-center">
              <button
                type="button"
                data-slot="stepper-indicator"
                data-status={status}
                aria-label={`Passo ${index}: ${label}`}
                aria-current={status === "active" ? "step" : undefined}
                title={label}
                disabled={disabled}
                onClick={() => onSelect(index)}
                className={cn(CIRCLE_BASE, CIRCLE_BY_STATUS[status])}
              >
                <IndicatorFace status={status} index={index} reduced={reduced} />
              </button>
            </li>
            {index < labels.length && (
              <li aria-hidden="true" className="flex flex-1 items-center">
                <Connector filled={index < step} reduced={reduced} />
              </li>
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
