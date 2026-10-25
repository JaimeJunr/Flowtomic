#!/usr/bin/env bun

/**
 * Gera a tabela "Peers por família" do packages/ui/README.md a partir do fecho real de imports
 * externos de cada componente no dist (o que o bundler do consumidor de fato resolve).
 *
 * Uso: bun run scripts/peer-table.ts (depois de `bun run build` no packages/ui).
 * Só entram pacotes que não são dependencies do ui (cn, class-variance-authority, tw-animate-css)
 * nem react/react-dom, que já são peers obrigatórios do pacote.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const distDir = join(import.meta.dir, "..", "packages", "ui", "dist");
const componentsDir = join(distDir, "components");
const IGNORED = new Set(["react", "react-dom", "cn", "class-variance-authority", "tw-animate-css"]);
const IMPORT = /(?:\bfrom\s*|\bimport\s*\(?\s*|\bimport\s+)["']([^"']+)["']/g;

function isDir(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

/** Um componente é uma pasta com index.js que não re-exporta subpastas (barrel de categoria). */
function componentFolders(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (!isDir(path)) continue;
    const children = readdirSync(path).map((c) => join(path, c));
    const hasIndex = existsSync(join(path, "index.js"));
    const isBarrel = children.some((c) => isDir(c) && existsSync(join(c, "index.js")));
    if (hasIndex && !isBarrel) out.push(path);
    else out.push(...componentFolders(path));
  }
  return out;
}

function resolveRelative(fromFile: string, specifier: string): string | undefined {
  const base = join(dirname(fromFile), specifier);
  for (const candidate of [base, `${base}.js`, join(base, "index.js")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function closure(entry: string): Set<string> {
  const packages = new Set<string>();
  const seen = new Set<string>();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(IMPORT)) {
      const specifier = match[1];
      if (specifier.startsWith("./") || specifier.startsWith("../")) {
        const next = resolveRelative(file, specifier);
        if (next?.endsWith(".js")) stack.push(next);
      } else if (!IGNORED.has(packageName(specifier))) {
        packages.add(packageName(specifier));
      }
    }
  }
  return packages;
}

const rows = new Map<string, string[]>();
for (const folder of componentFolders(componentsDir).sort()) {
  const name = relative(componentsDir, folder).split("/").pop() as string;
  const peers = [...closure(join(folder, "index.js"))].sort();
  const key = peers.join(", ");
  rows.set(key, [...(rows.get(key) ?? []), name]);
}

console.log("| Componentes | Peers externos alcançados (além de `react`/`react-dom`) |");
console.log("| --- | --- |");
for (const [peers, names] of [...rows.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(
    `| ${names
      .sort()
      .map((n) => `\`${n}\``)
      .join(", ")} | ${peers || "nenhum"} |`
  );
}
