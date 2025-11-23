/**
 * TeamMemberList - Componente Visual
 *
 * Lista de membros da equipe com avatares, nomes, tarefas e status
 */

import { Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../atoms";

export type TeamMemberStatus = "completed" | "in-progress" | "pending";

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  task: string;
  status: TeamMemberStatus;
}

export interface TeamMemberListProps {
  /**
   * Lista de membros da equipe
   */
  members: TeamMember[];

  /**
   * Título do card
   */
  title?: string;

  /**
   * Callback quando um membro é clicado
   */
  onMemberClick?: (member: TeamMember) => void;

  /**
   * Callback quando o botão "Add Member" é clicado
   */
  onAddMember?: () => void;

  /**
   * Texto do botão de adicionar
   * @default "+ Add Member"
   */
  addButtonText?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * Obtém cor do status
 */
function getStatusColor(status: TeamMemberStatus): string {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "in-progress":
      return "text-orange-600";
    case "pending":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Obtém texto do status
 */
function getStatusText(status: TeamMemberStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

/**
 * Obtém iniciais do nome
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Componente de lista de membros da equipe
 */
export function TeamMemberList({
  members,
  title = "Team Collaboration",
  onMemberClick,
  onAddMember,
  addButtonText = "+ Add Member",
  className,
}: TeamMemberListProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        {onAddMember && (
          <Button variant="ghost" size="sm" onClick={onAddMember}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No team members</div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                {...(onMemberClick
                  ? {
                      role: "button",
                      tabIndex: 0,
                      onClick: () => onMemberClick(member),
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onMemberClick(member);
                        }
                      },
                    }
                  : {})}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  onMemberClick &&
                    "cursor-pointer hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.avatar ? <User className="h-5 w-5" /> : getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{member.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">Working on {member.task}</div>
                  <div className={cn("text-xs font-medium mt-1", getStatusColor(member.status))}>
                    Status: {getStatusText(member.status)}
                  </div>
                </div>

                {/* Status badge (opcional) */}
                <Badge
                  variant={
                    member.status === "completed"
                      ? "default"
                      : member.status === "in-progress"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {getStatusText(member.status)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
