#!/usr/bin/env bun

/**
 * Script para gerar o registry completo
 * 
 * Este script gera o registry.json completo com todos os componentes e blocks
 * seguindo o schema do shadcn/ui
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

interface ComponentInfo {
  name: string
  type: 'atom' | 'molecule' | 'organism'
  path: string
  files: string[]
  dependencies?: string[]
}

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

interface RegistryItem {
  name: string
  type: string
  files: Array<{
    path: string
    type: string
    content?: string
    target?: string
  }>
  dependencies?: string[]
  registryDependencies?: string[]
  [key: string]: any
}

/**
 * Carrega o component map do CLI
 */
function loadComponentMap(): { components: ComponentInfo[], hooks: ComponentInfo[] } {
  const componentMapPath = join(rootDir, 'cli/src/utils/component-map.ts')
  if (!existsSync(componentMapPath)) {
    return { components: [], hooks: [] }
  }

  try {
    const content = readFileSync(componentMapPath, 'utf-8')
    
    // Extrair COMPONENT_MAP usando regex
    const componentMapMatch = content.match(/export const COMPONENT_MAP: Record<string, ComponentInfo> = ({[\s\S]*?})/m)
    const hookMapMatch = content.match(/export const HOOK_MAP: Record<string, ComponentInfo> = ({[\s\S]*?})/m)

    const components: ComponentInfo[] = []
    const hooks: ComponentInfo[] = []

    if (componentMapMatch) {
      // Parsear o objeto (simplificado - em produção usar um parser mais robusto)
      const mapContent = componentMapMatch[1]
      // Extrair cada entrada do objeto
      const entries = mapContent.match(/'([^']+)':\s*{[\s\S]*?}/g) || []
      
      for (const entry of entries) {
        const nameMatch = entry.match(/'([^']+)':/)
        if (!nameMatch) continue
        
        const name = nameMatch[1]
        const typeMatch = entry.match(/type:\s*'([^']+)'/)
        const pathMatch = entry.match(/path:\s*'([^']+)'/)
        const filesMatch = entry.match(/files:\s*\[([^\]]+)\]/)
        const depsMatch = entry.match(/dependencies:\s*\[([^\]]+)\]/)

        if (name && typeMatch && pathMatch && filesMatch) {
          const type = typeMatch[1] as 'atom' | 'molecule' | 'organism'
          const path = pathMatch[1]
          const files = filesMatch[1]
            .split(',')
            .map(f => f.trim().replace(/['"]/g, ''))
            .filter(Boolean)
          const dependencies = depsMatch 
            ? depsMatch[1].split(',').map(d => d.trim().replace(/['"]/g, '')).filter(Boolean)
            : undefined

          const component: ComponentInfo = {
            name,
            type,
            path,
            files,
            dependencies,
          }

          if (type === 'atom' && path.includes('hooks')) {
            hooks.push(component)
          } else {
            components.push(component)
          }
        }
      }
    }

    if (hookMapMatch) {
      // Similar para hooks
      const mapContent = hookMapMatch[1]
      const entries = mapContent.match(/'([^']+)':\s*{[\s\S]*?}/g) || []
      
      for (const entry of entries) {
        const nameMatch = entry.match(/'([^']+)':/)
        if (!nameMatch) continue
        
        const name = nameMatch[1]
        const typeMatch = entry.match(/type:\s*'([^']+)'/)
        const pathMatch = entry.match(/path:\s*'([^']+)'/)
        const filesMatch = entry.match(/files:\s*\[([^\]]+)\]/)
        const depsMatch = entry.match(/dependencies:\s*\[([^\]]+)\]/)

        if (name && typeMatch && pathMatch && filesMatch) {
          const type = typeMatch[1] as 'atom' | 'molecule' | 'organism'
          const path = pathMatch[1]
          const files = filesMatch[1]
            .split(',')
            .map(f => f.trim().replace(/['"]/g, ''))
            .filter(Boolean)
          const dependencies = depsMatch 
            ? depsMatch[1].split(',').map(d => d.trim().replace(/['"]/g, '')).filter(Boolean)
            : undefined

          hooks.push({
            name,
            type,
            path,
            files,
            dependencies,
          })
        }
      }
    }

    return { components, hooks }
  } catch (error) {
    console.error('Erro ao carregar component map:', error)
    return { components: [], hooks: [] }
  }
}

/**
 * Carrega blocks do JSON
 */
function loadBlocks(): Block[] {
  const blocksPath = join(rootDir, 'packages/ui/src/blocks/registry-blocks.json')
  if (existsSync(blocksPath)) {
    try {
    const content = readFileSync(blocksPath, 'utf-8')
      const data = JSON.parse(content)
      return data.blocks || []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Converte ComponentInfo para RegistryItem
 */
function componentToRegistryItem(component: ComponentInfo, repoPath: string): RegistryItem {
  const files = component.files.map(file => {
    const filePath = join(repoPath, component.path, file)
    let content = ''
    
    if (existsSync(filePath)) {
      try {
        content = readFileSync(filePath, 'utf-8')
      } catch {
        // Ignorar erros de leitura
      }
    }

    return {
      path: `${component.path}/${file}`,
      type: file.endsWith('.tsx') || file.endsWith('.ts') 
        ? 'registry:component' 
        : 'registry:lib',
      content,
    }
  })

  return {
    name: component.name,
    type: `registry:${component.type}`,
    files,
    dependencies: component.dependencies || [],
  }
}

/**
 * Gera o registry completo
 */
function generateRegistry() {
  const repoPath = rootDir
  const { components, hooks } = loadComponentMap()
  const blocks = loadBlocks()

  // Converter componentes para formato do registry
  const componentsRegistry = components.map(c => componentToRegistryItem(c, repoPath))
  const hooksRegistry = hooks.map(h => componentToRegistryItem(h, repoPath))

  // Converter blocks para formato do registry
  const blocksRegistry = blocks.map(block => ({
    ...block,
    files: block.files.map(file => ({
      ...file,
      path: `blocks/${file.path}`,
    })),
  }))

  return {
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'default',
    components: [...componentsRegistry, ...hooksRegistry],
    blocks: blocksRegistry,
  }
}

/**
 * Gera e salva o registry
 */
function main() {
  console.log('📦 Gerando registry completo...')
  
  const registry = generateRegistry()
  
  const outputPath = join(rootDir, 'registry', 'registry.json')
  writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf-8')
  
  console.log(`✅ Registry gerado em: ${outputPath}`)
  console.log(`   - ${registry.components.length} componentes`)
  console.log(`   - ${registry.blocks.length} blocks`)
}

main()

