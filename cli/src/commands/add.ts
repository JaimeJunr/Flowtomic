/**
 * Comando add - Adiciona componentes ou hooks ao projeto
 */

import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import chalk from 'chalk'
import { findComponent, listComponents, listHooks } from '../utils/component-map'
import { resolveFlowtomicRepo, resolveComponentPath } from '../utils/resolve-repo'
import { copyAndAdjustImports, ensureUtilsFile } from '../utils/file-utils'
import inquirer from 'inquirer'

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

export async function add(components: string[]) {
  const configPath = join(process.cwd(), 'components.json')

  if (!existsSync(configPath)) {
    console.log(chalk.red('❌ components.json não encontrado'))
    console.log(chalk.yellow('💡 Execute "npx flowtomic init" primeiro'))
    return
  }

  const config: ComponentsConfig = JSON.parse(
    readFileSync(configPath, 'utf-8')
  )

  // Resolver caminho do repositório Flowtomic
  const repoPath = resolveFlowtomicRepo()
  if (!repoPath) {
    console.log(chalk.red('❌ Não foi possível encontrar o repositório Flowtomic'))
    console.log(chalk.yellow('💡 Defina a variável de ambiente FLOWTOMIC_REPO_PATH'))
    console.log(chalk.gray('   Exemplo: export FLOWTOMIC_REPO_PATH=/caminho/para/flowtomic'))
    return
  }

  console.log(chalk.blue(`📦 Repositório encontrado: ${repoPath}`))

  // Se nenhum componente especificado, mostrar lista interativa
  if (components.length === 0) {
    const allComponents = [...listComponents(), ...listHooks()]
    const choices = allComponents.map(c => ({
      name: `${c.name} (${c.type})`,
      value: c.name,
    }))

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Selecione os componentes para adicionar:',
        choices,
      },
    ])

    components = selected
  }

  if (components.length === 0) {
    console.log(chalk.yellow('⚠️  Nenhum componente selecionado'))
    return
  }

  // Garantir que utils.ts existe
  const utilsPath = join(process.cwd(), config.aliases.utils.replace('@/', '') + '.ts')
  ensureUtilsFile(utilsPath, repoPath)

  // Adicionar cada componente
  for (const componentName of components) {
    await addComponent(componentName, config, repoPath)
  }

  console.log(chalk.green('\n✅ Componentes adicionados com sucesso!'))
}

async function addComponent(
  componentName: string,
  config: ComponentsConfig,
  repoPath: string
) {
  const component = findComponent(componentName)

  if (!component) {
    console.log(chalk.red(`❌ Componente "${componentName}" não encontrado`))
    console.log(chalk.yellow('💡 Use "npx flowtomic list" para ver componentes disponíveis'))
    return
  }

  console.log(chalk.blue(`\n📦 Adicionando ${component.name} (${component.type})...`))

  // Determinar diretório de destino
  const isHook = component.type === 'atom' && component.path.includes('hooks')
  const baseAlias = isHook ? config.aliases.hooks : config.aliases.ui
  const basePath = baseAlias.replace('@/', '')
  const targetDir = join(process.cwd(), basePath, component.name)

  // Copiar cada arquivo do componente
  for (const file of component.files) {
    const sourcePath = resolveComponentPath(join(component.path, file), repoPath)
    if (!sourcePath) {
      console.log(chalk.yellow(`⚠️  Arquivo ${file} não encontrado, pulando...`))
      continue
    }

    const targetPath = join(targetDir, file)

    try {
      copyAndAdjustImports(sourcePath, targetPath, {
        utilsAlias: config.aliases.utils,
        componentsAlias: config.aliases.ui,
        hooksAlias: config.aliases.hooks,
      })
      console.log(chalk.green(`   ✅ ${file}`))
    } catch (error) {
      console.log(chalk.red(`   ❌ Erro ao copiar ${file}: ${error}`))
    }
  }

  // Verificar e instalar dependências
  if (component.dependencies && component.dependencies.length > 0) {
    console.log(chalk.blue(`   📦 Dependências necessárias: ${component.dependencies.join(', ')}`))
    console.log(chalk.yellow(`   💡 Certifique-se de que todas as dependências estão instaladas`))
  }
}
