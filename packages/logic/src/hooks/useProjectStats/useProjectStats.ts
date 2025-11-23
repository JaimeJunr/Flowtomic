/**
 * useProjectStats - Headless UI Hook
 *
 * Fornece apenas: lógica, estado, processamento e API
 * NÃO fornece: markup, styles ou implementações pré-construídas
 *
 * Padrão Headless UI: você controla o markup e styles
 *
 * @example
 * ```tsx
 * function MyProjectStats() {
 *   const { total, ended, running, pending, stats } = useProjectStats({
 *     projects: [
 *       { id: '1', status: 'running', ... },
 *       { id: '2', status: 'ended', ... },
 *     ],
 *   })
 *
 *   return (
 *     <div>
 *       <div>Total: {total}</div>
 *       <div>Running: {running}</div>
 *       <div>Ended: {ended}</div>
 *       <div>Pending: {pending}</div>
 *     </div>
 *   )
 * }
 * ```
 */

import { useMemo } from "react";

export type ProjectStatus = "running" | "ended" | "pending" | "on-hold" | "cancelled";

export interface Project {
  id: string;
  status: ProjectStatus;
  [key: string]: unknown;
}

export interface UseProjectStatsOptions {
  /**
   * Lista de projetos
   */
  projects: Project[];

  /**
   * Função customizada para filtrar projetos
   */
  filter?: (project: Project) => boolean;

  /**
   * Função customizada para agrupar projetos
   */
  groupBy?: (project: Project) => string;
}

export interface ProjectStats {
  /**
   * Total de projetos
   */
  total: number;

  /**
   * Projetos finalizados
   */
  ended: number;

  /**
   * Projetos em execução
   */
  running: number;

  /**
   * Projetos pendentes
   */
  pending: number;

  /**
   * Projetos em espera
   */
  onHold: number;

  /**
   * Projetos cancelados
   */
  cancelled: number;

  /**
   * Distribuição por status
   */
  byStatus: Record<ProjectStatus, number>;

  /**
   * Projetos filtrados (se filter foi fornecido)
   */
  filtered: Project[];

  /**
   * Projetos agrupados (se groupBy foi fornecido)
   */
  grouped?: Record<string, Project[]>;
}

export interface UseProjectStatsReturn {
  /**
   * Estatísticas calculadas
   */
  stats: ProjectStats;

  /**
   * Total de projetos
   */
  total: number;

  /**
   * Projetos finalizados
   */
  ended: number;

  /**
   * Projetos em execução
   */
  running: number;

  /**
   * Projetos pendentes
   */
  pending: number;

  /**
   * Projetos em espera
   */
  onHold: number;

  /**
   * Projetos cancelados
   */
  cancelled: number;

  /**
   * Projetos filtrados
   */
  filtered: Project[];

  /**
   * Projetos agrupados
   */
  grouped?: Record<string, Project[]>;
}

/**
 * Hook headless para calcular estatísticas de projetos
 */
export function useProjectStats(options: UseProjectStatsOptions): UseProjectStatsReturn {
  const { projects, filter, groupBy } = options;

  const stats = useMemo(() => {
    // Aplicar filtro se fornecido
    const filtered = filter ? projects.filter(filter) : projects;

    // Calcular contagens por status
    const byStatus: Record<ProjectStatus, number> = {
      running: 0,
      ended: 0,
      pending: 0,
      "on-hold": 0,
      cancelled: 0,
    };

    filtered.forEach((project) => {
      const status = project.status || "pending";
      if (status in byStatus) {
        byStatus[status as ProjectStatus]++;
      }
    });

    // Agrupar se groupBy foi fornecido
    const grouped = groupBy
      ? filtered.reduce(
          (acc, project) => {
            const key = groupBy(project);
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(project);
            return acc;
          },
          {} as Record<string, Project[]>
        )
      : undefined;

    return {
      total: filtered.length,
      ended: byStatus.ended,
      running: byStatus.running,
      pending: byStatus.pending,
      onHold: byStatus["on-hold"],
      cancelled: byStatus.cancelled,
      byStatus,
      filtered,
      grouped,
    };
  }, [projects, filter, groupBy]);

  return {
    stats,
    total: stats.total,
    ended: stats.ended,
    running: stats.running,
    pending: stats.pending,
    onHold: stats.onHold,
    cancelled: stats.cancelled,
    filtered: stats.filtered,
    grouped: stats.grouped,
  };
}
