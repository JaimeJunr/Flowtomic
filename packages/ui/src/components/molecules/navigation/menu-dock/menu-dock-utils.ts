import type { ComponentType } from "react";

export type MenuDockItem = {
  /** Chave estável; sem ela o rótulo serve de chave. */
  id?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Com `href` o item é um link; sem ele, um botão. */
  href?: string;
  /** @deprecated Use `href`. Tratado como `href` quando este não vem. */
  path?: string;
  onClick?: () => void;
};

export const DEFAULT_ITEM_SIZE = 40;
export const DEFAULT_MAGNIFICATION = 80;
export const DEFAULT_MAGNIFY_DISTANCE = 150;

/** Faixas de entrada/saída das transformações da lupa; o ícone é sempre metade do item. */
export function buildDockRanges({
  itemSize = DEFAULT_ITEM_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  magnifyDistance = DEFAULT_MAGNIFY_DISTANCE,
}: {
  itemSize?: number;
  magnification?: number;
  magnifyDistance?: number;
}) {
  if (!(itemSize > 0)) {
    throw new RangeError(
      `invalid itemSize: received ${itemSize}, expected a positive number of pixels`
    );
  }
  if (!(magnifyDistance > 0)) {
    throw new RangeError(
      `invalid magnifyDistance: received ${magnifyDistance}, expected a positive number of pixels`
    );
  }
  if (!(magnification >= itemSize)) {
    throw new RangeError(
      `invalid magnification: received magnification ${magnification}, expected a number >= itemSize ${itemSize}`
    );
  }
  return {
    distance: [-magnifyDistance, 0, magnifyDistance],
    size: [itemSize, magnification, itemSize],
    icon: [itemSize / 2, magnification / 2, itemSize / 2],
  };
}

export type DockRanges = ReturnType<typeof buildDockRanges>;

/** Destino efetivo do item: `href` ganha de `path` (deprecado). */
export function dockHref(item: Pick<MenuDockItem, "href" | "path">): string | undefined {
  return item.href ?? item.path;
}

export function dockKey(item: Pick<MenuDockItem, "id" | "label">): string {
  return item.id ?? item.label;
}
