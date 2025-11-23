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
  ({ base64, uint8Array, mediaType, className, alt, ...props }, ref) => (
    <img
      ref={ref}
      {...props}
      alt={alt}
      className={cn("h-auto max-w-full overflow-hidden rounded-md", className)}
      src={`data:${mediaType};base64,${base64}`}
    />
  )
);
Image.displayName = "Image";
