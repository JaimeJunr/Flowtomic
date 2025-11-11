# useAnimatedIndicator

Hook headless reutilizável para animação de indicador que se move entre elementos.

## Características

- ✅ **Headless**: Fornece apenas lógica, sem UI
- ✅ **Reutilizável**: Funciona com qualquer tipo de elemento
- ✅ **Flexível**: Você controla markup e styles
- ✅ **Performático**: Usa MutationObserver para detecção eficiente
- ✅ **Responsivo**: Atualiza automaticamente em resize

## Uso Básico

```tsx
import { useAnimatedIndicator } from "@flowtomic/logic";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const { indicatorStyle, registerElement } = useAnimatedIndicator({
    containerRef,
    activeSelector: '[data-active="true"]',
  });

  const items = ["Home", "Work", "Settings"];

  return (
    <div ref={containerRef} className="relative flex gap-2 p-2">
      {items.map((item, index) => (
        <button
          key={item}
          data-active={activeIndex === index}
          ref={(el) => registerElement(el, index.toString())}
          onClick={() => setActiveIndex(index)}
        >
          {item}
        </button>
      ))}
      <motion.div
        className="absolute bg-background rounded-md"
        animate={{
          width: indicatorStyle.width,
          height: indicatorStyle.height,
          opacity: indicatorStyle.opacity,
        }}
        style={{
          left: `${indicatorStyle.left}px`,
          top: `${indicatorStyle.top}px`,
        }}
      />
    </div>
  );
}
```

## Exemplos de Uso

### 1. Tabs Component

```tsx
const { indicatorStyle, registerElement } = useAnimatedIndicator({
  containerRef: tabsListRef,
  activeSelector: '[data-state="active"]',
});
```

### 2. Menu/Navigation

```tsx
const { indicatorStyle, registerElement } = useAnimatedIndicator({
  containerRef: navRef,
  activeSelector: '[aria-current="page"]',
});
```

### 3. Segmented Control

```tsx
const { indicatorStyle, registerElement } = useAnimatedIndicator({
  containerRef: controlRef,
  activeSelector: '[data-selected="true"]',
});
```

### 4. Custom Selector

```tsx
const { indicatorStyle, registerElement } = useAnimatedIndicator({
  containerRef: containerRef,
  activeSelector: '.active-item',
  getElementValue: (element) => element.id,
});
```

## API

### `UseAnimatedIndicatorOptions`

```typescript
interface UseAnimatedIndicatorOptions {
  containerRef: React.RefObject<HTMLElement>;
  activeSelector?: string; // default: '[data-state="active"]'
  getElementValue?: (element: HTMLElement) => string;
  updateOnResize?: boolean; // default: true
}
```

### `UseAnimatedIndicatorReturn`

```typescript
interface UseAnimatedIndicatorReturn {
  indicatorStyle: IndicatorStyle; // { left, width, height, top, opacity }
  registerElement: (element: HTMLElement | null, value: string) => void;
  unregisterElement: (value: string) => void;
  updateIndicator: () => void;
  activeValue: string | undefined;
}
```

## Integração com Framer Motion

O hook funciona perfeitamente com Framer Motion:

```tsx
<motion.div
  animate={{
    width: indicatorStyle.width,
    height: indicatorStyle.height,
    opacity: indicatorStyle.opacity,
  }}
  transition={{
    type: "spring",
    stiffness: 380,
    damping: 30,
  }}
  style={{
    left: `${indicatorStyle.left}px`,
    top: `${indicatorStyle.top}px`,
  }}
/>
```

## Acessibilidade

O hook respeita `prefers-reduced-motion` quando usado com `useReducedMotion`:

```tsx
const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={
    shouldReduceMotion
      ? { opacity: indicatorStyle.opacity }
      : {
          width: indicatorStyle.width,
          height: indicatorStyle.height,
          opacity: indicatorStyle.opacity,
        }
  }
/>
```

