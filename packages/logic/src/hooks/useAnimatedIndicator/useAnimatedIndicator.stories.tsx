import type { Meta, StoryObj } from "@storybook/react-vite";
import { motion, useReducedMotion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";
import { useAnimatedIndicator } from "./index";

/**
 * Story demonstrando o uso do hook useAnimatedIndicator
 * Este hook é headless - fornece apenas lógica, sem UI
 */
const meta = {
  title: "Flowtomic Logic/Hooks/useAnimatedIndicator",
  component: () => null,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Hook headless que fornece lógica para animação de indicador que se move entre elementos. Você controla o markup e styles.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Componente de demonstração que usa o hook
 */
function AnimatedIndicatorDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const items = ["Home", "Work", "Calendar", "Settings"];

  const { indicatorStyle, registerElement } = useAnimatedIndicator({
    containerRef: containerRef as React.RefObject<HTMLElement>,
    activeSelector: '[data-active="true"]',
    getElementValue: (element) => {
      return element.getAttribute("data-index") || "";
    },
  });

  return (
    <div className="space-y-8">
      <div
        ref={containerRef}
        className="relative inline-flex items-center gap-2 rounded-lg bg-muted p-2"
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item}
              type="button"
              data-active={isActive}
              data-index={index.toString()}
              ref={(el) => registerElement(el, index.toString())}
              onClick={() => setActiveIndex(index)}
              className={`relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          );
        })}
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
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <AnimatedIndicatorDemo />,
};
