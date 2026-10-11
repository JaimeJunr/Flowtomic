import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { createRef, useState } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { LayeredMenu, type LayeredMenuProps } from "./layered-menu";

const ITEMS = [
  { label: "Início", href: "#inicio" },
  { label: "Carteiras", href: "#carteiras" },
  { label: "Relatórios", href: "#relatorios" },
];
const LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "E-mail", href: "#" },
];

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function setup(props: Partial<LayeredMenuProps> = {}, reducedMotion: "never" | "always" = "never") {
  return render(
    <MotionConfig reducedMotion={reducedMotion}>
      <LayeredMenu items={ITEMS} links={LINKS} {...props} />
    </MotionConfig>
  );
}

const toggle = () => screen.getByRole("button", { name: /menu/i });
const dialog = () => screen.queryByRole("dialog");

describe("LayeredMenu", () => {
  it("começa fechado, com a raiz marcada e posicionada", () => {
    const { container } = setup();
    const root = container.querySelector('[data-slot="layered-menu"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "overflow-hidden");
    expect(dialog()).not.toBeInTheDocument();
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveAttribute("data-slot", "layered-menu-toggle");
  });

  it("repassa ref, className e props à raiz", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = setup({ ref, className: "minha-classe", id: "menu-principal" });
    expect(ref.current).toBe(container.querySelector('[data-slot="layered-menu"]'));
    expect(ref.current).toHaveClass("minha-classe");
    expect(ref.current).toHaveAttribute("id", "menu-principal");
  });

  it("abre e fecha pelo botão", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(toggle());
    expect(dialog()).toBeInTheDocument();
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle());
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("liga aria-controls ao painel e expõe o diálogo modal com nav e lista", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(toggle());
    const panel = screen.getByRole("dialog", { name: "Menu" });
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveAttribute("data-slot", "layered-menu-panel");
    expect(toggle()).toHaveAttribute("aria-controls", panel.id);
    expect(panel.querySelector("nav ul")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Início|Carteiras|Relatórios/ })).toHaveLength(3);
  });

  it("fecha com Esc", async () => {
    const user = userEvent.setup();
    setup({ defaultOpen: true });
    expect(dialog()).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("fecha ao clicar fora do painel", async () => {
    const user = userEvent.setup();
    render(
      <MotionConfig reducedMotion="never">
        <button type="button">Fora</button>
        <LayeredMenu items={ITEMS} defaultOpen />
      </MotionConfig>
    );
    await user.click(screen.getByRole("button", { name: "Fora" }));
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("não fecha ao clicar dentro do painel", async () => {
    const user = userEvent.setup();
    setup({ defaultOpen: true });
    await user.click(screen.getByRole("dialog"));
    expect(dialog()).toBeInTheDocument();
  });

  it("não fecha ao clicar fora com closeOnClickAway desligado", async () => {
    const user = userEvent.setup();
    render(
      <MotionConfig reducedMotion="never">
        <button type="button">Fora</button>
        <LayeredMenu items={ITEMS} defaultOpen closeOnClickAway={false} />
      </MotionConfig>
    );
    await user.click(screen.getByRole("button", { name: "Fora" }));
    expect(dialog()).toBeInTheDocument();
  });

  it("fecha ao clicar num item", async () => {
    const user = userEvent.setup();
    setup({ defaultOpen: true });
    await user.click(screen.getByRole("link", { name: "Carteiras" }));
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("funciona no modo controlado e avisa onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <MotionConfig reducedMotion="never">
          <LayeredMenu
            items={ITEMS}
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
          />
        </MotionConfig>
      );
    }
    render(<Controlled />);
    await user.click(toggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(dialog()).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(dialog()).not.toBeInTheDocument());
  });

  it("não abre sozinho quando controlado e o pai não atualiza", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    setup({ open: false, onOpenChange });
    await user.click(toggle());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(dialog()).not.toBeInTheDocument();
  });

  it("manda o foco ao primeiro item ao abrir e de volta ao botão ao fechar", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(toggle());
    expect(screen.getByRole("link", { name: "Início" })).toHaveFocus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(toggle()).toHaveFocus());
  });

  it("circula o Tab entre o botão e o painel", async () => {
    const user = userEvent.setup();
    setup({ defaultOpen: true });
    screen.getByRole("link", { name: "E-mail" }).focus();
    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("link", { name: "E-mail" })).toHaveFocus();
  });

  it("numera os itens por padrão, com os números escondidos do leitor de tela", async () => {
    setup({ defaultOpen: true });
    const numbers = screen.getByRole("dialog").querySelectorAll('[aria-hidden="true"]');
    const texts = Array.from(numbers).map((n) => n.textContent);
    expect(texts).toContain("01");
    expect(texts).toContain("03");
    expect(screen.getByRole("link", { name: "Início" })).toBeInTheDocument();
  });

  it("não mostra números com numbered desligado", () => {
    setup({ defaultOpen: true, numbered: false });
    expect(screen.queryByText("01")).not.toBeInTheDocument();
  });

  it("mostra a seção de links com o título padrão e personalizado", () => {
    const { rerender } = setup({ defaultOpen: true });
    expect(screen.getByText("Contato")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    rerender(
      <MotionConfig reducedMotion="never">
        <LayeredMenu items={ITEMS} links={LINKS} linksTitle="Redes" defaultOpen />
      </MotionConfig>
    );
    expect(screen.getByText("Redes")).toBeInTheDocument();
  });

  it("omite a seção de links quando a lista é vazia ou ausente", () => {
    setup({ defaultOpen: true, links: [] });
    expect(screen.queryByText("Contato")).not.toBeInTheDocument();
  });

  it("usa ariaLabel do item quando informado", () => {
    setup({
      defaultOpen: true,
      items: [{ label: "Início", href: "#", ariaLabel: "Ir para o início" }],
    });
    expect(screen.getByRole("link", { name: "Ir para o início" })).toBeInTheDocument();
  });

  it("renderiza 1, 2 ou 3 camadas escondidas do leitor de tela", () => {
    for (const layers of [1, 2, 3] as const) {
      const { container, unmount } = setup({ defaultOpen: true, layers });
      const found = container.querySelectorAll('[data-slot="layered-menu-layer"]');
      expect(found).toHaveLength(layers);
      for (const layer of found) expect(layer).toHaveAttribute("aria-hidden", "true");
      unmount();
    }
  });

  it("encosta o painel na lateral escolhida", () => {
    const right = setup({ defaultOpen: true });
    expect(right.container.querySelector('[data-slot="layered-menu-panel"]')).toHaveClass(
      "right-0"
    );
    right.unmount();
    const left = setup({ defaultOpen: true, side: "left" });
    expect(left.container.querySelector('[data-slot="layered-menu-panel"]')).toHaveClass("left-0");
  });

  it("renderiza o logo", () => {
    setup({ logo: <span>Marca</span> });
    expect(screen.getByText("Marca")).toBeInTheDocument();
  });

  it("recusa lista de itens vazia", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => setup({ items: [], defaultOpen: true })).toThrow(/pelo menos 1/);
    spy.mockRestore();
  });

  describe("movimento reduzido", () => {
    it("abre o painel sem camadas e mantém um só texto no botão", async () => {
      const user = userEvent.setup();
      const { container } = setup({}, "always");
      expect(toggle().textContent).toContain("Menu");
      expect(toggle().textContent).not.toContain("Fechar");
      await user.click(toggle());
      expect(dialog()).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="layered-menu-layer"]')).toHaveLength(0);
      expect(toggle().textContent).toContain("Fechar");
      expect(toggle().textContent).not.toContain("Menu");
    });

    it("fecha com Esc", async () => {
      const user = userEvent.setup();
      setup({ defaultOpen: true }, "always");
      await user.keyboard("{Escape}");
      await waitFor(() => expect(dialog()).not.toBeInTheDocument());
    });
  });
});
