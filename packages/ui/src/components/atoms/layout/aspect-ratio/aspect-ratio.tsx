import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import type * as React from "react";

export interface AspectRatioProps extends React.ComponentProps<typeof AspectRatioPrimitive.Root> {}

/**
 * AspectRatio - Container com proporção fixa.
 *
 * @see [Radix UI Aspect Ratio](https://www.radix-ui.com/primitives/docs/components/aspect-ratio) para mais detalhes
 */
function AspectRatio({ ...props }: AspectRatioProps) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
