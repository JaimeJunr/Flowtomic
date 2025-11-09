/**
 * API Route para /all.json
 * Compatível com Vercel Serverless Functions
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const config = {
  runtime: 'edge', // ou 'nodejs' dependendo da necessidade
}

export default function handler(req: Request) {
  try {
    // Tentar carregar o registry gerado
    const registryPath = join(process.cwd(), 'registry', 'registry.json')
    
    if (existsSync(registryPath)) {
      const registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
      
      return new Response(JSON.stringify(registry, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      })
    }

    // Fallback: gerar dinamicamente
    return new Response(JSON.stringify({
      $schema: 'https://ui.shadcn.com/schema.json',
      style: 'default',
      components: [],
      blocks: [],
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load registry' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

