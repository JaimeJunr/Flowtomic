import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const meta = {
  title: "Flowtomic UI/Atoms/Data Display/Carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Carousel>
      <CarouselContent>
        <CarouselItem>
          <div className="flex h-40 items-center justify-center rounded-md bg-muted">
            <span>Slide 1</span>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="flex h-40 items-center justify-center rounded-md bg-muted">
            <span>Slide 2</span>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div className="w-full max-w-xs">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <span className="text-2xl font-bold">Imagem 1</span>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-teal-500 text-white">
              <span className="text-2xl font-bold">Imagem 2</span>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex h-64 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <span className="text-2xl font-bold">Imagem 3</span>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

export const NoKnownUsage: Story = {
  render: () => (
    <div className="p-4 text-sm text-muted-foreground">
      Este componente ainda não possui uso conhecido em componentes mais complexos.
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Este componente ainda não possui uso conhecido em molecules ou organisms.",
      },
    },
  },
};
