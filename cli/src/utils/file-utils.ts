/**
 * Utilitários para manipulação de arquivos
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";

/**
 * Copia um arquivo e ajusta os imports
 */
export function copyAndAdjustImports(
  sourcePath: string,
  targetPath: string,
  config: {
    utilsAlias: string;
    componentsAlias: string;
    hooksAlias: string;
  }
): void {
  if (!existsSync(sourcePath)) {
    throw new Error(`Arquivo não encontrado: ${sourcePath}`);
  }

  // Criar diretório de destino se não existir
  const targetDir = dirname(targetPath);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Ler conteúdo do arquivo
  let content = readFileSync(sourcePath, "utf-8");

  // Ajustar imports
  content = adjustImports(content, config);

  // Escrever arquivo de destino
  writeFileSync(targetPath, content, "utf-8");
}

/**
 * Ajusta os imports do arquivo para usar os aliases do projeto
 */
function adjustImports(
  content: string,
  config: {
    utilsAlias: string;
    componentsAlias: string;
    hooksAlias: string;
  }
): string {
  // Substituir imports do flowtomic/ui para usar alias local
  content = content.replace(/from ['"]flowtomic\/ui\/(.*?)['"]/g, (match, path) => {
    // Se for lib/utils, usar utilsAlias
    if (path === "lib/utils") {
      return `from '${config.utilsAlias}'`;
    }
    // Se for components, usar componentsAlias
    if (path.startsWith("components/")) {
      const componentPath = path.replace("components/", "");
      return `from '${config.componentsAlias}/${componentPath}'`;
    }
    return match;
  });

  // Substituir imports do flowtomic/logic para usar hooksAlias
  content = content.replace(/from ['"]flowtomic\/logic\/hooks\/(.*?)['"]/g, (_match, hookName) => {
    return `from '${config.hooksAlias}/${hookName}'`;
  });

  // Substituir imports relativos do repositório para relativos locais
  // Ex: import { cn } from '../../../lib/utils' -> import { cn } from '@/lib/utils'
  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/lib\/utils['"]/g,
    `from '${config.utilsAlias}'`
  );

  // Substituir imports relativos de componentes
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/components\/(.*?)['"]/g, (_match, path) => {
    return `from '${config.componentsAlias}/${path}'`;
  });

  // Substituir imports relativos de atoms/molecules/organisms
  content = content.replace(/from ['"]\.\.\/\.\.\/atoms\/(.*?)['"]/g, (_match, path) => {
    return `from '${config.componentsAlias}/atoms/${path}'`;
  });

  content = content.replace(/from ['"]\.\.\/\.\.\/molecules\/(.*?)['"]/g, (_match, path) => {
    return `from '${config.componentsAlias}/molecules/${path}'`;
  });

  content = content.replace(/from ['"]\.\.\/\.\.\/organisms\/(.*?)['"]/g, (_match, path) => {
    return `from '${config.componentsAlias}/organisms/${path}'`;
  });

  return content;
}

/**
 * Copia o arquivo utils.ts se necessário
 */
export function ensureUtilsFile(targetUtilsPath: string, repoPath: string | null): void {
  if (existsSync(targetUtilsPath)) {
    return; // Já existe
  }

  if (!repoPath) {
    console.log(chalk.yellow("⚠️  Não foi possível copiar utils.ts automaticamente"));
    return;
  }

  const sourceUtilsPath = join(repoPath, "packages", "ui", "src", "lib", "utils.ts");
  if (!existsSync(sourceUtilsPath)) {
    console.log(chalk.yellow("⚠️  utils.ts não encontrado no repositório"));
    return;
  }

  // Criar diretório se não existir
  const utilsDir = dirname(targetUtilsPath);
  if (!existsSync(utilsDir)) {
    mkdirSync(utilsDir, { recursive: true });
  }

  // Copiar arquivo
  copyFileSync(sourceUtilsPath, targetUtilsPath);
  console.log(chalk.green(`✅ utils.ts criado em ${targetUtilsPath}`));
}
