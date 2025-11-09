/**
 * Utilitários para manipulação de blocks
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import chalk from 'chalk'
import { copyAndAdjustImports, ensureUtilsFile } from './file-utils'
import { resolveFlowtomicRepo, resolveComponentPath } from './resolve-repo'

// Tipos inline para evitar problemas de importação
interface BlockFile {
  path: string
  type: 'registry:page' | 'registry:component' | 'registry:hook' | 'registry:lib'
  target?: string
}

interface Block {
  name: string
  author: string
  title: string
  description: string
  type: 'registry:block'
  registryDependencies?: string[]
  dependencies?: string[]
  files: BlockFile[]
  categories: string[]
}

interface ComponentsConfig {
  aliases: {
    components: string
    utils: string
    ui: string
    hooks: string
  }
  packages: {
    ui: string
    logic: string
  }
}

/**
 * Adiciona um block ao projeto
 */
export async function addBlock(
  block: Block,
  config: ComponentsConfig,
  repoPath: string
): Promise<void> {
  console.log(chalk.blue(`\n📦 Adicionando block "${block.title}"...`))

  // Instalar dependências do registry primeiro
  if (block.registryDependencies && block.registryDependencies.length > 0) {
    console.log(chalk.blue(`   📋 Dependências do registry: ${block.registryDependencies.join(', ')}`))
    console.log(chalk.yellow(`   💡 Certifique-se de que os componentes estão instalados`))
  }

  // Garantir que utils.ts existe
  const utilsPath = join(process.cwd(), config.aliases.utils.replace('@/', '') + '.ts')
  ensureUtilsFile(utilsPath, repoPath)

  // Processar cada arquivo do block
  for (const file of block.files) {
    await processBlockFile(file, block, config, repoPath)
  }

  // Verificar e instalar dependências npm
  if (block.dependencies && block.dependencies.length > 0) {
    console.log(chalk.blue(`   📦 Dependências npm necessárias: ${block.dependencies.join(', ')}`))
    console.log(chalk.yellow(`   💡 Execute: npm install ${block.dependencies.join(' ')}`))
  }

  console.log(chalk.green(`   ✅ Block "${block.title}" adicionado com sucesso!`))
}

/**
 * Processa um arquivo do block
 */
async function processBlockFile(
  file: BlockFile,
  block: Block,
  config: ComponentsConfig,
  repoPath: string
): Promise<void> {
  // Determinar caminho de origem
  const sourcePath = resolveComponentPath(
    join('packages/ui/src/blocks', file.path),
    repoPath
  )

  if (!sourcePath || !existsSync(sourcePath)) {
    console.log(chalk.yellow(`   ⚠️  Arquivo ${file.path} não encontrado, pulando...`))
    return
  }

  // Determinar caminho de destino
  let targetPath: string

  if (file.type === 'registry:page' && file.target) {
    // Para pages, usar o target especificado
    targetPath = join(process.cwd(), file.target)
  } else if (file.type === 'registry:component') {
    // Para componentes, usar o alias de componentes
    const fileName = file.path.split('/').pop() || 'component.tsx'
    const componentName = block.name
    const basePath = config.aliases.ui.replace('@/', '')
    targetPath = join(process.cwd(), basePath, componentName, fileName)
  } else if (file.type === 'registry:hook') {
    // Para hooks, usar o alias de hooks
    const fileName = file.path.split('/').pop() || 'hook.ts'
    const hookName = block.name
    const basePath = config.aliases.hooks.replace('@/', '')
    targetPath = join(process.cwd(), basePath, hookName, fileName)
  } else if (file.type === 'registry:lib') {
    // Para libs, usar o alias de utils (ou criar uma pasta lib)
    const fileName = file.path.split('/').pop() || 'lib.ts'
    const basePath = config.aliases.utils.replace('@/', '')
    const libDir = dirname(basePath)
    targetPath = join(process.cwd(), libDir, fileName)
  } else {
    // Fallback: colocar na raiz do projeto
    const fileName = file.path.split('/').pop() || 'file.ts'
    targetPath = join(process.cwd(), fileName)
  }

  // Criar diretório de destino
  const targetDir = dirname(targetPath)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  try {
    copyAndAdjustImports(sourcePath, targetPath, {
      utilsAlias: config.aliases.utils,
      componentsAlias: config.aliases.ui,
      hooksAlias: config.aliases.hooks,
    })
    console.log(chalk.green(`   ✅ ${file.path} -> ${targetPath}`))
  } catch (error) {
    console.log(chalk.red(`   ❌ Erro ao copiar ${file.path}: ${error}`))
  }
}

