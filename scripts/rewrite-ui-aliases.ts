#!/usr/bin/env bun

/**
 * Troca o alias interno `@/` por caminho relativo nos arquivos que o `tsc` emite em
 * packages/ui/dist. O bundle (dist/index.js) sai resolvido pelo Bun, mas os arquivos por
 * componente (export `./components/*`) e os `.d.ts` mantinham `@/lib/utils`, que não
 * existe no app de quem instala o pacote.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const distDir = join(import.meta.dir, "..", "packages", "ui", "dist");
const ALIAS = /((?:\bfrom|\bimport)\s*\(?\s*)(["'])@\/([^"']+)\2/g;

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(js|d\.ts)$/.test(entry.name)) yield path;
  }
}

let changed = 0;
const leftovers: string[] = [];

for (const file of walk(distDir)) {
  const source = readFileSync(file, "utf8");
  const output = source.replace(ALIAS, (_, prefix: string, quote: string, target: string) => {
    let rel = relative(dirname(file), join(distDir, target)).split(sep).join("/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `${prefix}${quote}${rel}${quote}`;
  });
  if (output !== source) {
    writeFileSync(file, output);
    changed++;
  }
  if (/(?:\bfrom|\bimport)\s*\(?\s*["']@\//.test(output)) leftovers.push(relative(distDir, file));
}

if (leftovers.length > 0) {
  console.error(`❌ Alias @/ sobrou em ${leftovers.length} arquivo(s) do dist:`);
  for (const file of leftovers) console.error(`   ${file}`);
  process.exit(1);
}

console.log(`✅ Alias @/ reescrito em ${changed} arquivo(s) do dist`);
