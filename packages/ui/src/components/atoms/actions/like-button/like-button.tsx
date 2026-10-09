/**
 * LikeButton Component - Flowtomic UI
 *
 * Pílula de curtir com ícone e contador: ao curtir o ícone encolhe até um
 * ponto, troca de contorno para preenchido e volta passando do tamanho; a
 * pílula dá uma leve batida e só o dígito que mudou rola no contador.
 * Baseado em @radix-ui/react-toggle e motion/react.
 *
 * Implementação clean room — spec em docs/clean-room/react-bits/like-button.md
 */

"use client";

import * as TogglePrimitive from "@radix-ui/react-toggle";
import { Heart, Star, ThumbsUp } from "lucide-react";
import { motion, useAnimationControls } from "motion/react";
import * as React from "react";

import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
import { cn } from "@/lib/utils";
import {
  beatKeyframes,
  diffDigits,
  formatCount,
  likeScaleKeyframes,
  SWAP_AT,
} from "./like-button-utils";

type LikeSize = "sm" | "default" | "lg";
type LikeIcon = "heart" | "star" | "thumb" | React.ReactNode;

export type LikeButtonProps = Omit<
  React.ComponentProps<typeof TogglePrimitive.Root>,
  "children" | "onChange" | "pressed" | "defaultPressed" | "onPressedChange" | "asChild"
> & {
  liked?: boolean;
  defaultLiked?: boolean;
  /** Contagem exibida; o clique soma ou tira 1. */
  count?: number;
  onLikedChange?: (liked: boolean, count: number) => void;
  /** false vira um círculo só com o ícone. */
  showCount?: boolean;
  icon?: LikeIcon;
  /** Contorno no estado neutro; false = sólido apagado. */
  idleOutline?: boolean;
  size?: LikeSize;
  /** Duração da corrida do ícone; a troca é sempre em 40%. */
  durationMs?: number;
  /** Fração do tamanho no ponto da troca. */
  dotSize?: number;
  /** Quanto passa do tamanho na volta. 0 = sem rebote. */
  overshoot?: number;
  /** Porcentagem da batida da pílula. */
  beat?: number;
  rollDurationMs?: number;
  /** Nome acessível; a contagem é acrescentada. */
  label?: string;
};

const SIZE_CLASSES: Record<LikeSize, { pill: string; circle: string; icon: string }> = {
  sm: { pill: "h-8 gap-1.5 px-3 text-xs", circle: "size-8", icon: "size-4" },
  default: { pill: "h-9 gap-2 px-3.5 text-sm", circle: "size-9", icon: "size-5" },
  lg: { pill: "h-11 gap-2 px-4 text-base", circle: "size-11", icon: "size-6" },
};

const ICONS = { heart: Heart, star: Star, thumb: ThumbsUp } as const;

function renderIcon(icon: LikeIcon, className: string): React.ReactNode {
  if (typeof icon === "string" && icon in ICONS) {
    const Icon = ICONS[icon as keyof typeof ICONS];
    return <Icon aria-hidden="true" className={className} />;
  }
  return icon;
}

type RollingCountProps = { text: string; direction: 1 | -1; changed: number[]; duration: number };

/** Só os glifos que mudaram remontam e rolam; os demais ficam parados. */
function RollingCount({ text, direction, changed, duration }: RollingCountProps) {
  const chars = Array.from(text);
  return (
    <span
      data-slot="like-button-count"
      aria-hidden="true"
      className="inline-flex overflow-hidden tabular-nums text-secondary-foreground"
    >
      {chars.map((char, index) => {
        const fromRight = chars.length - 1 - index;
        const rolls = changed.includes(fromRight);
        return (
          <motion.span
            key={`${fromRight}-${char}`}
            className="inline-block"
            initial={rolls ? { y: `${direction * 100}%`, opacity: 0 } : false}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration }}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}

function useLastValue<T>(value: T): T {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/** Contagem interna que acompanha a prop quando ela muda por fora. */
function useSyncedCount(prop: number): [number, (next: number) => void] {
  const [state, setState] = React.useState({ prop, value: prop });
  if (state.prop !== prop) setState({ prop, value: prop });
  return [state.value, (next) => setState({ prop, value: next })];
}

/** Botão de curtir com corrida do ícone, batida da pílula e contador que rola. */
function LikeButton({
  ref,
  className,
  liked: likedProp,
  defaultLiked = false,
  count: countProp = 0,
  onLikedChange,
  showCount = true,
  icon = "heart",
  idleOutline = true,
  size = "default",
  durationMs = 560,
  dotSize = 0.3,
  overshoot = 1.7,
  beat = 3,
  rollDurationMs = 350,
  label = "Curtir",
  disabled,
  ...props
}: LikeButtonProps) {
  const reduced = useShouldReduceMotion();
  const controlled = likedProp !== undefined;
  const [innerLiked, setInnerLiked] = React.useState(defaultLiked);
  const [innerCount, setInnerCount] = useSyncedCount(countProp);
  const liked = controlled ? likedProp : innerLiked;
  const shownCount = controlled ? countProp : innerCount;

  const iconControls = useAnimationControls();
  const pillControls = useAnimationControls();
  const racing = React.useRef(false);
  const [visualLiked, setVisualLiked] = React.useState(liked);

  // A troca visual acompanha a corrida (40%); mudança externa assenta direto.
  React.useEffect(() => {
    if (!racing.current || reduced) {
      racing.current = false;
      setVisualLiked(liked);
      return;
    }
    racing.current = false;
    const timer = setTimeout(() => setVisualLiked(liked), durationMs * SWAP_AT);
    return () => clearTimeout(timer);
  }, [liked, reduced, durationMs]);

  const text = formatCount(shownCount);
  const prevText = useLastValue(text);
  const prevCount = useLastValue(shownCount);
  const changed = reduced ? [] : diffDigits(prevText, text);

  const handlePressedChange = (next: boolean) => {
    const nextCount = shownCount + (next ? 1 : -1);
    racing.current = true;
    // Se o pai (modo controlado) recusar o clique, a marca não pode sobrar para uma mudança externa depois.
    queueMicrotask(() => {
      racing.current = false;
    });
    if (!controlled) {
      setInnerLiked(next);
      setInnerCount(nextCount);
    }
    if (!reduced) runRace();
    onLikedChange?.(next, nextCount);
  };

  const runRace = () => {
    const seconds = durationMs / 1000;
    const scale = likeScaleKeyframes(dotSize, overshoot);
    const pill = beatKeyframes(beat);
    iconControls.start({
      scale: scale.values,
      transition: { duration: seconds, times: scale.times, ease: "easeInOut" },
    });
    pillControls.start({
      scale: pill.values,
      transition: { duration: seconds, times: pill.times, ease: "easeInOut" },
    });
  };

  const sizes = SIZE_CLASSES[size];
  const iconClass = cn(
    sizes.icon,
    visualLiked
      ? "fill-current text-primary"
      : cn("text-muted-foreground", !idleOutline && "fill-current")
  );

  return (
    <TogglePrimitive.Root
      asChild
      pressed={liked}
      onPressedChange={handlePressedChange}
      disabled={disabled}
    >
      <motion.button
        ref={ref}
        type="button"
        data-slot="like-button"
        data-state={liked ? "on" : "off"}
        aria-label={`${label}, ${text}`}
        animate={pillControls}
        className={cn(
          "inline-flex select-none items-center justify-center rounded-full bg-secondary font-medium outline-none transition-[box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          showCount ? sizes.pill : sizes.circle,
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        <motion.span
          data-slot="like-button-icon"
          data-liked={visualLiked ? "true" : "false"}
          aria-hidden="true"
          animate={iconControls}
          className="inline-flex items-center justify-center"
        >
          {renderIcon(icon, iconClass)}
        </motion.span>
        {showCount && (
          <RollingCount
            text={text}
            direction={shownCount >= prevCount ? 1 : -1}
            changed={changed}
            duration={rollDurationMs / 1000}
          />
        )}
      </motion.button>
    </TogglePrimitive.Root>
  );
}

LikeButton.displayName = "LikeButton";

export { LikeButton };
