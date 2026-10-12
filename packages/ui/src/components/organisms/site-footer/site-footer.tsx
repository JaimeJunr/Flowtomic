/**
 * SiteFooter - Flowtomic UI
 *
 * Rodapé de página de produto: coluna de marca, colunas de links (uma `nav` por coluna), faixa
 * opcional (newsletter ou "apoiado por") e linha final com copyright e links legais.
 * A grade responde ao contêiner (container queries), sem medir nada em JS.
 */

"use client";

import { ExternalLink } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/atoms/actions/badge";
import { Button } from "@/components/atoms/actions/button";
import { Input } from "@/components/atoms/forms/input";
import { cn } from "@/lib/utils";
import type { SiteNavLink } from "../site-header/types";

export type SiteFooterColumn = { title: React.ReactNode; links: SiteNavLink[] };

export type SiteFooterProps = React.ComponentProps<"footer"> & {
  brand?: { logo: React.ReactNode; href?: string; tagline?: React.ReactNode };
  /** Ícones de redes, na coluna de marca. */
  social?: React.ReactNode;
  columns: SiteFooterColumn[];
  /** Faixa depois de uma régua: `SiteFooterNewsletter`, "apoiado por" ou o que for. */
  band?: React.ReactNode;
  copyright?: React.ReactNode;
  legal?: SiteNavLink[];
  /** Limita a largura do conteúdo (`max-w-6xl`). @default true */
  contained?: boolean;
  /** Nível do título de cada coluna. @default 2 */
  headingLevel?: 2 | 3 | 4;
};

function FooterLink({ link, className }: { link: SiteNavLink; className?: string }) {
  return (
    <a
      href={link.href}
      aria-current={link.active ? "page" : undefined}
      {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        link.active && "text-foreground",
        className
      )}
    >
      {link.label}
      {link.badge && (
        <Badge variant="secondary" size="sm">
          {link.badge}
        </Badge>
      )}
      {link.external && (
        <>
          <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
          <span className="sr-only">(abre em nova aba)</span>
        </>
      )}
    </a>
  );
}

/** Rodapé com colunas de links, faixa opcional e linha legal. */
function SiteFooter({
  brand,
  social,
  columns,
  band,
  copyright,
  legal,
  contained = true,
  headingLevel = 2,
  className,
  ...props
}: SiteFooterProps) {
  const baseId = React.useId();
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const hasBrand = Boolean(brand || social);

  return (
    <footer
      data-slot="site-footer"
      className={cn("@container border-t bg-background px-6 py-16", className)}
      {...props}
    >
      <div className={cn(contained && "mx-auto max-w-6xl")}>
        <div
          style={{ "--site-footer-cols": columns.length } as React.CSSProperties}
          className={cn(
            "grid grid-cols-2 gap-x-6 gap-y-10 @[640px]:grid-cols-4",
            hasBrand
              ? "@[1024px]:grid-cols-[2fr_repeat(var(--site-footer-cols),minmax(0,1fr))]"
              : "@[1024px]:grid-cols-[repeat(var(--site-footer-cols),minmax(0,1fr))]"
          )}
        >
          {hasBrand && (
            <div className="col-span-full space-y-4 @[1024px]:col-span-1">
              {brand &&
                (brand.href ? (
                  <a
                    href={brand.href}
                    className="inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {brand.logo}
                  </a>
                ) : (
                  <div className="inline-flex items-center">{brand.logo}</div>
                ))}
              {brand?.tagline && (
                <p className="max-w-xs text-sm text-muted-foreground">{brand.tagline}</p>
              )}
              {social && (
                <div className="flex items-center gap-2 text-muted-foreground">{social}</div>
              )}
            </div>
          )}
          {columns.map((column, index) => {
            const titleId = `${baseId}-col-${index}`;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: colunas estáticas, o título é ReactNode
              <nav key={index} data-slot="site-footer-column" aria-labelledby={titleId}>
                <Heading id={titleId} className="text-sm font-medium text-foreground">
                  {column.title}
                </Heading>
                <ul className="mt-4 space-y-3 text-sm">
                  {column.links.map((link, linkIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: links estáticos
                    <li key={linkIndex}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        {band && (
          <div data-slot="site-footer-band" className="mt-12 border-t pt-10">
            {band}
          </div>
        )}

        {(copyright || (legal && legal.length > 0)) && (
          <div
            data-slot="site-footer-bottom"
            className="mt-12 flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground @[640px]:flex-row @[640px]:items-center @[640px]:justify-between"
          >
            {copyright && <p>{copyright}</p>}
            {legal && legal.length > 0 && (
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {legal.map((link, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: links estáticos
                  <li key={index}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
SiteFooter.displayName = "SiteFooter";

export type SiteFooterNewsletterProps = Omit<React.ComponentProps<"form">, "onSubmit" | "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  /** @default "Inscrever" */
  submitLabel?: React.ReactNode;
  finePrint?: React.ReactNode;
  onSubmit: (email: string) => void | Promise<void>;
  /** @default "Inscrição feita. Confira seu e-mail." */
  successMessage?: React.ReactNode;
  /** @default "Não foi possível se inscrever. Tente de novo." */
  errorMessage?: React.ReactNode;
};

type NewsletterStatus = "idle" | "loading" | "success" | "error";

/** Faixa de newsletter pronta para o slot `band` do rodapé. */
function SiteFooterNewsletter({
  title,
  description,
  placeholder = "voce@empresa.com",
  submitLabel = "Inscrever",
  finePrint,
  onSubmit,
  successMessage = "Inscrição feita. Confira seu e-mail.",
  errorMessage = "Não foi possível se inscrever. Tente de novo.",
  className,
  ...props
}: SiteFooterNewsletterProps) {
  const id = React.useId();
  const inputId = `${id}-email`;
  const messageId = `${id}-message`;
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<NewsletterStatus>("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      await onSubmit(email.trim());
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const message =
    status === "success" ? successMessage : status === "error" ? errorMessage : undefined;

  return (
    <form
      data-slot="site-footer-newsletter"
      className={cn(
        "flex flex-col gap-4 @[1024px]:flex-row @[1024px]:items-start @[1024px]:justify-between",
        className
      )}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="max-w-md space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="w-full space-y-2 @[1024px]:max-w-md">
        <div className="flex flex-col gap-2 @[640px]:flex-row">
          <label htmlFor={inputId} className="sr-only">
            E-mail
          </label>
          <div className="min-w-0 flex-1">
            <Input
              id={inputId}
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder={placeholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "loading"}
              aria-invalid={status === "error" || undefined}
              aria-describedby={message ? messageId : undefined}
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 @[640px]:h-auto"
          >
            {status === "loading" ? "Enviando" : submitLabel}
          </Button>
        </div>
        {finePrint && <p className="text-xs text-muted-foreground">{finePrint}</p>}
        <p
          id={messageId}
          aria-live="polite"
          className={cn(
            "text-sm",
            status === "error" ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {status === "loading" ? "Enviando" : message}
        </p>
      </div>
    </form>
  );
}
SiteFooterNewsletter.displayName = "SiteFooterNewsletter";

export { SiteFooter, SiteFooterNewsletter };
