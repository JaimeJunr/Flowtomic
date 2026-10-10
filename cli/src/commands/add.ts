import chalk from "chalk";
import inquirer from "inquirer";
import { listComponents, listHooks } from "../utils/component-map";
import { createInstaller } from "../utils/install";
import { readComponentsConfig } from "../utils/project-config";
import { resolveFlowtomicRepo } from "../utils/resolve-repo";

export async function add(components: string[]) {
  const config = readComponentsConfig();
  const repoPath = resolveFlowtomicRepo();
  if (!repoPath)
    throw new Error(
      "Não foi possível encontrar o repositório Flowtomic. Defina FLOWTOMIC_REPO_PATH."
    );
  console.log(chalk.blue(`📦 Repositório encontrado: ${repoPath}`));
  if (components.length === 0) {
    const { selected } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selected",
        message: "Selecione os componentes para adicionar:",
        choices: [...listComponents(), ...listHooks()].map((entry) => ({
          name: `${entry.name} (${entry.type})`,
          value: entry.name,
        })),
      },
    ]);
    components = selected;
  }
  if (components.length === 0) {
    console.log(chalk.yellow("Nenhum componente selecionado"));
    return;
  }
  const installer = createInstaller(config, repoPath);
  for (const name of components) installer.component(name);
  installer.apply();
  console.log(chalk.green("\n✅ Componentes adicionados com sucesso!"));
}
