/**
 * useProjectProgress - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * function MyProjectProgress() {
 *   const { percentage, status, distribution } = useProjectProgress({
 *     projects: [
 *       { id: '1', status: 'completed', ... },
 *       { id: '2', status: 'in-progress', ... },
 *       { id: '3', status: 'pending', ... },
 *     ],
 *   })
 *
 *   return (
 *     <div>
 *       <div>Progress: {percentage}%</div>
 *       <div>Status: {status}</div>
 *     </div>
 *   )
 * }
 * ```
 */

import { useMemo } from "react";

export type ProjectProgressStatus = "completed" | "in-progress" | "pending" | "on-hold";

export interface ProjectWithProgress {
  id: string;
  status: ProjectProgressStatus;
  progress?: number; // 0-100, opcional
  [key: string]: unknown;
}

export interface UseProjectProgressOptions {
  /**
   * Lista de projetos com progresso
   */
  projects: ProjectWithProgress[];

  /**
   * Função customizada para calcular progresso de um projeto
   * Se não fornecido, usa progress do projeto ou calcula baseado no status
   */
  calculateProgress?: (project: ProjectWithProgress) => number;
}

export interface ProjectProgressDistribution {
  /**
   * Número de projetos completados
   */
  completed: number;

  /**
   * Número de projetos em progresso
   */
  inProgress: number;

  /**
   * Número de projetos pendentes
   */
  pending: number;

  /**
   * Número de projetos em espera
   */
  onHold: number;
}

export interface UseProjectProgressReturn {
  /**
   * Porcentagem total de progresso (0-100)
   */
  percentage: number;

  /**
   * Status geral do progresso
   */
  status: "completed" | "in-progress" | "pending" | "on-hold";

  /**
   * Distribuição de projetos por status
   */
  distribution: ProjectProgressDistribution;

  /**
   * Total de projetos
   */
  total: number;

  /**
   * Projetos completados
   */
  completed: number;

  /**
   * Projetos em progresso
   */
  inProgress: number;

  /**
   * Projetos pendentes
   */
  pending: number;

  /**
   * Projetos em espera
   */
  onHold: number;
}

/**
 * Calcula progresso padrão baseado no status
 */
function getDefaultProgress(project: ProjectWithProgress): number {
  if (project.progress !== undefined) {
    return project.progress;
  }

  switch (project.status) {
    case "completed":
      return 100;
    case "in-progress":
      return 50; // Valor padrão para projetos em progresso
    case "pending":
      return 0;
    case "on-hold":
      return 0;
    default:
      return 0;
  }
}

/**
 * Hook headless para calcular progresso de projetos
 */
export function useProjectProgress(options: UseProjectProgressOptions): UseProjectProgressReturn {
  const { projects, calculateProgress = getDefaultProgress } = options;

  const result = useMemo(() => {
    if (projects.length === 0) {
      return {
        percentage: 0,
        status: "pending" as const,
        distribution: {
          completed: 0,
          inProgress: 0,
          pending: 0,
          onHold: 0,
        },
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        onHold: 0,
      };
    }

    // Calcular distribuição
    const distribution: ProjectProgressDistribution = {
      completed: 0,
      inProgress: 0,
      pending: 0,
      onHold: 0,
    };

    let totalProgress = 0;

    projects.forEach((project) => {
      const progress = calculateProgress(project);
      totalProgress += progress;

      switch (project.status) {
        case "completed":
          distribution.completed++;
          break;
        case "in-progress":
          distribution.inProgress++;
          break;
        case "pending":
          distribution.pending++;
          break;
        case "on-hold":
          distribution.onHold++;
          break;
      }
    });

    // Calcular porcentagem média
    const percentage = Math.round(totalProgress / projects.length);

    // Determinar status geral
    let status: "completed" | "in-progress" | "pending" | "on-hold" = "pending";
    if (distribution.completed === projects.length) {
      status = "completed";
    } else if (distribution.inProgress > 0 || distribution.completed > 0) {
      status = "in-progress";
    } else if (distribution.onHold > 0) {
      status = "on-hold";
    }

    return {
      percentage,
      status,
      distribution,
      total: projects.length,
      completed: distribution.completed,
      inProgress: distribution.inProgress,
      pending: distribution.pending,
      onHold: distribution.onHold,
    };
  }, [projects, calculateProgress]);

  return result;
}
