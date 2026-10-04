// API inspirada no Bubble do shadcn-ui/chatbot-template (MIT) — ver packages/ui/THIRD_PARTY_NOTICES.md.
// Reescrito sobre Radix Slot, sem @base-ui/react.
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type BubbleVariant = "muted" | "tinted" | "outline" | "destructive";
type BubbleAlign = "start" | "end";

interface BubbleContextValue {
  variant: BubbleVariant;
  align: BubbleAlign;
}

const BubbleContext = React.createContext<BubbleContextValue>({ variant: "muted", align: "end" });

const bubbleContentVariants = cva(
  "w-fit max-w-full rounded-2xl px-4 py-2.5 text-left text-[15px] leading-relaxed break-words outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&:is(a,button)]:cursor-pointer",
  {
    variants: {
      variant: {
        muted: "bg-muted text-foreground [&:is(a,button)]:hover:bg-surface-hover",
        tinted: "bg-primary/10 text-primary [&:is(a,button)]:hover:bg-primary/15",
        outline:
          "border border-border bg-background text-foreground [&:is(a,button)]:hover:bg-muted",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

export interface BubbleGroupProps extends React.ComponentProps<"div"> {}

function BubbleGroup({ className, ...props }: BubbleGroupProps) {
  return (
    <div data-slot="bubble-group" className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

BubbleGroup.displayName = "BubbleGroup";

export interface BubbleProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof bubbleContentVariants> {
  /** Lado da conversa: `end` para quem escreve, `start` para o outro lado. */
  align?: BubbleAlign;
}

function Bubble({ className, variant, align = "end", ...props }: BubbleProps) {
  const resolvedVariant = variant ?? "muted";
  return (
    <BubbleContext.Provider value={{ variant: resolvedVariant, align }}>
      <div
        data-slot="bubble"
        data-variant={resolvedVariant}
        data-align={align}
        className={cn(
          "flex max-w-[80%] flex-col",
          align === "end" ? "items-end self-end" : "items-start self-start",
          className
        )}
        {...props}
      />
    </BubbleContext.Provider>
  );
}

Bubble.displayName = "Bubble";

export interface BubbleContentProps extends React.ComponentProps<"div"> {
  /** Renderiza o filho (`<button>`, `<a>`) com o visual do balão. */
  asChild?: boolean;
}

function BubbleContent({ className, asChild = false, ...props }: BubbleContentProps) {
  const { variant } = React.useContext(BubbleContext);
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="bubble-content"
      className={cn(bubbleContentVariants({ variant }), className)}
      {...props}
    />
  );
}

BubbleContent.displayName = "BubbleContent";

export interface BubbleReactionsProps extends React.ComponentProps<"div"> {}

function BubbleReactions({ className, ...props }: BubbleReactionsProps) {
  const { align } = React.useContext(BubbleContext);
  return (
    // biome-ignore lint/a11y/useSemanticElements: reações são botões de alternância, não campos de formulário; fieldset traria semântica de form
    <div
      role="group"
      data-slot="bubble-reactions"
      // Sobe sobre a borda de baixo do balão, do mesmo lado dele.
      className={cn(
        "relative -mt-2.5 flex items-center gap-1 px-3",
        align === "end" ? "self-end" : "self-start",
        className
      )}
      {...props}
    />
  );
}

BubbleReactions.displayName = "BubbleReactions";

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleContentVariants };
