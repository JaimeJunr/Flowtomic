/**
 * Tipos genéricos para componentes de Dashboard
 *
 * Tipos reutilizáveis para qualquer implementação de dashboard
 * com drag and drop e widgets customizáveis.
 */

/**
 * Layout de um widget no grid
 */
export interface WidgetLayout {
  /**
   * ID único do widget
   */
  id: string;

  /**
   * Tipo do widget (string genérico para flexibilidade)
   */
  type: string;

  /**
   * Posição X na grade (coluna inicial)
   */
  x: number;

  /**
   * Posição Y na grade (linha inicial)
   */
  y: number;

  /**
   * Largura em unidades de grade
   */
  w: number;

  /**
   * Altura em unidades de grade
   */
  h: number;

  /**
   * Configuração específica do widget
   */
  config?: Record<string, unknown>;

  /**
   * Se o widget está minimizado
   */
  minimized?: boolean;
}

/**
 * Configuração de grid do dashboard
 */
export interface GridConfig {
  /**
   * Número de colunas do grid
   */
  columns: number;

  /**
   * Tamanho de cada célula em pixels
   */
  cellSize?: number;

  /**
   * Espaçamento entre widgets
   */
  gap?: number;
}

/**
 * Configuração específica de um widget
 */
export interface WidgetConfig {
  /**
   * Fonte de dados para o widget
   */
  dataSource?: string;

  /**
   * Configurações adicionais específicas do widget
   */
  [key: string]: unknown;
}
