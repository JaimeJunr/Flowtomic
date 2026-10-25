/**
 * InstallCommand - Flowtomic UI
 *
 * Pílula com o comando de instalação: prompt, comando em mono e botão de copiar.
 * Opcionalmente traduz o comando (escrito em npm/npx) para o gerenciador escolhido.
 */

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../actions/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../forms/select";
import { type PackageManager, toPackageManager } from "./package-manager";

export type InstallCommandSize = "sm" | "md" | "lg";

export type InstallCommandProps = Omit<ComponentProps<"div">, "children" | "onCopy"> & {
  /** Comando escrito no formato npm/npx */
  command: string;
  /** Prompt antes do comando; `null` esconde. @default "$" */
  prompt?: string | null;
  /** @default "md" */
  size?: InstallCommandSize;
  /** Gerenciadores oferecidos no seletor; sem a lista, o comando fica como está */
  managers?: PackageManager[];
  /** Gerenciador controlado */
  manager?: PackageManager;
  /** Gerenciador inicial (não controlado); padrão o primeiro de `managers` */
  defaultManager?: PackageManager;
  onManagerChange?: (manager: PackageManager) => void;
  /** Lembra a escolha em localStorage */
  persistManager?: boolean;
  onCopy?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
  /** aria-label do grupo @default "Comando de instalação" */
  label?: string;
};

type CopyStatus = "idle" | "copied" | "error";

const STORAGE_KEY = "flowtomic:package-manager";
const FEEDBACK_MS = 2000;
const ALL_MANAGERS: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

const SIZE_CLASSES: Record<InstallCommandSize, string> = {
  sm: "h-8 pl-3 pr-1 text-xs",
  md: "h-10 pl-4 pr-1.5 text-sm",
  lg: "h-12 pl-5 pr-2 text-base",
};

const COPY_SIZE_CLASSES: Record<InstallCommandSize, string> = {
  sm: "size-6",
  md: "size-7",
  lg: "size-8",
};

function readStoredManager(allowed: PackageManager[]): PackageManager | undefined {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return allowed.find((m) => m === stored);
  } catch {
    return undefined;
  }
}

function writeStoredManager(manager: PackageManager): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, manager);
  } catch {
    // localStorage indisponível (modo privado, bloqueio): a escolha só vale na sessão
  }
}

export function InstallCommand({
  command,
  prompt = "$",
  size = "md",
  managers,
  manager: managerProp,
  defaultManager,
  onManagerChange,
  persistManager = false,
  onCopy,
  onCopyError,
  label = "Comando de instalação",
  className,
  ...props
}: InstallCommandProps) {
  const options = managers && managers.length > 0 ? managers : undefined;
  const [internalManager, setInternalManager] = useState<PackageManager | undefined>(
    defaultManager ?? options?.[0]
  );
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const optionsKey = options?.join(",");
  useEffect(() => {
    if (!persistManager || !optionsKey || managerProp) return;
    const stored = readStoredManager(optionsKey.split(",") as PackageManager[]);
    if (stored) setInternalManager(stored);
  }, [persistManager, optionsKey, managerProp]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const current = options ? (managerProp ?? internalManager ?? options[0]) : undefined;
  const text = current ? toPackageManager(command, current) : command;

  const changeManager = (next: string) => {
    const value = next as PackageManager;
    if (managerProp === undefined) setInternalManager(value);
    if (persistManager) writeStoredManager(value);
    onManagerChange?.(value);
  };

  const flash = useCallback((next: CopyStatus) => {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), FEEDBACK_MS);
  }, []);

  const copy = async () => {
    try {
      if (!navigator?.clipboard?.writeText) throw new Error("Clipboard API not available");
      await navigator.clipboard.writeText(text);
      flash("copied");
      onCopy?.(text);
    } catch (error) {
      flash("error");
      onCopyError?.(error);
    }
  };

  const Icon = status === "copied" ? CheckIcon : status === "error" ? XIcon : CopyIcon;
  const buttonLabel = status === "copied" ? "Copiado" : "Copiar comando";
  const announcement =
    status === "copied" ? "Comando copiado" : status === "error" ? "Não deu para copiar" : "";

  return (
    // biome-ignore lint/a11y/useSemanticElements: a spec pede div role="group" (fieldset traz estilo e semântica de formulário)
    <div
      role="group"
      aria-label={label}
      data-slot="install-command"
      data-size={size}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card font-mono text-foreground",
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {options && current && (
        <Select value={current} onValueChange={changeManager}>
          <SelectTrigger
            size="sm"
            aria-label="Gerenciador de pacotes"
            data-slot="install-command-manager"
            className="h-6 w-auto gap-1 rounded-full border-0 bg-transparent px-2 py-0 text-xs shadow-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_MANAGERS.filter((m) => options.includes(m)).map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {prompt !== null && (
        <span
          aria-hidden="true"
          data-slot="install-command-prompt"
          className="select-none text-muted-foreground"
        >
          {prompt}
        </span>
      )}
      <code data-slot="install-command-text" title={text} className="min-w-0 truncate">
        {text}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        data-slot="install-command-copy"
        aria-label={buttonLabel}
        onClick={copy}
        className={cn("shrink-0 rounded-full", COPY_SIZE_CLASSES[size])}
      >
        <Icon size={14} />
      </Button>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
InstallCommand.displayName = "InstallCommand";
