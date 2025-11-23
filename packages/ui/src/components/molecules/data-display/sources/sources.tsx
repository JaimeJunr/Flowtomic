/**
 * Sources Component - Flowtomic UI
 *
 * Componente de sources collapsible
 */

import { BookIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../atoms";

export type SourcesProps = ComponentProps<"div">;

export const Sources = React.forwardRef<HTMLDivElement, SourcesProps>(
  ({ className, ...props }, ref) => (
    <Collapsible
      ref={ref}
      className={cn("not-prose mb-4 text-primary text-xs", className)}
      {...props}
    />
  )
);
Sources.displayName = "Sources";

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  count: number;
};

export const SourcesTrigger = React.forwardRef<HTMLButtonElement, SourcesTriggerProps>(
  ({ className, count, children, ...props }, ref) => (
    <CollapsibleTrigger ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
      {children ?? (
        <>
          <p className="font-medium">Used {count} sources</p>
          <ChevronDownIcon className="h-4 w-4" />
        </>
      )}
    </CollapsibleTrigger>
  )
);
SourcesTrigger.displayName = "SourcesTrigger";

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = React.forwardRef<HTMLDivElement, SourcesContentProps>(
  ({ className, ...props }, ref) => (
    <CollapsibleContent
      ref={ref}
      className={cn(
        "mt-3 flex w-fit flex-col gap-2",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
        className
      )}
      {...props}
    />
  )
);
SourcesContent.displayName = "SourcesContent";

export type SourceProps = ComponentProps<"a">;

export const Source = React.forwardRef<HTMLAnchorElement, SourceProps>(
  ({ href, title, children, ...props }, ref) => (
    <a
      ref={ref}
      className="flex items-center gap-2"
      href={href}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children ?? (
        <>
          <BookIcon className="h-4 w-4" />
          <span className="block font-medium">{title}</span>
        </>
      )}
    </a>
  )
);
Source.displayName = "Source";
