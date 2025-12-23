/**
 * Tabs Component - Flowtomic UI
 *
 * Componente de abas baseado em Radix UI com animações naturais
 */

import { useAnimatedIndicator } from "@flowtomic/logic";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "@/lib/utils";

// Contexto para compartilhar estado do indicador entre TabsList e TabsTrigger
interface TabsContextValue {
  registerTrigger: (element: HTMLButtonElement | null, value: string) => void;
  unregisterTrigger: (value: string) => void;
  activeValue: string | undefined;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { indicatorStyle, registerElement, unregisterElement, activeValue } = useAnimatedIndicator({
    containerRef: listRef as React.RefObject<HTMLElement>,
    activeSelector: '[data-state="active"]',
    getElementValue: (element: HTMLElement) => {
      // Buscar o valor do atributo data-value ou do value do botão
      return element.getAttribute("data-value") || element.getAttribute("value") || "";
    },
  });

  const registerTrigger = React.useCallback(
    (element: HTMLButtonElement | null, value: string) => {
      registerElement(element, value);
    },
    [registerElement]
  );

  const unregisterTrigger = React.useCallback(
    (value: string) => {
      unregisterElement(value);
    },
    [unregisterElement]
  );

  const contextValue = React.useMemo(
    () => ({
      registerTrigger,
      unregisterTrigger,
      activeValue,
    }),
    [registerTrigger, unregisterTrigger, activeValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsPrimitive.List
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          listRef.current = node;
        }}
        className={cn(
          "relative inline-flex h-10 items-center justify-center rounded-lg bg-muted/50 p-1 text-muted-foreground",
          className
        )}
        {...props}
      >
        {props.children}
        <motion.div
          className="absolute rounded-md bg-primary/10"
          initial={false}
          animate={
            shouldReduceMotion
              ? {
                  opacity: indicatorStyle.opacity,
                }
              : {
                  x: indicatorStyle.left,
                  y: indicatorStyle.top,
                  width: indicatorStyle.width,
                  height: indicatorStyle.height,
                  opacity: indicatorStyle.opacity,
                }
          }
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
            mass: 0.5,
          }}
          style={{
            pointerEvents: "none",
            zIndex: 0,
            left: 0,
            top: 0,
          }}
        />
      </TabsPrimitive.List>
    </TabsContext.Provider>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (context && value) {
      context.registerTrigger(triggerRef.current, value);
      return () => {
        context.unregisterTrigger(value);
      };
    }
  }, [context, value]);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        triggerRef.current = node;
        if (context && value && node) {
          // Adicionar data-value para o hook conseguir identificar
          node.setAttribute("data-value", value);
          context.registerTrigger(node, value);
        }
      }}
      value={value}
      data-value={value}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{props.children}</span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, value, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <TabsPrimitive.Content
      ref={ref}
      value={value}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
      asChild
    >
      <motion.div
        key={value}
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 8,
              }
        }
        animate={
          shouldReduceMotion
            ? false
            : {
                opacity: 1,
                y: 0,
              }
        }
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.5,
        }}
      >
        {props.children}
      </motion.div>
    </TabsPrimitive.Content>
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
