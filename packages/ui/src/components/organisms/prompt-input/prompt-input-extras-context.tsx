"use client";

import { motion } from "motion/react";
import {
  createContext,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type SparkSpec, sparkLayout, typingEnergy } from "./prompt-input-extras-utils";

export type MenuAria = { expanded: boolean; controls?: string; activeDescendant?: string };
export type EffortState = { max: boolean; sparks: boolean };
export type KeyHandler = (event: KeyboardEvent<HTMLTextAreaElement>) => boolean;

export type PromptInputExtras = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  menuAria: MenuAria | null;
  setMenuAria: (owner: string, state: MenuAria | null) => void;
  registerKeyHandler: (handler: KeyHandler) => () => void;
  runKeyHandlers: (event: KeyboardEvent<HTMLTextAreaElement>) => boolean;
  effort: EffortState | null;
  setEffort: (state: EffortState | null) => void;
  noteKeystroke: () => void;
  subscribeKeystroke: (listener: () => void) => () => void;
};

export const PromptInputExtrasContext = createContext<PromptInputExtras | null>(null);

export const useOptionalPromptInputExtras = () => useContext(PromptInputExtrasContext);

export function usePromptInputExtras(consumer: string): PromptInputExtras {
  const extras = useContext(PromptInputExtrasContext);
  if (!extras) {
    throw new Error(
      `${consumer} must be rendered inside <PromptInput>, but no PromptInput was found`
    );
  }
  return extras;
}

function sameAria(a: MenuAria | undefined, b: MenuAria | null): boolean {
  if (!a || !b) {
    return a === undefined && b === null;
  }
  return (
    a.expanded === b.expanded &&
    a.controls === b.controls &&
    a.activeDescendant === b.activeDescendant
  );
}

/** Estado compartilhado entre o PromptInput, o textarea e as peças opcionais (menus, esforço). */
export function usePromptInputExtrasStore(): PromptInputExtras {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const handlers = useRef(new Set<KeyHandler>());
  const keystrokeListeners = useRef(new Set<() => void>());
  const [ariaByOwner, setAriaByOwner] = useState<Record<string, MenuAria>>({});
  const [effort, setEffortState] = useState<EffortState | null>(null);

  const setMenuAria = useCallback((owner: string, state: MenuAria | null) => {
    setAriaByOwner((prev) => {
      if (sameAria(prev[owner], state)) {
        return prev;
      }
      const { [owner]: _removed, ...rest } = prev;
      return state ? { ...rest, [owner]: state } : rest;
    });
  }, []);

  const setEffort = useCallback((state: EffortState | null) => {
    setEffortState((prev) =>
      prev?.max === state?.max && prev?.sparks === state?.sparks ? prev : state
    );
  }, []);

  const registerKeyHandler = useCallback((handler: KeyHandler) => {
    handlers.current.add(handler);
    return () => {
      handlers.current.delete(handler);
    };
  }, []);

  const runKeyHandlers = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    for (const handler of handlers.current) {
      if (handler(event)) {
        return true;
      }
    }
    return false;
  }, []);

  const noteKeystroke = useCallback(() => {
    for (const listener of keystrokeListeners.current) {
      listener();
    }
  }, []);

  const subscribeKeystroke = useCallback((listener: () => void) => {
    keystrokeListeners.current.add(listener);
    return () => {
      keystrokeListeners.current.delete(listener);
    };
  }, []);

  const menuAria = useMemo<MenuAria | null>(() => {
    const all = Object.values(ariaByOwner);
    return all.find((state) => state.expanded) ?? all[0] ?? null;
  }, [ariaByOwner]);

  return useMemo(
    () => ({
      textareaRef,
      menuAria,
      setMenuAria,
      registerKeyHandler,
      runKeyHandlers,
      effort,
      setEffort,
      noteKeystroke,
      subscribeKeystroke,
    }),
    [
      menuAria,
      setMenuAria,
      registerKeyHandler,
      runKeyHandlers,
      effort,
      setEffort,
      noteKeystroke,
      subscribeKeystroke,
    ]
  );
}

const SPARK_COUNT = 12;
const SPARK_SEED = 17;
const SPARK_RISE_PX = 72;

/** Faíscas do nível máximo: a energia de digitação acelera e acende as existentes, sem criar novas. */
export function PromptInputSparkLayer({
  subscribeKeystroke,
}: {
  subscribeKeystroke: PromptInputExtras["subscribeKeystroke"];
}) {
  const specs = useMemo<SparkSpec[]>(() => sparkLayout(SPARK_COUNT, SPARK_SEED), []);
  const [energy, setEnergy] = useState(0);
  const last = useRef({ energy: 0, at: 0 });

  useEffect(
    () =>
      subscribeKeystroke(() => {
        const now = performance.now();
        const next = typingEnergy(last.current.energy, now - last.current.at, true);
        last.current = { energy: next, at: now };
        setEnergy(next);
      }),
    [subscribeKeystroke]
  );

  useEffect(() => {
    if (energy === 0) {
      return;
    }
    const id = setInterval(() => {
      setEnergy(typingEnergy(last.current.energy, performance.now() - last.current.at, false));
    }, 120);
    return () => clearInterval(id);
  }, [energy]);

  return (
    <div
      data-slot="prompt-input-spark-layer"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {specs.map((spark, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: layout fixo e determinístico, nunca reordena
          key={index}
          className="absolute bottom-0 block"
          style={{ left: `${spark.left}%`, opacity: 0.5 + 0.5 * energy }}
        >
          <motion.span
            data-slot="prompt-input-spark"
            aria-hidden="true"
            className="block size-1 rounded-full bg-primary"
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: [0, -SPARK_RISE_PX], x: [0, spark.drift] }}
            transition={{
              duration: spark.duration / (1 + energy * 1.5),
              delay: spark.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        </span>
      ))}
    </div>
  );
}
