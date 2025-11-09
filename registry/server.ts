#!/usr/bin/env bun

/**
 * Servidor do Registry Flowtomic
 * 
 * Serve o registry JSON para compatibilidade com shadcn CLI
 * 
 * Uso:
 *   bun run registry/server.ts
 * 
 * Endpoints:
 *   GET /all.json - Retorna todos os componentes e blocks
 *   GET /blocks.json - Retorna apenas os blocks
 *   GET /components.json - Retorna apenas os componentes
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Carregar registry de blocks do JSON
function loadBlocks() {
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

// Carregar component map (simplificado para o servidor)
// Em produção, isso seria gerado em build time
function loadComponentMap() {
  // Por enquanto, retornar arrays vazios
  // Em produção, isso seria gerado a partir do component-map.ts
  return { components: [], hooks: [] }
}

/**
 * Gera o registry completo
 */
function generateRegistry() {
  const blocks = loadBlocks()
  const { components, hooks } = loadComponentMap()

  // Converter blocks para o formato do registry
  const blocksRegistry = blocks.map((block: any) => ({
    ...block,
    // Converter paths relativos para absolutos no registry
    files: block.files.map((file: any) => ({
      ...file,
      path: `blocks/${file.path}`,
    })),
  }))

  return {
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'default',
    components: [...components, ...hooks],
    blocks: blocksRegistry,
  }
}

/**
 * Servidor HTTP simples
 */
const port = process.env.PORT || 3001
const host = process.env.HOST || 'localhost'

const server = Bun.serve({
  port,
  hostname: host,
  fetch(req) {
    const url = new URL(req.url)
    
    if (url.pathname === '/all.json') {
      const registry = generateRegistry()
      return new Response(JSON.stringify(registry, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (url.pathname === '/blocks.json') {
      const registry = generateRegistry()
      return new Response(JSON.stringify(registry.blocks, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (url.pathname === '/components.json') {
      const registry = generateRegistry()
      return new Response(JSON.stringify(registry.components, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    return new Response('Not Found', { status: 404 })
  },
})

console.log(`🚀 Registry Flowtomic rodando em http://${host}:${port}`)
console.log(`📦 Endpoints disponíveis:`)
console.log(`   - http://${host}:${port}/all.json`)
console.log(`   - http://${host}:${port}/blocks.json`)
console.log(`   - http://${host}:${port}/components.json`)
