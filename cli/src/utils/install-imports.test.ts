import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInstaller } from "./install";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const config = {
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    hooks: "@/hooks",
  },
};
const DEFAULT_PATHS: Record<string, string> = { "@/*": "src/*" };
const LOCAL_IMPORT = /(?:from\s+|import\s*)["']((?:\.{1,2}\/|@\/)[^"']*)["']/g;

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

// Invariante: todo import relativo ou "@/..." de arquivo instalado resolve, segundo os paths, para arquivo existente.
function unresolvedImports(project: string, paths = DEFAULT_PATHS): string[] {
  const missing: string[] = [];
  for (const file of filesUnder(project).filter((path) => /\.tsx?$/.test(path))) {
    for (const [, specifier] of readFileSync(file, "utf-8").matchAll(LOCAL_IMPORT)) {
      const target = specifier.startsWith(".")
        ? resolve(dirname(file), specifier)
        : join(project, paths[specifier] ?? paths["@/*"].replace("*", specifier.slice(2)));
      if (!["", ".ts", ".tsx", "/index.ts", "/index.tsx"].some((ext) => isFile(target + ext)))
        missing.push(`${relative(project, file)} -> ${specifier}`);
    }
  }
  return missing;
}

describe("imports locais dos arquivos instalados", () => {
  let project: string;

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), "flowtomic-imports-"));
    writeFileSync(join(project, "components.json"), JSON.stringify(config));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(project, { recursive: true, force: true });
  });

  function install(name: string, paths = DEFAULT_PATHS): void {
    const compilerPaths = Object.fromEntries(
      Object.entries(paths).map(([alias, target]) => [alias, [target]])
    );
    writeFileSync(
      join(project, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths: compilerPaths } })
    );
    const installer = createInstaller(config, repo, project);
    installer.component(name);
    installer.apply();
  }

  // Achado da revisão do PR #82: o helper ia para dirname(utils) e o import apontava para outro lugar.
  it("helper de lib vai para onde o import aponta quando utils tem mapeamento exato", () => {
    const paths = { "@/*": "src/*", "@/lib/utils": "src/helpers/utils" };
    install("stretch-switch", paths);
    expect(existsSync(join(project, "src/helpers/utils.ts"))).toBe(true);
    expect(
      readFileSync(join(project, "src/components/ui/stretch-switch/stretch-switch.tsx"), "utf-8")
    ).toContain('from "@/lib/use-should-reduce-motion"');
    expect(unresolvedImports(project, paths)).toEqual([]);
  });
});
