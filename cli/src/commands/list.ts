/**
 * Comando list - Lista componentes, hooks e blocks disponíveis
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { listComponents, listHooks } from "../utils/component-map";
import { resolveFlowtomicRepo } from "../utils/resolve-repo";

function loadBlocks() {
  const repoPath = resolveFlowtomicRepo();
  if (!repoPath) return [];

  try {
    const jsonPath = join(repoPath, "packages/ui/src/blocks/registry-blocks.json");
    if (existsSync(jsonPath)) {
      const content = readFileSync(jsonPath, "utf-8");
      const data = JSON.parse(content);
      return data.blocks || [];
    }
  } catch {
    // Ignorar erros
  }

  return [];
}

export async function list() {
  const components = listComponents();
  const hooks = listHooks();
  const blocks = loadBlocks();

  console.log(chalk.blue("\n📦 Componentes UI disponíveis:\n"));

  // Agrupar por tipo
  const atoms = components.filter((c) => c.type === "atom");
  const molecules = components.filter((c) => c.type === "molecule");
  const organisms = components.filter((c) => c.type === "organism");

  if (atoms.length > 0) {
    console.log(chalk.bold("  Atoms:"));
    atoms.forEach((c) => {
      console.log(chalk.gray(`    - ${c.name}`));
    });
    console.log();
  }

  if (molecules.length > 0) {
    console.log(chalk.bold("  Molecules:"));
    molecules.forEach((c) => {
      console.log(chalk.gray(`    - ${c.name}`));
    });
    console.log();
  }

  if (organisms.length > 0) {
    console.log(chalk.bold("  Organisms:"));
    organisms.forEach((c) => {
      console.log(chalk.gray(`    - ${c.name}`));
    });
    console.log();
  }

  if (hooks.length > 0) {
    console.log(chalk.blue("🪝 Hooks disponíveis:\n"));
    hooks.forEach((h) => {
      console.log(chalk.gray(`    - ${h.name}`));
    });
    console.log();
  }

  if (blocks.length > 0) {
    console.log(chalk.blue("🧱 Blocks disponíveis:\n"));
    blocks.forEach((b: { name: string; title: string; description: string }) => {
      console.log(chalk.gray(`    - ${b.name}: ${b.title}`));
      console.log(chalk.dim(`      ${b.description}`));
    });
    console.log();
  }

  console.log(chalk.yellow('💡 Use "npx flowtomic add <nome>" para adicionar um componente'));
  console.log(chalk.yellow('💡 Use "npx flowtomic add-block <nome>" para adicionar um block'));
}
