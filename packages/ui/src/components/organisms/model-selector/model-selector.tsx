/**
 * ModelSelector Component - Flowtomic UI
 *
 * Componente de model selector dialog
 */

import type { ComponentProps, ReactNode } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../atoms";

export type ModelSelectorProps = ComponentProps<typeof Dialog>;

export const ModelSelector = (props: ModelSelectorProps) => <Dialog {...props} />;
ModelSelector.displayName = "ModelSelector";

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => (
  <DialogTrigger {...props} />
);
ModelSelectorTrigger.displayName = "ModelSelectorTrigger";

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const ModelSelectorContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ModelSelectorContentProps
>(({ className, children, title = "Model Selector", ...props }, ref) => (
  <DialogContent ref={ref} className={cn("p-0", className)} {...props}>
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">{children}</Command>
  </DialogContent>
));
ModelSelectorContent.displayName = "ModelSelectorContent";

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog {...props} />
);
ModelSelectorDialog.displayName = "ModelSelectorDialog";

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = React.forwardRef<
  React.ElementRef<typeof CommandInput>,
  ModelSelectorInputProps
>(({ className, ...props }, ref) => (
  <CommandInput ref={ref} className={cn("h-auto py-3.5", className)} {...props} />
));
ModelSelectorInput.displayName = "ModelSelectorInput";

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = (props: ModelSelectorListProps) => <CommandList {...props} />;
ModelSelectorList.displayName = "ModelSelectorList";

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => <CommandEmpty {...props} />;
ModelSelectorEmpty.displayName = "ModelSelectorEmpty";

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => <CommandGroup {...props} />;
ModelSelectorGroup.displayName = "ModelSelectorGroup";

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = (props: ModelSelectorItemProps) => <CommandItem {...props} />;
ModelSelectorItem.displayName = "ModelSelectorItem";

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = (props: ModelSelectorShortcutProps) => (
  <CommandShortcut {...props} />
);
ModelSelectorShortcut.displayName = "ModelSelectorShortcut";

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ModelSelectorSeparator = (props: ModelSelectorSeparatorProps) => (
  <CommandSeparator {...props} />
);
ModelSelectorSeparator.displayName = "ModelSelectorSeparator";

export type ModelSelectorLogoProps = Omit<ComponentProps<"img">, "src" | "alt"> & {
  provider:
    | "moonshotai-cn"
    | "lucidquery"
    | "moonshotai"
    | "zai-coding-plan"
    | "alibaba"
    | "xai"
    | "vultr"
    | "nvidia"
    | "upstage"
    | "groq"
    | "github-copilot"
    | "mistral"
    | "vercel"
    | "nebius"
    | "deepseek"
    | "alibaba-cn"
    | "google-vertex-anthropic"
    | "venice"
    | "chutes"
    | "cortecs"
    | "github-models"
    | "togetherai"
    | "azure"
    | "baseten"
    | "huggingface"
    | "opencode"
    | "fastrouter"
    | "google"
    | "google-vertex"
    | "cloudflare-workers-ai"
    | "inception"
    | "wandb"
    | "openai"
    | "zhipuai-coding-plan"
    | "perplexity"
    | "openrouter"
    | "zenmux"
    | "v0"
    | "iflowcn"
    | "synthetic"
    | "deepinfra"
    | "zhipuai"
    | "submodel"
    | "zai"
    | "inference"
    | "requesty"
    | "morph"
    | "lmstudio"
    | "anthropic"
    | "aihubmix"
    | "fireworks-ai"
    | "modelscope"
    | "llama"
    | "scaleway"
    | "amazon-bedrock"
    | "cerebras"
    | (string & {});
};

export const ModelSelectorLogo = React.forwardRef<HTMLImageElement, ModelSelectorLogoProps>(
  ({ provider, className, ...props }, ref) => (
    <img
      ref={ref}
      {...props}
      alt={`${provider} logo`}
      className={cn("size-3", className)}
      height={12}
      src={`https://models.dev/logos/${provider}.svg`}
      width={12}
    />
  )
);
ModelSelectorLogo.displayName = "ModelSelectorLogo";

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = React.forwardRef<HTMLDivElement, ModelSelectorLogoGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "-space-x-1 flex shrink-0 items-center [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 [&>img]:ring-border",
        className
      )}
      {...props}
    />
  )
);
ModelSelectorLogoGroup.displayName = "ModelSelectorLogoGroup";

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = React.forwardRef<HTMLSpanElement, ModelSelectorNameProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("flex-1 truncate text-left", className)} {...props} />
  )
);
ModelSelectorName.displayName = "ModelSelectorName";
