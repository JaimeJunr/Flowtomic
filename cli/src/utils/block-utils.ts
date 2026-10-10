import { basename, dirname, join } from "node:path";

export interface BlockFile {
  path: string;
  type: "registry:page" | "registry:component" | "registry:hook" | "registry:lib";
  target?: string;
}

export interface Block {
  name: string;
  title: string;
  registryDependencies?: string[];
  dependencies?: string[];
  files: BlockFile[];
  description?: string;
}

/** O registry usa paths relativos a packages/ui/src, já incluindo blocks/. */
export function blockSourcePath(file: BlockFile, repoPath: string): string {
  return join(repoPath, "packages/ui/src", file.path);
}

export function blockTargetPath(
  file: BlockFile,
  block: Block,
  paths: { ui: string; hooks: string; utils: string; page: (target: string) => string }
): string {
  if (file.type === "registry:page" && file.target) return paths.page(file.target);
  if (file.type === "registry:component") return join(paths.ui, block.name, basename(file.path));
  if (file.type === "registry:hook") return join(paths.hooks, block.name, basename(file.path));
  if (file.type === "registry:lib") return join(dirname(paths.utils), basename(file.path));
  throw new Error(`Destino não definido para o arquivo de block: ${file.path}`);
}
