/**
 * Comando init - Inicializa configuração do Flowtomic no projeto
 */

import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";

const DEFAULT_CONFIG = {
  $schema: "https://flowtomic.dev/schema.json",
  style: "default",
  rsc: false,
  tsx: true,
  tailwind: {
    config: "tailwind.config.js",
    css: "src/index.css",
    baseColor: "slate",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    hooks: "@/hooks",
  },
  packages: {
    ui: "flowtomic/ui",
    logic: "flowtomic/logic",
  },
};

export async function init() {
  const configPath = join(process.cwd(), "components.json");

  if (existsSync(configPath)) {
    console.log(chalk.yellow("⚠️  components.json já existe"));
    return;
  }

  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));

  console.log(chalk.green("✅ Configuração do Flowtomic inicializada!"));
  console.log(chalk.blue("📝 Arquivo components.json criado"));
}
