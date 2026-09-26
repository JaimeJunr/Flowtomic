/**
 * Image Component - Flowtomic UI
 *
 * Componente de image display
 */

import type { Experimental_GeneratedImage } from "ai";
import * as React from "react";
import { cn } from "@/lib/utils";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ base64, uint8Array, mediaType, className, alt, ...props }, ref) => {
    if (!base64) {
      return (
        <div className={cn("text-sm text-muted-foreground", className)}>
          Sem imagem: o componente precisa de dados em base64
        </div>
      );
    }

    return (
      <img
        ref={ref}
        {...props}
        alt={alt}
        className={cn("h-auto max-w-full overflow-hidden rounded-md", className)}
        src={`data:${mediaType};base64,${base64}`}
      />
    );
  }
);
Image.displayName = "Image";
