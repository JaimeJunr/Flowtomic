import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionGlobalConfig } from "motion/react";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { FaqSection, type FaqSectionProps } from "./faq-section";

const items: FaqSectionProps["items"] = [
  { id: "precos", question: "Quanto custa?", answer: "É gratuito para projetos comerciais." },
  { id: "react", question: "Funciona com React 18?", answer: "Não, React 19 é obrigatório." },
  { id: "cli", question: "O CLI sobrescreve arquivos?", answer: "Só se você confirmar." },
];

function setup(props: Partial<FaqSectionProps> = {}) {
  return render(<FaqSection title="Perguntas frequentes" items={items} {...props} />);
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
afterEach(() => {
  window.location.hash = "";
  vi.useRealTimers();
});

describe("FaqSection", () => {
  it("renderiza section nomeada pelo título, com uma pergunta por item", () => {
    const { container } = setup();
    const section = screen.getByRole("region", { name: "Perguntas frequentes" });
    expect(section).toHaveAttribute("data-slot", "faq-section");
    expect(container.querySelector('[data-slot="faq-section-header"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="faq-section-list"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-slot="faq-section-item"]')).toHaveLength(3);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("heading", { level: 2, name: "Perguntas frequentes" })).toBeVisible();
  });

  it("split numera 01, 02; grid não; numbered sobrescreve", () => {
    const { unmount } = setup();
    expect(screen.getByText("01")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("02")).toBeInTheDocument();
    unmount();

    const grid = setup({ layout: "grid" });
    expect(screen.queryByText("01")).not.toBeInTheDocument();
    grid.unmount();

    const gridNumbered = setup({ layout: "grid", numbered: true });
    expect(screen.getByText("01")).toBeInTheDocument();
    gridNumbered.unmount();

    setup({ numbered: false });
    expect(screen.queryByText("01")).not.toBeInTheDocument();
  });

  it("abrir mostra a resposta; sem multiple abrir outra fecha a primeira", async () => {
    const user = userEvent.setup();
    setup();
    const [primeira, segunda] = screen.getAllByRole("button");
    expect(primeira).toHaveAttribute("aria-expanded", "false");
    await user.click(primeira);
    expect(screen.getByText("É gratuito para projetos comerciais.")).toBeVisible();
    await user.click(segunda);
    expect(segunda).toHaveAttribute("aria-expanded", "true");
    expect(primeira).toHaveAttribute("aria-expanded", "false");
    await user.click(segunda);
    expect(segunda).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple deixa as duas abertas", async () => {
    const user = userEvent.setup();
    setup({ multiple: true });
    const [primeira, segunda] = screen.getAllByRole("button");
    await user.click(primeira);
    await user.click(segunda);
    expect(primeira).toHaveAttribute("aria-expanded", "true");
    expect(segunda).toHaveAttribute("aria-expanded", "true");
  });

  it("defaultValue abre o item inicial", () => {
    setup({ defaultValue: ["react"] });
    expect(screen.getByRole("button", { name: /React 18/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("controlado: onValueChange recebe ids e nada muda sem value novo", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = setup({ value: [], onValueChange });
    const primeira = screen.getAllByRole("button")[0];
    await user.click(primeira);
    expect(onValueChange).toHaveBeenCalledWith(["precos"]);
    expect(primeira).toHaveAttribute("aria-expanded", "false");
    rerender(
      <FaqSection
        title="Perguntas frequentes"
        items={items}
        value={["precos"]}
        onValueChange={onValueChange}
      />
    );
    expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "true");
  });

  it("controlado com multiple devolve a lista inteira", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    setup({ multiple: true, value: ["precos"], onValueChange });
    await user.click(screen.getAllByRole("button")[1]);
    expect(onValueChange).toHaveBeenCalledWith(["precos", "react"]);
  });

  it("usa o índice como id quando o item não tem id", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    setup({
      items: [
        { question: "A?", answer: "a" },
        { question: "B?", answer: "b" },
      ],
      onValueChange,
    });
    await user.click(screen.getAllByRole("button")[1]);
    expect(onValueChange).toHaveBeenCalledWith(["1"]);
  });

  it("grid distribui alternado em 2 colunas e o aberto fecha o da outra coluna", async () => {
    const user = userEvent.setup();
    const { container } = setup({ layout: "grid" });
    const lists = container.querySelectorAll('[data-slot="accordion"]');
    expect(lists).toHaveLength(2);
    expect(within(lists[0] as HTMLElement).getAllByRole("button")).toHaveLength(2);
    expect(
      within(lists[0] as HTMLElement).getByRole("button", { name: /Quanto custa/ })
    ).toBeVisible();
    expect(
      within(lists[0] as HTMLElement).getByRole("button", { name: /sobrescreve/ })
    ).toBeVisible();
    expect(within(lists[1] as HTMLElement).getByRole("button", { name: /React 18/ })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Quanto custa/ }));
    await user.click(screen.getByRole("button", { name: /React 18/ }));
    expect(screen.getByRole("button", { name: /Quanto custa/ })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("button", { name: /React 18/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("grid com multiple mantém abertas as perguntas das duas colunas", async () => {
    const user = userEvent.setup();
    setup({ layout: "grid", multiple: true });
    await user.click(screen.getByRole("button", { name: /Quanto custa/ }));
    await user.click(screen.getByRole("button", { name: /React 18/ }));
    expect(screen.getByRole("button", { name: /Quanto custa/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("button", { name: /React 18/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("icon plus alterna plus e minus por data-state", () => {
    const { container } = setup({ icon: "plus" });
    expect(container.querySelectorAll("svg.lucide-plus")).toHaveLength(3);
    expect(container.querySelectorAll("svg.lucide-minus")).toHaveLength(3);
  });

  describe("caixa de contato", () => {
    const contact = {
      copy: { label: "Abra uma issue em", value: "github.com/x/issues" },
    };

    function stubClipboard(writeText: (v: string) => Promise<void>) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });
    }

    it("copiar chama writeText, mostra Copiado e onCopy; volta em 2 s", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      stubClipboard(writeText);
      const onCopy = vi.fn();
      const { container } = setup({ contact: { ...contact, onCopy } });
      expect(container.querySelector('[data-slot="faq-section-contact"]')).toBeInTheDocument();
      expect(screen.getByText("Não achou o que procurava?")).toBeInTheDocument();
      expect(screen.getByText("github.com/x/issues")).toBeInTheDocument();

      vi.useFakeTimers();
      fireEvent.click(screen.getByRole("button", { name: "Copiar github.com/x/issues" }));
      await act(async () => {
        await Promise.resolve();
      });
      expect(writeText).toHaveBeenCalledWith("github.com/x/issues");
      expect(onCopy).toHaveBeenCalledWith("github.com/x/issues");
      expect(screen.getByText("Copiado")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByText("Copiar")).toBeInTheDocument();
    });

    it("clipboard que rejeita mostra Não deu para copiar", async () => {
      stubClipboard(vi.fn().mockRejectedValue(new Error("negado")));
      const onCopy = vi.fn();
      setup({ contact: { ...contact, onCopy } });
      fireEvent.click(screen.getByRole("button", { name: /Copiar github/ }));
      expect(await screen.findByText("Não deu para copiar")).toBeInTheDocument();
      expect(onCopy).not.toHaveBeenCalled();
    });

    it("title e description próprios", () => {
      setup({
        contact: { title: "Fale conosco", description: "Respondemos em um dia.", ...contact },
      });
      expect(screen.getByText("Fale conosco")).toBeInTheDocument();
      expect(screen.getByText("Respondemos em um dia.")).toBeInTheDocument();
    });

    it("contact.action vira link", () => {
      setup({ contact: { action: { label: "Abrir issue", href: "/issues" } } });
      expect(screen.getByRole("link", { name: "Abrir issue" })).toHaveAttribute("href", "/issues");
      expect(screen.queryByRole("button", { name: /Copiar/ })).not.toBeInTheDocument();
    });

    it("no grid a caixa fica na linha do cabeçalho", () => {
      const { container } = setup({ layout: "grid", contact });
      expect(container.querySelector('[data-slot="faq-section-contact"]')).toBeInTheDocument();
    });
  });

  describe("searchable", () => {
    it("filtra pela pergunta e pela resposta em string", async () => {
      const user = userEvent.setup();
      const { container } = setup({ searchable: true });
      expect(container.querySelector('[data-slot="faq-section-search"]')).toBeInTheDocument();
      const campo = screen.getByLabelText("Buscar nas perguntas");
      await user.type(campo, "react");
      expect(screen.getAllByRole("button")).toHaveLength(1);
      await user.clear(campo);
      await user.type(campo, "confirmar");
      expect(screen.getByRole("button", { name: /sobrescreve/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Quanto/ })).not.toBeInTheDocument();
    });

    it("filtra por texto dentro de ReactNode", async () => {
      const user = userEvent.setup();
      setup({
        searchable: true,
        items: [
          {
            id: "a",
            question: <strong>Tem tema escuro?</strong>,
            answer: <p>Sim, via classe dark.</p>,
          },
          { id: "b", question: "Outra", answer: null },
        ],
      });
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "escuro");
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("sem resultado mostra a mensagem com o termo", async () => {
      const user = userEvent.setup();
      setup({ searchable: true });
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "xyz");
      expect(screen.getByText(/Nenhuma pergunta com 'xyz'\./)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Quanto/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Fale com a gente" })).not.toBeInTheDocument();
    });

    it("sem resultado e com contact oferece Fale com a gente apontando para a caixa", async () => {
      const user = userEvent.setup();
      const { container } = setup({
        searchable: true,
        contact: { copy: { value: "a@b.c" } },
      });
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "xyz");
      const link = screen.getByRole("link", { name: "Fale com a gente" });
      const box = container.querySelector('[data-slot="faq-section-contact"]') as HTMLElement;
      expect(link).toHaveAttribute("href", `#${box.id}`);
      await user.click(link);
      expect(box).toHaveFocus();
    });

    it("anuncia a contagem de resultados", async () => {
      const user = userEvent.setup();
      setup({ searchable: true });
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "react");
      expect(screen.getByText("1 pergunta encontrada")).toBeInTheDocument();
      await user.clear(screen.getByLabelText("Buscar nas perguntas"));
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "e");
      expect(screen.getByText("3 perguntas encontradas")).toBeInTheDocument();
    });

    it("no grid, a busca também filtra", async () => {
      const user = userEvent.setup();
      setup({ layout: "grid", searchable: true });
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "react");
      expect(screen.getAllByRole("button")).toHaveLength(1);
      await user.clear(screen.getByLabelText("Buscar nas perguntas"));
      await user.type(screen.getByLabelText("Buscar nas perguntas"), "zzz");
      expect(screen.getByText(/Nenhuma pergunta com 'zzz'/)).toBeInTheDocument();
    });
  });

  describe("hashLink", () => {
    it("com location.hash abre o item e rola até ele", async () => {
      window.location.hash = "#faq-precos";
      const scroll = vi.mocked(Element.prototype.scrollIntoView);
      scroll.mockClear();
      const { container } = setup({ hashLink: true });
      expect(container.querySelector("#faq-precos")).toBeInTheDocument();
      expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "true");
      await waitFor(() => expect(scroll).toHaveBeenCalled());
    });

    it("com multiple soma ao que já estava aberto", () => {
      window.location.hash = "#faq-react";
      setup({ hashLink: true, multiple: true, defaultValue: ["precos"] });
      expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "true");
      expect(screen.getAllByRole("button")[1]).toHaveAttribute("aria-expanded", "true");
    });

    it("sem hashLink não põe id nem abre", () => {
      window.location.hash = "#faq-precos";
      const { container } = setup();
      expect(container.querySelector("#faq-precos")).not.toBeInTheDocument();
      expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "false");
    });

    it("ignora hash que não aponta para item", () => {
      window.location.hash = "#faq-nada";
      setup({ hashLink: true });
      for (const b of screen.getAllByRole("button")) {
        expect(b).toHaveAttribute("aria-expanded", "false");
      }
    });
  });

  it("headingLevel muda o nível do título e das perguntas", () => {
    setup({ headingLevel: 3 });
    expect(
      screen.getByRole("heading", { level: 3, name: "Perguntas frequentes" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
  });

  it("description e stickyHeader", () => {
    const { container, rerender } = setup({ description: "Tudo o que você precisa saber." });
    expect(screen.getByText("Tudo o que você precisa saber.")).toBeInTheDocument();
    const header = container.querySelector('[data-slot="faq-section-header"]');
    expect(header?.className).toContain("sticky");
    rerender(<FaqSection title="Perguntas frequentes" items={items} stickyHeader={false} />);
    expect(container.querySelector('[data-slot="faq-section-header"]')?.className).not.toContain(
      "sticky"
    );
  });

  it("funciona dentro de componente com estado externo", async () => {
    const user = userEvent.setup();
    function Wrapper() {
      const [v, setV] = useState<string[]>([]);
      return <FaqSection title="Dúvidas" items={items} value={v} onValueChange={setV} />;
    }
    render(<Wrapper />);
    await user.click(screen.getAllByRole("button")[2]);
    expect(screen.getAllByRole("button")[2]).toHaveAttribute("aria-expanded", "true");
  });

  it("repassa className e props à section", () => {
    setup({ className: "extra", "data-testid": "faq" } as Partial<FaqSectionProps>);
    expect(screen.getByTestId("faq")).toHaveClass("extra", "@container");
  });
});
