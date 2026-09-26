/**
 * EditChatMessageModal Component - Flowtomic UI
 *
 * Modal genérico para editar mensagens de chat com validação
 * de alterações não salvas e exibição de metadados
 */

import { Edit, Save, TriangleAlert } from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Textarea,
} from "../../../atoms";
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

const defaultFormatTimestamp = (timestamp: Date | string): string => {
  return new Date(timestamp).toLocaleString();
};

const defaultGetMessageTypeBadgeClassName = (messageType?: string): string => {
  switch (messageType) {
    case "SAY":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "ACTION":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "STORY":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
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
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <DialogTitle className="text-lg">Editar Mensagem</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações da mensagem */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">{message.sender}</span>
              {message.messageType && (
                <Badge className={getMessageTypeBadgeClassName(message.messageType)}>
                  {message.messageType}
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>

          {/* Campo de edição */}
          <div className="space-y-2">
            <label
              htmlFor="message-content"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Conteúdo da Mensagem
            </label>
            <Textarea
              id="message-content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] resize-none"
              placeholder="Digite o conteúdo da mensagem..."
              disabled={isLoading}
            />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{editedContent.length} caracteres</span>
              {hasChanges && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <TriangleAlert className="w-3.5 h-3.5" />
                  <span>Alterações não salvas</span>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isLoading || !editedContent.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

EditChatMessageModal.displayName = "EditChatMessageModal";
