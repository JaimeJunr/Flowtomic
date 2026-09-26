# @flowtomic/ui

Componentes UI do Flowtomic: atoms, molecules, organisms e blocks construídos sobre Radix UI e Tailwind CSS.

## Instalação

```bash
bun add @flowtomic/ui
# ou
npm install @flowtomic/ui
```

Peer dependencies: `react` e `react-dom` (`^18.0.0` ou `^19.0.0`). Componentes que usam painéis redimensionáveis também precisam de `react-resizable-panels` (`^4.6.5`).

## Estilos

Importe os três arquivos CSS, nesta ordem:

```ts
import "@flowtomic/ui/styles/globals.css";
import "@flowtomic/ui/styles/theme.css";
import "@flowtomic/ui/styles/typography.css";
```

## Uso

```tsx
import { Button } from "@flowtomic/ui";

function Exemplo() {
  return <Button variant="default">Enviar</Button>;
}
```

## Alternativa: copiar o componente

Para editar o código do componente depois de instalado, use o CLI em vez do package:

```bash
bunx flowtomic-cli add button
```

## Identidade visual

Cor de marca Urucum (laranja-queimado). Fontes: Public Sans (texto), Schibsted Grotesk (títulos) e JetBrains Mono (valores).

## Repositório

https://github.com/JaimeJunr/Flowtomic
