import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Button } from "../../actions/button/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

describe("AlertDialog", () => {
  describe("Renderização", () => {
    it("deve renderizar o AlertDialog", () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Open</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      const button = screen.getByRole("button", { name: "Open" });
      expect(button).toBeInTheDocument();
    });

    it("deve renderizar AlertDialogTrigger", () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Trigger</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Title</AlertDialogTitle>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      );
      const trigger = screen.getByRole("button", { name: "Trigger" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Interação", () => {
    it("deve abrir alert dialog ao clicar no trigger", async () => {
      const user = userEvent.setup();
      render(
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Open Alert</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alert Title</AlertDialogTitle>
              <AlertDialogDescription>Alert description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      const button = screen.getByRole("button", { name: "Open Alert" });
      await user.click(button);

      await waitFor(() => {
        const title = screen.getByText("Alert Title");
        expect(title).toBeInTheDocument();
      });
    });
  });
});

function renderConfirmacao(
  contentProps: React.ComponentProps<typeof AlertDialogContent> = {},
  handlers: { onAction?: () => void; onCancel?: () => void } = {}
) {
  return render(
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Excluir conta</Button>
      </AlertDialogTrigger>
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
          <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handlers.onCancel}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={handlers.onAction}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog - confirmação", () => {
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  it("deve abrir como alertdialog nomeado pelo título e descrito pela descrição", async () => {
    const user = userEvent.setup();
    renderConfirmacao();

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    const dialogo = await screen.findByRole("alertdialog", { name: "Excluir conta?" });
    expect(dialogo).toHaveAccessibleDescription("Essa ação não pode ser desfeita.");
  });

  it("deve executar a ação e fechar ao confirmar", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderConfirmacao({}, { onAction });
    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    await user.click(await screen.findByRole("button", { name: "Excluir" }));

    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("deve fechar sem executar a ação ao cancelar", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onCancel = vi.fn();
    renderConfirmacao({}, { onAction, onCancel });
    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    await user.click(await screen.findByRole("button", { name: "Voltar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onAction).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("deve fechar com Escape", async () => {
    const user = userEvent.setup();
    renderConfirmacao();
    await user.click(screen.getByRole("button", { name: "Excluir conta" }));
    await screen.findByRole("alertdialog");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("deve avisar a mudança de estado quando controlado", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog open onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Sair?</AlertDialogTitle>
          <AlertDialogDescription>Você perderá as alterações.</AlertDialogDescription>
          <AlertDialogCancel>Ficar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole("button", { name: "Ficar" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("alertdialog", { name: "Sair?" })).toBeInTheDocument();
  });

  it("deve repassar a className ao conteúdo", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ className: "dialogo-custom" });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(await screen.findByRole("alertdialog")).toHaveClass("dialogo-custom");
  });

  it("deve preencher a ref recebida com o elemento do diálogo quando aberto", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>Abrir</Button>
        </AlertDialogTrigger>
        <AlertDialogContent ref={ref}>
          <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
          <AlertDialogDescription>Não dá para desfazer.</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }));
    expect(ref.current).toBe(await screen.findByRole("alertdialog"));
  });

  it("deve destacar o botão de cancelar como secundário e o de ação como principal", async () => {
    const user = userEvent.setup();
    renderConfirmacao();
    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    const cancelar = await screen.findByRole("button", { name: "Voltar" });
    const confirmar = screen.getByRole("button", { name: "Excluir" });
    expect(cancelar).toHaveClass("border");
    expect(confirmar).toHaveClass("bg-primary");
  });
});

describe("AlertDialog - animação 3D", () => {
  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = false;
  });

  it("deve abrir o conteúdo com animation 3d", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ animation: "3d" });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(await screen.findByRole("alertdialog", { name: "Excluir conta?" })).toBeInTheDocument();
  });

  it("deve mostrar o botão Fechar apenas em 3d com showCloseButton e fechá-lo ao clicar", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ animation: "3d", showCloseButton: true });
    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    await user.click(await screen.findByRole("button", { name: "Fechar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("não deve mostrar o botão Fechar em 3d sem showCloseButton", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ animation: "3d" });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    await screen.findByRole("alertdialog");
    expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
  });

  it("não deve mostrar o botão Fechar fora do 3d mesmo com showCloseButton", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ showCloseButton: true });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    await screen.findByRole("alertdialog");
    expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
  });

  it("deve abrir com desfoque de fundo ligado em 3d", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ animation: "3d", backdropBlur: true });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(await screen.findByRole("alertdialog", { name: "Excluir conta?" })).toBeInTheDocument();
  });

  it("deve abrir com desfoque de fundo ligado no modo padrão", async () => {
    const user = userEvent.setup();
    renderConfirmacao({ backdropBlur: true });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(await screen.findByRole("alertdialog", { name: "Excluir conta?" })).toBeInTheDocument();
  });
});

describe("AlertDialog - animações de entrada", () => {
  it.each([
    "depth",
    "bottom",
    "top",
    "left",
    "right",
    "center",
  ] as const)("deve abrir com a animação %s", async (animation) => {
    const user = userEvent.setup();
    renderConfirmacao({ animation });

    await user.click(screen.getByRole("button", { name: "Excluir conta" }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });
});
