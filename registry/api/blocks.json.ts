/**
 * API Route para /blocks.json
 * Compatível com Vercel Serverless Functions
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const config = {
  runtime: 'edge',
}

export default function handler(req: Request) {
  try {
    const registryPath = join(process.cwd(), 'registry', 'registry.json')
    
    if (existsSync(registryPath)) {
      const registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
      
      return new Response(JSON.stringify(registry.blocks || [], null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      })
    }

    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load blocks' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

