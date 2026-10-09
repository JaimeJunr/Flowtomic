"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  type ComponentProps,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { usePromptInputExtras } from "./prompt-input-extras-context";
import {
  filterItems,
  findTrigger,
  type PromptInputMenuItem,
  type PromptInputTrigger,
  type TriggerMatch,
} from "./prompt-input-extras-utils";

export type { PromptInputMenuItem } from "./prompt-input-extras-utils";

export type PromptInputTriggerMenuProps = {
  trigger: PromptInputTrigger;
  items: PromptInputMenuItem[];
  /** Padrão: troca o "@consulta" ou "/consulta" digitado por `${trigger}${item.label} `. */
  onSelect?: (item: PromptInputMenuItem, api: { insert: (text: string) => void }) => void;
  emptyLabel?: string;
  className?: string;
};

// O React só enxerga a mudança se ela passar pelo setter nativo do textarea
function writeTextarea(el: HTMLTextAreaElement, value: string, caret: number): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.setSelectionRange(caret, caret);
}

function defaultInsertion(trigger: PromptInputTrigger, item: PromptInputMenuItem): string {
  const token = item.label.startsWith(trigger) ? item.label : `${trigger}${item.label}`;
  return `${token} `;
}

function optionId(menuId: string, key: string): string {
  return `${menuId}-option-${key}`;
}

export const PromptInputTriggerMenu = ({
  trigger,
  items,
  onSelect,
  emptyLabel = "Nada encontrado",
  className,
}: PromptInputTriggerMenuProps) => {
  const extras = usePromptInputExtras("PromptInputTriggerMenu");
  const { textareaRef, registerKeyHandler, setMenuAria } = extras;
  const menuId = useId();
  const [match, setMatch] = useState<TriggerMatch | null>(null);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastQuery = useRef<string | undefined>(undefined);

  const open = match !== null && match.start !== dismissedAt;
  const visible = useMemo(() => filterItems(items, match?.query ?? ""), [items, match?.query]);
  const active = visible[Math.min(activeIndex, visible.length - 1)];

  const refresh = useCallback(() => {
    const el = textareaRef.current;
    const next = el ? findTrigger(el.value, el.selectionStart ?? el.value.length, trigger) : null;
    if (next?.query !== lastQuery.current) {
      lastQuery.current = next?.query;
      setActiveIndex(0);
    }
    setMatch((prev) => (prev?.start === next?.start && prev?.query === next?.query ? prev : next));
    if (!next) {
      setDismissedAt(null);
    }
  }, [textareaRef, trigger]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) {
      return;
    }
    const events = ["input", "keyup", "click"] as const;
    for (const name of events) {
      el.addEventListener(name, refresh);
    }
    return () => {
      for (const name of events) {
        el.removeEventListener(name, refresh);
      }
    };
  }, [textareaRef, refresh]);

  const insert = useCallback(
    (text: string) => {
      const el = textareaRef.current;
      if (!el || !match) {
        return;
      }
      const caret = el.selectionStart ?? el.value.length;
      const value = `${el.value.slice(0, match.start)}${text}${el.value.slice(caret)}`;
      writeTextarea(el, value, match.start + text.length);
    },
    [textareaRef, match]
  );

  const choose = useCallback(
    (item: PromptInputMenuItem) => {
      if (onSelect) {
        onSelect(item, { insert });
      } else {
        insert(defaultInsertion(trigger, item));
      }
      textareaRef.current?.focus();
    },
    [onSelect, insert, trigger, textareaRef]
  );

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!open || !match) {
        return false;
      }
      const count = visible.length;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp": {
          event.preventDefault();
          if (count > 0) {
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex((current) => (current + step + count) % count);
          }
          return true;
        }
        case "Enter":
        case "Tab": {
          event.preventDefault();
          if (active) {
            choose(active);
          } else {
            setDismissedAt(match.start);
          }
          return true;
        }
        case "Escape": {
          event.preventDefault();
          setDismissedAt(match.start);
          return true;
        }
        default:
          return false;
      }
    },
    [open, match, visible.length, active, choose]
  );

  useEffect(() => registerKeyHandler(handleKey), [registerKeyHandler, handleKey]);

  useEffect(() => {
    setMenuAria(menuId, {
      expanded: open,
      controls: open ? menuId : undefined,
      activeDescendant: open && active ? optionId(menuId, active.key) : undefined,
    });
  }, [setMenuAria, menuId, open, active]);

  useEffect(() => () => setMenuAria(menuId, null), [setMenuAria, menuId]);

  return (
    <PopoverPrimitive.Root open={open}>
      <PopoverPrimitive.Anchor
        virtualRef={textareaRef as ComponentProps<typeof PopoverPrimitive.Anchor>["virtualRef"]}
      />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          asChild
        >
          <div
            data-slot="prompt-input-trigger-menu"
            id={menuId}
            role="listbox"
            aria-label={trigger === "@" ? "Fontes" : "Comandos"}
            className={cn(
              "z-50 max-h-64 min-w-56 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-hidden",
              className
            )}
          >
            {visible.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</p>
            ) : (
              visible.map((item) => (
                <TriggerOption
                  key={item.key}
                  id={optionId(menuId, item.key)}
                  item={item}
                  selected={item === active}
                  onHover={() => setActiveIndex(visible.indexOf(item))}
                  onChoose={() => choose(item)}
                />
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

PromptInputTriggerMenu.displayName = "PromptInputTriggerMenu";

function TriggerOption({
  id,
  item,
  selected,
  onHover,
  onChoose,
}: {
  id: string;
  item: PromptInputMenuItem;
  selected: boolean;
  onHover: () => void;
  onChoose: () => void;
}) {
  const optionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (selected) {
      optionRef.current?.scrollIntoView?.({ block: "nearest" });
    }
  }, [selected]);

  return (
    <div
      data-slot="prompt-input-trigger-option"
      ref={optionRef}
      id={id}
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden",
        selected && "bg-accent text-accent-foreground"
      )}
      // mousedown não pode tirar o foco do textarea
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={onHover}
      onClick={onChoose}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onChoose();
        }
      }}
    >
      {item.icon ? <span className="shrink-0 [&_svg]:size-4">{item.icon}</span> : null}
      <span className="font-medium">{item.label}</span>
      {item.description ? (
        <span className="truncate text-muted-foreground">{item.description}</span>
      ) : null}
    </div>
  );
}
