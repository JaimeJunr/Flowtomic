#!/usr/bin/env bun

/**
 * Script para copiar arquivos CSS do packages/styles para packages/ui/dist/styles
 * durante o build do package UI
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const STYLE_FILES = ["globals.css", "theme.css", "typography.css"] as const;

const rootDir = join(import.meta.dir, "..");
const stylesSourceDir = join(rootDir, "packages", "styles");
const stylesTargetDir = join(rootDir, "packages", "ui", "dist", "styles");

// Criar diretório de destino se não existir
if (!existsSync(stylesTargetDir)) {
  mkdirSync(stylesTargetDir, { recursive: true });
  console.log(`📁 Diretório criado: ${stylesTargetDir}`);
}

// Copiar cada arquivo CSS
let copiedCount = 0;
for (const fileName of STYLE_FILES) {
  const sourcePath = join(stylesSourceDir, fileName);
  const targetPath = join(stylesTargetDir, fileName);

  if (!existsSync(sourcePath)) {
    console.error(`❌ Arquivo não encontrado: ${sourcePath}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(sourcePath, "utf-8");
    writeFileSync(targetPath, content, "utf-8");
    copiedCount++;
    console.log(`✅ ${fileName} copiado para dist/styles/`);
  } catch (error) {
    console.error(`❌ Erro ao copiar ${fileName}:`, error);
    process.exit(1);
  }
}

if (copiedCount === STYLE_FILES.length) {
  console.log(`\n✅ Todos os arquivos CSS copiados com sucesso! (${copiedCount}/${STYLE_FILES.length})`);
} else {
  console.error(`\n❌ Erro: Apenas ${copiedCount}/${STYLE_FILES.length} arquivos foram copiados`);
  process.exit(1);
}

