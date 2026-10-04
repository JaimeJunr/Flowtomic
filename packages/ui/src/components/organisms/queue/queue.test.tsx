import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemImage,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "./queue";

function FilaDeTarefas({
  onRemover = () => {},
  defaultOpen,
}: {
  onRemover?: () => void;
  defaultOpen?: boolean;
}) {
  return (
    <Queue>
      <QueueSection defaultOpen={defaultOpen}>
        <QueueSectionTrigger>
          <QueueSectionLabel count={2} label="tarefas pendentes" />
        </QueueSectionTrigger>
        <QueueSectionContent>
          <QueueList>
            <QueueItem>
              <div className="flex items-center gap-2">
                <QueueItemIndicator />
                <QueueItemContent>Revisar relatório</QueueItemContent>
                <QueueItemActions>
                  <QueueItemAction aria-label="Remover Revisar relatório" onClick={onRemover}>
                    x
                  </QueueItemAction>
                </QueueItemActions>
              </div>
              <QueueItemDescription>Conferir os números de setembro</QueueItemDescription>
            </QueueItem>
          </QueueList>
        </QueueSectionContent>
      </QueueSection>
    </Queue>
  );
}

describe("QueueSectionLabel", () => {
  describe("Contagem em pt-BR", () => {
    it("formata milhar com ponto, no padrão pt-BR", () => {
      render(<QueueSectionLabel count={1240} label="tarefas do build do registry" />);
      expect(screen.getByText("1.240 tarefas do build do registry")).toBeInTheDocument();
    });

    it("sem count, mostra só o label", () => {
      render(<QueueSectionLabel label="fila vazia" />);
      expect(screen.getByText("fila vazia")).toBeInTheDocument();
    });
  });
});

describe("Queue", () => {
  describe("Seção recolhível", () => {
    it("começa aberta por padrão e mostra os itens", () => {
      render(<FilaDeTarefas />);
      expect(screen.getByRole("button", { name: /tarefas pendentes/ })).toHaveAttribute(
        "aria-expanded",
        "true"
      );
      expect(screen.getByText("Revisar relatório")).toBeVisible();
    });

    it("mostra a contagem formatada no rótulo do gatilho", () => {
      render(<FilaDeTarefas />);
      expect(screen.getByRole("button", { name: "2 tarefas pendentes" })).toBeInTheDocument();
    });

    it("recolhe os itens ao clicar no gatilho e reabre ao clicar de novo", async () => {
      const user = userEvent.setup();
      render(<FilaDeTarefas />);
      const gatilho = screen.getByRole("button", { name: /tarefas pendentes/ });

      await user.click(gatilho);
      expect(gatilho).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText("Revisar relatório")).not.toBeInTheDocument();

      await user.click(gatilho);
      expect(gatilho).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("Revisar relatório")).toBeInTheDocument();
    });

    it("alterna pelo teclado com Enter", async () => {
      const user = userEvent.setup();
      render(<FilaDeTarefas />);
      await user.tab();
      const gatilho = screen.getByRole("button", { name: /tarefas pendentes/ });
      expect(gatilho).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(gatilho).toHaveAttribute("aria-expanded", "false");
    });

    it("com defaultOpen=false, começa recolhida", () => {
      render(<FilaDeTarefas defaultOpen={false} />);
      expect(screen.getByRole("button", { name: /tarefas pendentes/ })).toHaveAttribute(
        "aria-expanded",
        "false"
      );
      expect(screen.queryByText("Revisar relatório")).not.toBeInTheDocument();
    });
  });

  describe("Item da fila", () => {
    it("lista o item com conteúdo e descrição", () => {
      render(<FilaDeTarefas />);
      expect(screen.getByRole("listitem")).toBeInTheDocument();
      expect(screen.getByText("Conferir os números de setembro")).toBeInTheDocument();
    });

    it("dispara a ação do item quando clicada", async () => {
      const onRemover = vi.fn();
      const user = userEvent.setup();
      render(<FilaDeTarefas onRemover={onRemover} />);

      await user.click(screen.getByRole("button", { name: "Remover Revisar relatório" }));
      expect(onRemover).toHaveBeenCalledTimes(1);
    });

    it("a ação do item é um botão do tipo button, que não envia formulários", () => {
      render(<FilaDeTarefas />);
      expect(screen.getByRole("button", { name: "Remover Revisar relatório" })).toHaveAttribute(
        "type",
        "button"
      );
    });

    it("item concluído tem conteúdo e descrição riscados", () => {
      render(
        <ul>
          <QueueItem>
            <QueueItemIndicator completed data-testid="indicador" />
            <QueueItemContent completed>Enviar fatura</QueueItemContent>
            <QueueItemDescription completed>Cliente já pagou</QueueItemDescription>
          </QueueItem>
        </ul>
      );
      expect(screen.getByText("Enviar fatura")).toHaveClass("line-through");
      expect(screen.getByText("Cliente já pagou")).toHaveClass("line-through");
      expect(screen.getByTestId("indicador")).toHaveClass("bg-muted-foreground/10");
    });

    it("item pendente não tem conteúdo nem descrição riscados", () => {
      render(
        <ul>
          <QueueItem>
            <QueueItemIndicator data-testid="indicador" />
            <QueueItemContent>Enviar fatura</QueueItemContent>
            <QueueItemDescription>Cliente ainda não pagou</QueueItemDescription>
          </QueueItem>
        </ul>
      );
      expect(screen.getByText("Enviar fatura")).not.toHaveClass("line-through");
      expect(screen.getByText("Cliente ainda não pagou")).not.toHaveClass("line-through");
      expect(screen.getByTestId("indicador")).not.toHaveClass("bg-muted-foreground/10");
    });
  });

  describe("Anexos", () => {
    it("mostra o nome do arquivo anexado", () => {
      render(
        <QueueItemAttachment>
          <QueueItemFile>contrato.pdf</QueueItemFile>
        </QueueItemAttachment>
      );
      expect(screen.getByText("contrato.pdf")).toBeInTheDocument();
    });

    it("imagem anexada usa a descrição passada e tem tamanho fixo de miniatura", () => {
      render(
        <QueueItemAttachment>
          <QueueItemImage src="/foto.png" alt="Foto do recibo" />
        </QueueItemAttachment>
      );
      const imagem = screen.getByRole("img", { name: "Foto do recibo" });
      expect(imagem).toHaveAttribute("src", "/foto.png");
      expect(imagem).toHaveAttribute("width", "32");
      expect(imagem).toHaveAttribute("height", "32");
    });

    it("imagem sem alt é decorativa e some da árvore de acessibilidade", () => {
      render(<QueueItemImage src="/foto.png" />);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("fila aberta não tem violações de acessibilidade", async () => {
      const { container } = render(<FilaDeTarefas />);
      const resultado = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(resultado.violations).toEqual([]);
    });

    it("fila recolhida não tem violações de acessibilidade", async () => {
      const { container } = render(<FilaDeTarefas defaultOpen={false} />);
      const resultado = await axe.run(container, {
        rules: { "color-contrast": { enabled: false } },
      });
      expect(resultado.violations).toEqual([]);
    });
  });
});
