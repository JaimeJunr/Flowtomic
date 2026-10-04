import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Convenções do shadcn desde fev/2025, que a lib adota a partir da 1.0 (exige React 19):
// `ref` é prop normal, então nada de forwardRef, e todo componente marca a raiz com data-slot.
// As áreas entram aqui conforme cada uma é migrada.
const COMPONENTS_DIR = path.resolve(__dirname, "../components");
const MIGRATED_AREAS = ["atoms", "molecules", "organisms"];

function componentFiles(area: string): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx$/.test(entry.name) && !/\.(stories|test)\.tsx$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(path.join(COMPONENTS_DIR, area));
  return files;
}

const relative = (file: string) => path.relative(COMPONENTS_DIR, file);

describe.each(MIGRATED_AREAS)("convenções do React 19 em %s", (area) => {
  it("nenhum componente usa forwardRef", () => {
    const offenders = componentFiles(area).filter((file) =>
      /\bforwardRef\b/.test(readFileSync(file, "utf8"))
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it("todo arquivo de componente marca a raiz com data-slot", () => {
    const offenders = componentFiles(area).filter((file) => {
      const source = readFileSync(file, "utf8");
      return /return\s*\(?\s*</.test(source) && !/data-slot=/.test(source);
    });
    expect(offenders.map(relative)).toEqual([]);
  });
});
