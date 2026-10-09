/**
 * Conversation Component - Flowtomic UI
 *
 * Componente de conversation container com scroll
 */

import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import * as React from "react";
import { useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import {
  StickToBottom,
  type StickToBottomState,
  useStickToBottomContext,
} from "use-stick-to-bottom";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms";

export type ConversationProps = ComponentProps<typeof StickToBottom> & {
  ref?: React.Ref<HTMLDivElement>;
};

// diz ao turno se ele surgiu depois da abertura (mensagem nova) ou veio com o histórico
const ConversationOpenedContext = React.createContext<React.RefObject<boolean> | null>(null);

export function Conversation({ className, children, ...props }: ConversationProps) {
  const opened = useRef(false);
  useEffect(() => {
    opened.current = true;
  }, []);
  return (
    <ConversationOpenedContext.Provider value={opened}>
      <StickToBottom
        data-slot="conversation"
        className={cn("relative flex-1 overflow-y-auto", className)}
        initial="smooth"
        resize="smooth"
        role="log"
        {...props}
      >
        {children}
      </StickToBottom>
    </ConversationOpenedContext.Provider>
  );
}
Conversation.displayName = "Conversation";

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export function ConversationContent({ className, children, ...props }: ConversationContentProps) {
  return (
    <StickToBottom.Content
      data-slot="conversation-content"
      className={cn("flex flex-col gap-8 p-4", className)}
      {...props}
    >
      {children}
    </StickToBottom.Content>
  );
}
ConversationContent.displayName = "ConversationContent";

/** Folga entre o topo da área de rolagem e a mensagem ancorada. */
const TURN_TOP_GAP_PX = 16;

/**
 * `state` é o store imperativo da lib, não estado do React, e ela só deixa rolar por ele
 * (`scrollTop`): o setter marca o scroll como ignorado. Rolar o elemento direto faria a lib
 * ler o movimento como a pessoa rolando e voltar a seguir o fim da resposta. A escrita fica
 * numa função de módulo porque o `react-hooks/immutability` não aceita mutar o que um hook devolve.
 */
function scrollIgnoredByLib(state: StickToBottomState, top: number): void {
  state.scrollTop = top;
}

export type ConversationTurnProps = ComponentProps<"div"> & {
  /**
   * Turno mais recente (a mensagem da pessoa e a resposta que vem depois). Quando ele surge
   * depois da abertura, sobe pro topo e a rolagem para de seguir a resposta; se ela passar da
   * tela, o `ConversationScrollButton` aparece. Com o histórico aberto, nada muda.
   */
  anchor?: boolean;
};

export const ConversationTurn = ({
  anchor = false,
  className,
  ...props
}: ConversationTurnProps) => {
  const turnRef = useRef<HTMLDivElement>(null);
  const opened = useContext(ConversationOpenedContext);
  const { scrollRef, contentRef, state, stopScroll } = useStickToBottomContext();

  useLayoutEffect(() => {
    const turn = turnRef.current;
    const scroller = scrollRef.current;
    if (!anchor || !opened?.current || !turn || !scroller) return;
    const content = contentRef.current;
    const paddingBottom = content ? Number.parseFloat(getComputedStyle(content).paddingBottom) : 0;
    // sem esse espaço, um turno curto não tem como subir até o topo
    turn.style.minHeight = `${Math.max(
      scroller.clientHeight - TURN_TOP_GAP_PX - (paddingBottom || 0),
      0
    )}px`;
    const top =
      turn.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      TURN_TOP_GAP_PX;
    // solta a trava antes de mover: a lib ignora esse scroll e não volta a seguir o fim
    stopScroll();
    scrollIgnoredByLib(state, Math.max(top, 0));
    return () => {
      turn.style.minHeight = "";
    };
  }, [anchor, opened, scrollRef, contentRef, state, stopScroll]);

  return (
    <div
      ref={turnRef}
      data-slot="conversation-turn"
      className={cn("flex flex-col gap-[inherit]", className)}
      {...props}
    />
  );
};
ConversationTurn.displayName = "ConversationTurn";

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export function ConversationEmptyState({
  className,
  title = "Nenhuma mensagem ainda",
  description = "Envie a primeira mensagem para começar.",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) {
  return (
    <div
      data-slot="conversation-empty-state"
      className={cn(
        "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="space-y-1">
            <h3 className="font-medium text-sm">{title}</h3>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
        </>
      )}
    </div>
  );
}
ConversationEmptyState.displayName = "ConversationEmptyState";

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export function ConversationScrollButton({ className, ...props }: ConversationScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Fica no DOM quando a conversa está no fim, só escondido, para poder entrar e sair
  // com transição; aria-hidden e tabIndex tiram ele do leitor de tela e do Tab.
  return (
    <Button
      data-slot="conversation-scroll-button"
      aria-hidden={isAtBottom ? true : undefined}
      tabIndex={isAtBottom ? -1 : undefined}
      data-state={isAtBottom ? "hidden" : "visible"}
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 gap-1.5 rounded-full bg-background shadow-md",
        "transition-[opacity,translate] duration-200 motion-reduce:transition-none",
        isAtBottom ? "pointer-events-none translate-y-2 opacity-0" : "translate-y-0 opacity-100",
        className
      )}
      onClick={handleScrollToBottom}
      size="sm"
      type="button"
      variant="outline"
      {...props}
    >
      <ArrowDownIcon aria-hidden="true" className="size-3.5" />
      Ir para o fim
    </Button>
  );
}
ConversationScrollButton.displayName = "ConversationScrollButton";
