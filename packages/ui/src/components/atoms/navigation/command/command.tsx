import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;
export type CommandDialogProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Dialog>;
export type CommandInputProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;
export type CommandListProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>;
export type CommandEmptyProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>;
export type CommandGroupProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>;
export type CommandItemProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>;
export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;
export type CommandSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

/**
 * Command - Container principal do command
 */
const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, CommandProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  )
);
Command.displayName = CommandPrimitive.displayName;

/**
 * CommandDialog - Dialog do command
 */
const CommandDialog = ({ ...props }: CommandDialogProps) => <CommandPrimitive.Dialog {...props} />;
CommandDialog.displayName = "CommandDialog";

/**
 * CommandInput - Input do command
 */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

/**
 * CommandList - Lista do command
 */
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

/**
 * CommandEmpty - Empty state do command
 */
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(({ ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

/**
 * CommandGroup - Grupo do command
 */
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

/**
 * CommandSeparator - Separador do command
 */
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

/**
 * CommandItem - Item do command
 */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

/**
 * CommandShortcut - Atalho do command
 */
const CommandShortcut = ({ className, ...props }: CommandShortcutProps) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
