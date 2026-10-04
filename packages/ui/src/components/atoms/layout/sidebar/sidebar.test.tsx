import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

function EstadoDaBarra() {
  const { state, open, isMobile } = useSidebar();
  return (
    <output data-testid="estado">
      {state}|{String(open)}|{String(isMobile)}
    </output>
  );
}

// O Radix mantém o balão no DOM com o atributo hidden quando o tooltip é suprimido
function getBalaoDoTooltip(texto: string) {
  return screen.getAllByText(texto).find((el) => el.hasAttribute("data-side")) as HTMLElement;
}

function getBarraDesktop() {
  return document.querySelector('[data-slot="sidebar"]') as HTMLElement;
}

describe("Sidebar", () => {
  describe("Renderização", () => {
    it("deve renderizar o SidebarProvider", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });

    it("deve renderizar o Sidebar", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Sidebar Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Sidebar Content");
      expect(content).toBeInTheDocument();
    });

    it("deve renderizar SidebarTrigger", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
          <SidebarTrigger />
        </SidebarProvider>
      );
      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
    });

    it("deve renderizar SidebarMenu", () => {
      render(
        <SidebarProvider>
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Item 1</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const item = screen.getByText("Item 1");
      expect(item).toBeInTheDocument();
    });
  });

  describe("Estados", () => {
    it("deve renderizar com defaultOpen true", () => {
      render(
        <SidebarProvider defaultOpen>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });

    it("deve renderizar com defaultOpen false", () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });
  });

  it("o botão de abrir e fechar a barra tem nome em português", () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
      </SidebarProvider>
    );
    expect(screen.getByRole("button", { name: "Alternar barra lateral" })).toBeInTheDocument();
  });
});

describe("Sidebar - estado e atalhos", () => {
  const larguraOriginal = window.innerWidth;

  afterEach(() => {
    window.innerWidth = larguraOriginal;
    // biome-ignore lint/suspicious/noDocumentCookie: limpa o cookie de estado entre os testes
    document.cookie = "sidebar_state=; path=/; max-age=0";
  });

  it("deve falhar com mensagem clara quando useSidebar é usado fora do provider", () => {
    const erroConsole = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => render(<EstadoDaBarra />)).toThrow(
        "useSidebar must be used within a SidebarProvider."
      );
    } finally {
      erroConsole.mockRestore();
    }
  });

  it("deve recolher e expandir ao clicar no botão e guardar a escolha no cookie", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Conteúdo</SidebarContent>
        </Sidebar>
        <SidebarTrigger />
        <EstadoDaBarra />
      </SidebarProvider>
    );
    expect(getBarraDesktop()).toHaveAttribute("data-state", "expanded");

    await user.click(screen.getByRole("button", { name: "Alternar barra lateral" }));

    expect(getBarraDesktop()).toHaveAttribute("data-state", "collapsed");
    expect(screen.getByTestId("estado")).toHaveTextContent("collapsed|false|false");
    expect(document.cookie).toContain("sidebar_state=false");

    await user.click(screen.getByRole("button", { name: "Alternar barra lateral" }));

    expect(getBarraDesktop()).toHaveAttribute("data-state", "expanded");
    expect(document.cookie).toContain("sidebar_state=true");
  });

  it("deve começar recolhida com defaultOpen false", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <SidebarContent>Conteúdo</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    expect(getBarraDesktop()).toHaveAttribute("data-state", "collapsed");
    expect(getBarraDesktop()).toHaveAttribute("data-collapsible", "icon");
  });

  it("deve ser controlada de fora e avisar o novo estado sem mudar sozinha", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <Sidebar>
          <SidebarContent>Conteúdo</SidebarContent>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>
    );

    await user.click(screen.getByRole("button", { name: "Alternar barra lateral" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(getBarraDesktop()).toHaveAttribute("data-state", "expanded");
  });

  it("deve chamar o onClick do botão antes de alternar", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <SidebarTrigger onClick={onClick} />
        <EstadoDaBarra />
      </SidebarProvider>
    );

    await user.click(screen.getByRole("button", { name: "Alternar barra lateral" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("estado")).toHaveTextContent("collapsed");
  });

  it("deve alternar com Ctrl+B e ignorar B sozinho", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <EstadoDaBarra />
      </SidebarProvider>
    );

    await user.keyboard("b");
    expect(screen.getByTestId("estado")).toHaveTextContent("expanded");

    await user.keyboard("{Control>}b{/Control}");
    expect(screen.getByTestId("estado")).toHaveTextContent("collapsed");

    await user.keyboard("{Meta>}b{/Meta}");
    expect(screen.getByTestId("estado")).toHaveTextContent("expanded");
  });
});

describe("Sidebar - setOpen pelo contexto", () => {
  it("deve aceitar um valor direto em setOpen", async () => {
    const user = userEvent.setup();
    function Fechar() {
      const { setOpen } = useSidebar();
      return (
        <button type="button" onClick={() => setOpen(false)}>
          Fechar barra
        </button>
      );
    }
    render(
      <SidebarProvider>
        <Fechar />
        <EstadoDaBarra />
      </SidebarProvider>
    );

    await user.click(screen.getByRole("button", { name: "Fechar barra" }));

    expect(screen.getByTestId("estado")).toHaveTextContent("collapsed|false");
  });
});

describe("Sidebar - variantes e lado", () => {
  it("deve expor lado e variante escolhidos", () => {
    render(
      <SidebarProvider>
        <Sidebar side="right" variant="floating">
          <SidebarContent>Conteúdo</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    expect(getBarraDesktop()).toHaveAttribute("data-side", "right");
    expect(getBarraDesktop()).toHaveAttribute("data-variant", "floating");
  });

  it("deve aceitar a variante inset e repassar className ao container", () => {
    render(
      <SidebarProvider>
        <Sidebar variant="inset" className="minha-barra">
          <SidebarContent>Conteúdo</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    expect(getBarraDesktop()).toHaveAttribute("data-variant", "inset");
    expect(document.querySelector('[data-slot="sidebar-container"]')).toHaveClass("minha-barra");
  });

  it("deve renderizar fixa e sem estado de recolhimento com collapsible none", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Sidebar collapsible="none" className="fixa">
          <SidebarContent>Conteúdo</SidebarContent>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>
    );
    await user.click(screen.getByRole("button", { name: "Alternar barra lateral" }));

    const barra = getBarraDesktop();
    expect(barra).toHaveClass("fixa");
    expect(barra).not.toHaveAttribute("data-state");
    expect(screen.getByText("Conteúdo")).toBeVisible();
  });
});

describe("Sidebar - partes", () => {
  it("deve compor cabeçalho, grupo, menu, rodapé e conteúdo principal", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Topo</SidebarHeader>
          <SidebarInput aria-label="Buscar no menu" />
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegação</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive size="lg" variant="outline">
                      Início
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>Rodapé</SidebarFooter>
        </Sidebar>
        <SidebarInset>Página</SidebarInset>
      </SidebarProvider>
    );

    expect(screen.getByRole("textbox", { name: "Buscar no menu" })).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sidebar-separator"]')).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Página");
    expect(screen.getByText("Topo")).toBeInTheDocument();
    expect(screen.getByText("Rodapé")).toBeInTheDocument();
    const botao = screen.getByRole("button", { name: "Início" });
    expect(botao).toHaveAttribute("data-active", "true");
    expect(botao).toHaveAttribute("data-size", "lg");
  });

  it("deve renderizar o rótulo do grupo como o elemento filho com asChild", () => {
    render(
      <SidebarProvider>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <h2>Projetos</h2>
          </SidebarGroupLabel>
        </SidebarGroup>
      </SidebarProvider>
    );

    expect(screen.getByRole("heading", { level: 2, name: "Projetos" })).toHaveAttribute(
      "data-slot",
      "sidebar-group-label"
    );
  });

  it("deve renderizar o botão do menu como link com asChild", () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton asChild>
          <a href="/inicio">Início</a>
        </SidebarMenuButton>
      </SidebarProvider>
    );

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "data-slot",
      "sidebar-menu-button"
    );
  });
});

describe("SidebarMenuButton - tooltip", () => {
  it("deve mostrar o tooltip com o texto quando a barra está recolhida", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip="Painel de controle">Painel</SidebarMenuButton>
      </SidebarProvider>
    );

    await user.hover(screen.getByRole("button", { name: "Painel" }));

    await waitFor(() => expect(getBalaoDoTooltip("Painel de controle")).toBeDefined());
    expect(getBalaoDoTooltip("Painel de controle")).not.toHaveAttribute("hidden");
  });

  it("deve aceitar o tooltip como objeto de props", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip={{ children: "Dica em objeto" }}>Painel</SidebarMenuButton>
      </SidebarProvider>
    );

    await user.hover(screen.getByRole("button", { name: "Painel" }));

    await waitFor(() => expect(getBalaoDoTooltip("Dica em objeto")).toBeDefined());
    expect(getBalaoDoTooltip("Dica em objeto")).not.toHaveAttribute("hidden");
  });

  it("não deve mostrar o tooltip quando a barra está expandida", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <SidebarMenuButton tooltip="Painel de controle">Painel</SidebarMenuButton>
      </SidebarProvider>
    );

    await user.hover(screen.getByRole("button", { name: "Painel" }));

    await waitFor(() => expect(getBalaoDoTooltip("Painel de controle")).toBeDefined());
    expect(getBalaoDoTooltip("Painel de controle")).toHaveAttribute("hidden");
  });
});

describe("Sidebar - celular", () => {
  const larguraOriginal = window.innerWidth;

  afterEach(() => {
    window.innerWidth = larguraOriginal;
  });

  it("deve abrir como painel deslizante pelo botão e fechar com Escape", async () => {
    window.innerWidth = 500;
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Menu do celular</SidebarContent>
        </Sidebar>
        <SidebarTrigger />
        <EstadoDaBarra />
      </SidebarProvider>
    );
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("true"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Alternar barra lateral" }));

    const painel = await screen.findByRole("dialog", { name: "Barra lateral" });
    expect(painel).toHaveAttribute("data-mobile", "true");
    expect(painel).toHaveTextContent("Menu do celular");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("deve alternar o painel com Ctrl+B no celular", async () => {
    window.innerWidth = 500;
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Menu do celular</SidebarContent>
        </Sidebar>
        <EstadoDaBarra />
      </SidebarProvider>
    );
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("true"));

    await user.keyboard("{Control>}b{/Control}");

    expect(await screen.findByRole("dialog", { name: "Barra lateral" })).toBeInTheDocument();
  });

  it("não deve mostrar tooltip do botão do menu no celular", async () => {
    window.innerWidth = 500;
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip="Painel de controle">Painel</SidebarMenuButton>
        <EstadoDaBarra />
      </SidebarProvider>
    );
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("true"));

    await user.hover(screen.getByRole("button", { name: "Painel" }));

    await waitFor(() => expect(getBalaoDoTooltip("Painel de controle")).toBeDefined());
    expect(getBalaoDoTooltip("Painel de controle")).toHaveAttribute("hidden");
  });
});
