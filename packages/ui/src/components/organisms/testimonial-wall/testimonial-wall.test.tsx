import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  type TestimonialItem,
  TestimonialWall,
  type TestimonialWallProps,
} from "./testimonial-wall";

const items: TestimonialItem[] = [
  {
    id: "a",
    author: { name: "Marina Alves", role: "Engenheira de frontend" },
    rating: 4,
    date: "2026-03-12",
    title: "Trocamos três bibliotecas por uma",
    body: "O mural de componentes ficou coeso.",
    source: { label: "Fórum", href: "https://example.com/post" },
    media: { src: "/captura.png", alt: "Captura da tela" },
  },
  {
    id: "b",
    author: { name: "Caio Ramos" },
    body: "Copiei o componente e editei à vontade.",
  },
  {
    id: "v",
    kind: "video",
    author: { name: "Lia Torres", role: "Design systems" },
    poster: "/poster.png",
    videoSrc: "/video.mp4",
  },
];

function setup(props: Partial<TestimonialWallProps> = {}) {
  return render(<TestimonialWall title="Quem já usa" items={items} {...props} />);
}

function card(name: string) {
  return screen.getByText(name).closest('[data-slot="testimonial-card"]') as HTMLElement;
}

describe("TestimonialWall", () => {
  it("renderiza a seção nomeada pelo título e uma lista com um item por depoimento", () => {
    const { container } = setup();
    expect(screen.getByRole("region", { name: "Quem já usa" })).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(container.querySelector('[data-slot="testimonial-wall"]')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("@container");
  });

  it("sem título, a seção se chama Depoimentos", () => {
    render(<TestimonialWall items={items} />);
    expect(screen.getByRole("region", { name: "Depoimentos" })).toBeInTheDocument();
  });

  it("cartão de texto: nome, cargo, título, blockquote e data pt-BR", () => {
    setup();
    const el = card("Marina Alves");
    expect(el).toHaveAttribute("data-kind", "text");
    expect(within(el).getByText("Engenheira de frontend")).toBeInTheDocument();
    expect(within(el).getByText("Trocamos três bibliotecas por uma")).toBeInTheDocument();
    expect(el.querySelector("blockquote")).toHaveTextContent("O mural de componentes ficou coeso.");
    const time = el.querySelector("time");
    expect(time).toHaveAttribute("datetime", "2026-03-12");
    expect(time).toHaveTextContent("12 de mar. de 2026");
  });

  it("usa o dateFormatter customizado", () => {
    setup({ dateFormatter: (iso) => `em ${iso}` });
    expect(screen.getByText("em 2026-03-12")).toBeInTheDocument();
  });

  it("estrelas: nota 4 preenche 4", () => {
    setup();
    const rating = screen.getByRole("img", { name: "Nota 4 de 5" });
    expect(rating.querySelectorAll('[data-filled="true"]')).toHaveLength(4);
    expect(rating.querySelectorAll("svg")).toHaveLength(5);
  });

  it("estrelas: 4.6 arredonda para 5 e o rótulo mostra a vírgula; sem rating, nada", () => {
    setup({
      items: [
        { ...(items[0] as object), id: "x", rating: 4.6 } as TestimonialItem,
        items[1] as TestimonialItem,
      ],
    });
    const rating = screen.getByRole("img", { name: "Nota 4,6 de 5" });
    expect(rating.querySelectorAll('[data-filled="true"]')).toHaveLength(5);
    expect(document.querySelectorAll('[data-slot="testimonial-rating"]')).toHaveLength(1);
  });

  it("source vira link e media vira imagem com alt", () => {
    setup();
    const link = screen.getByRole("link", { name: "Ver no Fórum" });
    expect(link).toHaveAttribute("href", "https://example.com/post");
    expect(screen.getByRole("img", { name: "Captura da tela" })).toHaveAttribute(
      "src",
      "/captura.png"
    );
  });

  it("cartão de vídeo com onPlay chama onPlay com o item", async () => {
    const onPlay = vi.fn();
    setup({ onPlay });
    const el = card("Lia Torres");
    expect(el).toHaveAttribute("data-kind", "video");
    expect(within(el).getByText("Design systems")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Assistir depoimento de Lia Torres" })
    );
    expect(onPlay).toHaveBeenCalledWith(items[2]);
    expect(el.querySelector("video")).toBeNull();
  });

  it("sem onPlay e com videoSrc, o play troca o pôster por <video> e foca nele", async () => {
    setup();
    const el = card("Lia Torres");
    expect(el.querySelector("img")).toHaveAttribute("alt", "");
    await userEvent.click(
      screen.getByRole("button", { name: "Assistir depoimento de Lia Torres" })
    );
    const video = el.querySelector("video") as HTMLVideoElement;
    expect(video).toHaveAttribute("aria-label", "Depoimento de Lia Torres");
    expect(video.controls).toBe(true);
    expect(video).toHaveFocus();
    expect(el.querySelector("img")).toBeNull();
    expect(screen.queryByRole("button", { name: /Assistir/ })).toBeNull();
  });

  it("com movimento reduzido, o vídeo não usa autoPlay", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    try {
      setup();
      await userEvent.click(screen.getByRole("button", { name: /Assistir/ }));
      expect(card("Lia Torres").querySelector("video")?.autoplay).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });

  it("sem videoSrc e sem onPlay, não há botão de play", () => {
    setup({
      items: [{ id: "v", kind: "video", author: { name: "Lia Torres" }, poster: "/p.png" }],
    });
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("collapsedHeight: botão com aria-expanded false; clicar expande, some e move o foco", async () => {
    const { container } = setup({ collapsedHeight: "20rem" });
    const button = screen.getByRole("button", { name: "Mostrar mais depoimentos" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", screen.getByRole("list").id);
    expect(container.querySelector("[style*='max-height']")).toHaveStyle({ maxHeight: "20rem" });
    await userEvent.click(button);
    expect(screen.queryByRole("button", { name: "Mostrar mais depoimentos" })).toBeNull();
    expect(container.querySelector("[style*='max-height']")).toBeNull();
    expect(screen.getAllByRole("listitem").some((li) => li === document.activeElement)).toBe(true);
  });

  it("sem collapsedHeight, não há botão de expandir", () => {
    setup();
    expect(document.querySelector('[data-slot="testimonial-wall-expand"]')).toBeNull();
  });

  it("proof: texto, link, avatares aria-hidden e no máximo 4", () => {
    setup({
      proof: {
        text: "Usado em mais de 40 projetos",
        action: { label: "Ver mais", href: "/casos" },
        avatars: ["Ana Lima", "Bia Souza", "Caio Reis", "Davi Nunes", "Eva Prado"].map((name) => ({
          name,
        })),
      },
    });
    const pill = document.querySelector('[data-slot="testimonial-wall-proof"]') as HTMLElement;
    expect(within(pill).getByText("Usado em mais de 40 projetos")).toBeInTheDocument();
    expect(within(pill).getByRole("link", { name: "Ver mais" })).toHaveAttribute("href", "/casos");
    const stack = pill.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(stack.querySelectorAll('[data-slot="avatar"]')).toHaveLength(4);
  });

  it("columns={2} não aplica a classe de 3 colunas", () => {
    const { rerender } = setup({ columns: 2 });
    expect(screen.getByRole("list")).not.toHaveClass("@min-[1024px]:columns-3");
    expect(screen.getByRole("list")).toHaveClass("@min-[640px]:columns-2");
    rerender(<TestimonialWall title="Quem já usa" items={items} />);
    expect(screen.getByRole("list")).toHaveClass("@min-[1024px]:columns-3");
  });

  it("headingLevel muda o nível do título", () => {
    setup({ headingLevel: 3 });
    expect(screen.getByRole("heading", { level: 3, name: "Quem já usa" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });
});
