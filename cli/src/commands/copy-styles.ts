/**
 * Comando copy-styles - Copia arquivos de estilo do Flowtomic para o projeto
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { resolveFlowtomicRepo } from "../utils/resolve-repo";

interface ComponentsConfig {
  tailwind: {
    css: string;
  };
}

const STYLE_FILES = {
  globals: "globals.css",
  theme: "theme.css",
  typography: "typography.css",
  fonts: "fonts.css",
} as const;

type StyleFileKey = keyof typeof STYLE_FILES;

// Fontes do Google ficam fora do padrão (opt-in): só entram com `styles fonts` explícito.
const DEFAULT_STYLES: StyleFileKey[] = ["globals", "theme", "typography"];

export interface CopyStylesOptions {
  force?: boolean;
}

export async function copyStyles(styles: string[], options: CopyStylesOptions = {}) {
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
    console.log(chalk.gray("   Exemplo: export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic"));
    return;
  }

  console.log(chalk.blue(`📦 Repositório encontrado: ${repoPath}`));

  // Se nenhum estilo especificado, copiar todos
  if (styles.length === 0) {
    styles = DEFAULT_STYLES;
    console.log(
      chalk.blue(
        "📝 Nenhum estilo especificado, copiando os padrões (fonts fica de fora: use `styles fonts`)..."
      )
    );
  }

  // Validar estilos fornecidos
  const invalidStyles = styles.filter((s) => !(s in STYLE_FILES));
  if (invalidStyles.length > 0) {
    console.log(chalk.red(`❌ Estilos inválidos: ${invalidStyles.join(", ")}`));
    console.log(chalk.yellow(`💡 Estilos disponíveis: ${Object.keys(STYLE_FILES).join(", ")}`));
    return;
  }

  // O globals.css faz @import "./theme.css": sem ele ao lado, o build do projeto quebra
  if (styles.includes("globals") && !styles.includes("theme")) {
    styles = [...styles, "theme"];
    console.log(chalk.blue("📝 globals.css importa theme.css, copiando os dois..."));
  }

  // Determinar diretório de destino baseado no arquivo CSS configurado
  const cssPath = config.tailwind.css;
  const targetDir = dirname(cssPath);
  const targetDirPath = join(process.cwd(), targetDir);

  // Criar diretório de destino se não existir
  if (!existsSync(targetDirPath)) {
    mkdirSync(targetDirPath, { recursive: true });
    console.log(chalk.green(`📁 Diretório criado: ${targetDir}`));
  }

  // Copiar cada arquivo de estilo
  const copiedFiles: string[] = [];
  for (const styleKey of styles as StyleFileKey[]) {
    const fileName = STYLE_FILES[styleKey];
    const sourcePath = join(repoPath, "packages", "styles", fileName);
    const targetPath = join(targetDirPath, fileName);

    if (!existsSync(sourcePath)) {
      console.log(chalk.yellow(`⚠️  Arquivo ${fileName} não encontrado no repositório, pulando...`));
      continue;
    }

    try {
      const content = readFileSync(sourcePath, "utf-8");
      // fonts.css costuma ser customizado pelo projeto: não sobrescreve sem --force
      if (
        styleKey === "fonts" &&
        !options.force &&
        existsSync(targetPath) &&
        readFileSync(targetPath, "utf-8") !== content
      ) {
        console.log(
          chalk.yellow(
            `   ⚠️  ${targetDir}/${fileName} já existe e é diferente; use --force para sobrescrever, pulando...`
          )
        );
        continue;
      }
      writeFileSync(targetPath, content, "utf-8");
      copiedFiles.push(fileName);
      console.log(chalk.green(`   ✅ ${fileName} copiado para ${targetDir}/${fileName}`));
    } catch (error) {
      console.log(chalk.red(`   ❌ Erro ao copiar ${fileName}: ${error}`));
    }
  }

  if (copiedFiles.length === 0) {
    console.log(chalk.yellow("⚠️  Nenhum arquivo foi copiado"));
    return;
  }

  // Atualizar arquivo CSS principal com imports
  const mainCssPath = join(process.cwd(), cssPath);
  if (existsSync(mainCssPath)) {
    updateMainCssFile(mainCssPath, copiedFiles, targetDir);
  } else {
    console.log(chalk.yellow(`⚠️  Arquivo CSS principal não encontrado em ${cssPath}`));
    console.log(chalk.blue("💡 Você precisará importar manualmente os arquivos copiados:"));
    copiedFiles.forEach((file) => {
      const importPath = targetDir === "." ? `./${file}` : `${targetDir}/${file}`;
      console.log(chalk.gray(`   @import '${importPath}';`));
    });
  }

  console.log(chalk.green("\n✅ Arquivos de estilo copiados com sucesso!"));
}

/**
 * Atualiza o arquivo CSS principal com imports dos arquivos copiados
 */
function updateMainCssFile(mainCssPath: string, copiedFiles: string[], targetDir: string) {
  let content = readFileSync(mainCssPath, "utf-8");

  // Remover imports antigos dos arquivos de estilo
  copiedFiles.forEach((file) => {
    // Casa `./fonts.css` e `../x/fonts`, mas não `./brand-fonts`, que é do projeto
    const importPattern = new RegExp(
      `@import\\s+['"](?:[^'"]*/)?${file.replace(".css", "")}(?:\\.css)?['"];?\\s*`,
      "g"
    );
    content = content.replace(importPattern, "");
  });

  // Determinar caminho relativo para imports
  const mainCssDir = dirname(mainCssPath);
  const stylesDir = join(process.cwd(), targetDir);
  const relativePath = getRelativePath(mainCssDir, stylesDir);

  // Adicionar imports no início do arquivo (após @import 'tailwindcss' se existir)
  const imports: string[] = [];

  // Ordem específica: globals, theme, typography e fontes opcionais
  const orderedFiles = ["globals.css", "theme.css", "typography.css", "fonts.css"].filter((f) =>
    copiedFiles.includes(f)
  );

  orderedFiles.forEach((file) => {
    const importPath =
      relativePath === "." ? `./${file}` : `${relativePath}/${file}`.replace(/\\/g, "/");
    imports.push(`@import '${importPath}';`);
  });

  // Inserir imports após @import 'tailwindcss' se existir
  const tailwindImportPattern = /(@import\s+['"]tailwindcss['"];?)/;
  if (tailwindImportPattern.test(content)) {
    content = content.replace(tailwindImportPattern, `$1\n${imports.join("\n")}`);
  } else {
    // Se não houver @import 'tailwindcss', adicionar no início
    content = `${imports.join("\n")}\n\n${content}`;
  }

  writeFileSync(mainCssPath, content, "utf-8");
  console.log(chalk.green(`   ✅ Arquivo CSS principal atualizado: ${mainCssPath}`));
}

/**
 * Calcula o caminho relativo entre dois diretórios
 */
function getRelativePath(from: string, to: string): string {
  const fromParts = from.split(/[/\\]/).filter(Boolean);
  const toParts = to.split(/[/\\]/).filter(Boolean);

  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }

  const upLevels = fromParts.length - i;
  const downPath = toParts.slice(i).join("/");

  if (upLevels === 0 && downPath === "") {
    return ".";
  }

  const upPath = upLevels > 0 ? "../".repeat(upLevels) : "";
  return upPath + downPath || ".";
}
