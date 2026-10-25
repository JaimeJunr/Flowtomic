/**
 * LinkTileGrid Component - Flowtomic UI
 *
 * Grade de ladrilhos-link para navegação densa (casos de uso, categorias,
 * atalhos): ícone tingido, nome, seta e, opcionalmente, descrição e selo.
 * Colunas por container query, então vale a largura do painel, não da janela.
 *
 * Implementação clean room — spec em docs/clean-room/sites/link-tile-grid.md
 */

import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/atoms/actions/badge";
import { cn } from "@/lib/utils";

export type LinkTile = {
  id: string;
  label: ReactNode;
  href: string;
  /** Ícone de traço; vai num quadrado tingido com `--primary`. */
  icon?: ReactNode;
  /** Uma linha em muted sob o nome. */
  description?: ReactNode;
  /** Selo curto entre o nome e a seta, ex.: "Novo". */
  badge?: ReactNode;
  /** Abre em nova aba e troca a seta. */
  external?: boolean;
  /** Vira `<span aria-disabled>`: sem link, sem foco. */
  disabled?: boolean;
};

export type LinkTileLinkProps = ComponentProps<"a"> & { item: LinkTile };

export type LinkTileGridProps = Omit<ComponentProps<"nav">, "children"> & {
  items: LinkTile[];
  /** Máximo de colunas. Padrão 4. */
  columns?: 2 | 3 | 4;
  /** `aria-label` do `<nav>`. Padrão "Atalhos". */
  label?: string;
  /** Id do título visível; vence o `label`. */
  labelledBy?: string;
  /** Para `Link` de router: recebe as props prontas e devolve o elemento. */
  renderLink?: (props: LinkTileLinkProps) => ReactNode;
};

// Classes literais: o Tailwind não gera classe montada por interpolação.
const COLUMNS_CLASS = {
  2: "grid-cols-1 @min-[480px]:grid-cols-2",
  3: "grid-cols-1 @min-[480px]:grid-cols-2 @min-[768px]:grid-cols-3",
  4: "grid-cols-1 @min-[480px]:grid-cols-2 @min-[768px]:grid-cols-3 @min-[1100px]:grid-cols-4",
} as const;

// role="list" explícito: o Safari tira a semântica de lista de <ul> com list-style none.
// Via spread porque o Biome marca o role como redundante.
const LIST_ROLE_PROPS = { role: "list" } as const;

const TILE_CLASS =
  "group flex h-full min-h-20 items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 text-foreground transition-[border-color,box-shadow]";

const TILE_INTERACTIVE_CLASS =
  "hover:border-[color-mix(in_oklab,var(--primary)_40%,var(--border))] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const ARROW_CLASS =
  "size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0";

function TileContent({ item }: { item: LinkTile }) {
  const Arrow = item.external ? ArrowUpRight : ArrowRight;
  return (
    <>
      {item.icon ? (
        <span
          data-slot="link-tile-icon"
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklch,var(--primary)_10%,transparent)] text-primary [&_svg]:size-[18px]"
        >
          {item.icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span data-slot="link-tile-label" className="text-sm font-semibold text-balance">
          {item.label}
          {item.external ? <span className="sr-only"> (abre em nova aba)</span> : null}
        </span>
        {item.description ? (
          <span className="line-clamp-1 text-xs text-muted-foreground">{item.description}</span>
        ) : null}
      </span>
      {item.badge ? (
        <Badge size="sm" className="shrink-0">
          {item.badge}
        </Badge>
      ) : null}
      <Arrow data-slot="link-tile-arrow" aria-hidden="true" className={ARROW_CLASS} />
    </>
  );
}

function LinkTileItem({
  item,
  renderLink,
}: {
  item: LinkTile;
  renderLink?: LinkTileGridProps["renderLink"];
}) {
  if (item.disabled) {
    return (
      <span
        data-slot="link-tile"
        data-disabled=""
        aria-disabled="true"
        className={cn(TILE_CLASS, "opacity-50")}
      >
        <TileContent item={item} />
      </span>
    );
  }

  const linkProps: LinkTileLinkProps = {
    item,
    href: item.href,
    "data-slot": "link-tile",
    className: cn(TILE_CLASS, TILE_INTERACTIVE_CLASS),
    children: <TileContent item={item} />,
    ...(item.external ? { target: "_blank", rel: "noreferrer" } : {}),
  } as LinkTileLinkProps;

  if (renderLink) return <>{renderLink(linkProps)}</>;
  const { item: _item, ...anchorProps } = linkProps;
  return <a {...anchorProps} />;
}

function LinkTileGrid({
  items,
  columns = 4,
  label = "Atalhos",
  labelledBy,
  renderLink,
  className,
  ref,
  ...props
}: LinkTileGridProps) {
  return (
    // Container query só estiliza descendentes: o @container fica no <nav>
    // e a grade (que ganha as colunas) é a <ul> filha.
    <nav
      ref={ref}
      data-slot="link-tile-grid"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={cn("@container", className)}
      {...props}
    >
      <ul
        {...LIST_ROLE_PROPS}
        className={cn("m-0 grid list-none auto-rows-fr gap-3 p-0", COLUMNS_CLASS[columns])}
      >
        {items.map((item) => (
          <li key={item.id} className="min-w-0">
            <LinkTileItem item={item} renderLink={renderLink} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

LinkTileGrid.displayName = "LinkTileGrid";

export { LinkTileGrid };
