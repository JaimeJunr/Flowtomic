import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/atoms/actions/badge";
import { Button } from "@/components/atoms/actions/button";
import { Loader } from "@/components/atoms/animation/loader";
import { Card, CardTitle } from "@/components/atoms/display/card";
import { Separator } from "@/components/atoms/display/separator";
import { Skeleton } from "@/components/atoms/display/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/atoms/feedback/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/atoms/feedback/dialog";
import { Checkbox } from "@/components/atoms/forms/checkbox";
import { Input } from "@/components/atoms/forms/input";
import { ScrollArea, ScrollAreaViewport } from "@/components/atoms/layout/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/navigation/tabs";
import { Artifact, ArtifactAction } from "@/components/molecules/data-display/artifact";
import { Message, MessageContent } from "@/components/molecules/data-display/message";
import {
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/molecules/data-display/sources";
import { StatCard } from "@/components/molecules/data-display/stat-card";
import { Suggestion, Suggestions } from "@/components/molecules/data-display/suggestion";
import { Tool } from "@/components/molecules/data-display/tool";
import { EditModeToggle } from "@/components/molecules/edit-mode-toggle";
import { Confirmation } from "@/components/molecules/feedback/confirmation";
import { Autocomplete } from "@/components/molecules/forms/autocomplete";
import { ButtonGroup } from "@/components/molecules/forms/button-group";
import { ChatInput } from "@/components/molecules/forms/chat-input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/molecules/forms/input-group";
import { TextEditor } from "@/components/molecules/forms/text-editor";
import { ChatLog } from "@/components/organisms/chat-log";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/organisms/conversation";
import { DashboardHeaderActions } from "@/components/organisms/dashboard-header-actions";
import { DashboardLayout } from "@/components/organisms/dashboard-layout";
import { DashboardMovementsSection } from "@/components/organisms/dashboard-movements-section";
import { DocumentEditor } from "@/components/organisms/document-editor";
import { Image } from "@/components/organisms/image";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
} from "@/components/organisms/model-selector";
import { MonthlySummary } from "@/components/organisms/monthly-summary";
import { OpenIn, OpenInContent, OpenInTrigger } from "@/components/organisms/open-in-chat";
import { ScriptEditor } from "@/components/organisms/script-editor";
import { StatsGrid } from "@/components/organisms/stats-grid";

// Guarda da migração para React 19: `ref` é prop normal e a raiz carrega data-slot.
describe("ref como prop e data-slot nos atoms", () => {
  it("Button entrega o ref do botão", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>ok</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("button");
  });

  it("Input entrega o ref do input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="campo" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("input");
  });

  it("Card e CardTitle entregam o ref", () => {
    const cardRef = React.createRef<HTMLDivElement>();
    const titleRef = React.createRef<HTMLHeadingElement>();
    render(
      <Card ref={cardRef}>
        <CardTitle ref={titleRef}>t</CardTitle>
      </Card>
    );
    expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
    expect(cardRef.current?.getAttribute("data-slot")).toBe("card");
    expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
    expect(titleRef.current?.getAttribute("data-slot")).toBe("card-title");
  });

  it("Badge entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Badge ref={ref}>b</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("badge");
  });

  it("Checkbox entrega o ref do botão", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} aria-label="c" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("checkbox");
  });

  it("Separator entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("separator");
  });

  it("Skeleton entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("skeleton");
  });

  it("Tabs: ref do usuário e ref interno convivem em TabsList e TabsTrigger", () => {
    const listRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    render(
      <Tabs defaultValue="a">
        <TabsList ref={listRef}>
          <TabsTrigger value="a" ref={triggerRef}>
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">conteúdo</TabsContent>
      </Tabs>
    );
    expect(listRef.current).toBeInstanceOf(HTMLElement);
    expect(listRef.current?.getAttribute("data-slot")).toBe("tabs-list");
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current?.getAttribute("data-slot")).toBe("tabs-trigger");
    // o ref interno continua funcionando: o trigger é registrado com data-value
    expect(triggerRef.current?.getAttribute("data-value")).toBe("a");
  });

  it("ScrollArea e ScrollAreaViewport entregam o ref", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const viewportRef = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={rootRef}>
        <ScrollAreaViewport ref={viewportRef}>x</ScrollAreaViewport>
      </ScrollArea>
    );
    expect(rootRef.current).toBeInstanceOf(HTMLElement);
    expect(rootRef.current?.getAttribute("data-slot")).toBe("scroll-area");
    expect(viewportRef.current).toBeInstanceOf(HTMLElement);
    expect(viewportRef.current?.getAttribute("data-slot")).toBe("scroll-area-viewport");
  });

  it("DialogContent aberto entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Dialog open>
        <DialogContent ref={ref}>
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole("dialog")).toBe(ref.current);
    expect(ref.current?.getAttribute("data-slot")).toBe("dialog-content");
  });

  it("AlertDialogContent aberto entrega o ref sem repassá-lo ao overlay", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <AlertDialog open>
        <AlertDialogContent ref={ref}>
          <AlertDialogTitle>t</AlertDialogTitle>
          <AlertDialogDescription>d</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByRole("alertdialog")).toBe(ref.current);
    expect(ref.current?.getAttribute("data-slot")).toBe("alert-dialog-content");
    expect(document.querySelector('[data-slot="alert-dialog-overlay"]')).not.toBe(ref.current);
  });

  it("Loader entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Loader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("loader");
  });
});

describe("ref como prop e data-slot nas molecules", () => {
  it("InputGroup e seus filhos entregam o ref", () => {
    const groupRef = React.createRef<HTMLDivElement>();
    const addonRef = React.createRef<HTMLDivElement>();
    const buttonRef = React.createRef<HTMLButtonElement>();
    render(
      <InputGroup ref={groupRef}>
        <InputGroupAddon ref={addonRef}>@</InputGroupAddon>
        <InputGroupButton ref={buttonRef}>ok</InputGroupButton>
      </InputGroup>
    );
    expect(groupRef.current?.getAttribute("data-slot")).toBe("input-group");
    expect(addonRef.current?.getAttribute("data-slot")).toBe("input-group-addon");
    expect(buttonRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(buttonRef.current?.getAttribute("data-slot")).toBe("input-group-button");
  });

  it("ButtonGroup entrega o ref do fieldset", () => {
    const ref = React.createRef<HTMLFieldSetElement>();
    render(<ButtonGroup ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("button-group");
  });

  it("StatCard entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<StatCard ref={ref} title="Receita" value={10} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("stat-card");
  });

  it("Autocomplete entrega o ref ao input e marca a raiz", () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(
      <Autocomplete ref={ref} aria-label="busca" options={[{ value: "a", label: "A" }]} />
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByLabelText("busca")).toBe(ref.current);
    expect(container.querySelector('[data-slot="autocomplete"]')).not.toBeNull();
  });

  it("ChatInput entrega o ref da raiz e mantém a textarea funcionando", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ChatInput ref={ref} value="oi" onChange={() => {}} onSubmit={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("chat-input");
    expect(ref.current?.querySelector("textarea")).toBe(screen.getByLabelText("Mensagem"));
  });

  it("TextEditor entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<TextEditor ref={ref} availableModes={["rich"]} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("text-editor");
  });

  it("Confirmation entrega o ref do alerta e não renderiza sem aprovação", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(
      <Confirmation ref={ref} approval={{ id: "1" }} state="approval-requested">
        pode?
      </Confirmation>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("confirmation");
    rerender(
      <Confirmation ref={ref} state="approval-requested">
        pode?
      </Confirmation>
    );
    expect(screen.queryByText("pode?")).toBeNull();
  });

  it("Message e MessageContent entregam o ref", () => {
    const messageRef = React.createRef<HTMLDivElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    render(
      <Message ref={messageRef} from="user">
        <MessageContent ref={contentRef}>olá</MessageContent>
      </Message>
    );
    expect(messageRef.current?.getAttribute("data-slot")).toBe("message");
    expect(contentRef.current?.getAttribute("data-slot")).toBe("message-content");
  });

  it("Sources, trigger e conteúdo entregam o ref", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    render(
      <Sources ref={rootRef} {...{ defaultOpen: true }}>
        <SourcesTrigger ref={triggerRef} count={1} />
        <SourcesContent ref={contentRef}>x</SourcesContent>
      </Sources>
    );
    expect(rootRef.current?.getAttribute("data-slot")).toBe("sources");
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current?.getAttribute("data-slot")).toBe("sources-trigger");
    expect(contentRef.current?.getAttribute("data-slot")).toBe("sources-content");
  });

  it("Artifact e ArtifactAction entregam o ref", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const actionRef = React.createRef<HTMLButtonElement>();
    render(
      <Artifact ref={rootRef}>
        <ArtifactAction ref={actionRef} label="copiar" />
      </Artifact>
    );
    expect(rootRef.current?.getAttribute("data-slot")).toBe("artifact");
    expect(actionRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(actionRef.current?.getAttribute("data-slot")).toBe("artifact-action");
  });

  it("Suggestion e Suggestions (wrap) entregam o ref", () => {
    const listRef = React.createRef<HTMLDivElement>();
    const itemRef = React.createRef<HTMLButtonElement>();
    render(
      <Suggestions ref={listRef} layout="wrap">
        <Suggestion ref={itemRef} suggestion="sugestão" />
      </Suggestions>
    );
    expect(listRef.current?.getAttribute("data-slot")).toBe("suggestions");
    expect(itemRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(itemRef.current?.getAttribute("data-slot")).toBe("suggestion");
  });

  it("Tool entrega o ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Tool ref={ref} />);
    expect(ref.current?.getAttribute("data-slot")).toBe("tool");
  });

  it("EditModeToggle entrega o ref do botão", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<EditModeToggle ref={ref} isEditMode={false} onToggle={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("edit-mode-toggle");
  });
});

describe("ref como prop e data-slot nos organisms", () => {
  it("Conversation e suas partes entregam o ref e marcam a raiz", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const emptyRef = React.createRef<HTMLDivElement>();
    render(
      <Conversation ref={rootRef}>
        <ConversationContent data-testid="conteudo">
          <ConversationEmptyState ref={emptyRef} />
        </ConversationContent>
      </Conversation>
    );
    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current).toHaveAttribute("role", "log");
    expect(rootRef.current?.getAttribute("data-slot")).toBe("conversation");
    expect(screen.getByTestId("conteudo").getAttribute("data-slot")).toBe("conversation-content");
    expect(emptyRef.current?.getAttribute("data-slot")).toBe("conversation-empty-state");
  });

  it("ConversationScrollButton entrega o ref do botão", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Conversation>
        <ConversationContent>x</ConversationContent>
        <ConversationScrollButton ref={ref} />
      </Conversation>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("conversation-scroll-button");
  });

  it("ChatLog entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ChatLog ref={ref} messages={[]} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("chat-log");
  });

  it("StatsGrid entrega o ref nos modos grade, lista e carregando", () => {
    const stats = [{ id: "a", title: "Downloads", value: 10 }];
    const gridRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<HTMLDivElement>();
    const loadingRef = React.createRef<HTMLDivElement>();
    render(
      <>
        <StatsGrid ref={gridRef} stats={stats} />
        <StatsGrid ref={listRef} stats={stats} layout="list" />
        <StatsGrid ref={loadingRef} stats={stats} loading />
      </>
    );
    for (const ref of [gridRef, listRef, loadingRef]) {
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute("data-slot")).toBe("stats-grid");
    }
    expect(loadingRef.current).toHaveAttribute("aria-busy", "true");
  });

  it("ModelSelectorContent, Input, Logo, LogoGroup e Name entregam o ref", () => {
    const contentRef = React.createRef<HTMLDivElement>();
    const inputRef = React.createRef<HTMLInputElement>();
    const groupRef = React.createRef<HTMLDivElement>();
    const nameRef = React.createRef<HTMLSpanElement>();
    const initialRef = React.createRef<HTMLImageElement | HTMLSpanElement>();
    const imgRef = React.createRef<HTMLImageElement | HTMLSpanElement>();
    render(
      <ModelSelector defaultOpen>
        <ModelSelectorContent ref={contentRef}>
          <ModelSelectorInput ref={inputRef} placeholder="Buscar" />
          <ModelSelectorLogoGroup ref={groupRef}>
            <ModelSelectorLogo ref={initialRef} provider="anthropic" />
            <ModelSelectorLogo ref={imgRef} provider="openai" src="/openai.svg" />
          </ModelSelectorLogoGroup>
          <ModelSelectorName ref={nameRef}>Claude</ModelSelectorName>
        </ModelSelectorContent>
      </ModelSelector>
    );
    expect(contentRef.current?.getAttribute("data-slot")).toBe("model-selector-content");
    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current?.getAttribute("data-slot")).toBe("model-selector-input");
    expect(groupRef.current?.getAttribute("data-slot")).toBe("model-selector-logo-group");
    expect(initialRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(imgRef.current).toBeInstanceOf(HTMLImageElement);
    expect(nameRef.current?.getAttribute("data-slot")).toBe("model-selector-name");
  });

  it("Image entrega o ref da imagem e marca o fallback sem dados", () => {
    const ref = React.createRef<HTMLImageElement>();
    const { container } = render(
      <>
        <Image
          ref={ref}
          base64="AAAA"
          mediaType="image/png"
          alt="x"
          uint8Array={new Uint8Array()}
        />
        <Image base64="" mediaType="image/png" uint8Array={new Uint8Array()} />
      </>
    );
    expect(ref.current).toBeInstanceOf(HTMLImageElement);
    expect(ref.current?.getAttribute("data-slot")).toBe("image");
    expect(container.querySelectorAll("[data-slot=image]")).toHaveLength(2);
  });

  it("OpenInTrigger e OpenInContent entregam o ref", () => {
    const triggerRef = React.createRef<HTMLButtonElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    render(
      <OpenIn query="olá" defaultOpen>
        <OpenInTrigger ref={triggerRef} />
        <OpenInContent ref={contentRef} />
      </OpenIn>
    );
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement);
    expect(triggerRef.current?.getAttribute("data-slot")).toBe("open-in-trigger");
    expect(contentRef.current?.getAttribute("data-slot")).toBe("open-in-content");
  });

  it("MonthlySummary entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<MonthlySummary ref={ref} />);
    expect(ref.current?.getAttribute("data-slot")).toBe("monthly-summary");
  });

  it("DashboardHeaderActions entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DashboardHeaderActions ref={ref} />);
    expect(ref.current?.getAttribute("data-slot")).toBe("dashboard-header-actions");
  });

  it("DashboardLayout entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DashboardLayout ref={ref}>conteúdo</DashboardLayout>);
    expect(ref.current?.getAttribute("data-slot")).toBe("dashboard-layout");
  });

  it("DashboardMovementsSection entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DashboardMovementsSection ref={ref} />);
    expect(ref.current?.getAttribute("data-slot")).toBe("dashboard-movements-section");
  });

  it("DocumentEditor entrega o ref da raiz", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DocumentEditor ref={ref} />);
    expect(ref.current?.getAttribute("data-slot")).toBe("document-editor");
  });

  it("ScriptEditor entrega o ref da raiz e o log segue rolando", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ScriptEditor ref={ref} autoConnect={false} />);
    expect(ref.current?.getAttribute("data-slot")).toBe("script-editor");
    expect(screen.getByRole("log")).toBeInTheDocument();
  });
});
