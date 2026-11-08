/**
 * SponsoredCard Component - Flowtomic UI
 *
 * Card "Patrocinado" para mostrar um anúncio fora do conteúdo (ex.: abaixo da resposta de um
 * chat). Identifica o anúncio antes de tudo, põe quem paga em primeiro e junta os controles do
 * app (ocultar, denunciar, "por que estou vendo isto?") num menu de opções.
 */

import { ChevronDown, Ellipsis, ExternalLink } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../atoms/actions/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../atoms/layout/collapsible";
import { isSafeSourceUrl } from "../sources";

/**
 * - `tab`: rótulo como aba em cima do card; logo e anunciante primeiro; link na base.
 * - `advertiser`: logo e anunciante com o selo ao lado; link na base.
 * - `bar`: uma linha com selo, título e anunciante; pensado para ficar recolhido.
 * - `footnote`: sem caixa, a forma mais curta; não recolhe.
 */
export type SponsoredCardVariant = "tab" | "advertiser" | "bar" | "footnote";

export interface SponsoredCardAction {
  label: string;
  onSelect: () => void;
  /** Põe um separador antes do item (ex.: "Denunciar anúncio"). */
  separated?: boolean;
}

export type SponsoredCardProps = Omit<ComponentProps<"aside">, "title" | "children"> & {
  advertiser: string;
  title: string;
  body?: string;
  /** Destino do clique; passe a rota que registra o clique, se houver. */
  href: string;
  /** Domínio mostrado no link (ex.: "exemplo.com.br"). */
  displayHost: string;
  /** Logo do anunciante. Sem logo, aparece a inicial do nome. */
  logoSrc?: string;
  variant?: SponsoredCardVariant;
  /** Recolhe numa linha com quem paga e o título; o cabeçalho abre. Ignorado em `footnote`. */
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  actions?: SponsoredCardAction[];
  label?: string;
  regionLabel?: string;
  actionsLabel?: string;
  newTabLabel?: string;
  /** Conteúdo do app dentro do card: explicação, formulário de denúncia. */
  children?: ReactNode;
};

// Anel na cor do texto do anúncio: o anel da marca não entra no anúncio.
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-sponsored-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-sponsored";

function SponsoredLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      data-slot="sponsored-card-label"
      className={cn(
        "inline-flex shrink-0 items-center rounded bg-sponsored-badge px-1.5 py-1 font-semibold text-[11px] text-sponsored-badge-foreground leading-none",
        className
      )}
    >
      {children}
    </span>
  );
}

function AdvertiserLogo({ advertiser, logoSrc }: { advertiser: string; logoSrc?: string }) {
  return (
    <span
      data-slot="sponsored-card-logo"
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-sponsored-badge font-bold text-sm text-sponsored-badge-foreground sm:size-8"
    >
      {logoSrc ? (
        <img src={logoSrc} alt="" className="size-full object-cover" />
      ) : (
        advertiser.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

function AdLink({ href, displayHost, newTabLabel, className }: AdLinkProps) {
  if (!isSafeSourceUrl(href)) return <span className={className}>{displayHost}</span>;
  return (
    <a
      data-slot="sponsored-card-link"
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={cn(FOCUS, className)}
    >
      <span className="min-w-0 [overflow-wrap:anywhere]">{displayHost}</span>
      <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
      <span className="sr-only"> ({newTabLabel})</span>
    </a>
  );
}
type AdLinkProps = Pick<SponsoredCardProps, "href" | "displayHost"> & {
  newTabLabel: string;
  className?: string;
};

function ActionsMenu({ actions, label }: { actions?: SponsoredCardAction[]; label: string }) {
  if (!actions?.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg text-sponsored-muted hover:bg-sponsored-foreground/10 hover:text-sponsored-foreground",
          FOCUS
        )}
      >
        <Ellipsis aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-60 border-sponsored-border bg-sponsored text-sponsored-foreground"
      >
        {actions.map((action) => [
          action.separated ? (
            <DropdownMenuSeparator key={`${action.label}-sep`} className="bg-sponsored-border" />
          ) : null,
          <DropdownMenuItem
            key={action.label}
            onSelect={action.onSelect}
            className="min-h-10 focus:bg-sponsored-foreground/10 focus:text-sponsored-foreground"
          >
            {action.label}
          </DropdownMenuItem>,
        ])}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Quem paga e o título; o selo entra ao lado só no formato `advertiser`, e antes no `bar`. */
function Identity({ ad, variant, label }: IdentityProps) {
  if (variant === "bar") {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <SponsoredLabel>{label}</SponsoredLabel>
        <span className="min-w-0 truncate font-semibold text-sm">{ad.title}</span>
        <span className="hidden shrink-0 text-[13px] text-sponsored-muted sm:inline">
          {ad.advertiser}
        </span>
      </span>
    );
  }
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5">
      <AdvertiserLogo advertiser={ad.advertiser} logoSrc={ad.logoSrc} />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-[13px]">{ad.advertiser}</span>
          {variant === "advertiser" ? <SponsoredLabel>{label}</SponsoredLabel> : null}
        </span>
        <span className="line-clamp-2 font-semibold text-sm sm:line-clamp-1">{ad.title}</span>
      </span>
    </span>
  );
}
type IdentityProps = {
  ad: Pick<SponsoredCardProps, "advertiser" | "title" | "logoSrc">;
  variant: SponsoredCardVariant;
  label: string;
};

function FootnoteAd(
  props: Required<Pick<SponsoredCardProps, "label" | "newTabLabel">> & SponsoredCardProps
) {
  const {
    advertiser,
    title,
    body,
    href,
    displayHost,
    actions,
    label,
    actionsLabel,
    newTabLabel,
    children,
  } = props;
  return (
    <div className="border-sponsored-border border-t pt-2">
      <div className="flex items-center gap-2">
        <SponsoredLabel>{label}</SponsoredLabel>
        <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
          {advertiser}
        </span>
        <ActionsMenu actions={actions} label={actionsLabel ?? "Opções do anúncio"} />
      </div>
      <p className="mt-1 text-sm [overflow-wrap:anywhere]">
        <span className="font-semibold">{title}.</span>{" "}
        <span className="text-muted-foreground">{body}</span>
      </p>
      <AdLink
        href={href}
        displayHost={displayHost}
        newTabLabel={newTabLabel}
        className="mt-1 inline-flex items-center gap-1.5 rounded-sm font-medium text-[13px] underline decoration-sponsored-badge underline-offset-4 hover:decoration-2"
      />
      {children ? <div className="mt-2 text-[13px]">{children}</div> : null}
    </div>
  );
}

export function SponsoredCard({
  advertiser,
  title,
  body,
  href,
  displayHost,
  logoSrc,
  variant = "tab",
  collapsible = false,
  open,
  defaultOpen,
  onOpenChange,
  actions,
  label = "Patrocinado",
  regionLabel = "Anúncio patrocinado",
  actionsLabel = "Opções do anúncio",
  newTabLabel = "abre em nova aba",
  children,
  className,
  ...props
}: SponsoredCardProps) {
  const ad = { advertiser, title, logoSrc };
  const canCollapse = collapsible && variant !== "footnote";
  const rowClass =
    "flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-lg py-1 pr-1.5 pl-3 text-left";

  const header = (
    <div className="flex items-center gap-1 py-1.5 pr-1">
      {canCollapse ? (
        <CollapsibleTrigger
          className={cn(rowClass, "group hover:bg-sponsored-foreground/5", FOCUS)}
        >
          <Identity ad={ad} variant={variant} label={label} />
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-sponsored-muted transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </CollapsibleTrigger>
      ) : (
        <div className={rowClass}>
          <Identity ad={ad} variant={variant} label={label} />
        </div>
      )}
      <ActionsMenu actions={actions} label={actionsLabel} />
    </div>
  );

  const content = (
    <>
      {body ? (
        <p className="px-4 pb-3 text-sm leading-relaxed [overflow-wrap:anywhere] sm:pl-[3.375rem]">
          {body}
        </p>
      ) : null}
      <AdLink
        href={href}
        displayHost={displayHost}
        newTabLabel={newTabLabel}
        className="flex min-h-11 items-center justify-between gap-3 border-sponsored-border border-t px-4 font-medium text-sm hover:bg-sponsored-foreground/5"
      />
    </>
  );

  const sheet = (
    <div
      className={cn(
        "border border-sponsored-border bg-sponsored text-sponsored-foreground",
        variant === "tab"
          ? "rounded-lg rounded-tl-none border-t-2 border-t-sponsored-badge"
          : "rounded-lg"
      )}
    >
      {header}
      {canCollapse ? <CollapsibleContent>{content}</CollapsibleContent> : content}
      {children ? (
        <div className="border-sponsored-border border-t px-4 py-3 text-[13px]">{children}</div>
      ) : null}
    </div>
  );

  return (
    <aside
      data-slot="sponsored-card"
      data-variant={variant}
      aria-label={regionLabel}
      className={cn("relative min-w-0", variant === "tab" && "pt-[26px]", className)}
      {...props}
    >
      {variant === "tab" ? (
        <span className="absolute top-0 left-4 flex h-[27px] items-center rounded-t-md bg-sponsored-badge px-2.5 font-semibold text-sponsored-badge-foreground text-xs">
          {label}
        </span>
      ) : null}
      {variant === "footnote" ? (
        <FootnoteAd
          {...{ advertiser, title, body, href, displayHost, actions, actionsLabel, children }}
          label={label}
          newTabLabel={newTabLabel}
        />
      ) : canCollapse ? (
        <Collapsible open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          {sheet}
        </Collapsible>
      ) : (
        sheet
      )}
    </aside>
  );
}
SponsoredCard.displayName = "SponsoredCard";
