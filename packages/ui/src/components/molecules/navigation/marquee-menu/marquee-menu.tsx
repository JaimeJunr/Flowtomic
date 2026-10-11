"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { type MarqueeMenuItem, MarqueeMenuItemView } from "./marquee-menu-parts";
import { assertSpeed } from "./marquee-menu-utils";

export type { MarqueeMenuItem };

export type MarqueeMenuProps = React.ComponentProps<"nav"> & {
  /** Itens do menu, pelo menos um. */
  items: MarqueeMenuItem[];
  /** Segundos por volta do letreiro. Precisa ser maior que 0. */
  speed?: number;
};

function MarqueeMenu({ items, speed = 15, className, ref, ...props }: MarqueeMenuProps) {
  assertSpeed(speed);
  if (items.length < 1) {
    throw new Error(`MarqueeMenu: items recebido com ${items.length} itens, esperado pelo menos 1`);
  }

  return (
    <nav
      ref={ref}
      data-slot="marquee-menu"
      className={cn("h-full w-full select-none bg-background text-foreground", className)}
      {...props}
    >
      <ul className="m-0 flex h-full list-none flex-col p-0">
        {items.map((item, index) => (
          <MarqueeMenuItemView
            key={item.href}
            item={item}
            last={index === items.length - 1}
            speed={speed}
          />
        ))}
      </ul>
    </nav>
  );
}
MarqueeMenu.displayName = "MarqueeMenu";

export { MarqueeMenu };
