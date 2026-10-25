import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generatePeerTable, importSpecifiers } from "./peer-table";

const table = execFileSync("bun", ["run", "scripts/peer-table.ts"], {
  cwd: `${import.meta.dir}/..`,
  encoding: "utf8",
});
const rowFor = (name: string) => table.split("\n").find((line) => line.includes(`\`${name}\``));

describe("tabela dos peers publicados", () => {
  it("não interpreta data-from nem texto JS como pacote", () => {
    expect(rowFor("blur-text")?.split("|").at(-2)?.trim()).toBe("motion");
    expect(table).not.toContain(": from,");
  });
  it("documenta o peer ai dos tipos públicos de image", () => {
    expect(rowFor("image")).toContain("ai (só tipos)");
  });
  it("documenta o peer @xyflow/react dos tipos públicos de connection", () => {
    expect(rowFor("connection")).toContain("@xyflow/react (só tipos)");
  });
});

// Fixtures pequenas guardam o parser e o fecho transitivo, além da tabela real acima.
describe("parser e fecho transitivo", () => {
  it("extrai apenas imports/reexports reais e import types", () => {
    const source = `
      import { x } from "@scope/pkg/path";
      export { y } from "motion/react";
      import "side-effect";
      const lazy = import("lazy-package");
      type T = import("type-package").T;
      import Legacy = require("legacy-package");
      // import { fake } from "comment-package";
      const text = 'import("string-package")';
      const props = { "data-from": "not-a-package", from: "not-a-package-either" };
    `;
    expect(importSpecifiers(source, "sample.ts")).toEqual([
      "@scope/pkg/path",
      "motion/react",
      "side-effect",
      "lazy-package",
      "type-package",
      "legacy-package",
    ]);
  });

  it("segue .d.ts transitivos com specifier .js, encerra ciclos e distingue runtime de tipos", () => {
    const root = mkdtempSync(join(tmpdir(), "flowtomic-peers-"));
    try {
      const component = join(root, "sample");
      mkdirSync(component);
      const files = {
        "index.js": 'export * from "./runtime.js";',
        "runtime.js": 'export { motion } from "motion/react";',
        "index.d.ts": 'export * from "./public.js";',
        "public.d.ts":
          'export { motion } from "motion/react"; export * from "./shared.js"; export type A = import("ai").A;',
        "shared.d.ts":
          'export * from "./public.js"; export type { Connection } from "@xyflow/react";',
      };
      for (const [name, text] of Object.entries(files)) writeFileSync(join(component, name), text);
      const result = generatePeerTable(root);
      expect(result.table).toContain(
        "| `sample` | @xyflow/react (só tipos), ai (só tipos), motion |"
      );
      expect(result.components).toBe(1);
      expect(result.files).toBe(5);
      expect(result.imports).toBe(8);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
