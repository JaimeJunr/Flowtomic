import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyLibDependencies, findLibImports } from "./lib-files";

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

describe("findLibImports", () => {
  it("lista os imports de @/lib, exceto o utils", () => {
    const source = `
      import { cn } from "@/lib/utils";
      import { useShouldReduceMotion } from "@/lib/use-should-reduce-motion";
      import { useWebglCanvas } from '@/lib/webgl';
      import { motion } from "motion/react";
    `;

    expect(findLibImports(source)).toEqual(["use-should-reduce-motion", "webgl"]);
  });

  it("devolve vazio quando o arquivo não importa nada de @/lib além do utils", () => {
    expect(findLibImports(`import { cn } from "@/lib/utils";`)).toEqual([]);
  });
});

describe("copyLibDependencies", () => {
  let root: string;
  let repoLibRoot: string;
  let targetLibRoot: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "flowtomic-lib-"));
    repoLibRoot = join(root, "repo", "lib");
    targetLibRoot = join(root, "projeto", "lib");
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("copia o helper que o componente importa", () => {
    writeFile(join(repoLibRoot, "use-should-reduce-motion.ts"), "export const x = 1;\n");

    const copied = copyLibDependencies(`import { x } from "@/lib/use-should-reduce-motion";`, {
      repoLibRoot,
      targetLibRoot,
    });

    expect(copied).toEqual(["use-should-reduce-motion.ts"]);
    expect(readFileSync(join(targetLibRoot, "use-should-reduce-motion.ts"), "utf-8")).toBe(
      "export const x = 1;\n"
    );
  });

  // O lib/webgl é uma pasta cujo index reexporta arquivos irmãos, que por sua vez
  // importam helpers de fora da pasta. Copiar só o index deixaria imports quebrados.
  it("resolve pasta com index e segue os imports relativos e de @/lib dos arquivos copiados", () => {
    writeFile(join(repoLibRoot, "webgl", "index.ts"), `export * from "./use-webgl-canvas";\n`);
    writeFile(
      join(repoLibRoot, "webgl", "use-webgl-canvas.ts"),
      `import { y } from "../use-should-reduce-motion";\nimport { z } from "@/lib/read-theme-color";\n`
    );
    writeFile(join(repoLibRoot, "use-should-reduce-motion.ts"), "export const y = 1;\n");
    writeFile(join(repoLibRoot, "read-theme-color.ts"), "export const z = 1;\n");

    const copied = copyLibDependencies(`import { w } from "@/lib/webgl";`, {
      repoLibRoot,
      targetLibRoot,
    });

    expect([...copied].sort()).toEqual([
      "read-theme-color.ts",
      "use-should-reduce-motion.ts",
      "webgl/index.ts",
      "webgl/use-webgl-canvas.ts",
    ]);
  });

  it("não sobrescreve arquivo que o projeto já tem", () => {
    writeFile(join(repoLibRoot, "use-should-reduce-motion.ts"), "export const novo = 1;\n");
    writeFile(join(targetLibRoot, "use-should-reduce-motion.ts"), "// editado pelo usuário\n");

    const copied = copyLibDependencies(`import { x } from "@/lib/use-should-reduce-motion";`, {
      repoLibRoot,
      targetLibRoot,
    });

    expect(copied).toEqual([]);
    expect(readFileSync(join(targetLibRoot, "use-should-reduce-motion.ts"), "utf-8")).toBe(
      "// editado pelo usuário\n"
    );
  });

  it("ignora import de @/lib que não existe no repositório, sem lançar erro", () => {
    const copied = copyLibDependencies(`import { x } from "@/lib/nao-existe";`, {
      repoLibRoot,
      targetLibRoot,
    });

    expect(copied).toEqual([]);
    expect(existsSync(targetLibRoot)).toBe(false);
  });

  it("não copia arquivo de fora da pasta lib, mesmo importado por um helper", () => {
    writeFile(join(repoLibRoot, "a.ts"), `import { c } from "../components/c";\n`);
    writeFile(join(root, "repo", "components", "c.ts"), "export const c = 1;\n");

    const copied = copyLibDependencies(`import { a } from "@/lib/a";`, {
      repoLibRoot,
      targetLibRoot,
    });

    expect(copied).toEqual(["a.ts"]);
    expect(existsSync(join(root, "projeto", "components"))).toBe(false);
  });

  it("não entra em loop com imports circulares", () => {
    writeFile(join(repoLibRoot, "a.ts"), `import { b } from "./b";\n`);
    writeFile(join(repoLibRoot, "b.tsx"), `import { a } from "./a";\n`);

    const copied = copyLibDependencies(`import { a } from "@/lib/a";`, {
      repoLibRoot,
      targetLibRoot,
    });

    expect([...copied].sort()).toEqual(["a.ts", "b.tsx"]);
  });
});
