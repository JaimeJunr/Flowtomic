/**
 * Comando add-block - Adiciona blocks ao projeto
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import inquirer from "inquirer";
import { addBlock } from "../utils/block-utils";
import { resolveFlowtomicRepo } from "../utils/resolve-repo";

// Interface Block para tipagem
interface Block {
  name: string;
  author: string;
  title: string;
  description: string;
  type: "registry:block";
  registryDependencies?: string[];
  dependencies?: string[];
  files: Array<{
    path: string;
    type: "registry:page" | "registry:component" | "registry:hook" | "registry:lib";
    target?: string;
  }>;
  categories: string[];
}

// Carregar blocks dinamicamente do repositório
function loadBlocks(): Block[] {
  const repoPath = resolveFlowtomicRepo();
  if (!repoPath) return [];

  try {
    // Carregar do JSON (formato seguro e recomendado)
    const jsonPath = join(repoPath, "packages/ui/src/blocks/registry-blocks.json");
    if (existsSync(jsonPath)) {
      const content = readFileSync(jsonPath, "utf-8");
      const data = JSON.parse(content);
      return (data.blocks || []) as Block[];
    }
  } catch {
    // Ignorar erros - retornar array vazio se não conseguir carregar
  }

  return [];
}

function findBlock(name: string): Block | null {
  const blocks = loadBlocks();
  return blocks.find((b) => b.name === name) || null;
}

function listBlocks(): Block[] {
  return loadBlocks();
}

interface ComponentsConfig {
  aliases: {
    components: string;
    utils: string;
    ui: string;
    hooks: string;
  };
  packages: {
    ui: string;
    logic: string;
  };
}

export async function addBlockCommand(blockNames: string[]) {
  const configPath = join(process.cwd(), "components.json");

  if (!existsSync(configPath)) {
    console.log(chalk.red("❌ components.json não encontrado"));
    console.log(chalk.yellow('💡 Execute "npx flowtomic init" primeiro'));
    return;
  }

  const config: ComponentsConfig = JSON.parse(readFileSync(configPath, "utf-8"));

  // Resolver caminho do repositório Flowtomic
  const repoPath = resolveFlowtomicRepo();
  if (!repoPath) {
    console.log(chalk.red("❌ Não foi possível encontrar o repositório Flowtomic"));
    console.log(chalk.yellow("💡 Defina a variável de ambiente FLOWTOMIC_REPO_PATH"));
    return;
  }

  console.log(chalk.blue(`📦 Repositório encontrado: ${repoPath}`));

  // Se nenhum block especificado, mostrar lista interativa
  if (blockNames.length === 0) {
    const allBlocks = listBlocks();
    if (allBlocks.length === 0) {
      console.log(chalk.yellow("⚠️  Nenhum block disponível"));
      return;
    }

    const choices = allBlocks.map((b: Block) => ({
      name: `${b.title} - ${b.description}`,
      value: b.name,
    }));

    const { selected } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "Selecione os blocks para adicionar:",
        choices,
      },
    ]);

    blockNames = selected;
  }

  if (blockNames.length === 0) {
    console.log(chalk.yellow("⚠️  Nenhum block selecionado"));
    return;
  }

  // Adicionar cada block
  for (const blockName of blockNames) {
    const block = findBlock(blockName);
    if (!block) {
      console.log(chalk.red(`❌ Block "${blockName}" não encontrado`));
      continue;
    }

    await addBlock(block, config, repoPath);
  }

  console.log(chalk.green("\n✅ Blocks adicionados com sucesso!"));
}
