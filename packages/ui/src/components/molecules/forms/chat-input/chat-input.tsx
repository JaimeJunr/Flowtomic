/**
 * ChatInput Component - Flowtomic UI
 *
 * Componente de input para chat com suporte a tipos de mensagem,
 * modos customizáveis, contador de caracteres e atalhos de teclado
 */

import { Send } from "lucide-react";
import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button, Textarea } from "../../../atoms";

export interface MessageTypeOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface ModeOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
}

export interface ChatInputProps extends Omit<ComponentProps<"div">, "onSubmit" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, messageType?: string, mode?: string) => void;
  maxLength?: number;
  messageTypes?: MessageTypeOption[];
  selectedMessageType?: string;
  onMessageTypeChange?: (type: string) => void;
  modes?: ModeOption[];
  selectedMode?: string;
  onModeChange?: (mode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  shortcuts?: { submit?: string; clear?: string };
  indicators?: ReactNode;
  showCounter?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  className?: string;
}

const COUNT = new Intl.NumberFormat("pt-BR");

function counterLabel(remaining: number): string {
  return `${COUNT.format(remaining)} ${remaining === 1 ? "restante" : "restantes"}`;
}

function counterClass(remaining: number, maxLength: number): string {
  if (remaining <= 0) return "text-destructive";
  if (remaining <= maxLength * 0.1) return "text-warning";
  return "text-muted-foreground";
}

// O texto do atalho é exibido como o usuário vê no teclado, não como o nome da tecla no DOM
function shortcutLabel(shortcut: string): string {
  return shortcut.replace("Escape", "Esc").replace("Meta", "Cmd");
}

interface ChoiceOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ChoiceGroupProps {
  label: string;
  options: ChoiceOption[];
  selected?: string;
  onSelect?: (value: string) => void;
  describe?: (value: string) => string | undefined;
}

// Escolha exclusiva (radio) em vez de botão sólido: o único sólido da peça é o Enviar
function ChoiceGroup({ label, options, selected, onSelect, describe }: ChoiceGroupProps) {
  const name = useId();
  return (
    <fieldset className="mb-3 inline-flex w-fit flex-wrap gap-0.5 rounded-lg border border-border p-0.5">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          title={describe?.(option.value)}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors",
            "text-muted-foreground hover:text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            "has-[:checked]:bg-accent has-[:checked]:font-semibold has-[:checked]:text-accent-foreground"
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selected === option.value}
            onChange={() => onSelect?.(option.value)}
            className="sr-only"
          />
          {option.icon && <span aria-hidden="true">{option.icon}</span>}
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  maxLength = 1500,
  messageTypes,
  selectedMessageType,
  onMessageTypeChange,
  modes,
  selectedMode,
  onModeChange,
  placeholder = "Escreva sua mensagem",
  disabled = false,
  isLoading = false,
  shortcuts = { submit: "Ctrl+Enter", clear: "Escape" },
  indicators,
  showCounter = true,
  showHeader = false,
  headerTitle,
  headerDescription,
  className,
  ...props
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = maxLength - value.length;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = () => {
    if (!value.trim() || remaining < 0 || disabled || isLoading) return;
    onSubmit(value.trim(), selectedMessageType, selectedMode);
    onChange("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (shortcuts.submit && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (shortcuts.clear && e.key === "Escape") {
      e.preventDefault();
      onChange("");
    }
  };

  const renderMessageTypeButtons = (): ReactNode => {
    if (!messageTypes || messageTypes.length === 0) return null;
    return (
      <ChoiceGroup
        label="Tipo de mensagem"
        options={messageTypes}
        selected={selectedMessageType}
        onSelect={onMessageTypeChange}
      />
    );
  };

  const renderModeButtons = (): ReactNode => {
    if (!modes || modes.length === 0) return null;
    return (
      <ChoiceGroup
        label="Modo"
        options={modes}
        selected={selectedMode}
        onSelect={onModeChange}
        describe={(value) => modes.find((mode) => mode.value === value)?.description}
      />
    );
  };

  return (
    <div
      data-slot="chat-input"
      className={cn("rounded-[10px] border border-border bg-background", className)}
      {...props}
    >
      {showHeader && (
        <header className="border-b border-border px-4 py-3">
          <div>
            {headerTitle && <h3 className="text-sm font-medium text-foreground">{headerTitle}</h3>}
            {headerDescription && (
              <p className="text-[11px] text-muted-foreground">{headerDescription}</p>
            )}
          </div>
        </header>
      )}
      <div className="p-4">
        {/* Message type buttons */}
        {renderMessageTypeButtons()}

        {/* Mode buttons */}
        {renderModeButtons()}

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-label="Mensagem"
          disabled={disabled || isLoading}
          className={cn(
            "w-full min-h-[80px] mb-3 rounded-md bg-background border border-input",
            "text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            "p-3 resize-none disabled:opacity-50"
          )}
        />

        {/* Footer with counter, indicators and submit button */}
        <div className="flex items-center justify-between">
          {showCounter && (
            <span
              aria-live="polite"
              className={cn("font-mono text-xs", counterClass(remaining, maxLength))}
            >
              {counterLabel(remaining)}
            </span>
          )}

          {/* Custom indicators */}
          {indicators && <div className="ml-auto mr-3">{indicators}</div>}

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || remaining < 0 || disabled || isLoading}
            className={cn("gap-2", !showCounter && !indicators && "ml-auto")}
          >
            <Send className="size-4" aria-hidden="true" />
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </div>

        {/* Shortcuts hint */}
        {shortcuts && (
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            {shortcuts.submit && (
              <span>
                <kbd className="font-mono">{shortcutLabel(shortcuts.submit)}</kbd> envia
              </span>
            )}
            {shortcuts.clear && (
              <span>
                <kbd className="font-mono">{shortcutLabel(shortcuts.clear)}</kbd> limpa
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

ChatInput.displayName = "ChatInput";
