import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import type { ButtonHTMLAttributes } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  type ModalProps,
  ModalTrigger,
} from "./animated-modal";

interface DemoProps extends Omit<ModalProps, "children"> {
  asChild?: boolean;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onChildClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}

function Demo({
  asChild = false,
  showCloseButton = true,
  closeOnOutsideClick = true,
  triggerProps,
  onChildClick,
  ...props
}: DemoProps) {
  return (
    <>
      <Modal {...props}>
        <ModalTrigger asChild={asChild} {...triggerProps}>
          {asChild ? (
            <button type="button" onClick={onChildClick}>
              Editar tarefa
            </button>
          ) : (
            "Editar tarefa"
          )}
        </ModalTrigger>
        <ModalBody showCloseButton={showCloseButton} closeOnOutsideClick={closeOnOutsideClick}>
          <ModalContent>
            <h2>Dados da tarefa</h2>
            <label htmlFor="titulo">Título</label>
            <input id="titulo" />
          </ModalContent>
          <ModalFooter>
            <button type="button">Salvar</button>
          </ModalFooter>
        </ModalBody>
      </Modal>
      <button type="button">Outra ação</button>
    </>
  );
}

const dialog = () => screen.getByRole("dialog", { name: "Modal" });
const closed = () =>
  waitFor(() => expect(screen.queryByRole("dialog", { name: "Modal" })).not.toBeInTheDocument());

// A animação de saída passa de 1 s com a máquina carregada e estoura o waitFor padrão
// (falhava só na suíte inteira). O teste confere o comportamento, não a duração.
beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

describe("AnimatedModal", () => {
  it.each([
    false,
    true,
  ])("defaultOpen=%s define a presença de um diálogo nomeado e modal", (defaultOpen) => {
    render(<Demo defaultOpen={defaultOpen} />);
    expect(
      screen.getByRole("button", { name: "Editar tarefa", hidden: defaultOpen })
    ).toBeInTheDocument();
    if (defaultOpen) {
      expect(dialog()).toHaveAttribute("aria-modal", "true");
      expect(
        within(dialog()).getByRole("heading", { name: "Dados da tarefa" })
      ).toBeInTheDocument();
      expect(within(dialog()).getByRole("textbox", { name: "Título" })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByRole("textbox", { name: "Título" })).not.toBeInTheDocument();
    }
  });

  it.each([
    false,
    true,
  ])("abrir com showCloseButton/asChild=%s move foco para dentro; Escape fecha e devolve foco duas vezes", async (showCloseButton) => {
    const onOpenChange = vi.fn();
    render(
      <Demo
        asChild={showCloseButton}
        showCloseButton={showCloseButton}
        onOpenChange={onOpenChange}
      />
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Editar tarefa" });
    await user.tab();
    expect(trigger).toHaveFocus();
    for (const key of ["{Enter}", " "]) {
      await user.keyboard(key);
      const initialFocus = showCloseButton
        ? screen.getByRole("button", { name: "Fechar modal" })
        : screen.getByRole("textbox", { name: "Título" });
      await waitFor(() => expect(initialFocus).toHaveFocus());
      expect(dialog()).toContainElement(document.activeElement as HTMLElement);
      await user.keyboard("{Escape}");
      await closed();
      await waitFor(() => expect(trigger).toHaveFocus());
    }
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
  });

  it.each([
    false,
    true,
  ])("showCloseButton=%s mantém Tab e Shift+Tab dentro do diálogo", async (showCloseButton) => {
    render(<Demo showCloseButton={showCloseButton} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar tarefa" }));
    const first = showCloseButton
      ? screen.getByRole("button", { name: "Fechar modal" })
      : screen.getByRole("textbox", { name: "Título" });
    await waitFor(() => expect(first).toHaveFocus());
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    screen.getByRole("button", { name: "Salvar" }).focus();
    await user.tab();
    expect(first).toHaveFocus();
    expect(screen.getByRole("button", { name: "Outra ação", hidden: true })).not.toHaveFocus();
  });

  it("sem controles focáveis o próprio diálogo recebe foco e Escape devolve ao gatilho", async () => {
    render(
      <Modal>
        <ModalTrigger>Abrir instrução</ModalTrigger>
        <ModalBody showCloseButton={false}>
          <ModalContent>
            <p>Revise a configuração.</p>
          </ModalContent>
        </ModalBody>
      </Modal>
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(dialog()).toHaveFocus());
    expect(screen.queryByRole("button", { name: "Fechar modal" })).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    await closed();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Abrir instrução" })).toHaveFocus()
    );
  });

  it.each([
    false,
    true,
  ])("gatilho asChild=%s compõe onClick do consumidor sem suprimir a abertura", async (asChild) => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn();
    const onChildClick = vi.fn();
    render(
      <Demo
        asChild={asChild}
        onOpenChange={onOpenChange}
        triggerProps={{ onClick }}
        onChildClick={onChildClick}
      />
    );
    const trigger = screen.getByRole("button", { name: "Editar tarefa" });
    await userEvent.click(trigger);
    expect(onClick.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: trigger })],
    ]);
    if (asChild)
      expect(onChildClick.mock.calls).toEqual([
        [expect.objectContaining({ type: "click", target: trigger })],
      ]);
    else expect(onChildClick).not.toHaveBeenCalled();
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(dialog()).toBeInTheDocument();
  });

  it.each([
    false,
    true,
  ])("preventDefault no gatilho asChild=%s cancela a abertura", async (asChild) => {
    const onOpenChange = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
    render(<Demo asChild={asChild} onOpenChange={onOpenChange} triggerProps={{ onClick }} />);
    const trigger = screen.getByRole("button", { name: "Editar tarefa" });
    await userEvent.click(trigger);
    expect(onClick.mock.calls).toEqual([
      [expect.objectContaining({ type: "click", target: trigger, defaultPrevented: true })],
    ]);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    false,
    true,
  ])("gatilho disabled com asChild=%s não abre por clique ou teclado", async (asChild) => {
    const onOpenChange = vi.fn();
    render(
      <Demo asChild={asChild} onOpenChange={onOpenChange} triggerProps={{ disabled: true }} />
    );
    const trigger = screen.getByRole("button", { name: "Editar tarefa" });
    expect(trigger).toBeDisabled();
    const user = userEvent.setup();
    await user.click(trigger);
    await user.tab();
    expect(screen.getByRole("button", { name: "Outra ação" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    false,
    true,
  ])("closeOnOutsideClick=%s ignora cliques internos e respeita o backdrop", async (closeOnOutsideClick) => {
    const onOpenChange = vi.fn();
    render(<Demo closeOnOutsideClick={closeOnOutsideClick} onOpenChange={onOpenChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar tarefa" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(dialog()).toBeInTheDocument();
    const backdrop = dialog().parentElement;
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as HTMLElement);
    if (closeOnOutsideClick) await closed();
    else {
      expect(dialog()).toBeInTheDocument();
      expect(onOpenChange.mock.calls).toEqual([[true]]);
      await user.keyboard("{Escape}");
      await closed();
    }
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Editar tarefa" })).toHaveFocus()
    );
  });

  it("estado controlado solicita abrir/fechar e espera o consumidor atualizar open", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Demo open={false} onOpenChange={onOpenChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar tarefa" }));
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(<Demo open onOpenChange={onOpenChange} />);
    expect(dialog()).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(dialog()).toBeInTheDocument();
    rerender(<Demo open={false} onOpenChange={onOpenChange} />);
    await closed();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Editar tarefa" })).toHaveFocus()
    );
  });

  it("fechar por botão no modo controlado também espera open e Escape fechado não emite callback", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Demo open onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(dialog()).toBeInTheDocument();
    rerender(<Demo open={false} onOpenChange={onOpenChange} />);
    await closed();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });

  it.each([
    "clique",
    "teclado",
  ])("Fechar modal por %s remove o diálogo e devolve foco ao gatilho", async (route) => {
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "Editar tarefa" });
    await user.click(trigger);
    const close = screen.getByRole("button", { name: "Fechar modal" });
    await waitFor(() => expect(close).toHaveFocus());
    if (route === "clique") await user.click(close);
    else await user.keyboard("{Enter}");
    await closed();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it.each([
    false,
    true,
  ])("movimento reduzido evita scale/rotateX com showCloseButton=%s", (showCloseButton) => {
    render(
      <MotionConfig reducedMotion="always">
        <Demo defaultOpen showCloseButton={showCloseButton} />
      </MotionConfig>
    );
    expect(dialog().style.transform).not.toMatch(/scale\(|rotateX\(/);
    expect(within(dialog()).getByRole("textbox", { name: "Título" })).toBeInTheDocument();
  });

  it.each([
    false,
    true,
  ])("diálogo aberto com showCloseButton=%s não tem violações automáticas de acessibilidade", async (showCloseButton) => {
    render(<Demo defaultOpen showCloseButton={showCloseButton} />);
    expect(dialog()).toHaveAccessibleName("Modal");
    const result = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
