import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "./image";

const meta = {
  title: "Flowtomic UI/Organisms/Image",
  component: Image,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

// PNG 8x8 xadrez, gerado só para a story (poucas centenas de bytes em base64).
const base64Sample =
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAGUlEQVR4nGN4kGP169sHTJIBqyiQZBiUOgAVAYzBALw4hgAAAABJRU5ErkJggg==";

export const Default: Story = {
  args: {
    base64: base64Sample,
    mediaType: "image/png",
    alt: "Amostra xadrez gerada para a story",
  },
  render: (args) => <Image {...args} className="h-32 w-32" />,
};

export const SemDados: Story = {
  name: "Sem dados base64",
  args: {
    mediaType: "image/png",
  },
};
