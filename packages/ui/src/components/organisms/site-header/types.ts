import type { ReactNode } from "react";

/** Link de navegação, compartilhado entre o `SiteHeader` e o `SiteFooter`. */
export type SiteNavLink = {
  label: ReactNode;
  href: string;
  description?: ReactNode;
  icon?: ReactNode;
  /** Abre em nova aba, com ícone e texto para leitor de tela. */
  external?: boolean;
  badge?: ReactNode;
  active?: boolean;
};

/** Item de primeiro nível: link simples ou grupo que abre um painel. */
export type SiteNavItem = SiteNavLink | { label: ReactNode; items: SiteNavLink[]; columns?: 1 | 2 };

export type SiteHeaderAction = {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Só uma ação deve ser `default` (sólida). */
  variant?: "default" | "outline" | "ghost";
  /** Aparece no cabeçalho estreito. Padrão: só a sólida. */
  mobile?: boolean;
};
