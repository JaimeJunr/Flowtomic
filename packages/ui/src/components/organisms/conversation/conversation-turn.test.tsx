import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { type StickToBottomState, useStickToBottomContext } from "use-stick-to-bottom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Conversation, ConversationContent, ConversationTurn } from "./conversation";

// O jsdom não mede layout. Fingimos só as medidas: a área de rolagem tem 500 px de altura e
// começa em y=100; cada turno começa 640 px abaixo dela. Sem a lib de rolagem mockada: o turno
// conversa com o use-stick-to-bottom de verdade.
const SCROLL_HEIGHT = 500;
const SCROLL_TOP_Y = 100;
const TURN_OFFSET = 640;

const isScroller = (el: Element) => el.parentElement?.getAttribute("role") === "log";

const spies: { mockRestore: () => void }[] = [];

beforeEach(() => {
  const height = vi
    .spyOn(HTMLElement.prototype, "clientHeight", "get")
    .mockImplementation(function (this: HTMLElement) {
      return isScroller(this) ? SCROLL_HEIGHT : 0;
    });
  const rect = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const scroller = this.closest("[role=log]")?.firstElementChild as HTMLElement | null;
      const top = isScroller(this)
        ? SCROLL_TOP_Y
        : SCROLL_TOP_Y + TURN_OFFSET - (scroller?.scrollTop ?? 0);
      return { top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top } as DOMRect;
    });
  spies.push(height, rect);
});

// restoreAllMocks apagaria o ResizeObserver falso do setup global (ver CLAUDE.md)
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore();
});

function Chat({ children }: { children: ReactNode }) {
  return (
    <Conversation>
      <ConversationContent>{children}</ConversationContent>
    </Conversation>
  );
}

const scroller = () => screen.getByRole("log").firstElementChild as HTMLElement;

// Espia o contexto real da lib de rolagem: guarda o último valor que o contexto devolveu.
type StickContext = ReturnType<typeof useStickToBottomContext>;
function StickSpy({ onContext }: { onContext: (ctx: StickContext) => void }) {
  onContext(useStickToBottomContext());
  return null;
}

describe("ConversationTurn", () => {
  it("o turno que chega depois sobe pro topo, com espaço até o fim da tela", () => {
    const { rerender } = render(
      <Chat>
        <ConversationTurn anchor data-testid="t1">
          primeira
        </ConversationTurn>
      </Chat>
    );
    rerender(
      <Chat>
        <ConversationTurn data-testid="t1">primeira</ConversationTurn>
        <ConversationTurn anchor data-testid="t2">
          segunda
        </ConversationTurn>
      </Chat>
    );
    // 500 da tela menos a folga de 16 px no topo
    expect(screen.getByTestId("t2").style.minHeight).toBe("484px");
    // o topo do turno fica 16 px abaixo do topo da área de rolagem
    expect(scroller().scrollTop).toBe(TURN_OFFSET - 16);
    // o turno anterior devolve o espaço extra
    expect(screen.getByTestId("t1").style.minHeight).toBe("");
  });

  it("ao abrir uma conversa que já existe, o último turno não pula nem ganha espaço", () => {
    render(
      <Chat>
        <ConversationTurn anchor data-testid="t1">
          antiga
        </ConversationTurn>
      </Chat>
    );
    expect(screen.getByTestId("t1").style.minHeight).toBe("");
    expect(scroller().scrollTop).toBe(0);
  });

  it("sem anchor, um turno novo não mexe na rolagem", () => {
    const { rerender } = render(<Chat>{null}</Chat>);
    rerender(
      <Chat>
        <ConversationTurn data-testid="t1">nova</ConversationTurn>
      </Chat>
    );
    expect(screen.getByTestId("t1").style.minHeight).toBe("");
    expect(scroller().scrollTop).toBe(0);
  });

  it("marca o turno com data-slot e repassa className", () => {
    render(
      <Chat>
        <ConversationTurn className="extra">oi</ConversationTurn>
      </Chat>
    );
    const turn = screen.getByText("oi");
    expect(turn).toHaveAttribute("data-slot", "conversation-turn");
    expect(turn).toHaveClass("extra", "flex", "flex-col");
  });

  it("sobe pelo setter do state da lib e solta a trava de seguir o fim", () => {
    let ctx: StickContext | undefined;
    const spy = <StickSpy onContext={(c) => (ctx = c)} />;
    const { rerender } = render(
      <Chat>
        <ConversationTurn anchor data-testid="t1">
          primeira
        </ConversationTurn>
        {spy}
      </Chat>
    );
    rerender(
      <Chat>
        <ConversationTurn data-testid="t1">primeira</ConversationTurn>
        <ConversationTurn anchor data-testid="t2">
          segunda
        </ConversationTurn>
        {spy}
      </Chat>
    );
    const state = ctx?.state as StickToBottomState;
    // é o setter da lib que marca esse scroll como "ignorado"; sem isso ela o leria como a
    // pessoa rolando e voltaria a seguir o fim da resposta
    expect(state.ignoreScrollToTop).toBe(TURN_OFFSET - 16);
    expect(ctx?.escapedFromLock).toBe(true);
    expect(ctx?.isAtBottom).toBe(false);
  });
});
