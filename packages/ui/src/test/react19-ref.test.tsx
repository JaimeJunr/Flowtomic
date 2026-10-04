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
