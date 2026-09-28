/**
 * TeamMemberList - Componente Visual
 *
 * Lista densa de pessoas da equipe: nome, tarefa atual e estado, separados por régua
 * de 1px (DESIGN.md, "Lista densa") em vez de um card por pessoa.
 */

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms";

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
   * Título da seção
   * @default "Equipe"
   */
  title?: string;

  /**
   * Callback quando um membro é clicado. Com ele, cada linha vira um botão.
   */
  onMemberClick?: (member: TeamMember) => void;

  /**
   * Callback do botão de adicionar. Sem ele, o botão não aparece.
   */
  onAddMember?: () => void;

  /**
   * Texto do botão de adicionar (o ícone de "+" já vem junto)
   * @default "Adicionar pessoa"
   */
  addButtonText?: string;

  /**
   * Classe CSS adicional
   */
  className?: string;
}

const STATUS_LABEL: Record<TeamMemberStatus, string> = {
  completed: "Concluída",
  "in-progress": "Em andamento",
  pending: "Pendente",
};

// Pendente é neutro: não é erro, então não usa destructive (DESIGN.md, "Color Means Something").
const STATUS_TONE: Record<TeamMemberStatus, string> = {
  completed: "bg-success/10 text-success",
  "in-progress": "bg-info/10 text-info",
  pending: "bg-muted text-foreground",
};

function StatusTag({ status }: { status: TeamMemberStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium leading-5",
        STATUS_TONE[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function MemberRowContent({ member, showPhoto }: { member: TeamMember; showPhoto: boolean }) {
  return (
    <>
      {showPhoto && (
        <img src={member.avatar} alt="" className="size-6 shrink-0 rounded-full object-cover" />
      )}
      <span className="font-medium sm:w-32 sm:shrink-0">{member.name}</span>
      <span className="order-last basis-full text-muted-foreground sm:order-none sm:basis-auto sm:flex-1 sm:min-w-0 sm:text-foreground">
        {member.task}
      </span>
      <span className="ml-auto sm:ml-0">
        <StatusTag status={member.status} />
      </span>
    </>
  );
}

const ROW_CLASS = "flex flex-wrap items-center gap-x-4 gap-y-0.5 px-2 py-3";

/**
 * Componente de lista de membros da equipe
 */
export function TeamMemberList({
  members,
  title = "Equipe",
  onMemberClick,
  onAddMember,
  addButtonText = "Adicionar pessoa",
  className,
}: TeamMemberListProps) {
  // Foto só se todos tiverem: metade com foto e metade sem desalinha a lista.
  const showPhoto = members.length > 0 && members.every((m) => Boolean(m.avatar));

  return (
    <section className={cn("text-sm", className)}>
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="font-mono text-[13px] text-muted-foreground">{members.length}</span>
        <div className="h-px flex-1 bg-border" />
        {onAddMember && (
          <Button variant="outline" size="sm" onClick={onAddMember}>
            <Plus className="size-4" aria-hidden="true" />
            {addButtonText}
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Ninguém na equipe ainda.</p>
      ) : (
        <ul className="mt-3">
          {members.map((member) => (
            <li key={member.id} className="border-t border-border first:border-t-0">
              {onMemberClick ? (
                <button
                  type="button"
                  onClick={() => onMemberClick(member)}
                  className={cn(
                    ROW_CLASS,
                    "w-full rounded-lg text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  <MemberRowContent member={member} showPhoto={showPhoto} />
                </button>
              ) : (
                <div className={ROW_CLASS}>
                  <MemberRowContent member={member} showPhoto={showPhoto} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
