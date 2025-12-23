/**
 * flowtomic/ui
 *
 * Biblioteca de componentes UI reutilizáveis
 * baseados em Radix UI e Tailwind CSS
 *
 * Estrutura baseada em Atomic Design:
 * - Atoms: Componentes básicos e indivisíveis
 * - Molecules: Componentes compostos
 * - Organisms: Componentes complexos
 */

// Atoms
export * from "./components/atoms";

// Molecules
export * from "./components/molecules";

// Organisms
export * from "./components/organisms";
// Utils
export { cn } from "./lib/utils";
// Types
export type { GridConfig, WidgetConfig, WidgetLayout } from "./types/dashboard";
