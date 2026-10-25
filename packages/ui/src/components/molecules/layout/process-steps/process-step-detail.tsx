import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/actions/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../atoms/feedback/dialog";
import type { ProcessStepDetail as ProcessStepDetailData } from "./process-steps-types";

/** Texto simples de um ReactNode, para o aria-label do botão. */
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

type ProcessStepDetailProps = {
  stepTitle: React.ReactNode;
  detail: ProcessStepDetailData;
};

/** Botão sobreposto ao passo que abre o carrossel de detalhes numa janela. */
function ProcessStepDetail({ stepTitle, detail }: ProcessStepDetailProps) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const total = detail.slides.length;
  const slide = detail.slides[Math.min(index, total - 1)];

  const go = React.useCallback(
    (next: number) => setIndex(Math.min(Math.max(next, 0), total - 1)),
    [total]
  );

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setIndex(0);
  };

  // No documento, não no DialogContent: ao chegar numa ponta o botão desabilitado perde o foco
  // e as setas deixariam de chegar ao conteúdo.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(index + 1);
      else if (event.key === "ArrowLeft") go(index - 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, index, go]);

  if (!slide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Ver detalhes de ${textOf(stepTitle)}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </DialogTrigger>
      <DialogContent
        data-slot="process-step-detail"
        className="max-w-3xl"
        {...(slide.description ? {} : { "aria-describedby": undefined })}
      >
        <DialogHeader>
          <DialogTitle>{detail.title ?? stepTitle}</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border border-border">{slide.media}</div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold">{slide.title}</p>
            {slide.description ? (
              <DialogDescription className="text-sm text-muted-foreground">
                {slide.description}
              </DialogDescription>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-1.5">
              {detail.slides.map((_item, position) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: slides não têm id
                  key={position}
                  type="button"
                  aria-label={`Slide ${position + 1} de ${total}`}
                  aria-current={position === index ? "true" : undefined}
                  onClick={() => go(position)}
                  className={cn(
                    "size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    position === index
                      ? "bg-primary"
                      : "bg-[color-mix(in_oklch,var(--muted-foreground)_30%,transparent)]"
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Anterior"
              disabled={index === 0}
              onClick={() => go(index - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Próximo"
              disabled={index >= total - 1}
              onClick={() => go(index + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
ProcessStepDetail.displayName = "ProcessStepDetail";

export { ProcessStepDetail };
