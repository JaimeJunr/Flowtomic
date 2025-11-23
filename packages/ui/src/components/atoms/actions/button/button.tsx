import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps, motion, type Transition } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success-hover",
        info: "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover",
        natural:
          "bg-background text-foreground border border-input shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "transition">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animated?: boolean;
  transition?: Transition;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, animated = false, transition, ...props }, ref) => {
    const baseClassName = cn(buttonVariants({ variant, size, className }));

    if (animated && !asChild) {
      const { onDrag: _onDrag, ...motionProps } = props;
      return (
        <motion.button
          ref={ref}
          className={baseClassName}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={
            transition || {
              type: "spring",
              stiffness: 400,
              damping: 17,
            }
          }
          {...(motionProps as Omit<HTMLMotionProps<"button">, "onDrag" | "ref">)}
        />
      );
    }

    if (asChild) {
      return <Slot className={baseClassName} ref={ref} {...props} />;
    }
    return <button className={baseClassName} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
