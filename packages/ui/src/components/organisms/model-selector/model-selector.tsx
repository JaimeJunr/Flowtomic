/**
 * ModelSelector Component - Flowtomic UI
 *
 * Componente de model selector dialog
 */

import type * as React from "react";
import type { ComponentProps, ReactNode } from "react";
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

// O Dialog raiz não renderiza elemento próprio, então não há onde pôr o data-slot
export const ModelSelector = (props: ModelSelectorProps) => <Dialog {...props} />;
ModelSelector.displayName = "ModelSelector";

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => (
  <DialogTrigger data-slot="model-selector-trigger" {...props} />
);
ModelSelectorTrigger.displayName = "ModelSelectorTrigger";

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

export const ModelSelectorContent = ({
  className,
  children,
  title = "Seletor de modelo",
  ...props
}: ModelSelectorContentProps) => (
  // Sem descrição: o Radix pede aria-describedby={undefined} explícito para não avisar
  <DialogContent
    data-slot="model-selector-content"
    aria-describedby={undefined}
    className={cn("p-0", className)}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">{children}</Command>
  </DialogContent>
);
ModelSelectorContent.displayName = "ModelSelectorContent";

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog data-slot="model-selector-dialog" {...props} />
);
ModelSelectorDialog.displayName = "ModelSelectorDialog";

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = ({ className, ...props }: ModelSelectorInputProps) => (
  <CommandInput
    data-slot="model-selector-input"
    className={cn("h-auto py-3.5", className)}
    {...props}
  />
);
ModelSelectorInput.displayName = "ModelSelectorInput";

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = (props: ModelSelectorListProps) => (
  <CommandList data-slot="model-selector-list" {...props} />
);
ModelSelectorList.displayName = "ModelSelectorList";

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => (
  <CommandEmpty data-slot="model-selector-empty" {...props} />
);
ModelSelectorEmpty.displayName = "ModelSelectorEmpty";

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => (
  <CommandGroup data-slot="model-selector-group" {...props} />
);
ModelSelectorGroup.displayName = "ModelSelectorGroup";

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = ({ className, ...props }: ModelSelectorItemProps) => (
  <CommandItem data-slot="model-selector-item" className={cn("gap-2", className)} {...props} />
);
ModelSelectorItem.displayName = "ModelSelectorItem";

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = (props: ModelSelectorShortcutProps) => (
  <CommandShortcut data-slot="model-selector-shortcut" {...props} />
);
ModelSelectorShortcut.displayName = "ModelSelectorShortcut";

export type ModelSelectorSeparatorProps = ComponentProps<typeof CommandSeparator>;

export const ModelSelectorSeparator = (props: ModelSelectorSeparatorProps) => (
  <CommandSeparator data-slot="model-selector-separator" {...props} />
);
ModelSelectorSeparator.displayName = "ModelSelectorSeparator";

export type ModelSelectorLogoProps = Omit<ComponentProps<"img">, "src" | "alt" | "ref"> & {
  ref?: React.Ref<HTMLImageElement | HTMLSpanElement>;
  /**
   * Imagem do logo, servida pelo app. Sem ela, aparece a inicial do provedor: a lib não
   * busca logo em site de fora (sumia offline e vazava o uso para terceiros).
   */
  src?: string;
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

export const ModelSelectorLogo = ({
  provider,
  src,
  className,
  ref,
  ...props
}: ModelSelectorLogoProps) => {
  // o nome do modelo já está escrito ao lado: o logo é decorativo nos dois casos
  if (!src) {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        aria-hidden="true"
        data-slot="model-selector-logo"
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-sm bg-muted font-mono text-[10px] font-semibold uppercase leading-none text-muted-foreground",
          className
        )}
      >
        {provider.charAt(0)}
      </span>
    );
  }
  return (
    <img
      ref={ref as React.Ref<HTMLImageElement>}
      {...props}
      alt=""
      data-slot="model-selector-logo"
      className={cn("size-4", className)}
      height={16}
      src={src}
      width={16}
    />
  );
};
ModelSelectorLogo.displayName = "ModelSelectorLogo";

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = ({ className, ...props }: ModelSelectorLogoGroupProps) => (
  <div
    data-slot="model-selector-logo-group"
    className={cn(
      "-space-x-1 flex shrink-0 items-center [&>*]:rounded-full [&>*]:ring-1 [&>*]:ring-border [&>img]:bg-background [&>img]:p-px",
      className
    )}
    {...props}
  />
);
ModelSelectorLogoGroup.displayName = "ModelSelectorLogoGroup";

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = ({ className, ...props }: ModelSelectorNameProps) => (
  <span
    data-slot="model-selector-name"
    className={cn("flex-1 truncate text-left", className)}
    {...props}
  />
);
ModelSelectorName.displayName = "ModelSelectorName";
