/**
 * ChatInput Component - Flowtomic UI
 *
 * Componente de input para chat com suporte a tipos de mensagem,
 * modos customizáveis, contador de caracteres e atalhos de teclado
 */

import { Send } from "lucide-react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms";

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

export interface ChatInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSubmit" | "onChange"> {
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

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
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
      placeholder = "Digite sua mensagem...",
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
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const remaining = maxLength - value.length;

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value]);

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
        <div className="flex items-center gap-2 mb-3">
          {messageTypes.map((type) => (
            <Button
              key={type.value}
              type="button"
              variant={selectedMessageType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => onMessageTypeChange?.(type.value)}
              className={cn(
                "text-xs font-medium transition-colors",
                selectedMessageType === type.value
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {type.icon && <span className="mr-1">{type.icon}</span>}
              {type.label}
            </Button>
          ))}
        </div>
      );
    };

    const renderModeButtons = (): ReactNode => {
      if (!modes || modes.length === 0) return null;

      return (
        <div className="flex items-center gap-3 mb-3">
          {modes.map((mode) => (
            <TooltipProvider key={mode.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={selectedMode === mode.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onModeChange?.(mode.value)}
                    className={cn(
                      "text-sm font-medium transition-all flex items-center gap-2",
                      selectedMode === mode.value
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                    )}
                  >
                    {mode.icon && <span>{mode.icon}</span>}
                    <span className="font-semibold">{mode.label}</span>
                  </Button>
                </TooltipTrigger>
                {mode.description && (
                  <TooltipContent>
                    <p>{mode.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn("border border-gray-700/50 rounded-lg bg-gray-900/40", className)}
        {...props}
      >
        {showHeader && (
          <header className="px-4 py-3 border-b border-gray-700/50 flex items-center gap-2">
            <span className="inline-flex w-5 h-5 items-center justify-center rounded-md bg-purple-600 text-white text-xs">
              ■
            </span>
            <div>
              {headerTitle && <h3 className="text-sm font-medium text-gray-200">{headerTitle}</h3>}
              {headerDescription && (
                <p className="text-[11px] text-gray-400">{headerDescription}</p>
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
            disabled={disabled || isLoading}
            className={cn(
              "w-full min-h-[80px] mb-2 rounded-md bg-gray-900 border border-gray-700",
              "text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500",
              "p-3 resize-none disabled:opacity-50"
            )}
          />

          {/* Footer with counter, indicators and submit button */}
          <div className="flex items-center justify-between pt-3 relative">
            {showCounter && (
              <span
                className={cn(
                  "absolute left-4 bottom-14 text-[12px] font-bold select-none px-2 py-0.5 rounded-full shadow bg-gray-900/50 hover:bg-gray-900 transition-colors hover:cursor-default",
                  remaining > 0
                    ? "text-green-400/70 hover:text-green-400"
                    : "text-red-400/70 hover:text-red-400"
                )}
                style={{ zIndex: 5 }}
              >
                • {remaining} restantes
              </span>
            )}

            {/* Custom indicators */}
            {indicators && (
              <div className="absolute right-4 bottom-14" style={{ zIndex: 5 }}>
                {indicators}
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={!value.trim() || remaining < 0 || disabled || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>
          </div>

          {/* Shortcuts hint */}
          {shortcuts && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              {shortcuts.submit && (
                <span>
                  {shortcuts.submit.replace("Ctrl", "Ctrl").replace("Meta", "Cmd")} para enviar
                </span>
              )}
              {shortcuts.clear && <span>{shortcuts.clear} para limpar</span>}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
