import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import type * as React from "react";

export interface AspectRatioProps extends React.ComponentProps<typeof AspectRatioPrimitive.Root> {}

function AspectRatio({ ...props }: AspectRatioProps) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
