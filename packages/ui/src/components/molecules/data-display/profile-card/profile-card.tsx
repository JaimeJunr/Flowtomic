/**
 * ProfileCard Component - Flowtomic UI
 *
 * Cartão de perfil em retrato que inclina em 3D com o ponteiro, com faixas
 * holográficas e um reflexo que acompanham a inclinação e um halo atrás.
 * Só mouse e caneta reagem; em toque e com movimento reduzido o cartão fica parado.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/profile-card.md
 */

"use client";

import { animate } from "motion/react";
import * as React from "react";

import { Button } from "@/components/atoms/actions/button";
import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import { lerpState, type PointerState, pointerState, REST_STATE } from "./profile-card-utils";

export type ProfileCardProps = Omit<React.ComponentProps<"article">, "title"> & {
  /** Foto principal (img com alt). */
  avatar: React.ReactNode;
  name: string;
  title: string;
  handle?: string;
  status?: string;
  /** Miniatura da barra; padrão: nada. */
  miniAvatar?: React.ReactNode;
  contactLabel?: string;
  onContact?: () => void;
  showInfo?: boolean;
  glow?: boolean;
  tilt?: boolean;
  /** Inclinação máxima em graus. */
  maxTilt?: number;
};

const LEAVE_DURATION_S = 0.6;

function isHoverPointer(event: React.PointerEvent): boolean {
  return event.pointerType === "mouse" || event.pointerType === "pen";
}

function writeVars(el: HTMLElement, state: PointerState, tilt: boolean) {
  el.style.setProperty("--px", `${state.px}%`);
  el.style.setProperty("--py", `${state.py}%`);
  if (!tilt) return;
  el.style.setProperty("--rx", `${state.rx}deg`);
  el.style.setProperty("--ry", `${state.ry}deg`);
}

// As variáveis vão direto no DOM, um quadro por vez, para não re-renderizar a cada move.
// As variáveis ficam na raiz para o halo (irmão do cartão) também enxergá-las.
function usePointerVars(
  rootRef: React.RefObject<HTMLElement | null>,
  innerRef: React.RefObject<HTMLDivElement | null>,
  tilt: boolean,
  maxTilt: number
) {
  const current = React.useRef<PointerState>(REST_STATE);
  const frame = React.useRef(0);
  const leaving = React.useRef<{ stop: () => void } | null>(null);

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      leaving.current?.stop();
    },
    []
  );

  const follow = React.useCallback(
    (x: number, y: number) => {
      const card = innerRef.current;
      const el = rootRef.current;
      if (!card || !el) return;
      leaving.current?.stop();
      current.current = pointerState(card.getBoundingClientRect(), x, y, maxTilt);
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => writeVars(el, current.current, tilt));
    },
    [rootRef, innerRef, tilt, maxTilt]
  );

  const release = React.useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    const from = current.current;
    leaving.current?.stop();
    leaving.current = animate(0, 1, {
      duration: LEAVE_DURATION_S,
      ease: "easeOut",
      onUpdate: (t) => {
        current.current = lerpState(from, REST_STATE, t);
        writeVars(el, current.current, tilt);
      },
    });
  }, [rootRef, tilt]);

  return { follow, release };
}

const HOLO_BANDS =
  "repeating-linear-gradient(115deg, var(--primary) 0%, var(--accent) 12%, var(--secondary) 24%, var(--primary) 36%)";

function ProfileCard({
  ref,
  className,
  avatar,
  name,
  title,
  handle,
  status,
  miniAvatar,
  contactLabel = "Falar",
  onContact,
  showInfo = true,
  glow = true,
  tilt = true,
  maxTilt = 14,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  style,
  ...props
}: ProfileCardProps) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = useShouldReduceMotion();
  const [active, setActive] = React.useState(false);
  const { follow, release } = usePointerVars(rootRef, innerRef, tilt && !reduceMotion, maxTilt);

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const handleEnter = (event: React.PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);
    if (reduceMotion || !isHoverPointer(event)) return;
    setActive(true);
  };
  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || !isHoverPointer(event)) return;
    follow(event.clientX, event.clientY);
  };
  const handleLeave = (event: React.PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    if (!active) return;
    setActive(false);
    release();
  };

  return (
    <article
      data-slot="profile-card"
      data-active={active ? "true" : "false"}
      aria-label={`Perfil de ${name}`}
      ref={setRefs}
      style={{ "--px": "50%", "--py": "50%", ...style } as React.CSSProperties}
      className={cn("relative inline-block [perspective:900px]", className)}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    >
      {glow ? <Glow active={active} /> : null}
      <div
        data-slot="profile-card-inner"
        ref={innerRef}
        className="relative aspect-[0.72] w-80 select-none overflow-hidden rounded-3xl border bg-card shadow-xl [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
      >
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-secondary to-card" />
        <div
          className="absolute inset-x-0 bottom-0 flex h-[78%] items-end [&>*]:max-h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
          data-slot="profile-card-avatar"
        >
          {avatar}
        </div>
        <Holo active={active} />
        <Reflection />
        <header className="absolute inset-x-0 top-0 p-6 text-center">
          <h3 className="font-display text-2xl font-semibold">{name}</h3>
          <p className="text-muted-foreground">{title}</p>
        </header>
        {showInfo ? (
          <InfoBar
            name={name}
            handle={handle}
            status={status}
            miniAvatar={miniAvatar}
            contactLabel={contactLabel}
            onContact={onContact}
          />
        ) : null}
      </div>
    </article>
  );
}
ProfileCard.displayName = "ProfileCard";

function Glow({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="profile-card-glow"
      className="pointer-events-none absolute -inset-8 rounded-[32px] blur-2xl transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle at var(--px, 50%) var(--py, 50%), var(--primary), transparent 65%)",
        opacity: active ? 0.6 : 0,
      }}
    />
  );
}

function Holo({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="profile-card-holo"
      className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-500"
      style={{
        backgroundImage: HOLO_BANDS,
        backgroundSize: "300% 300%",
        backgroundPosition: "var(--px, 50%) var(--py, 50%)",
        opacity: active ? 0.8 : 0.35,
      }}
    />
  );
}

function Reflection() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{
        background:
          "radial-gradient(circle at var(--px, 50%) var(--py, 50%), var(--background), transparent 55%)",
      }}
    />
  );
}

type InfoBarProps = Pick<
  ProfileCardProps,
  "name" | "handle" | "status" | "miniAvatar" | "onContact"
> & { contactLabel: string };

function InfoBar({ name, handle, status, miniAvatar, contactLabel, onContact }: InfoBarProps) {
  return (
    <div
      data-slot="profile-card-info"
      className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl border bg-background/70 px-3 py-2 backdrop-blur"
    >
      {miniAvatar ? (
        <div className="size-10 shrink-0 overflow-hidden rounded-full">{miniAvatar}</div>
      ) : null}
      <div className="min-w-0 flex-1 text-xs">
        {handle ? <p className="truncate font-medium">@{handle}</p> : null}
        {status ? <p className="truncate text-muted-foreground">{status}</p> : null}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onContact}
        aria-label={`${contactLabel} com ${name}`}
      >
        {contactLabel}
      </Button>
    </div>
  );
}

export { ProfileCard };
