/**
 * Copia os helpers de `packages/ui/src/lib` que um componente importa.
 *
 * O `ensureUtilsFile` só cobre o `lib/utils.ts`. Componentes que usam outros
 * helpers (`@/lib/use-should-reduce-motion`, `@/lib/webgl`) chegavam ao projeto
 * com import quebrado.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const LIB_IMPORT = /from\s+["']@\/lib\/([^"']+)["']/g;
const RELATIVE_IMPORT = /from\s+["'](\.{1,2}\/[^"']+)["']/g;
const CANDIDATE_SUFFIXES = [".ts", ".tsx", "/index.ts", "/index.tsx"];

export type LibCopyRoots = {
  /** `packages/ui/src/lib` dentro do repositório Flowtomic. */
  repoLibRoot: string;
  /** Pasta `lib` do projeto que recebe o componente. */
  targetLibRoot: string;
  /** Ajusta os aliases dos helpers antes da cópia. */
  transform?: (content: string, sourcePath: string) => string;
};

/** Caminhos importados via `@/lib/...`, sem o `utils` (que tem cópia própria). */
export function findLibImports(content: string): string[] {
  const paths = [...content.matchAll(LIB_IMPORT)].map((match) => match[1]);
  return paths.filter((path) => path !== "utils");
}

function findRelativeImports(content: string): string[] {
  return [...content.matchAll(RELATIVE_IMPORT)].map((match) => match[1]);
}

function resolveSourceFile(basePath: string): string | null {
  const candidates = CANDIDATE_SUFFIXES.map((suffix) => `${basePath}${suffix}`);
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function importsOf(sourceFile: string, repoLibRoot: string): string[] {
  const content = readFileSync(sourceFile, "utf-8");
  const fromLib = findLibImports(content).map((path) => join(repoLibRoot, path));
  const fromRelative = findRelativeImports(content).map((path) =>
    resolve(dirname(sourceFile), path)
  );
  return [...fromLib, ...fromRelative];
}

// Import relativo que sai da lib (ex.: ../components) não é helper: o CLI copia componente por outro caminho.
function isInsideLib(sourceFile: string, repoLibRoot: string): boolean {
  return !relative(repoLibRoot, sourceFile).startsWith("..");
}

function copyIfMissing(sourceFile: string, roots: LibCopyRoots): string | null {
  const relativePath = relative(roots.repoLibRoot, sourceFile);
  const targetFile = join(roots.targetLibRoot, relativePath);
  if (existsSync(targetFile)) return null;
  mkdirSync(dirname(targetFile), { recursive: true });
  if (roots.transform) {
    writeFileSync(
      targetFile,
      roots.transform(readFileSync(sourceFile, "utf-8"), sourceFile),
      "utf-8"
    );
  } else {
    copyFileSync(sourceFile, targetFile);
  }
  return relativePath;
}

/**
 * Copia para o projeto cada helper de lib importado por `componentSource`,
 * seguindo os imports dos arquivos copiados. Não sobrescreve o que já existe.
 * Devolve os caminhos copiados, relativos à pasta lib.
 */
export function copyLibDependencies(componentSource: string, roots: LibCopyRoots): string[] {
  const pending = findLibImports(componentSource).map((path) => join(roots.repoLibRoot, path));
  const visited = new Set<string>();
  const copied: string[] = [];
  while (pending.length > 0) {
    const sourceFile = resolveSourceFile(pending.pop() as string);
    if (!sourceFile || visited.has(sourceFile) || !isInsideLib(sourceFile, roots.repoLibRoot)) {
      continue;
    }
    visited.add(sourceFile);
    const copiedPath = copyIfMissing(sourceFile, roots);
    if (copiedPath) copied.push(copiedPath);
    pending.push(...importsOf(sourceFile, roots.repoLibRoot));
  }
  return copied;
}
