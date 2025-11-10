/**
 * Categorias de blocks disponíveis
 */

export interface BlockCategory {
  name: string;
  slug: string;
  hidden?: boolean;
}

export const registryCategories: BlockCategory[] = [
  {
    name: "Dashboard",
    slug: "dashboard",
    hidden: false,
  },
  {
    name: "Authentication",
    slug: "authentication",
    hidden: false,
  },
  {
    name: "Marketing",
    slug: "marketing",
    hidden: false,
  },
  {
    name: "Application",
    slug: "application",
    hidden: false,
  },
];
