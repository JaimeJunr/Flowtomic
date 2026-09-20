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
 * O endpoint é remoto: proxy, página de erro em HTML ou deploy pela metade
 * devolvem 200 com corpo que não é um registry. Sem esta checagem esse corpo
 * seguia adiante tipado como `RegistryData` e quebrava longe daqui.
 */
function ehRegistryData(valor: unknown): valor is RegistryData {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

/** Assinatura mínima do `fetch` que este módulo usa; injetável para teste. */
type Buscador = (url: string) => Promise<Response>;

/**
 * Busca o registry completo online
 */
export async function fetchRegistry(buscar: Buscador = fetch): Promise<RegistryData | null> {
  try {
    const response = await buscar(`${REGISTRY_URL}/all.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`);
    }
    const dados: unknown = await response.json();
    return ehRegistryData(dados) ? dados : null;
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
