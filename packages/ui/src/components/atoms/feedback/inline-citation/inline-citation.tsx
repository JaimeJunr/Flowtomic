import type * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "../../actions/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";

export type InlineCitationProps = React.ComponentProps<"span">;

export function InlineCitation({ className, ...props }: InlineCitationProps) {
  return (
    <span
      data-slot="inline-citation"
      className={cn("group inline items-center gap-1", className)}
      {...props}
    />
  );
}
InlineCitation.displayName = "InlineCitation";

export type InlineCitationTextProps = React.ComponentProps<"span">;

export function InlineCitationText({ className, ...props }: InlineCitationTextProps) {
  return (
    <span
      data-slot="inline-citation-text"
      className={cn("transition-colors group-hover:bg-accent", className)}
      {...props}
    />
  );
}
InlineCitationText.displayName = "InlineCitationText";

export type InlineCitationCardProps = React.ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard data-slot="inline-citation-card" closeDelay={0} openDelay={0} {...props} />
);
InlineCitationCard.displayName = "InlineCitationCard";

export type InlineCitationCardTriggerProps = React.ComponentProps<typeof Badge> & {
  sources: string[];
};

export function InlineCitationCardTrigger({
  sources,
  className,
  ...props
}: InlineCitationCardTriggerProps) {
  return (
    <HoverCardTrigger asChild>
      <Badge
        data-slot="inline-citation-card-trigger"
        className={cn("ml-1 rounded-full", className)}
        variant="secondary"
        {...props}
      >
        {sources[0] ? (
          <>
            {new URL(sources[0]).hostname} {sources.length > 1 && `+${sources.length - 1}`}
          </>
        ) : (
          "unknown"
        )}
      </Badge>
    </HoverCardTrigger>
  );
}
InlineCitationCardTrigger.displayName = "InlineCitationCardTrigger";

export type InlineCitationCardBodyProps = React.ComponentProps<"div">;

export function InlineCitationCardBody({ className, ...props }: InlineCitationCardBodyProps) {
  return (
    <HoverCardContent
      data-slot="inline-citation-card-body"
      className={cn("relative w-80 p-0", className)}
      {...props}
    />
  );
}
InlineCitationCardBody.displayName = "InlineCitationCardBody";

export type InlineCitationSourceProps = React.ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

export function InlineCitationSource({
  title,
  url,
  description,
  className,
  children,
  ...props
}: InlineCitationSourceProps) {
  return (
    <div data-slot="inline-citation-source" className={cn("space-y-1", className)} {...props}>
      {title && <h4 className="truncate font-medium text-sm leading-tight">{title}</h4>}
      {url && <p className="truncate break-all text-muted-foreground text-xs">{url}</p>}
      {description && (
        <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}
InlineCitationSource.displayName = "InlineCitationSource";

export type InlineCitationQuoteProps = React.ComponentProps<"blockquote">;

export function InlineCitationQuote({ children, className, ...props }: InlineCitationQuoteProps) {
  return (
    <blockquote
      data-slot="inline-citation-quote"
      className={cn("border-muted border-l-2 pl-3 text-muted-foreground text-sm italic", className)}
      {...props}
    >
      {children}
    </blockquote>
  );
}
InlineCitationQuote.displayName = "InlineCitationQuote";
