import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  describe("Renderização", () => {
    it("deve renderizar o AspectRatio", () => {
      render(
        <AspectRatio ratio={16 / 9}>
          <div>Content</div>
        </AspectRatio>
      );
      const content = screen.getByText("Content");
      expect(content).toBeInTheDocument();
    });

    it("deve aplicar ratio customizado", () => {
      const { container } = render(
        <AspectRatio ratio={4 / 3}>
          <div>Content</div>
        </AspectRatio>
      );
      const aspectRatio = container.querySelector('[data-slot="aspect-ratio"]');
      expect(aspectRatio).toBeInTheDocument();
    });

    it("deve aplicar className customizada", () => {
      const { container } = render(
        <AspectRatio ratio={1 / 1} className="custom-class">
          <div>Content</div>
        </AspectRatio>
      );
      const aspectRatio = container.querySelector('[data-slot="aspect-ratio"]');
      expect(aspectRatio).toHaveClass("custom-class");
    });
  });

  describe("Proporções", () => {
    it("deve suportar proporção 16:9", () => {
      render(
        <AspectRatio ratio={16 / 9}>
          <div>16:9</div>
        </AspectRatio>
      );
      const content = screen.getByText("16:9");
      expect(content).toBeInTheDocument();
    });

    it("deve suportar proporção 4:3", () => {
      render(
        <AspectRatio ratio={4 / 3}>
          <div>4:3</div>
        </AspectRatio>
      );
      const content = screen.getByText("4:3");
      expect(content).toBeInTheDocument();
    });

    it("deve suportar proporção 1:1", () => {
      render(
        <AspectRatio ratio={1 / 1}>
          <div>1:1</div>
        </AspectRatio>
      );
      const content = screen.getByText("1:1");
      expect(content).toBeInTheDocument();
    });
  });
});
