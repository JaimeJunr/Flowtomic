/**
 * EnvDiff Component - Flowtomic UI
 *
 * Diff curto de variáveis de ambiente: linhas removidas, adicionadas e de contexto, com borda
 * na cor do tipo e fundo que esmaece da esquerda para a direita.
 */

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { MotionConfigContext, motion, useReducedMotion } from "motion/react";
import { type ComponentProps, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../actions/button";

export type EnvDiffLine = {
  type: "removed" | "added" | "context";
  /** "OPENAI_API_KEY" ou a linha inteira */
  name: string;
  /** Mostrado depois de "=" */
  value?: string;
  /** Troca o valor por uma máscara */
  masked?: boolean;
};

export type EnvDiffProps = Omit<ComponentProps<"div">, "children"> & {
  lines: EnvDiffLine[];
  /** Fundo em degradê que esmaece. Com `false`, o fundo é chapado. @default true */
  fade?: boolean;
  /** Anima a entrada das linhas quando o bloco aparece na tela. @default false */
  animate?: boolean;
  /** Mostra o botão que copia o estado final. @default false */
  copyable?: boolean;
  onCopy?: (text: string) => void;
  /** aria-label do bloco. @default "Diferença nas variáveis de ambiente" */
  label?: string;
};

const MASK = "\u2022".repeat(8);
const STEP_MS = 80;
const PAUSE_MS = 200;

/**
 * Lê um texto no formato de diff (`- X=1`, `+ Y=2`, `  Z=3`). Linhas vazias são ignoradas e o
 * primeiro `=` separa nome e valor.
 */
export function parseEnvDiff(text: string): EnvDiffLine[] {
  const result: EnvDiffLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === "") continue;
    const sign = raw[0];
    let type: EnvDiffLine["type"] = "context";
    let rest = raw;
    if (sign === "-" || sign === "+" || sign === " ") {
      type = sign === "-" ? "removed" : sign === "+" ? "added" : "context";
      rest = raw.slice(1);
      if (rest.startsWith(" ")) rest = rest.slice(1);
    }
    rest = rest.trimEnd();
    if (rest === "") continue;
    const eq = rest.indexOf("=");
    if (eq === -1) result.push({ type, name: rest });
    else result.push({ type, name: rest.slice(0, eq), value: rest.slice(eq + 1) });
  }
  return result;
}

function lineText(line: EnvDiffLine) {
  return line.value === undefined ? line.name : `${line.name}=${line.value}`;
}

const typeClasses = {
  removed: {
    border: "border-destructive",
    text: "text-[color-mix(in_oklab,var(--destructive)_75%,var(--foreground))]",
    fade: "bg-[linear-gradient(to_right,color-mix(in_oklch,var(--destructive)_14%,transparent),transparent)]",
    flat: "bg-[color-mix(in_oklch,var(--destructive)_14%,transparent)]",
    sign: "-",
    sr: "Removido: ",
  },
  added: {
    border: "border-success",
    text: "text-[color-mix(in_oklab,var(--success)_75%,var(--foreground))]",
    fade: "bg-[linear-gradient(to_right,color-mix(in_oklch,var(--success)_14%,transparent),transparent)]",
    flat: "bg-[color-mix(in_oklch,var(--success)_14%,transparent)]",
    sign: "+",
    sr: "Adicionado: ",
  },
  context: {
    border: "border-border",
    text: "text-muted-foreground",
    fade: "",
    flat: "",
    sign: " ",
    sr: "",
  },
} as const;

export function EnvDiff({
  lines,
  fade = true,
  animate = false,
  copyable = false,
  onCopy,
  label = "Diferença nas variáveis de ambiente",
  className,
  ref,
  ...props
}: EnvDiffProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  const [inView, setInView] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Mesmo critério do sliding-number: preferência do sistema ou MotionConfig reducedMotion="always"
  const reducedConfig = useContext(MotionConfigContext).reducedMotion;
  const reduced = useReducedMotion() || reducedConfig === "always";
  const canObserve = typeof IntersectionObserver !== "undefined";
  const animating = animate && !reduced && canObserve;

  const setRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  useEffect(() => {
    if (!animating) return;
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [animating]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const measure = () => setOverflows(node.scrollWidth > node.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const finishCopy = (state: "ok" | "error") => {
    setCopyState(state);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopyState("idle"), 2000);
  };

  const handleCopy = async () => {
    const text = lines
      .filter((line) => line.type !== "removed")
      .map(lineText)
      .join("\n");
    try {
      if (!navigator?.clipboard?.writeText) throw new Error("Clipboard indisponível");
      await navigator.clipboard.writeText(text);
      finishCopy("ok");
      onCopy?.(text);
    } catch {
      finishCopy("error");
    }
  };

  // Atraso de entrada: removidas (e contexto) primeiro, pausa, depois as adicionadas.
  const firstGroup = lines.filter((line) => line.type !== "added").length;
  let firstIndex = 0;
  let secondIndex = 0;
  const delays = lines.map((line) => {
    if (line.type !== "added") return (firstIndex++ * STEP_MS) / 1000;
    const base = firstGroup > 0 ? (firstGroup - 1) * STEP_MS + PAUSE_MS : 0;
    return (base + secondIndex++ * STEP_MS) / 1000;
  });

  const CopyIconNow = copyState === "ok" ? CheckIcon : copyState === "error" ? XIcon : CopyIcon;

  return (
    // biome-ignore lint/a11y/useSemanticElements: a spec pede role="group" no bloco inteiro
    <div
      data-slot="env-diff"
      role="group"
      aria-label={label}
      ref={setRoot}
      className={cn(
        "group relative w-fit min-w-0 max-w-full font-mono text-[0.8125rem] leading-5",
        className
      )}
      {...props}
    >
      <div ref={scrollRef} className="overflow-x-auto" tabIndex={overflows ? 0 : undefined}>
        <ul className="m-0 w-max min-w-full list-none p-0">
          {lines.map((line, index) => {
            const c = typeClasses[line.type];
            const hasValue = line.value !== undefined;
            return (
              <motion.li
                // biome-ignore lint/suspicious/noArrayIndexKey: linhas são posicionais e podem repetir
                key={index}
                data-slot="env-diff-line"
                data-type={line.type}
                initial={animating ? { opacity: 0, x: -4 } : false}
                animate={animating && !inView ? { opacity: 0, x: -4 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: animating ? delays[index] : 0 }}
                className={cn(
                  "flex whitespace-pre border-l-2 px-3",
                  c.border,
                  c.text,
                  fade ? c.fade : c.flat
                )}
              >
                <span aria-hidden="true" className="w-[1ch] shrink-0 select-none">
                  {c.sign}
                </span>
                <span className="pl-[1ch]">
                  {c.sr && <span className="sr-only">{c.sr}</span>}
                  {line.name}
                  {hasValue && (
                    <>
                      <span className="text-muted-foreground">=</span>
                      {line.masked ? (
                        <>
                          <span aria-hidden="true">{MASK}</span>
                          <span className="sr-only">valor oculto</span>
                        </>
                      ) : (
                        line.value
                      )}
                    </>
                  )}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
      {copyable && (
        <>
          <Button
            data-slot="env-diff-copy"
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Copiar resultado"
            onClick={handleCopy}
            className={cn(
              "absolute top-1 right-1 size-7 opacity-0 transition-opacity",
              "group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100",
              "[@media(hover:none)]:opacity-100"
            )}
          >
            <CopyIconNow />
          </Button>
          <span aria-live="polite" className="sr-only">
            {copyState === "error" ? "Não deu para copiar" : ""}
          </span>
        </>
      )}
    </div>
  );
}
