import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";

describe("ContextMenu", () => {
  describe("Renderização", () => {
    it("deve renderizar o ContextMenu", () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item 1</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
      expect(screen.getByText("Trigger")).toBeInTheDocument();
    });

    it("deve renderizar todos os sub-componentes", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Label</ContextMenuLabel>
            <ContextMenuItem>Item</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuContent>
        </ContextMenu>
      );
      expect(screen.getByText("Trigger")).toBeInTheDocument();

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        expect(screen.getByText("Label")).toBeInTheDocument();
        expect(screen.getByText("Item")).toBeInTheDocument();
      });
    });
  });

  describe("ContextMenuItem", () => {
    it("deve renderizar item com variant default", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem variant="default">Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeInTheDocument();
      });
    });

    it("deve renderizar item com variant destructive", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        const item = document.querySelector('[data-variant="destructive"]');
        expect(item).toBeInTheDocument();
      });
    });

    it("deve renderizar item com inset", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem inset>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        const item = document.querySelector('[data-inset="true"]');
        expect(item).toBeInTheDocument();
      });
    });

    it("deve chamar onClick quando clicado", async () => {
      const handleClick = vi.fn();
      render(
        <ContextMenu>
          <ContextMenuTrigger>Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={handleClick}>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      // Abre o menu via clique direito
      const trigger = screen.getByText("Trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      // Aguarda menu abrir
      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });

      // Clica no item
      const item = screen.getByText("Item");
      await userEvent.click(item);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Acessibilidade", () => {
    it("deve abrir menu via clique direito", async () => {
      render(
        <ContextMenu>
          <ContextMenuTrigger data-testid="trigger">Trigger</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Item</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );

      const trigger = screen.getByTestId("trigger");
      await userEvent.pointer([
        { keys: "[MouseRight>]", target: trigger },
        { keys: "[/MouseRight]" },
      ]);

      await waitFor(() => {
        expect(screen.getByText("Item")).toBeVisible();
      });
    });
  });
});

async function abrirMenuComCliqueDireito() {
  await userEvent.pointer([
    { keys: "[MouseRight>]", target: screen.getByText("Área") },
    { keys: "[/MouseRight]" },
  ]);
  await screen.findByRole("menu");
}

describe("ContextMenu - itens de seleção", () => {
  it("deve alternar um item de checkbox e avisar o novo valor", async () => {
    const onCheckedChange = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Mostrar barra
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    const item = screen.getByRole("menuitemcheckbox", { name: "Mostrar barra" });
    expect(item).toHaveAttribute("aria-checked", "false");
    await userEvent.click(item);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("deve indicar o item de checkbox marcado", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem checked>Mostrar barra</ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    const item = screen.getByRole("menuitemcheckbox", { name: "Mostrar barra" });
    expect(item).toHaveAttribute("data-state", "checked");
    expect(item.querySelector("svg")).toBeInTheDocument();
  });

  it("deve selecionar uma opção do grupo de rádio", async () => {
    const onValueChange = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuRadioGroup value="claro" onValueChange={onValueChange}>
            <ContextMenuRadioItem value="claro">Claro</ContextMenuRadioItem>
            <ContextMenuRadioItem value="escuro">Escuro</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    expect(screen.getByRole("menuitemradio", { name: "Claro" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitemradio", { name: "Escuro" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Escuro" }));

    expect(onValueChange).toHaveBeenCalledWith("escuro");
  });
});

describe("ContextMenu - estrutura e estados", () => {
  it("deve agrupar itens e repassar className ao conteúdo", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent className="menu-custom">
          <ContextMenuGroup aria-label="Edição">
            <ContextMenuItem>Copiar</ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    expect(screen.getByRole("group", { name: "Edição" })).toContainElement(
      screen.getByRole("menuitem", { name: "Copiar" })
    );
    expect(screen.getByRole("menu")).toHaveClass("menu-custom");
  });

  it("deve aplicar inset ao rótulo e marcar o separador", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel inset>Seção</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>Copiar</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    expect(screen.getByText("Seção")).toHaveAttribute("data-inset", "true");
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("não deve disparar a ação de um item desabilitado", async () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled onSelect={onSelect}>
            Colar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    const item = screen.getByRole("menuitem", { name: "Colar" });
    expect(item).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(item);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("deve ativar o item focado com Enter e fechar o menu", async () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Recortar</ContextMenuItem>
          <ContextMenuItem onSelect={onSelect}>Copiar</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("deve fechar o menu com Escape", async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copiar</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
    await abrirMenuComCliqueDireito();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });
});

describe("ContextMenu - submenu", () => {
  function renderComSubmenu(onSelect = vi.fn()) {
    render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Mais ações</ContextMenuSubTrigger>
            <ContextMenuSubContent className="sub-custom">
              <ContextMenuItem onSelect={onSelect}>Salvar como</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  it("deve abrir o submenu com a seta para a direita", async () => {
    renderComSubmenu();
    await abrirMenuComCliqueDireito();

    const gatilho = screen.getByRole("menuitem", { name: "Mais ações" });
    expect(gatilho).toHaveAttribute("aria-expanded", "false");
    expect(gatilho).toHaveAttribute("data-inset", "true");

    await userEvent.keyboard("{ArrowDown}{ArrowRight}");

    expect(await screen.findByRole("menuitem", { name: "Salvar como" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Mais ações" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("deve executar a ação de um item do submenu", async () => {
    const onSelect = vi.fn();
    renderComSubmenu(onSelect);
    await abrirMenuComCliqueDireito();
    await userEvent.keyboard("{ArrowDown}{ArrowRight}");

    await userEvent.click(await screen.findByRole("menuitem", { name: "Salvar como" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe("ContextMenuPortal", () => {
  it("deve levar o conteúdo para fora do container da árvore", async () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Área</ContextMenuTrigger>
        <ContextMenuPortal forceMount>
          <p>Conteúdo no portal</p>
        </ContextMenuPortal>
      </ContextMenu>
    );

    const conteudo = await screen.findByText("Conteúdo no portal");
    expect(container).not.toContainElement(conteudo);
    expect(document.body).toContainElement(conteudo);
  });
});
