/**
 * AnnouncementBar - Flowtomic UI
 *
 * Faixa de aviso de largura total, logo abaixo do cabeçalho: ícone, texto e link centralizados,
 * com botão de fechar. O fechamento pode ser lembrado em `localStorage` (`storageKey`).
 * Fechar anima a altura até 0; com movimento reduzido, a faixa some seco.
 */

"use client";

import { X } from "lucide-react";
import { AnimatePresence, MotionConfigContext, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type AnnouncementBarProps = Omit<React.ComponentProps<"aside">, "children"> & {
  /** O texto do aviso. */
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: { label: React.ReactNode; href: string };
  /** @default true */
  dismissible?: boolean;
  /** Se dado, o fechamento fica guardado em `localStorage` e a faixa não volta. */
  storageKey?: string;
  /** Controlado: com `open`, o estado fica por conta de quem usa. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
  /** Nome da região para leitor de tela. @default "Aviso" */
  label?: string;
};

function wasDismissed(storageKey: string | undefined): boolean {
  if (!storageKey) return false;
  try {
    return window.localStorage.getItem(storageKey) === "1";
  } catch {
    return false;
  }
}

/** Faixa de aviso dispensável, com ação opcional. */
function AnnouncementBar({
  children,
  icon,
  action,
  dismissible = true,
  storageKey,
  open,
  onOpenChange,
  onDismiss,
  label = "Aviso",
  className,
  ...props
}: AnnouncementBarProps) {
  const [innerOpen, setInnerOpen] = React.useState(() => !wasDismissed(storageKey));
  const visible = open ?? innerOpen;
  const prefersReduced = useReducedMotion();
  const motionConfig = React.useContext(MotionConfigContext);
  const reduceMotion = Boolean(prefersReduced) || motionConfig.reducedMotion === "always";

  const dismiss = () => {
    onDismiss?.();
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, "1");
      } catch {
        // storage indisponível: o aviso só some desta vez
      }
    }
    if (open === undefined) setInnerOpen(false);
    onOpenChange?.(false);
  };

  const bar = (
    <aside
      data-slot="announcement-bar"
      aria-label={label}
      className={cn(
        "relative border-b border-[color-mix(in_oklch,var(--primary)_25%,var(--border))] bg-[color-mix(in_oklch,var(--primary)_8%,var(--background))] px-4 py-2.5 text-sm text-foreground",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mx-auto flex items-start justify-center gap-2 text-center",
          dismissible && "px-8"
        )}
      >
        {icon && (
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-primary [&_svg:not([class*='size-'])]:size-4"
          >
            {icon}
          </span>
        )}
        <p className="min-w-0">
          <span>{children}</span>
          {action && (
            <>
              {" "}
              <a
                data-slot="announcement-bar-action"
                href={action.href}
                className="font-medium text-primary underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {action.label}
              </a>
            </>
          )}
        </p>
      </div>
      {dismissible && (
        <button
          type="button"
          data-slot="announcement-bar-dismiss"
          aria-label="Fechar aviso"
          onClick={dismiss}
          className="absolute top-1/2 right-3 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </aside>
  );

  if (reduceMotion) return visible ? bar : null;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="announcement-bar"
          style={{ overflow: "hidden" }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {bar}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
AnnouncementBar.displayName = "AnnouncementBar";

export { AnnouncementBar };
