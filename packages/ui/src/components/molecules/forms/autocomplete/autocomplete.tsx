/**
 * Autocomplete Component - Flowtomic UI
 *
 * Componente de autocomplete usando hook headless useAutocomplete
 * Suporta API antiga (options) e composição (Compound Components)
 */

// Hooks Flowtomic
import { type AutocompleteOption, useAutocomplete } from "flowtomic/logic";
// Ícones
import { ChevronDownIcon, XIcon } from "lucide-react";
// React e types
import * as React from "react";

// Utils
import { cn } from "@/lib/utils";

import { Spinner } from "../../../atoms/animation/spinner/spinner";
// Feedback/Overlay
import { Popover, PopoverContent, PopoverTrigger } from "../../../atoms/feedback/popover/popover";
import { inputVariants } from "../../../atoms/forms/input/input";

// Context/Composição
import { AutocompleteContext, type AutocompleteContextValue } from "./autocomplete-context";
import { AutocompleteItem } from "./autocomplete-item";
import { AutocompleteSection } from "./autocomplete-section";

export interface AutocompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange" | "defaultValue"
  > {
  // API antiga (compatibilidade)
  options?: AutocompleteOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  // Props do Flowtomic
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  inputClassName?: string;
  emptyMessage?: string;
  filterFunction?: (option: AutocompleteOption, searchTerm: string) => boolean;
  allowCustomValue?: boolean;
  // Props adicionais
  isLoading?: boolean;
  maxListboxHeight?: string;
  // Composição
  children?: React.ReactNode;
}

const AutocompleteRoot = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      options = [],
      value: controlledValue,
      defaultValue,
      onValueChange,
      placeholder = "Selecione uma opção...",
      disabled = false,
      size = "default",
      className,
      inputClassName,
      emptyMessage = "Nenhum resultado encontrado.",
      filterFunction,
      allowCustomValue = false,
      isLoading = false,
      maxListboxHeight = "300px",
      children,
      id,
      ...props
    },
    ref
  ) => {
    // Determinar se está usando composição
    const useComposition = children !== undefined;

    // Hook headless
    const hookReturn = useAutocomplete({
      options: useComposition ? undefined : options,
      value: controlledValue,
      defaultValue,
      onValueChange,
      filterFunction,
      allowCustomValue,
      isLoading,
      emptyMessage,
      children: useComposition ? children : undefined,
    });

    const {
      inputValue: _inputValue,
      selectedValue,
      isOpen,
      filteredItems,
      getInputProps,
      getPopoverProps,
      getListProps,
      getItemProps,
      open: _open,
      close: _close,
      clear,
    } = hookReturn;

    // Input props
    const inputProps = getInputProps({
      ...props,
      id,
      placeholder,
      disabled,
      className: cn(inputVariants({ size }), "pr-8", inputClassName),
    });

    // Context value
    const contextValue: AutocompleteContextValue = {
      ...hookReturn,
      size,
      disabled,
      maxListboxHeight,
      emptyMessage,
    };

    return (
      <AutocompleteContext.Provider value={contextValue}>
        <div className={cn("relative w-full", className)}>
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative">
                <input {...inputProps} ref={ref} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                  {selectedValue && !disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        clear();
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="text-muted-foreground hover:text-foreground rounded-sm p-1 opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-events-auto"
                    >
                      <XIcon className="size-4" />
                      <span className="sr-only">Limpar</span>
                    </button>
                  )}
                  <ChevronDownIcon
                    className={cn(
                      "size-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              {...getPopoverProps()}
              className={cn(
                "bg-popover text-popover-foreground",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2",
                "data-[side=top]:slide-in-from-bottom-2",
                "relative z-50",
                "min-w-[var(--radix-popover-trigger-width)] w-full",
                "overflow-hidden rounded-md border shadow-md p-0"
              )}
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              <div style={{ maxHeight: maxListboxHeight }} className="overflow-auto">
                {isLoading ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <Spinner className="mx-auto mb-2" />
                    Carregando...
                  </div>
                ) : useComposition ? (
                  children
                ) : filteredItems.length > 0 ? (
                  <ul {...getListProps()} className="p-1 outline-none">
                    {filteredItems.map((item: AutocompleteOption) => {
                      const itemProps = getItemProps(item);
                      return (
                        <li
                          key={item.value}
                          {...itemProps}
                          className={cn(
                            "cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                            "hover:bg-accent focus:bg-accent",
                            item.disabled && "pointer-events-none opacity-50",
                            itemProps.className
                          )}
                        >
                          {item.label}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AutocompleteContext.Provider>
    );
  }
);

AutocompleteRoot.displayName = "Autocomplete";

// Subcomponentes para composição
const AutocompleteList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AutocompleteContext);
    if (!context) {
      throw new Error("AutocompleteList must be used within Autocomplete component");
    }
    const { getListProps } = context;

    return (
      <ul {...getListProps()} {...props} ref={ref} className={cn("p-1 outline-none", className)}>
        {children}
      </ul>
    );
  }
);

AutocompleteList.displayName = "AutocompleteList";

const AutocompleteEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(AutocompleteContext);
    if (!context) {
      throw new Error("AutocompleteEmpty must be used within Autocomplete component");
    }
    const { emptyMessage } = context;

    return (
      <div
        ref={ref}
        {...props}
        className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      >
        {children || emptyMessage}
      </div>
    );
  }
);

AutocompleteEmpty.displayName = "AutocompleteEmpty";

const AutocompleteLoading = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      >
        {children || (
          <>
            <Spinner className="mx-auto mb-2" />
            Carregando...
          </>
        )}
      </div>
    );
  }
);

AutocompleteLoading.displayName = "AutocompleteLoading";

// Exportar componente composto
export const Autocomplete = Object.assign(AutocompleteRoot, {
  List: AutocompleteList,
  Empty: AutocompleteEmpty,
  Loading: AutocompleteLoading,
  Item: AutocompleteItem,
  Section: AutocompleteSection,
});

// AutocompleteProps já está exportado acima
