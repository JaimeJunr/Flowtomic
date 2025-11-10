/**
 * Registry de blocks do Flowtomic
 *
 * Segue o schema do shadcn/ui para compatibilidade
 * Schema: https://ui.shadcn.com/schema/registry-item.json
 */

export interface BlockFile {
  path: string;
  type: "registry:page" | "registry:component" | "registry:hook" | "registry:lib";
  target?: string; // Para pages, indica onde o arquivo deve ser colocado
}

export interface Block {
  name: string;
  author: string;
  title: string;
  description: string;
  type: "registry:block";
  registryDependencies?: string[]; // Componentes do registry necessários
  dependencies?: string[]; // Pacotes npm necessários
  files: BlockFile[];
  categories: string[];
}

/**
 * Lista de blocks disponíveis
 */
export const blocks: Block[] = [
  // Exemplo de block - pode ser removido quando houver blocks reais
  // {
  //   name: "dashboard-01",
  //   author: "flowtomic (https://flowtomic.dev)",
  //   title: "Dashboard",
  //   description: "Um dashboard simples com componentes do Flowtomic.",
  //   type: "registry:block",
  //   registryDependencies: ["card", "button", "input"],
  //   dependencies: [],
  //   files: [
  //     {
  //       path: "blocks/dashboard-01/page.tsx",
  //       type: "registry:page",
  //       target: "app/dashboard/page.tsx",
  //     },
  //   ],
  //   categories: ["dashboard"],
  // },
];

/**
 * Busca um block pelo nome
 */
export function findBlock(name: string): Block | null {
  return blocks.find((b) => b.name === name) || null;
}

/**
 * Lista todos os blocks
 */
export function listBlocks(): Block[] {
  return blocks;
}

/**
 * Lista blocks por categoria
 */
export function listBlocksByCategory(category: string): Block[] {
  return blocks.filter((b) => b.categories.includes(category));
}

/**
 * Lista todas as categorias disponíveis
 */
export function listCategories(): string[] {
  const categories = new Set<string>();
  for (const b of blocks) {
    for (const c of b.categories) {
      categories.add(c);
    }
  }
  return Array.from(categories).sort();
}
