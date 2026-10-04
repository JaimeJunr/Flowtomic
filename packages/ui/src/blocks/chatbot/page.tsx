"use client";

// Layout e comportamento inspirados no shadcn-ui/chatbot-template (MIT) — ver
// packages/ui/THIRD_PARTY_NOTICES.md. O block não fala com nenhuma API: o app liga
// `messages`, `status` e os callbacks no `useChat` (AI SDK) ou no que usar.
import { AlertCircle, Code2, FileText, Globe, Plus, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/actions/button";
import { Shimmer } from "@/components/atoms/animation/shimmer";
import { Bubble, BubbleContent } from "@/components/molecules/data-display/bubble";
import { MessageResponse } from "@/components/molecules/data-display/message";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  uniqueSources,
} from "@/components/molecules/data-display/sources";
import { Suggestion, Suggestions } from "@/components/molecules/data-display/suggestion";
import {
  ToolStatusLine,
  type ToolStatusLineState,
} from "@/components/molecules/data-display/tool-status-line";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationTurn,
} from "@/components/organisms/conversation";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/organisms/prompt-input";
import {
  Questionnaire,
  type QuestionnaireAnswer,
  type QuestionnaireQuestion,
  QuestionnaireSummary,
} from "@/components/organisms/questionnaire";
import { cn } from "@/lib/utils";

export type ChatbotToolKind = "web" | "file" | "code";

export type ChatbotPart =
  | { type: "text"; text: string }
  | {
      type: "tool";
      kind?: ChatbotToolKind;
      state: ToolStatusLineState;
      label: string;
      detail?: string;
      meta?: string;
    }
  | { type: "sources"; sources: { url: string; title: string }[] }
  | { type: "answers"; answers: QuestionnaireAnswer[] };

export interface ChatbotMessage {
  id: string;
  role: "user" | "assistant";
  parts: ChatbotPart[];
}

/** Os mesmos estados do `useChat` do AI SDK. */
export type ChatbotStatus = "ready" | "submitted" | "streaming" | "error";

export interface ChatbotModel {
  id: string;
  name: string;
}

export interface ChatbotProps {
  /** Título da conversa no cabeçalho; sem mensagens, aparece "Conversa nova". */
  title?: string;
  messages?: ChatbotMessage[];
  status?: ChatbotStatus;
  /** Detalhe do erro (código, mensagem do servidor), mostrado em mono. */
  error?: string | null;
  /** Instrução da conversa vazia; diga o que o assistente sabe fazer. */
  emptyTitle?: string;
  emptyHint?: ReactNode;
  /** Rótulo curto no botão, pedido completo enviado. */
  suggestions?: { label: string; prompt: string }[];
  /** Pergunta pendente do assistente; enquanto existir, o campo fica travado. */
  question?: { questions: QuestionnaireQuestion[]; preparing?: boolean } | null;
  models?: ChatbotModel[];
  model?: string;
  onModelChange?: (model: string) => void;
  onSend?: (text: string) => void;
  onStop?: () => void;
  onRetry?: () => void;
  onAnswer?: (answers: QuestionnaireAnswer[]) => void;
  onNewChat?: () => void;
  className?: string;
}

const TOOL_ICONS: Record<ChatbotToolKind, ReactNode> = {
  web: <Globe />,
  file: <FileText />,
  code: <Code2 />,
};

function ChatbotHeader({
  title,
  hasMessages,
  onNewChat,
}: Pick<ChatbotProps, "title" | "onNewChat"> & { hasMessages: boolean }) {
  return (
    <header className="flex min-h-13 flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-2">
      <h1
        className={cn(
          "font-display text-[15px] font-semibold",
          !hasMessages && "text-muted-foreground"
        )}
      >
        {hasMessages && title ? title : "Conversa nova"}
      </h1>
      {hasMessages && onNewChat ? (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onNewChat}>
          <Plus aria-hidden="true" />
          Nova conversa
        </Button>
      ) : null}
    </header>
  );
}

function ChatbotEmpty({
  emptyTitle,
  emptyHint,
  suggestions,
  onSend,
}: Pick<ChatbotProps, "emptyTitle" | "emptyHint" | "suggestions" | "onSend">) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-8 text-center">
      <h2 className="font-display text-3xl font-bold tracking-tight">{emptyTitle}</h2>
      {emptyHint ? <p className="text-sm text-muted-foreground">{emptyHint}</p> : null}
      {suggestions?.length ? (
        <Suggestions layout="wrap" className="mt-2 max-w-[640px]">
          {suggestions.map(({ label, prompt }) => (
            <Suggestion key={label} suggestion={prompt} onClick={(text) => onSend?.(text)}>
              {label}
            </Suggestion>
          ))}
        </Suggestions>
      ) : null}
    </div>
  );
}

function ChatbotPartView({ part, finished }: { part: ChatbotPart; finished: boolean }) {
  switch (part.type) {
    case "text":
      return <MessageResponse>{part.text}</MessageResponse>;
    case "tool":
      return (
        <ToolStatusLine
          state={part.state}
          icon={part.kind ? TOOL_ICONS[part.kind] : <Wrench />}
          label={part.label}
          detail={part.detail}
          meta={part.meta}
        />
      );
    case "sources": {
      // a lista pularia enquanto a resposta ainda chega; só aparece no fim
      if (!finished) return null;
      const sources = uniqueSources(part.sources);
      return (
        <Sources>
          <SourcesTrigger count={sources.length} />
          <SourcesContent>
            {sources.map((source) => (
              <Source key={source.url} href={source.url} title={source.title} />
            ))}
          </SourcesContent>
        </Sources>
      );
    }
    case "answers":
      return <QuestionnaireSummary answers={part.answers} />;
  }
}

function ChatbotMessageView({ message, finished }: { message: ChatbotMessage; finished: boolean }) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end gap-2">
        {message.parts.map((part, i) =>
          part.type === "text" ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: partes de uma mensagem não mudam de ordem
            <Bubble key={i}>
              <BubbleContent className="whitespace-pre-wrap">{part.text}</BubbleContent>
            </Bubble>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: partes de uma mensagem não mudam de ordem
            <ChatbotPartView key={i} part={part} finished />
          )
        )}
      </div>
    );
  }
  // a resposta do assistente ocupa a largura toda, sem balão
  return (
    <div className="flex flex-col gap-3.5">
      {message.parts.map((part, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: partes de uma mensagem não mudam de ordem
        <ChatbotPartView key={i} part={part} finished={finished} />
      ))}
    </div>
  );
}

function ChatbotError({ error, onRetry }: Pick<ChatbotProps, "error" | "onRetry">) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span className="flex-1">
        A resposta falhou. {error ? <span className="font-mono text-[12.5px]">{error}</span> : null}
      </span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="whitespace-nowrap underline">
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}

function ChatbotModelSelect({
  models,
  model,
  onModelChange,
}: Required<Pick<ChatbotProps, "models">> & Pick<ChatbotProps, "model" | "onModelChange">) {
  return (
    <PromptInputModelSelect value={model} onValueChange={onModelChange}>
      <PromptInputModelSelectTrigger aria-label="Modelo">
        <PromptInputModelSelectValue placeholder="Modelo" />
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {models.map((item) => (
          <PromptInputModelSelectItem key={item.id} value={item.id}>
            {item.name}
          </PromptInputModelSelectItem>
        ))}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

export default function Chatbot({
  title,
  messages = [],
  status = "ready",
  error,
  emptyTitle = "Comece pela sua pergunta",
  emptyHint,
  suggestions,
  question,
  models,
  model,
  onModelChange,
  onSend,
  onStop,
  onRetry,
  onAnswer,
  onNewChat,
  className,
}: ChatbotProps) {
  const hasMessages = messages.length > 0;
  const responding = status === "submitted" || status === "streaming";
  const waitingFirstToken = status === "submitted" && messages.at(-1)?.role === "user";
  // a última pergunta e o que veio depois dela formam o turno que sobe pro topo ao enviar
  let turnStart = messages.length;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      turnStart = i;
      break;
    }
  }
  const renderMessage = (message: ChatbotMessage, i: number) => (
    <ChatbotMessageView
      key={message.id}
      message={message}
      finished={!(responding && i === messages.length - 1)}
    />
  );

  return (
    <div className={cn("flex h-svh min-h-0 flex-col bg-background text-foreground", className)}>
      <ChatbotHeader title={title} hasMessages={hasMessages} onNewChat={onNewChat} />

      {hasMessages ? (
        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="mx-auto w-full max-w-[720px] gap-7 px-5 py-8">
            {messages.slice(0, turnStart).map(renderMessage)}
            {turnStart < messages.length ? (
              <ConversationTurn key={messages[turnStart].id} anchor>
                {messages
                  .slice(turnStart)
                  .map((message, i) => renderMessage(message, turnStart + i))}
                {waitingFirstToken ? (
                  <Shimmer as="span" className="text-sm">
                    Pensando…
                  </Shimmer>
                ) : null}
              </ConversationTurn>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <ChatbotEmpty
          emptyTitle={emptyTitle}
          emptyHint={emptyHint}
          suggestions={suggestions}
          onSend={onSend}
        />
      )}

      <footer className="mx-auto flex w-full max-w-[720px] flex-col gap-2 px-5 pb-4">
        {question ? (
          <Questionnaire
            questions={question.questions}
            preparing={question.preparing}
            onSubmit={(answers) => onAnswer?.(answers)}
          />
        ) : null}
        {status === "error" ? <ChatbotError error={error} onRetry={onRetry} /> : null}
        <PromptInput onSubmit={(message) => onSend?.(message.text ?? "")}>
          <PromptInputTextarea
            aria-label="Mensagem"
            disabled={Boolean(question)}
            placeholder={
              question ? "Responda a pergunta acima para continuar" : "Escreva sua mensagem"
            }
            minHeight={28}
          />
          <PromptInputFooter>
            <PromptInputTools>
              {models?.length ? (
                <ChatbotModelSelect models={models} model={model} onModelChange={onModelChange} />
              ) : null}
            </PromptInputTools>
            {/* com pergunta aberta, o único botão forte é o da pergunta */}
            {question ? null : <PromptInputSubmit status={status} onStop={onStop} />}
          </PromptInputFooter>
        </PromptInput>
        <p className="text-center text-xs text-muted-foreground">
          <span className="font-mono">Enter</span> envia ·{" "}
          <span className="font-mono">Shift+Enter</span> quebra a linha
        </p>
      </footer>
    </div>
  );
}
