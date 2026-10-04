/**
 * ProjectList - Componente Visual
 *
 * Lista densa de projetos: nome, prazo em mono e estado, separados por régua de 1px
 * (DESIGN.md, "Lista densa"). Prazo passado de projeto não concluído vira "venceu".
 */

import { Plus } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms";

export type ProjectStatus = "active" | "pending" | "completed" | "on-hold";

export interface Project {
  id: string;
  name: string;
  dueDate: string | Date;
  icon?: React.ReactNode;
  /**
   * @deprecated O ícone sai sempre na cor do texto suave (DESIGN.md, cor só onde carrega
   * significado). Mantido só para não quebrar quem já passa.
   */
  iconColor?: string;
  status?: ProjectStatus;
}

export interface ProjectListProps {
  /**
   * Lista de projetos
   */
  projects: Project[];

  /**
   * Título da seção
   * @default "Projetos"
   */
  title?: string;

  /**
   * Callback quando um projeto é clicado. Com ele, cada linha vira um botão.
   */
  onProjectClick?: (project: Project) => void;

  /**
   * Callback do botão de adicionar. Sem ele, o botão não aparece.
   */
  onAddNew?: () => void;

  /**
   * Texto do botão de adicionar (o ícone de "+" já vem junto)
   * @default "Novo projeto"
   */
  addButtonText?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Ativo",
  pending: "Pendente",
  completed: "Concluído",
  "on-hold": "Em espera",
};

const STATUS_TONE: Record<ProjectStatus, string> = {
  active: "bg-info/10 text-info",
  pending: "bg-muted text-foreground",
  completed: "bg-success/10 text-success",
  "on-hold": "bg-warning/10 text-warning",
};

// "2026-10-06" sozinho o Date lê como meia-noite UTC, que no Brasil ainda é o dia 05.
function toLocalDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  return new Date(date);
}

function isOverdue(project: Project, due: Date): boolean {
  if (project.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function DueDate({ project }: { project: Project }) {
  const due = toLocalDate(project.dueDate);
  const text = due.toLocaleDateString("pt-BR");
  const late = isOverdue(project, due);
  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[13px]",
        project.icon && "max-sm:ml-8",
        late ? "text-destructive" : "text-muted-foreground"
      )}
    >
      {late ? `venceu ${text}` : text}
    </span>
  );
}

function ProjectRowContent({ project }: { project: Project }) {
  return (
    <>
      {project.icon && (
        <span className="flex shrink-0 text-muted-foreground [&_svg]:size-4" aria-hidden="true">
          {project.icon}
        </span>
      )}
      <span className="min-w-0 flex-1 font-medium max-sm:basis-[calc(100%-2rem)] sm:truncate">
        {project.name}
      </span>
      <DueDate project={project} />
      {project.status && (
        // Coluna de largura fixa para as datas ficarem alinhadas entre as linhas.
        <span className="flex w-24 shrink-0 justify-end max-sm:ml-auto">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[13px] font-medium leading-5",
              STATUS_TONE[project.status]
            )}
          >
            {STATUS_LABEL[project.status]}
          </span>
        </span>
      )}
    </>
  );
}

// No celular a data e o estado descem para a linha de baixo, alinhados com o nome.
const ROW_CLASS = "flex flex-wrap items-center gap-x-4 gap-y-1 px-2 py-3";

/**
 * Componente de lista de projetos
 */
export function ProjectList({
  projects,
  title = "Projetos",
  onProjectClick,
  onAddNew,
  addButtonText = "Novo projeto",
  className,
}: ProjectListProps) {
  return (
    <section data-slot="project-list" className={cn("text-sm", className)}>
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="font-mono text-[13px] text-muted-foreground">{projects.length}</span>
        <div className="h-px flex-1 bg-border" />
        {onAddNew && (
          <Button variant="outline" size="sm" onClick={onAddNew}>
            <Plus className="size-4" aria-hidden="true" />
            {addButtonText}
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhum projeto ainda.</p>
      ) : (
        <ul className="mt-3">
          {projects.map((project) => (
            <li key={project.id} className="border-t border-border first:border-t-0">
              {onProjectClick ? (
                <button
                  type="button"
                  onClick={() => onProjectClick(project)}
                  className={cn(
                    ROW_CLASS,
                    "w-full rounded-lg text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  <ProjectRowContent project={project} />
                </button>
              ) : (
                <div className={ROW_CLASS}>
                  <ProjectRowContent project={project} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
