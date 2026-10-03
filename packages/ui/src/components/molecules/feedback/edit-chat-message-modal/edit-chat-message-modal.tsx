/**
 * EditChatMessageModal Component - Flowtomic UI
 *
 * Modal genérico para editar mensagens de chat com validação
 * de alterações não salvas e exibição de metadados
 */

import { Loader2 } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Textarea } from "../../../atoms";
import type { ChatMessageData } from "../../data-display/chat-message";

export interface EditChatMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ChatMessageData | null;
  onSave: (id: string | number, content: string) => Promise<void> | void;
  isLoading?: boolean;
  formatTimestamp?: (timestamp: Date | string) => string;
  getMessageTypeBadgeClassName?: (messageType?: string) => string;
  className?: string;
}

const TIMESTAMP = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const defaultFormatTimestamp = (timestamp: Date | string): string => {
  return TIMESTAMP.format(new Date(timestamp));
};

// Mesmos rótulos e cores dos tipos padrão do ChatMessage
const TYPE_LABELS: Record<string, string> = { STORY: "Narração", ACTION: "Ação", SAY: "Fala" };

// Pinta o ponto ao lado do tipo, não um selo
const defaultGetMessageTypeBadgeClassName = (messageType?: string): string => {
  switch (messageType) {
    case "SAY":
      return "bg-success";
    case "ACTION":
      return "bg-warning";
    case "STORY":
      return "bg-info";
    default:
      return "bg-muted-foreground";
  }
};

export const EditChatMessageModal: React.FC<EditChatMessageModalProps> = ({
  isOpen,
  onClose,
  message,
  onSave,
  isLoading = false,
  formatTimestamp = defaultFormatTimestamp,
  getMessageTypeBadgeClassName = defaultGetMessageTypeBadgeClassName,
  className,
}) => {
  const [editedContent, setEditedContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (message) {
      setEditedContent(message.content);
      setHasChanges(false);
    }
  }, [message]);

  useEffect(() => {
    if (message) {
      setHasChanges(editedContent !== message.content);
    }
  }, [editedContent, message]);

  const handleSave = async () => {
    if (!message || !hasChanges || isLoading) return;

    try {
      await onSave(message.id, editedContent);
      onClose();
    } catch (error) {
      console.error("Error saving message:", error);
      // Error handling should be done by the parent component
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        "Você tem alterações não salvas. Deseja realmente fechar?"
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("max-w-2xl max-h-[80vh] overflow-hidden", className)}>
        <DialogHeader>
          <DialogTitle>Editar mensagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <dl className="grid grid-cols-3 gap-3">
            <div>
              <dt className="text-[13px] text-muted-foreground">Remetente</dt>
              <dd className="truncate">{message.sender}</dd>
            </div>
            {message.messageType && (
              <div>
                <dt className="text-[13px] text-muted-foreground">Tipo</dt>
                <dd className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-[7px] rounded-full",
                      getMessageTypeBadgeClassName(message.messageType)
                    )}
                  />
                  {TYPE_LABELS[message.messageType] ?? message.messageType}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-[13px] text-muted-foreground">Enviada</dt>
              <dd className="font-mono text-sm">{formatTimestamp(message.timestamp)}</dd>
            </div>
          </dl>

          {/* Campo de edição */}
          <div className="space-y-2">
            <label htmlFor="message-content" className="text-sm font-medium text-foreground">
              Texto
            </label>
            <Textarea
              id="message-content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] resize-none"
              placeholder="Escreva o texto da mensagem"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">{editedContent.length} caracteres</span>
              {hasChanges && <span className="text-warning">Alterações não salvas</span>}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isLoading || !editedContent.trim()}
              className="gap-2"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isLoading ? "Salvando" : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

EditChatMessageModal.displayName = "EditChatMessageModal";
