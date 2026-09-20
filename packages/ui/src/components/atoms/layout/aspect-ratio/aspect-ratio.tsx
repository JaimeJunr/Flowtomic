/**
 * # AspectRatio Component
 *
 * O componente `AspectRatio` é usado para manter uma proporção específica
 * de largura para altura em um elemento. É útil para imagens, vídeos e outros
 * elementos que precisam manter proporções consistentes.
 *
 * ## Características Principais
 *
 * - **Proporção Fixa**: Mantém proporção específica independente do conteúdo
 * - **Responsivo**: Ajusta automaticamente ao tamanho do container
 * - **Acessível**: Baseado em Radix UI
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { AspectRatio } from "@flowtomic/ui/components/atoms/layout/aspect-ratio";
 *
 * function MyComponent() {
 *   return (
 *     <AspectRatio ratio={16 / 9}>
 *       <img src="image.jpg" alt="Imagem" />
 *     </AspectRatio>
 *   );
 * }
 * ```
 *
 * ## Proporções Comuns
 *
 * - **16:9**: Vídeos widescreen (padrão YouTube)
 * - **4:3**: Vídeos tradicionais
 * - **1:1**: Quadrado (Instagram)
 * - **21:9**: Ultra-wide
 *
 * ## Acessibilidade
 *
 * - Baseado em Radix UI para acessibilidade
 * - Mantém estrutura semântica do conteúdo
 *
 * @see [Radix UI Aspect Ratio](https://www.radix-ui.com/primitives/docs/components/aspect-ratio) para mais detalhes
 */

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import type * as React from "react";

/**
 * Props do componente AspectRatio.
 *
 * @property {number} ratio - Proporção de largura para altura (ex: 16/9, 4/3, 1/1)
 */
export interface AspectRatioProps extends React.ComponentProps<typeof AspectRatioPrimitive.Root> {}

/**
 * AspectRatio - Container com proporção fixa.
 *
 * Componente usado para manter uma proporção específica de largura para altura.
 *
 * @param {AspectRatioProps} props - Props do componente
 * @returns {JSX.Element} Componente AspectRatio
 */
function AspectRatio({ ...props }: AspectRatioProps) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
