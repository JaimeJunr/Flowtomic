import type { Meta, StoryObj } from "@storybook/react-vite";
import { type TestimonialItem, TestimonialWall } from "./testimonial-wall";

const meta = {
  title: "Flowtomic UI/Organisms/TestimonialWall",
  component: TestimonialWall,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Mural de depoimentos em colunas de alturas desiguais, feitas com CSS columns e container queries (1 coluna até 640 px de contêiner, 2 até 1024 px, 3 acima; `columns` limita o máximo). Mistura cartões de texto (nota em estrelas, data, título, corpo em `blockquote`, link de origem e imagem) e cartões de vídeo (pôster, nome sobreposto e botão de play que chama `onPlay` ou troca o pôster por `<video>`). `collapsedHeight` corta o mural com degradê e um botão "Mostrar mais depoimentos"; `proof` mostra a pílula de prova social. A ordem de leitura é a ordem dos dados.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "inline-radio", options: [2, 3] },
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
    collapsedHeight: { control: "text" },
  },
} satisfies Meta<typeof TestimonialWall>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pôster abstrato (formas, sem rosto), montado como SVG em data: URI. */
function poster(background: string, shapeA: string, shapeB: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="${background}"/><circle cx="120" cy="170" r="110" fill="${shapeA}"/><rect x="180" y="250" width="260" height="300" rx="40" fill="${shapeB}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const posterA = poster("#2b3a55", "#e07a5f", "#81b29a");
const posterB = poster("#3d2c3e", "#f2cc8f", "#6d83c4");

const textItems: TestimonialItem[] = [
  {
    id: "1",
    author: { name: "Marina Alves", role: "Engenheira de frontend" },
    rating: 5,
    date: "2026-09-18",
    title: "Trocamos três bibliotecas por uma",
    body: "Tínhamos tabela, formulário e gráfico de pacotes diferentes. Agora é tudo do mesmo sistema, com os mesmos tokens.",
  },
  {
    id: "2",
    author: { name: "Caio Ramos", role: "Líder técnico" },
    rating: 5,
    date: "2026-09-02",
    title: "O CLI copiou o componente e eu editei à vontade",
    body: "Sem caixa-preta: o arquivo está no meu repositório e eu mudo o que precisar.",
    source: { label: "GitHub", href: "https://example.com/discussao" },
  },
  {
    id: "3",
    author: { name: "Beatriz Nogueira", role: "Designer de produto" },
    rating: 4,
    date: "2026-08-21",
    body: "Os tokens semânticos deixaram o modo escuro quase de graça. Faltou só um exemplo de página inteira.",
  },
  {
    id: "5",
    author: { name: "Tiago Mendes" },
    rating: 4.6,
    date: "2026-07-30",
    title: "Acessibilidade que eu não precisei refazer",
    body: (
      <>
        <p>Foco, rótulos e navegação por teclado já vieram resolvidos.</p>
        <p>Passei o tempo que sobrou nos detalhes do produto.</p>
      </>
    ),
  },
  {
    id: "6",
    author: { name: "Helena Castro", role: "Desenvolvedora" },
    date: "2026-07-11",
    body: "Montei o painel interno em uma tarde.",
    media: {
      src: poster("#dfe3ea", "#9aa5b8", "#c3cad6"),
      alt: "Captura abstrata de um painel interno",
    },
  },
  {
    id: "7",
    author: { name: "Rafael Duarte", role: "CTO" },
    rating: 5,
    date: "2026-06-25",
    title: "Documentação que responde de verdade",
    body: "Cada componente tem história, props e cuidados de acessibilidade descritos. Menos tempo perguntando no chat.",
  },
  {
    id: "8",
    author: { name: "Paula Siqueira", role: "Engenheira de software" },
    rating: 5,
    date: "2026-06-03",
    body: "Atualizar para uma versão nova foi trocar o arquivo e ler o diff. Previsível.",
  },
];

const videoItems: TestimonialItem[] = [
  {
    id: "4",
    kind: "video",
    author: { name: "Lia Torres", role: "Design systems" },
    poster: posterA,
    videoSrc: "/exemplo.mp4",
  },
  {
    id: "9",
    kind: "video",
    author: { name: "Otávio Pires", role: "Fundador" },
    poster: posterB,
    aspect: "square",
    videoSrc: "/exemplo.mp4",
  },
];

const items: TestimonialItem[] = [
  textItems[0] as TestimonialItem,
  videoItems[0] as TestimonialItem,
  textItems[1] as TestimonialItem,
  textItems[2] as TestimonialItem,
  textItems[3] as TestimonialItem,
  videoItems[1] as TestimonialItem,
  textItems[4] as TestimonialItem,
  textItems[5] as TestimonialItem,
  textItems[6] as TestimonialItem,
];

const proof = {
  text: "Usado em mais de 40 projetos",
  action: { label: "Ver casos", href: "#casos" },
  avatars: ["Ana Lima", "Bruno Reis", "Carla Dias", "Davi Nunes", "Eva Prado"].map((name) => ({
    name,
  })),
};

export const Default: Story = {
  args: { title: "Quem já usa", items, columns: 3, proof },
};

export const Recolhido: Story = {
  args: { title: "Quem já usa", items, collapsedHeight: "36rem", proof },
};

export const DuasColunas: Story = {
  args: { title: "Quem já usa", items: textItems, columns: 2 },
};

export const Estreito: Story = {
  args: { title: "Quem já usa", items, proof },
  render: (args) => (
    <div style={{ width: 360 }}>
      <TestimonialWall {...args} />
    </div>
  ),
};

export const Escuro: Story = {
  args: { title: "Quem já usa", items, proof },
  render: (args) => (
    <div className="dark rounded-xl bg-background p-6 text-foreground">
      <TestimonialWall {...args} />
    </div>
  ),
};
