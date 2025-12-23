/**
 * useAutocomplete - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * function MyCustomAutocomplete() {
 *   const {
 *     inputValue,
 *     selectedValue,
 *     isOpen,
 *     filteredItems,
 *     getInputProps,
 *     getPopoverProps,
 *     getListProps,
 *     getItemProps,
 *     open,
 *     close,
 *     select,
 *     clear,
 *   } = useAutocomplete({
 *     options: [
 *       { value: "1", label: "Option 1" },
 *       { value: "2", label: "Option 2" },
 *     ],
 *   });
 *
 *   return (
 *     <div>
 *       <input {...getInputProps()} />
 *       {isOpen && (
 *         <div {...getPopoverProps()}>
 *           <ul {...getListProps()}>
 *             {filteredItems.map((item) => (
 *               <li key={item.value} {...getItemProps(item)}>
 *                 {item.label}
 *               </li>
 *             ))}
 *           </ul>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface AutocompleteOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UseAutocompleteOptions {
  /**
   * Opções para seleção (API antiga)
   */
  options?: AutocompleteOption[];

  /**
   * Valor selecionado (controlado)
   */
  value?: string;

  /**
   * Valor padrão (não controlado)
   */
  defaultValue?: string;

  /**
   * Callback quando o valor muda
   */
  onValueChange?: (value: string | undefined) => void;

  /**
   * Função de filtro customizada
   */
  filterFunction?: (option: AutocompleteOption, searchTerm: string) => boolean;

  /**
   * Permite valores customizados (não presentes nas opções)
   */
  allowCustomValue?: boolean;

  /**
   * Estado de loading
   */
  isLoading?: boolean;

  /**
   * Mensagem quando não há resultados
   */
  emptyMessage?: string;

  /**
   * Children para composição (modo compound components)
   */
  children?: React.ReactNode;
}

export interface UseAutocompleteReturn {
  /**
   * Valor atual do input
   */
  inputValue: string;

  /**
   * Valor selecionado
   */
  selectedValue: string | undefined;

  /**
   * Se o popover está aberto
   */
  isOpen: boolean;

  /**
   * Items filtrados baseado no inputValue
   */
  filteredItems: AutocompleteOption[];

  /**
   * Índice do item destacado (para navegação por teclado)
   */
  highlightedIndex: number;

  /**
   * Estado de loading
   */
  isLoading: boolean;

  /**
   * Se não há items para exibir
   */
  isEmpty: boolean;

  /**
   * Abre o popover
   */
  open: () => void;

  /**
   * Fecha o popover
   */
  close: () => void;

  /**
   * Seleciona um valor
   */
  select: (value: string) => void;

  /**
   * Limpa a seleção
   */
  clear: () => void;

  /**
   * Define o valor do input
   */
  setInputValue: (value: string) => void;

  /**
   * Helper para props do input
   */
  getInputProps: (props?: React.InputHTMLAttributes<HTMLInputElement>) => Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "value"
    | "onChange"
    | "onFocus"
    | "onBlur"
    | "onKeyDown"
    | "aria-expanded"
    | "aria-autocomplete"
    | "aria-controls"
    | "aria-activedescendant"
    | "role"
  > & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: React.FocusEventHandler<HTMLInputElement>;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    "aria-expanded": boolean;
    "aria-autocomplete": "list";
    "aria-controls": string;
    "aria-activedescendant": string | undefined;
    role: "combobox";
  };

  /**
   * Helper para props do popover
   */
  getPopoverProps: (props?: React.ComponentProps<"div">) => React.ComponentProps<"div"> & {
    "aria-label": string;
    role: "listbox";
  };

  /**
   * Helper para props da lista
   */
  getListProps: (
    props?: React.HTMLAttributes<HTMLUListElement>
  ) => React.HTMLAttributes<HTMLUListElement> & {
    id: string;
    role: "listbox";
    "aria-label": string;
  };

  /**
   * Helper para props de um item
   */
  getItemProps: (
    item: AutocompleteOption,
    props?: React.HTMLAttributes<HTMLLIElement>
  ) => Omit<
    React.HTMLAttributes<HTMLLIElement>,
    "role" | "aria-selected" | "aria-disabled" | "id" | "onClick" | "onMouseEnter"
  > & {
    role: "option";
    "aria-selected": boolean;
    "aria-disabled": boolean;
    id: string;
    onClick: (e: React.MouseEvent<HTMLLIElement>) => void;
    onMouseEnter: (e: React.MouseEvent<HTMLLIElement>) => void;
  };

  /**
   * Extrai items dos children (para modo composição)
   */
  extractItemsFromChildren: (children: React.ReactNode) => AutocompleteOption[];
}

/**
 * Função de filtro padrão (case-insensitive)
 */
function defaultFilter(option: AutocompleteOption, searchTerm: string): boolean {
  return option.label.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Extrai items dos children em modo composição
 */
function extractItemsFromChildren(children: React.ReactNode): AutocompleteOption[] {
  const items: AutocompleteOption[] = [];

  const processChild = (child: React.ReactNode) => {
    if (!React.isValidElement(child)) {
      return;
    }

    const props = child.props as Record<string, unknown>;

    // Se tiver prop 'value', é um Autocomplete.Item
    if (props.value !== undefined) {
      const value = String(props.value);
      let label = value;

      // Extrair o texto dos children
      if (props.children !== undefined && props.children !== null) {
        if (typeof props.children === "string") {
          label = props.children;
        } else if (typeof props.children === "number") {
          label = String(props.children);
        } else if (React.isValidElement(props.children)) {
          const childProps = props.children.props as Record<string, unknown>;
          if (typeof childProps?.children === "string") {
            label = childProps.children;
          } else {
            label = String(props.children);
          }
        } else if (Array.isArray(props.children)) {
          React.Children.forEach(props.children as React.ReactNode, (c) => {
            if (typeof c === "string" && label === value) {
              label = c;
            }
          });
        } else {
          label = String(props.children);
        }
      }

      items.push({
        value,
        label,
        disabled: props.disabled as boolean | undefined,
      });
      return;
    }

    // Se tiver prop 'title', é um AutocompleteSection - processar seus children
    if (props.title !== undefined) {
      if (props.children) {
        React.Children.forEach(props.children as React.ReactNode, processChild);
      }
      return;
    }

    // Se tiver children mas não é Item nem Section, processar recursivamente
    if (props.children !== undefined && props.children !== null) {
      if (
        typeof props.children === "string" ||
        typeof props.children === "number" ||
        typeof props.children === "boolean"
      ) {
        return;
      }

      if (Array.isArray(props.children) || React.isValidElement(props.children)) {
        React.Children.forEach(props.children as React.ReactNode, processChild);
      } else if (typeof props.children === "object") {
        React.Children.forEach(props.children as React.ReactNode, processChild);
      }
    }
  };

  React.Children.forEach(children, processChild);

  return items;
}

/**
 * Hook Headless UI para Autocomplete
 *
 * Fornece apenas a lógica e API, sem markup ou styles.
 * Você é responsável por criar o visual.
 */
export function useAutocomplete(options: UseAutocompleteOptions = {}): UseAutocompleteReturn {
  const {
    options: providedOptions = [],
    value: controlledValue,
    defaultValue,
    onValueChange,
    filterFunction = defaultFilter,
    allowCustomValue = false,
    isLoading = false,
    emptyMessage: _emptyMessage = "Nenhum resultado encontrado.",
    children,
  } = options;

  // Determinar se está usando composição ou API antiga
  const useComposition = children !== undefined;

  // Estado interno
  const [inputValue, setInputValueState] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    controlledValue ?? defaultValue
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Determinar se é controlado
  const isControlled = controlledValue !== undefined;

  // Extrair items dos children se em modo composição
  const itemsFromChildren = useMemo(() => {
    if (!useComposition) return [];
    return extractItemsFromChildren(children);
  }, [useComposition, children]);

  // Items disponíveis (API antiga ou composição)
  const allItems = useMemo(() => {
    if (useComposition) {
      return itemsFromChildren;
    }
    return providedOptions;
  }, [useComposition, itemsFromChildren, providedOptions]);

  // Filtrar items baseado no inputValue
  const filteredItems = useMemo(() => {
    if (!inputValue.trim()) {
      return allItems;
    }
    return allItems.filter((item) => filterFunction(item, inputValue));
  }, [allItems, inputValue, filterFunction]);

  // Estado derivado
  const isEmpty = filteredItems.length === 0 && !isLoading;

  // IDs para acessibilidade
  const listIdRef = useRef(`autocomplete-list-${React.useId()}`);
  const listId = listIdRef.current;

  // Sincronizar com valor controlado
  useEffect(() => {
    if (isControlled && controlledValue !== undefined) {
      const option = allItems.find((opt) => opt.value === controlledValue);
      if (option) {
        setSelectedValue(controlledValue);
        setInputValueState(option.label);
      } else {
        setSelectedValue(undefined);
        setInputValueState(controlledValue);
      }
    }
  }, [isControlled, controlledValue, allItems]);

  // Sincronizar inputValue quando seleção muda (apenas para API antiga)
  useEffect(() => {
    if (!useComposition && selectedValue) {
      const option = allItems.find((opt) => opt.value === selectedValue);
      if (option && inputValue !== option.label) {
        setInputValueState(option.label);
      }
    }
  }, [selectedValue, allItems, useComposition, inputValue]);

  // Controles
  const open = useCallback(() => {
    if (filteredItems.length > 0 || isLoading) {
      setIsOpen(true);
    }
  }, [filteredItems.length, isLoading]);

  const close = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const select = useCallback(
    (value: string) => {
      const option = allItems.find((opt) => opt.value === value);
      if (option) {
        setSelectedValue(value);
        setInputValueState(option.label);
        onValueChange?.(value);
        close();
      } else if (allowCustomValue) {
        setSelectedValue(value);
        setInputValueState(value);
        onValueChange?.(value);
        close();
      }
    },
    [allItems, allowCustomValue, onValueChange, close]
  );

  const clear = useCallback(() => {
    setSelectedValue(undefined);
    setInputValueState("");
    onValueChange?.(undefined);
    close();
  }, [onValueChange, close]);

  const setInputValue = useCallback(
    (value: string) => {
      setInputValueState(value);
      if (value.trim() && (filteredItems.length > 0 || isLoading)) {
        setIsOpen(true);
      } else if (!value.trim()) {
        setIsOpen(false);
      }
    },
    [filteredItems.length, isLoading]
  );

  // Helpers de props
  const getInputProps = useCallback(
    (
      props: React.InputHTMLAttributes<HTMLInputElement> = {}
    ): React.InputHTMLAttributes<HTMLInputElement> & {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onFocus: () => void;
      onBlur: () => void;
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      "aria-expanded": boolean;
      "aria-autocomplete": "list";
      "aria-controls": string;
      "aria-activedescendant": string | undefined;
      role: "combobox";
    } => {
      const highlightedItem = filteredItems[highlightedIndex];
      const activeDescendant = highlightedItem
        ? `${listId}-item-${highlightedItem.value}`
        : undefined;

      const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        open();
        props.onFocus?.(e);
      };

      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Delay para permitir cliques nos items
        setTimeout(() => {
          // Não fechar o popover no onBlur - deixar o Popover gerenciar o fechamento
          // O Popover do Radix UI já gerencia o fechamento quando você clica fora
          // via onOpenChange. Fechar aqui causa conflito e comportamento inconsistente.
          props.onBlur?.(e);
        }, 200);
      };

      return {
        ...(props as Record<string, unknown>),
        value: inputValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value);
          props.onChange?.(e);
        },
        onFocus: handleFocus,
        onBlur: handleBlur,
        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (isOpen) {
              setHighlightedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
            } else {
              open();
            }
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (isOpen) {
              setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            }
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (isOpen && highlightedItem) {
              select(highlightedItem.value);
            } else if (isOpen && filteredItems.length === 1) {
              select(filteredItems[0].value);
            } else if (allowCustomValue && inputValue.trim()) {
              select(inputValue);
            }
          } else if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
          props.onKeyDown?.(e);
        },
        "aria-expanded": isOpen,
        "aria-autocomplete": "list",
        "aria-controls": listId,
        "aria-activedescendant": activeDescendant,
        role: "combobox",
      } as ReturnType<typeof getInputProps>;
    },
    [
      inputValue,
      isOpen,
      filteredItems,
      highlightedIndex,
      listId,
      open,
      close,
      select,
      allowCustomValue,
      setInputValue,
    ]
  );

  const getPopoverProps = useCallback(
    (
      props: React.ComponentProps<"div"> = {}
    ): React.ComponentProps<"div"> & {
      "aria-label": string;
      role: "listbox";
    } => {
      return {
        ...props,
        "aria-label": "Lista de opções",
        role: "listbox",
      };
    },
    []
  );

  const getListProps = useCallback(
    (
      props: React.HTMLAttributes<HTMLUListElement> = {}
    ): React.HTMLAttributes<HTMLUListElement> & {
      id: string;
      role: "listbox";
      "aria-label": string;
    } => {
      return {
        ...props,
        id: listId,
        role: "listbox",
        "aria-label": "Opções disponíveis",
      };
    },
    [listId]
  );

  const getItemProps = useCallback(
    (
      item: AutocompleteOption,
      props: React.HTMLAttributes<HTMLLIElement> = {}
    ): React.HTMLAttributes<HTMLLIElement> & {
      role: "option";
      "aria-selected": boolean;
      "aria-disabled": boolean;
      id: string;
      onClick: () => void;
      onMouseEnter: () => void;
    } => {
      const itemId = `${listId}-item-${item.value}`;
      const isSelected = selectedValue === item.value;
      const isHighlighted = filteredItems[highlightedIndex]?.value === item.value;

      const handleClick = (e: React.MouseEvent<HTMLLIElement>) => {
        if (!item.disabled) {
          select(item.value);
        }
        props.onClick?.(e);
      };

      const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>) => {
        const index = filteredItems.findIndex((i) => i.value === item.value);
        if (index >= 0) {
          setHighlightedIndex(index);
        }
        props.onMouseEnter?.(e);
      };

      return {
        ...(props as Record<string, unknown>),
        role: "option",
        "aria-selected": isSelected,
        "aria-disabled": item.disabled ?? false,
        id: itemId,
        onClick: handleClick,
        onMouseEnter: handleMouseEnter,
        className:
          `${props.className || ""} ${isHighlighted ? "bg-accent" : ""} ${isSelected ? "font-semibold" : ""}`.trim(),
      } as ReturnType<typeof getItemProps>;
    },
    [listId, selectedValue, filteredItems, highlightedIndex, select]
  );

  return {
    inputValue,
    selectedValue,
    isOpen,
    filteredItems,
    highlightedIndex,
    isLoading,
    isEmpty,
    open,
    close,
    select,
    clear,
    setInputValue,
    getInputProps,
    getPopoverProps,
    getListProps,
    getItemProps,
    extractItemsFromChildren,
  };
}
