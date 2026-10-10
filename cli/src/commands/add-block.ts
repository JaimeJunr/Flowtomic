import { readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import type { Block } from "../utils/block-utils";
import { createInstaller } from "../utils/install";
import { readComponentsConfig } from "../utils/project-config";
import { resolveFlowtomicRepo } from "../utils/resolve-repo";

export async function addBlockCommand(blockNames: string[]) {
  const config = readComponentsConfig();
  const repoPath = resolveFlowtomicRepo();
  if (!repoPath)
    throw new Error(
      "Não foi possível encontrar o repositório Flowtomic. Defina FLOWTOMIC_REPO_PATH."
    );
  console.log(chalk.blue(`📦 Repositório encontrado: ${repoPath}`));
  const registryPath = join(repoPath, "packages/ui/src/blocks/registry-blocks.json");
  const data = JSON.parse(readFileSync(registryPath, "utf-8")) as { blocks: Block[] };
  if (!Array.isArray(data.blocks)) throw new Error(`Registry de blocks inválido: ${registryPath}`);
  if (blockNames.length === 0) {
    const { selected } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "Selecione os blocks para adicionar:",
        choices: data.blocks.map((block) => ({
          name: `${block.title} - ${block.description || ""}`,
          value: block.name,
        })),
      },
    ]);
    blockNames = selected;
  }
  if (blockNames.length === 0) {
    console.log(chalk.yellow("Nenhum block selecionado"));
    return;
  }
  const installer = createInstaller(config, repoPath);
  for (const name of blockNames) {
    const block = data.blocks.find((entry) => entry.name === name);
    if (!block) throw new Error(`Block "${name}" não encontrado`);
    installer.block(block);
  }
  installer.apply();
  console.log(chalk.green("\n✅ Blocks adicionados com sucesso!"));
}
