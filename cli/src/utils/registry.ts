/**
 * Utilitários para trabalhar com o registry online
 */

const REGISTRY_URL = process.env.FLOWTOMIC_REGISTRY_URL || 'https://registry.flowtomic.dev'

/**
 * Busca o registry completo online
 */
export async function fetchRegistry(): Promise<any> {
  try {
    const response = await fetch(`${REGISTRY_URL}/all.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar registry online:', error)
    return null
  }
}

/**
 * Busca um componente específico do registry
 */
export async function fetchComponent(name: string): Promise<any> {
  try {
    const response = await fetch(`${REGISTRY_URL}/${name}.json`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    return null
  }
}

/**
 * Busca blocks do registry
 */
export async function fetchBlocks(): Promise<any[]> {
  try {
    const response = await fetch(`${REGISTRY_URL}/blocks.json`)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    return []
  }
}

/**
 * Verifica se o registry está acessível
 */
export async function checkRegistry(): Promise<boolean> {
  try {
    const response = await fetch(`${REGISTRY_URL}/all.json`, {
      method: 'HEAD',
    })
    return response.ok
  } catch {
    return false
  }
}

