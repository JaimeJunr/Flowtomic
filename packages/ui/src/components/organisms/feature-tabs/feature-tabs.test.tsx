import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfig, MotionGlobalConfig } from "motion/react";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FeatureTabs, type FeatureTabsProps } from "./feature-tabs";

const tabs: FeatureTabsProps["tabs"] = [
  {
    id: "cli",
    label: "CLI",
    heading: "Copie só o que usa",
    description: "O CLI copia os arquivos para o projeto.",
    points: ["Comando add", "Comando list"],
    link: { href: "/cli" },
  },
  {
    id: "pacote",
    label: "Pacote npm",
    heading: "Tudo em um pacote",
    description: "Tipos exportados.",
    link: { href: "/pacote", label: "Ver o pacote" },
  },
  { id: "hooks", label: "Hooks", heading: "Sem UI", media: <p>demo do hook</p> },
];

function setup(props: Partial<FeatureTabsProps> = {}) {
  return render(<FeatureTabs title="Jeitos de usar" tabs={tabs} {...props} />);
}

const spies: Array<{ mockRestore: () => void }> = [];

function track<T extends { mockRestore: () => void }>(spy: T): T {
  spies.push(spy);
  return spy;
}

function mockWidth(width: number) {
  return track(
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      width,
      height: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
  );
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  for (const spy of spies.splice(0)) spy.mockRestore();
  window.location.hash = "";
});

describe("FeatureTabs", () => {
  it("renderiza a seção nomeada pelo título, uma aba por item e o primeiro painel", () => {
    const { container } = setup();
    expect(screen.getByRole("region", { name: "Jeitos de usar" })).toHaveAttribute(
      "data-slot",
      "feature-tabs"
    );
    expect(container.querySelector('[data-slot="feature-tabs-header"]')).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Recursos" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel");
    expect(
      within(panel).getByRole("heading", { level: 3, name: "Copie só o que usa" })
    ).toBeVisible();
    expect(within(panel).getByText("O CLI copia os arquivos para o projeto.")).toBeInTheDocument();
    expect(within(panel).getAllByRole("listitem")).toHaveLength(2);
    expect(within(panel).getByRole("link", { name: "Saiba mais sobre CLI" })).toHaveAttribute(
      "href",
      "/cli"
    );
    expect(container.querySelector('[data-slot="feature-tabs-indicator"]')).toBeInTheDocument();
  });

  it("clicar numa aba mostra o painel dela e o leitor acha só um tabpanel", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("tab", { name: "Pacote npm" }));
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Tudo em um pacote" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Copie só o que usa" })).not.toBeInTheDocument();
  });

  it("no largo as setas verticais trocam de aba; Home e End vão às pontas", async () => {
    mockWidth(1000);
    setup();
    const list = screen.getByRole("tablist");
    await waitFor(() => expect(list).toHaveAttribute("aria-orientation", "vertical"));
    const cli = screen.getByRole("tab", { name: "CLI" });
    cli.focus();
    fireEvent.keyDown(cli, { key: "ArrowDown" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Pacote npm" })).toHaveAttribute(
        "aria-selected",
        "true"
      )
    );
    fireEvent.keyDown(screen.getByRole("tab", { name: "Pacote npm" }), { key: "End" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Hooks" })).toHaveAttribute("aria-selected", "true")
    );
    fireEvent.keyDown(screen.getByRole("tab", { name: "Hooks" }), { key: "Home" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true")
    );
  });

  it("no estreito a orientação é horizontal e a seta direita avança", async () => {
    mockWidth(390);
    setup();
    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("aria-orientation", "horizontal");
    const cli = screen.getByRole("tab", { name: "CLI" });
    cli.focus();
    fireEvent.keyDown(cli, { key: "ArrowRight" });
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Pacote npm" })).toHaveAttribute(
        "aria-selected",
        "true"
      )
    );
  });

  it("controlado: onValueChange recebe o id e sem value novo a aba não muda", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    setup({ value: "cli", onValueChange });
    await user.click(screen.getByRole("tab", { name: "Hooks" }));
    expect(onValueChange).toHaveBeenCalledWith("hooks");
    expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
  });

  it("controlado com estado do pai troca a aba", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [value, setValue] = useState("cli");
      return <FeatureTabs title="T" tabs={tabs} value={value} onValueChange={setValue} />;
    }
    render(<Wrapper />);
    await user.click(screen.getByRole("tab", { name: "Hooks" }));
    expect(screen.getByRole("tab", { name: "Hooks" })).toHaveAttribute("aria-selected", "true");
  });

  it("defaultValue escolhe a aba inicial", () => {
    setup({ defaultValue: "hooks" });
    expect(screen.getByRole("tab", { name: "Hooks" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("demo do hook")).toBeVisible();
  });

  it("link com label usa o dado", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("tab", { name: "Pacote npm" }));
    expect(screen.getByRole("link", { name: "Ver o pacote" })).toHaveAttribute("href", "/pacote");
    expect(screen.queryByRole("link", { name: /Saiba mais sobre/ })).not.toBeInTheDocument();
  });

  it("syncHash: trocar de aba chama replaceState com #id", async () => {
    const user = userEvent.setup();
    const spy = track(vi.spyOn(window.history, "replaceState"));
    setup({ syncHash: true });
    await user.click(screen.getByRole("tab", { name: "Pacote npm" }));
    expect(spy).toHaveBeenCalledWith(window.history.state, "", "#pacote");
  });

  it("sem syncHash a URL não muda", async () => {
    const user = userEvent.setup();
    const spy = track(vi.spyOn(window.history, "replaceState"));
    setup();
    await user.click(screen.getByRole("tab", { name: "Pacote npm" }));
    expect(spy).not.toHaveBeenCalled();
  });

  it("syncHash: montar com #id abre aquela aba; hash desconhecido abre a padrão", () => {
    window.location.hash = "#hooks";
    const { unmount } = setup({ syncHash: true });
    expect(screen.getByRole("tab", { name: "Hooks" })).toHaveAttribute("aria-selected", "true");
    unmount();

    window.location.hash = "#nada";
    setup({ syncHash: true });
    expect(screen.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
  });

  it("headingLevel 3 põe o título em h3 e os títulos de painel em h4", () => {
    setup({ headingLevel: 3 });
    expect(screen.getByRole("heading", { level: 3, name: "Jeitos de usar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Copie só o que usa" })).toBeVisible();
  });

  it("painéis inativos continuam montados, inativos e fora da árvore de acessibilidade", () => {
    const { container } = setup();
    const panels = container.querySelectorAll('[data-slot="feature-tabs-panel"]');
    expect(panels).toHaveLength(3);
    expect(panels[0]).toHaveAttribute("data-state", "active");
    expect(panels[1]).toHaveAttribute("data-state", "inactive");
    expect(panels[1]).toHaveAttribute("aria-hidden", "true");
    expect(panels[0]).not.toHaveAttribute("aria-hidden");
  });

  it("aceita label da lista, ícone e media; sem título a seção não ganha nome", () => {
    const { container } = render(
      <FeatureTabs
        label="Passos"
        tabs={[{ ...tabs[0], icon: <svg data-testid="ico" /> }, tabs[2]]}
      />
    );
    expect(screen.getByRole("tablist", { name: "Passos" })).toBeInTheDocument();
    expect(screen.getByTestId("ico").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("section")).not.toHaveAttribute("aria-labelledby");
    expect(container.querySelector('[data-slot="feature-tabs-header"]')).not.toBeInTheDocument();
  });

  it("rola a aba ativa para dentro da faixa no estreito", async () => {
    mockWidth(390);
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("tab", { name: "Hooks" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ inline: "nearest", block: "nearest" });
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });

  it("com movimento reduzido ainda troca de aba", async () => {
    const user = userEvent.setup();
    render(
      <MotionConfig reducedMotion="always">
        <FeatureTabs title="T" tabs={tabs} />
      </MotionConfig>
    );
    await act(async () => {
      await user.click(screen.getByRole("tab", { name: "Hooks" }));
    });
    expect(screen.getByRole("tab", { name: "Hooks" })).toHaveAttribute("aria-selected", "true");
  });
});
