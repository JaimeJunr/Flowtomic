/**
 * Avatar Component - Flowtomic UI
 *
 * Componente Avatar simples
 */

import type * as React from "react";
import { cn } from "@/lib/utils";

export type AvatarProps = React.ComponentProps<"div">;
export type AvatarImageProps = React.ComponentProps<"img">;
export type AvatarFallbackProps = React.ComponentProps<"div">;

/**
 * Avatar - Container principal do avatar
 */
function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}
Avatar.displayName = "Avatar";

/**
 * AvatarImage - Imagem do avatar
 */
function AvatarImage({ className, alt = "", ...props }: AvatarImageProps) {
  return (
    <img
      data-slot="avatar-image"
      alt={alt}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  );
}
AvatarImage.displayName = "AvatarImage";

/**
 * AvatarFallback - Fallback do avatar
 */
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
}
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
