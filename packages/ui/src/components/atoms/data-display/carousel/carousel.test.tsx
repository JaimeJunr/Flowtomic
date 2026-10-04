import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

function Slides() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem>Primeiro</CarouselItem>
        <CarouselItem>Segundo</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("as setas têm nome em português", () => {
    render(<Slides />);
    expect(screen.getByRole("button", { name: "Slide anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próximo slide" })).toBeInTheDocument();
  });

  it("é anunciado como carrossel, com cada item como slide", () => {
    render(<Slides />);
    expect(screen.getByRole("region")).toHaveAttribute("aria-roledescription", "carrossel");
    expect(screen.getAllByRole("group")[0]).toHaveAttribute("aria-roledescription", "slide");
  });

  it("no começo não dá para voltar", () => {
    render(<Slides />);
    expect(screen.getByRole("button", { name: "Slide anterior" })).toBeDisabled();
  });
});
