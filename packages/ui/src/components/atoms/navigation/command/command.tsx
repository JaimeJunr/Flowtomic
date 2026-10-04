import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Search } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export type CommandProps = React.ComponentProps<typeof CommandPrimitive>;
export type CommandDialogProps = React.ComponentProps<typeof CommandPrimitive.Dialog>;
export type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input>;
export type CommandListProps = React.ComponentProps<typeof CommandPrimitive.List>;
export type CommandEmptyProps = React.ComponentProps<typeof CommandPrimitive.Empty>;
export type CommandGroupProps = React.ComponentProps<typeof CommandPrimitive.Group>;
export type CommandItemProps = React.ComponentProps<typeof CommandPrimitive.Item>;
export type CommandShortcutProps = React.ComponentProps<"span">;
export type CommandSeparatorProps = React.ComponentProps<typeof CommandPrimitive.Separator>;

/**
 * Command - Container principal do command
 */
function Command({ className, ...props }: CommandProps) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  );
}
Command.displayName = "Command";

/**
 * CommandDialog - Dialog do command
 */
const CommandDialog = ({ ...props }: CommandDialogProps) => (
  <CommandPrimitive.Dialog data-slot="command-dialog" {...props} />
);
CommandDialog.displayName = "CommandDialog";

/**
 * CommandInput - Input do command
 */
function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}
CommandInput.displayName = "CommandInput";

/**
 * CommandList - Lista do command
 */
function CommandList({ className, ...props }: CommandListProps) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}
CommandList.displayName = "CommandList";

/**
 * CommandEmpty - Empty state do command
 */
function CommandEmpty({ ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}
CommandEmpty.displayName = "CommandEmpty";

/**
 * CommandGroup - Grupo do command
 */
function CommandGroup({ className, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
CommandGroup.displayName = "CommandGroup";

/**
 * CommandSeparator - Separador do command
 */
function CommandSeparator({ className, alwaysRender, ...props }: CommandSeparatorProps) {
  // O CommandPrimitive.Separator força role="separator", que dentro do listbox viola
  // aria-required-children. A linha é só visual; repete só o "some durante a busca" dele.
  const searching = useCommandState((state) => state.search !== "");
  if (searching && !alwaysRender) return null;
  return (
    <div
      data-slot="command-separator"
      cmdk-separator=""
      role="none"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}
CommandSeparator.displayName = "CommandSeparator";

/**
 * CommandItem - Item do command
 */
function CommandItem({ className, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
CommandItem.displayName = "CommandItem";

/**
 * CommandShortcut - Atalho do command
 */
const CommandShortcut = ({ className, ...props }: CommandShortcutProps) => {
  return (
    <span
      data-slot="command-shortcut"
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
