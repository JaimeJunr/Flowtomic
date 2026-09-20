/**
 * # InlineCitation Component
 *
 * O componente `InlineCitation` é usado para exibir citações inline com hover card
 * que mostra informações detalhadas sobre as fontes. É útil para documentos acadêmicos,
 * artigos e conteúdo que requer referências.
 *
 * ## Características Principais
 *
 * - **Hover Card**: Exibe informações detalhadas ao passar o mouse
 * - **Múltiplas Fontes**: Suporta múltiplas fontes com badge
 * - **Composição**: Múltiplos sub-componentes para flexibilidade
 * - **Acessível**: Baseado em HoverCard (Radix UI) para acessibilidade
 *
 * ## Componentes
 *
 * - **InlineCitation**: Container principal
 * - **InlineCitationText**: Texto da citação
 * - **InlineCitationCard**: Card com hover (wrapper do HoverCard)
 * - **InlineCitationCardTrigger**: Trigger com badge mostrando fonte
 * - **InlineCitationCardBody**: Corpo do card
 * - **InlineCitationSource**: Fonte individual com título, URL e descrição
 * - **InlineCitationQuote**: Citação em formato blockquote
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { InlineCitation, InlineCitationText, InlineCitationCard, InlineCitationCardTrigger, InlineCitationCardBody, InlineCitationSource } from "@flowtomic/ui/components/atoms/feedback/inline-citation";
 *
 * function MyComponent() {
 *   return (
 *     <InlineCitation>
 *       <InlineCitationText>Texto com citação</InlineCitationText>
 *       <InlineCitationCard>
 *         <InlineCitationCardTrigger sources={["https://example.com"]} />
 *         <InlineCitationCardBody>
 *           <InlineCitationSource
 *             title="Título da Fonte"
 *             url="https://example.com"
 *             description="Descrição da fonte"
 *           />
 *         </InlineCitationCardBody>
 *       </InlineCitationCard>
 *     </InlineCitation>
 *   );
 * }
 * ```
 *
 * ## Acessibilidade
 *
 * - Baseado em HoverCard (Radix UI) para acessibilidade
 * - Suporta leitores de tela
 * - Navegação por teclado
 *
 * @see [HoverCard Component](../hover-card/hover-card.tsx) para mais detalhes sobre o hover card
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "../../actions/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";

export type InlineCitationProps = React.ComponentProps<"span">;

export const InlineCitation = React.forwardRef<HTMLSpanElement, InlineCitationProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("group inline items-center gap-1", className)} {...props} />
  )
);
InlineCitation.displayName = "InlineCitation";

export type InlineCitationTextProps = React.ComponentProps<"span">;

export const InlineCitationText = React.forwardRef<HTMLSpanElement, InlineCitationTextProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("transition-colors group-hover:bg-accent", className)}
      {...props}
    />
  )
);
InlineCitationText.displayName = "InlineCitationText";

export type InlineCitationCardProps = React.ComponentProps<typeof HoverCard>;

export const InlineCitationCard = (props: InlineCitationCardProps) => (
  <HoverCard closeDelay={0} openDelay={0} {...props} />
);
InlineCitationCard.displayName = "InlineCitationCard";

export type InlineCitationCardTriggerProps = React.ComponentProps<typeof Badge> & {
  sources: string[];
};

export const InlineCitationCardTrigger = React.forwardRef<
  HTMLDivElement,
  InlineCitationCardTriggerProps
>(({ sources, className, ...props }, ref) => (
  <HoverCardTrigger asChild>
    <Badge ref={ref} className={cn("ml-1 rounded-full", className)} variant="secondary" {...props}>
      {sources[0] ? (
        <>
          {new URL(sources[0]).hostname} {sources.length > 1 && `+${sources.length - 1}`}
        </>
      ) : (
        "unknown"
      )}
    </Badge>
  </HoverCardTrigger>
));
InlineCitationCardTrigger.displayName = "InlineCitationCardTrigger";

export type InlineCitationCardBodyProps = React.ComponentProps<"div">;

export const InlineCitationCardBody = React.forwardRef<HTMLDivElement, InlineCitationCardBodyProps>(
  ({ className, ...props }, ref) => (
    <HoverCardContent ref={ref} className={cn("relative w-80 p-0", className)} {...props} />
  )
);
InlineCitationCardBody.displayName = "InlineCitationCardBody";

export type InlineCitationSourceProps = React.ComponentProps<"div"> & {
  title?: string;
  url?: string;
  description?: string;
};

export const InlineCitationSource = React.forwardRef<HTMLDivElement, InlineCitationSourceProps>(
  ({ title, url, description, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {title && <h4 className="truncate font-medium text-sm leading-tight">{title}</h4>}
      {url && <p className="truncate break-all text-muted-foreground text-xs">{url}</p>}
      {description && (
        <p className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  )
);
InlineCitationSource.displayName = "InlineCitationSource";

export type InlineCitationQuoteProps = React.ComponentProps<"blockquote">;

export const InlineCitationQuote = React.forwardRef<HTMLQuoteElement, InlineCitationQuoteProps>(
  ({ children, className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn("border-muted border-l-2 pl-3 text-muted-foreground text-sm italic", className)}
      {...props}
    >
      {children}
    </blockquote>
  )
);
InlineCitationQuote.displayName = "InlineCitationQuote";
