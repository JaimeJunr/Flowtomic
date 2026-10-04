import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar";

function Barra({ onNovo = () => {}, onExcluir = () => {} }) {
  const [grade, setGrade] = useState(false);
  const [zoom, setZoom] = useState("100");
  return (
    <Menubar aria-label="Aplicativo">
      <MenubarMenu>
        <MenubarTrigger>Arquivo</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Documento</MenubarLabel>
          <MenubarItem onSelect={onNovo}>
            Novo <MenubarShortcut>Ctrl+N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Imprimir</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive" onSelect={onExcluir}>
            Excluir
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Exportar</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Exibir</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={grade} onCheckedChange={setGrade}>
            Mostrar grade
          </MenubarCheckboxItem>
          <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
            <MenubarRadioItem value="100">100%</MenubarRadioItem>
            <MenubarRadioItem value="200">200%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe("Menubar", () => {
  it("começa com os menus fechados", () => {
    render(<Barra />);
    expect(screen.getByRole("menubar", { name: "Aplicativo" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Novo/ })).not.toBeInTheDocument();
  });

  it("abre o menu, mostra o atalho e executa o item escolhido fechando o menu", async () => {
    const onNovo = vi.fn();
    render(<Barra onNovo={onNovo} />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    const novo = screen.getByRole("menuitem", { name: /Novo/ });
    expect(novo).toHaveTextContent("Ctrl+N");
    await userEvent.click(novo);
    expect(onNovo).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: /Novo/ })).not.toBeInTheDocument();
  });

  it("Esc fecha o menu aberto", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("seta para a direita passa para o menu vizinho", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitemcheckbox", { name: "Mostrar grade" })).toBeVisible();
  });

  it("setas navegam pelos itens e Enter ativa o focado", async () => {
    const onNovo = vi.fn();
    render(<Barra onNovo={onNovo} />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Novo/ })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onNovo).toHaveBeenCalledTimes(1);
  });

  it("item desabilitado fica marcado e não dispara ação", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    expect(screen.getByRole("menuitem", { name: "Imprimir" })).toHaveAttribute("data-disabled");
  });

  it("item destrutivo carrega a variante para o estilo e ainda executa", async () => {
    const onExcluir = vi.fn();
    render(<Barra onExcluir={onExcluir} />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    const excluir = screen.getByRole("menuitem", { name: "Excluir" });
    expect(excluir).toHaveAttribute("data-variant", "destructive");
    expect(screen.getByRole("menuitem", { name: /Novo/ })).toHaveAttribute(
      "data-variant",
      "default"
    );
    await userEvent.click(excluir);
    expect(onExcluir).toHaveBeenCalledTimes(1);
  });

  it("item de marcação alterna o estado ao ser escolhido", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Exibir" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Mostrar grade" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Mostrar grade" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Exibir" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Mostrar grade" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("grupo de rádio marca só a opção escolhida", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Exibir" }));
    expect(screen.getByRole("menuitemradio", { name: "100%" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.click(screen.getByRole("menuitemradio", { name: "200%" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Exibir" }));
    expect(screen.getByRole("menuitemradio", { name: "200%" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitemradio", { name: "100%" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("submenu abre com a seta para a direita", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    screen.getByRole("menuitem", { name: "Exportar" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "PDF" })).toBeVisible();
  });

  it("não tem violações de acessibilidade com o menu aberto", async () => {
    render(<Barra />);
    await userEvent.click(screen.getByRole("menuitem", { name: "Arquivo" }));
    const result = await axe.run(screen.getByRole("menu"), {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
