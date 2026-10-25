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
import ts from "typescript";

const distDir = join(import.meta.dir, "..", "packages", "ui", "dist");
const componentsDir = join(distDir, "components");
const IGNORED = new Set(["react", "react-dom", "cn", "class-variance-authority", "tw-animate-css"]);

/** O AST distingue specifiers de atributos como "data-from", strings e comentários. */
export function importSpecifiers(source: string, filename: string): string[] {
  const parsed = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const imports: string[] = [];
  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      imports.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      imports.push(node.argument.literal.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      imports.push(node.arguments[0].text);
    } else if (
      ts.isExternalModuleReference(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression)
    ) {
      imports.push(node.expression.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  return imports;
}

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
  const declarations = fromFile.endsWith(".d.ts");
  const candidates = declarations
    ? [base.replace(/\.js$/, ".d.ts"), `${base}.d.ts`, join(base, "index.d.ts")]
    : [base, `${base}.js`, join(base, "index.js")];
  return candidates.find(
    (candidate) =>
      candidate.endsWith(declarations ? ".d.ts" : ".js") &&
      existsSync(candidate) &&
      statSync(candidate).isFile()
  );
}

function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

export function generatePeerTable(componentsDir: string): {
  table: string;
  components: number;
  files: number;
  imports: number;
} {
  const cache = new Map<string, string[]>();
  function closure(entry: string): Set<string> {
    const packages = new Set<string>();
    const seen = new Set<string>();
    const stack = [entry];
    while (stack.length) {
      const file = stack.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      let specifiers = cache.get(file);
      if (!specifiers) {
        specifiers = importSpecifiers(readFileSync(file, "utf8"), file);
        cache.set(file, specifiers);
      }
      for (const specifier of specifiers) {
        if (specifier.startsWith("./") || specifier.startsWith("../")) {
          const next = resolveRelative(file, specifier);
          if (next) stack.push(next);
        } else if (!IGNORED.has(packageName(specifier))) {
          packages.add(packageName(specifier));
        }
      }
    }
    return packages;
  }

  const rows = new Map<string, string[]>();
  const folders = componentFolders(componentsDir).sort();
  for (const folder of folders) {
    const name = relative(componentsDir, folder).split("/").pop() as string;
    const runtime = closure(join(folder, "index.js"));
    const declarations = closure(join(folder, "index.d.ts"));
    const peers = [...new Set([...runtime, ...declarations])].sort();
    const key = peers.map((peer) => (runtime.has(peer) ? peer : `${peer} (só tipos)`)).join(", ");
    rows.set(key, [...(rows.get(key) ?? []), name]);
  }

  const lines = [
    "| Componentes | Peers externos alcançados (além de `react`/`react-dom`) |",
    "| --- | --- |",
  ];
  for (const [peers, names] of [...rows.entries()].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(
      `| ${names
        .sort()
        .map((n) => `\`${n}\``)
        .join(", ")} | ${peers || "nenhum"} |`
    );
  }

  return {
    table: lines.join("\n"),
    components: folders.length,
    files: cache.size,
    imports: [...cache.values()].reduce((count, imports) => count + imports.length, 0),
  };
}

if (import.meta.main) {
  const result = generatePeerTable(componentsDir);
  console.log(result.table);
  console.error(
    `Peers: ${result.components} componentes, ${result.files} arquivos JS/d.ts, ${result.imports} imports analisados`
  );
}
