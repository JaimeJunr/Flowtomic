import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Barrel de categoria = index.ts de uma pasta que re-exporta subpastas (atoms, molecules,
 * organisms e subcategorias como atoms/layout). Importar um barrel arrasta todas as famílias
 * para dentro do subpath do componente: quem usa FormLayout passa a precisar de peers de
 * tiptap, xyflow, vaul etc. Por isso componentes importam o arquivo do componente, nunca barrel.
 */

const SRC = resolve(__dirname, "..");
const COMPONENTS = join(SRC, "components");
// Só casa imports/exports em início de linha e import() dinâmico: `from "..."` dentro de um
// template string (snippet de código exibido na doc) não é import.
const SPECIFIER =
  /(?:^[ \t]*(?:import|export)\b[^"'`;]*?\bfrom\s*|^[ \t]*import\s*|\bimport\s*\(\s*)["']([^"']+)["']/gm;

function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

function listSources(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (isDirectory(path)) return listSources(path);
    return /\.tsx?$/.test(entry) && !entry.endsWith(".d.ts") ? [path] : [];
  });
}

function isCategoryBarrel(indexPath: string, source: string): boolean {
  const dir = dirname(indexPath);
  return [...source.matchAll(/from\s+["'](\.\.?\/[^"']+)["']/g)].some((match) =>
    isDirectory(resolve(dir, match[1]))
  );
}

function resolveLocal(fromFile: string, specifier: string): string | undefined {
  let base: string | undefined;
  if (specifier === "@flowtomic/ui") base = SRC;
  else if (specifier.startsWith("@/")) base = join(SRC, specifier.slice(2));
  else if (specifier.startsWith("@flowtomic/ui/"))
    base = join(SRC, specifier.slice("@flowtomic/ui/".length));
  else if (specifier.startsWith("./") || specifier.startsWith("../"))
    base = resolve(dirname(fromFile), specifier);
  if (!base) return undefined;
  // components/ é reservado como barrel raiz, mesmo antes de existir no disco.
  if (base === SRC || base === COMPONENTS) return join(base, "index.ts");
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

/** Devolve, para cada arquivo, os specifiers que resolvem para um barrel de categoria. */
function findCategoryBarrelImports(files: Map<string, string>, barrels: Set<string>): string[] {
  const violations: string[] = [];
  for (const [file, source] of files) {
    if (barrels.has(file)) continue;
    for (const match of source.matchAll(SPECIFIER)) {
      const target = resolveLocal(file, match[1]);
      if (target && barrels.has(target)) {
        violations.push(`${relative(SRC, file)} -> ${match[1]}`);
      }
    }
  }
  return violations;
}

function loadComponentTree(): { files: Map<string, string>; barrels: Set<string> } {
  const files = new Map<string, string>();
  const barrels = new Set([join(SRC, "index.ts"), join(COMPONENTS, "index.ts")]);
  for (const file of listSources(COMPONENTS)) {
    const source = readFileSync(file, "utf8");
    files.set(file, source);
    if (file.endsWith("/index.ts") && isCategoryBarrel(file, source)) barrels.add(file);
  }
  return { files, barrels };
}

describe("imports de barrel de categoria em components", () => {
  it("nenhum arquivo de components importa barrel de categoria (exceto os próprios barrels)", () => {
    const { files, barrels } = loadComponentTree();

    const candidates = [...files].filter(([file]) => !barrels.has(file));
    const imports = candidates.reduce(
      (count, [, source]) => count + [...source.matchAll(SPECIFIER)].length,
      0
    );
    expect(imports).toBeGreaterThan(0);
    expect(barrels.size).toBeGreaterThan(2);
    expect(findCategoryBarrelImports(files, barrels)).toEqual([]);
  });

  it("acusa import de barrel por alias e aceita import direto do componente", () => {
    const barrels = new Set([join(COMPONENTS, "atoms", "index.ts")]);
    const consumer = join(COMPONENTS, "organisms", "form-layout", "form-layout.tsx");

    const viaBarrel = new Map([[consumer, 'import { Button } from "@/components/atoms";']]);
    expect(findCategoryBarrelImports(viaBarrel, barrels)).toEqual([
      "components/organisms/form-layout/form-layout.tsx -> @/components/atoms",
    ]);

    const direct = new Map([
      [consumer, 'import { Button } from "@/components/atoms/actions/button";'],
    ]);
    expect(findCategoryBarrelImports(direct, barrels)).toEqual([]);
  });
});

describe("barrels raiz", () => {
  it.each([
    "@flowtomic/ui",
    "@/index",
    "../../../../index",
    "../../../..",
  ])("acusa import raiz plantado via %s no conjunto real de barrels", (specifier) => {
    const { barrels } = loadComponentTree();
    const consumer = join(COMPONENTS, "atoms", "actions", "button", "probe.tsx");
    const files = new Map([[consumer, `import { Button } from "${specifier}";`]]);
    expect(findCategoryBarrelImports(files, barrels)).toEqual([
      `components/atoms/actions/button/probe.tsx -> ${specifier}`,
    ]);
  });

  it("considera @/components mesmo quando o barrel ainda não existe no disco", () => {
    const { barrels } = loadComponentTree();
    const consumer = join(COMPONENTS, "atoms", "actions", "button", "probe.tsx");
    expect(
      findCategoryBarrelImports(
        new Map([[consumer, 'export { Button } from "@/components";']]),
        barrels
      )
    ).toEqual(["components/atoms/actions/button/probe.tsx -> @/components"]);
  });
});
