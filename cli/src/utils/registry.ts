/**
 * Utilitários para trabalhar com o registry online
 */

const REGISTRY_URL = process.env.FLOWTOMIC_REGISTRY_URL || "https://registry.flowtomic.dev";

interface RegistryData {
  $schema?: string;
  style?: string;
  components?: unknown[];
  blocks?: unknown[];
}

/**
 * Busca o registry completo online
 */
export async function fetchRegistry(): Promise<RegistryData | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/all.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar registry online:", error);
    return null;
  }
}

/**
 * Busca um componente específico do registry
 */
export async function fetchComponent(name: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${REGISTRY_URL}/${name}.json`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

interface Block {
  name: string;
  title: string;
  description: string;
  [key: string]: unknown;
}

/**
 * Busca blocks do registry
 */
export async function fetchBlocks(): Promise<Block[]> {
  try {
    const response = await fetch(`${REGISTRY_URL}/blocks.json`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Verifica se o registry está acessível
 */
export async function checkRegistry(): Promise<boolean> {
  try {
    const response = await fetch(`${REGISTRY_URL}/all.json`, {
      method: "HEAD",
    });
    return response.ok;
  } catch {
    return false;
  }
}
