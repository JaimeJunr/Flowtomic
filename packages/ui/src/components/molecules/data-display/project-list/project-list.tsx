/**
 * ProjectList - Componente Visual
 *
 * Lista de projetos com ícones, datas e ações
 */

import { Calendar, Plus } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "../../../atoms";

export interface Project {
  id: string;
  name: string;
  dueDate: string | Date;
  icon?: React.ReactNode;
  iconColor?: string;
  status?: "active" | "pending" | "completed" | "on-hold";
}

export interface ProjectListProps {
  /**
   * Lista de projetos
   */
  projects: Project[];

  /**
   * Título do card
   */
  title?: string;

  /**
   * Callback quando um projeto é clicado
   */
  onProjectClick?: (project: Project) => void;

  /**
   * Callback quando o botão "New" é clicado
   */
  onAddNew?: () => void;

  /**
   * Texto do botão de adicionar
   * @default "+ New"
   */
  addButtonText?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Formata data para exibição
 */
function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Componente de lista de projetos
 */
export function ProjectList({
  projects,
  title = "Project",
  onProjectClick,
  onAddNew,
  addButtonText = "+ New",
  className,
}: ProjectListProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        {onAddNew && (
          <Button variant="ghost" size="sm" onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No projects</div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                {...(onProjectClick
                  ? {
                      role: "button",
                      tabIndex: 0,
                      onClick: () => onProjectClick(project),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onProjectClick(project);
                        }
                      },
                    }
                  : {})}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  onProjectClick &&
                    "cursor-pointer hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                {/* Ícone */}
                {project.icon && (
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded",
                      project.iconColor || "bg-primary/10"
                    )}
                    style={project.iconColor ? { backgroundColor: project.iconColor } : undefined}
                  >
                    {project.icon}
                  </div>
                )}

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{project.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due date: {formatDate(project.dueDate)}</span>
                  </div>
                </div>

                {/* Status badge (opcional) */}
                {project.status && (
                  <Badge
                    variant={
                      project.status === "completed"
                        ? "default"
                        : project.status === "active"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {project.status}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
