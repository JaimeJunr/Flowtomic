/**
 * SiteHeader - Flowtomic UI
 *
 * Cabeçalho de página de produto: logo, navegação principal (com painéis), busca, redes e ações,
 * com sub-navegação opcional. Abaixo de 1024 px de contêiner (container query, sem medir em JS) a
 * navegação some e entra um botão de menu que abre um Sheet pela direita.
 */

"use client";

import { ExternalLink, Menu, Search } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/atoms/actions/badge";
import { Button } from "@/components/atoms/actions/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/atoms/feedback/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/atoms/navigation/navigation-menu";
import { cn } from "@/lib/utils";
import type { SiteHeaderAction, SiteNavItem, SiteNavLink } from "./types";

export type SiteHeaderProps = React.ComponentProps<"header"> & {
  logo: React.ReactNode;
  /** @default "/" */
  logoHref?: string;
  nav?: SiteNavItem[];
  /** @default "start" */
  align?: "start" | "center";
  /** Ex.: um botão que parece campo, com o atalho em `kbd`. */
  search?: React.ReactNode;
  social?: React.ReactNode;
  /** No máximo uma com `variant: "default"` (sólida). */
  actions?: SiteHeaderAction[];
  subnav?: { title?: React.ReactNode; items: SiteNavLink[] };
  /** @default true */
  sticky?: boolean;
  /** Destino do link "Pular para o conteúdo"; `false` remove. @default "#conteudo" */
  skipToContent?: string | false;
  /**
   * Força o modo: `auto` segue a largura do contêiner (padrão); `desktop` e `mobile` fixam.
   * Existe para teste e para story em largura fixa.
   * @default "auto"
   */
  layout?: "auto" | "desktop" | "mobile";
};

const NO_ACTIONS: SiteHeaderAction[] = [];

function linkExtras(link: SiteNavLink) {
  return link.external ? { target: "_blank", rel: "noreferrer" } : {};
}

function ExternalMark() {
  return (
    <>
      <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
      <span className="sr-only">(abre em nova aba)</span>
    </>
  );
}

const TOP_LINK =
  "flex-row items-center gap-1.5 px-3 py-2 font-normal text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent data-[active=true]:bg-transparent data-[active=true]:text-foreground data-[active=true]:hover:bg-transparent data-[active=true]:focus:bg-transparent";

const TOP_TRIGGER =
  "bg-transparent font-normal text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-foreground data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent";

function PanelLink({ link }: { link: SiteNavLink }) {
  return (
    <li>
      <NavigationMenuLink asChild active={link.active}>
        <a href={link.href} {...linkExtras(link)}>
          <span className="flex items-center gap-2 font-medium text-foreground">
            {link.icon && <span className="flex shrink-0 [&_svg]:size-4">{link.icon}</span>}
            <span>{link.label}</span>
            {link.badge && (
              <Badge variant="secondary" size="sm">
                {link.badge}
              </Badge>
            )}
            {link.external && <ExternalMark />}
          </span>
          {link.description && (
            <span className="text-xs text-muted-foreground">{link.description}</span>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
}

function MobileLink({ link, onNavigate }: { link: SiteNavLink; onNavigate: () => void }) {
  return (
    <a
      href={link.href}
      aria-current={link.active ? "page" : undefined}
      onClick={onNavigate}
      {...linkExtras(link)}
      className={cn(
        "flex flex-col gap-0.5 rounded-md px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
        link.active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span className="flex items-center gap-2 font-medium">
        {link.icon && <span className="flex shrink-0 [&_svg]:size-4">{link.icon}</span>}
        <span>{link.label}</span>
        {link.badge && (
          <Badge variant="secondary" size="sm">
            {link.badge}
          </Badge>
        )}
        {link.external && <ExternalMark />}
      </span>
      {link.description && (
        <span className="text-xs text-muted-foreground">{link.description}</span>
      )}
    </a>
  );
}

function ActionButton({
  action,
  className,
  onNavigate,
}: {
  action: SiteHeaderAction;
  className?: string;
  onNavigate?: () => void;
}) {
  const variant = action.variant ?? "outline";
  const click = () => {
    action.onClick?.();
    onNavigate?.();
  };
  if (action.href) {
    return (
      <Button asChild variant={variant} size="sm" className={className}>
        <a href={action.href} onClick={click}>
          {action.label}
        </a>
      </Button>
    );
  }
  return (
    <Button variant={variant} size="sm" className={className} onClick={click}>
      {action.label}
    </Button>
  );
}

function SubNav({ subnav }: { subnav: NonNullable<SiteHeaderProps["subnav"]> }) {
  const titleId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView?.({ inline: "center", block: "nearest" });
  }, []);

  return (
    <nav
      data-slot="site-header-subnav"
      aria-label={subnav.title ? undefined : "Sub-navegação"}
      aria-labelledby={subnav.title ? titleId : undefined}
      className="flex h-12 items-center gap-4 border-t px-6"
    >
      {subnav.title && (
        <span
          id={titleId}
          className="shrink-0 font-mono text-xs font-medium tracking-wide text-foreground uppercase"
        >
          {subnav.title}
        </span>
      )}
      <div
        ref={listRef}
        className="relative flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {subnav.items.map((item, index) => (
          <a
            // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos, o rótulo é ReactNode
            key={index}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            {...linkExtras(item)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm whitespace-nowrap outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              item.active ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
            {item.external && <ExternalMark />}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** Cabeçalho de página de produto com navegação, busca, ações e menu para telas estreitas. */
function SiteHeader({
  logo,
  logoHref = "/",
  nav = [],
  align = "start",
  search,
  social,
  actions = NO_ACTIONS,
  subnav,
  sticky = true,
  skipToContent = "#conteudo",
  layout = "auto",
  className,
  ...props
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = () => setMenuOpen(false);

  const showDesktop = layout !== "mobile";
  const showMobile = layout !== "desktop";
  const auto = layout === "auto";
  const hideNarrow = auto ? "@max-[1024px]:hidden" : undefined;
  const narrowOnly = auto ? "@min-[1024px]:hidden" : undefined;

  const solidCount = actions.filter((action) => action.variant === "default").length;
  React.useEffect(() => {
    if (solidCount > 1) {
      console.warn('SiteHeader: use no máximo uma ação com variant="default" (sólida).');
    }
  }, [solidCount]);

  const isMobileAction = (action: SiteHeaderAction) =>
    action.mobile ?? action.variant === "default";

  return (
    <header
      data-slot="site-header"
      className={cn(
        "@container border-b bg-background",
        sticky && "sticky top-0 z-40 bg-background/85 backdrop-blur",
        className
      )}
      {...props}
    >
      {skipToContent !== false && (
        <a
          href={skipToContent}
          className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:ring-2 focus:ring-ring"
        >
          Pular para o conteúdo
        </a>
      )}
      <div className="flex h-[60px] items-center gap-2 px-6">
        <a
          href={logoHref}
          className="mr-2 inline-flex shrink-0 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {logo}
        </a>

        {showDesktop && nav.length > 0 && (
          <NavigationMenu
            viewport={false}
            aria-label="Principal"
            data-slot="site-header-nav"
            className={cn(
              align === "center" ? "flex-1 justify-center" : "flex-none",
              "max-w-none",
              hideNarrow
            )}
          >
            <NavigationMenuList>
              {nav.map((item, index) =>
                "items" in item ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos, o rótulo é ReactNode
                  <NavigationMenuItem key={index}>
                    <NavigationMenuTrigger className={TOP_TRIGGER}>
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul
                        className={cn(
                          "grid gap-1",
                          item.columns === 2 ? "w-[34rem] grid-cols-2" : "w-72"
                        )}
                      >
                        {item.items.map((link, linkIndex) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos
                          <PanelLink key={linkIndex} link={link} />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos, o rótulo é ReactNode
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink asChild active={item.active} className={TOP_LINK}>
                      <a href={item.href} {...linkExtras(item)}>
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                        {item.external && <ExternalMark />}
                      </a>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        <div data-slot="site-header-actions" className="ml-auto flex items-center gap-2">
          {showDesktop && search && (
            <div className={cn("flex items-center", hideNarrow)}>{search}</div>
          )}
          {showDesktop && social && (
            <div className={cn("flex items-center gap-1 text-muted-foreground", hideNarrow)}>
              {social}
            </div>
          )}
          {showMobile && search && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Abrir busca"
              className={narrowOnly}
              onClick={() => setMenuOpen(true)}
            >
              <Search />
            </Button>
          )}
          {actions.map((action, index) => {
            if (!showDesktop && !isMobileAction(action)) return null;
            return (
              <ActionButton
                // biome-ignore lint/suspicious/noArrayIndexKey: lista estática
                key={index}
                action={action}
                className={!isMobileAction(action) ? hideNarrow : undefined}
              />
            );
          })}
          {showMobile && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Abrir menu"
                  className={narrowOnly}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                data-slot="site-header-mobile-menu"
                aria-describedby={undefined}
                className="gap-0 p-0"
              >
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navegação do site</SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
                  {search && <div>{search}</div>}
                  {nav.length > 0 && (
                    <nav aria-label="Menu" className="space-y-4">
                      {nav.map((item, index) =>
                        "items" in item ? (
                          // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos
                          <div key={index} className="space-y-1">
                            <p className="px-3 text-xs font-medium text-muted-foreground">
                              {item.label}
                            </p>
                            {item.items.map((link, linkIndex) => (
                              <MobileLink
                                // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos
                                key={linkIndex}
                                link={link}
                                onNavigate={closeMenu}
                              />
                            ))}
                          </div>
                        ) : (
                          // biome-ignore lint/suspicious/noArrayIndexKey: itens estáticos
                          <MobileLink key={index} link={item} onNavigate={closeMenu} />
                        )
                      )}
                    </nav>
                  )}
                  {social && (
                    <div className="flex items-center gap-1 text-muted-foreground">{social}</div>
                  )}
                </div>
                {actions.length > 0 && (
                  <SheetFooter className="border-t">
                    {actions.map((action, index) => (
                      <ActionButton
                        // biome-ignore lint/suspicious/noArrayIndexKey: lista estática
                        key={index}
                        action={action}
                        className="w-full"
                        onNavigate={closeMenu}
                      />
                    ))}
                  </SheetFooter>
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      {subnav && <SubNav subnav={subnav} />}
    </header>
  );
}
SiteHeader.displayName = "SiteHeader";

export { SiteHeader };
