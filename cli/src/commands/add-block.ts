/**
 * Comando add-block - Adiciona blocks ao projeto
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'
import { resolveFlowtomicRepo } from '../utils/resolve-repo'
import { addBlock } from '../utils/block-utils'
import inquirer from 'inquirer'

// Carregar blocks dinamicamente do repositório
function loadBlocks() {
  const repoPath = resolveFlowtomicRepo()
  if (!repoPath) return []

  try {
    // Tentar carregar do JSON primeiro
    const jsonPath = join(repoPath, 'packages/ui/src/blocks/registry-blocks.json')
    if (existsSync(jsonPath)) {
      const content = readFileSync(jsonPath, 'utf-8')
      const data = JSON.parse(content)
      return data.blocks || []
    }

    // Fallback: tentar carregar do TypeScript (mais complexo)
    const tsPath = join(repoPath, 'packages/ui/src/blocks/registry-blocks.ts')
    if (existsSync(tsPath)) {
      const content = readFileSync(tsPath, 'utf-8')
      // Extrair o array de blocks usando regex
      const blocksMatch = content.match(/export const blocks: Block\[\] = (\[[\s\S]*?\])/m)
      if (blocksMatch) {
        try {
          // Avaliar o código TypeScript (remover tipos primeiro)
          const blocksCode = blocksMatch[1]
            .replace(/:\s*Block\[\]/g, '')
            .replace(/:\s*Block/g, '')
            .replace(/:\s*string/g, '')
            .replace(/:\s*number/g, '')
            .replace(/:\s*boolean/g, '')
            .replace(/:\s*'[^']*'/g, '')
          return eval(`(${blocksCode})`)
        } catch {
          // Se falhar, retornar vazio
        }
      }
    }
  } catch (error) {
    // Ignorar erros
  }

  return []
}

function findBlock(name: string) {
  const blocks = loadBlocks()
  return blocks.find((b: any) => b.name === name) || null
}

function listBlocks() {
  return loadBlocks()
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

export async function addBlockCommand(blockNames: string[]) {
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
    return
  }

  console.log(chalk.blue(`📦 Repositório encontrado: ${repoPath}`))

  // Se nenhum block especificado, mostrar lista interativa
  if (blockNames.length === 0) {
    const allBlocks = listBlocks()
    if (allBlocks.length === 0) {
      console.log(chalk.yellow('⚠️  Nenhum block disponível'))
      return
    }

    const choices = allBlocks.map(b => ({
      name: `${b.title} - ${b.description}`,
      value: b.name,
    }))

    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Selecione os blocks para adicionar:',
        choices,
      },
    ])

    blockNames = selected
  }

  if (blockNames.length === 0) {
    console.log(chalk.yellow('⚠️  Nenhum block selecionado'))
    return
  }

  // Adicionar cada block
  for (const blockName of blockNames) {
    const block = findBlock(blockName)
    if (!block) {
      console.log(chalk.red(`❌ Block "${blockName}" não encontrado`))
      continue
    }

    await addBlock(block, config, repoPath)
  }

  console.log(chalk.green('\n✅ Blocks adicionados com sucesso!'))
}

