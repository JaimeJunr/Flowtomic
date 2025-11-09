# flowtomic/logic

Biblioteca de hooks headless e lógica reutilizável para React.

## Instalação

```bash
bunx flowtomic add useThemeToggle
```

## Uso

```tsx
import { useThemeToggle } from 'flowtomic/logic'

function MyComponent() {
  const { theme, toggleTheme, isDark } = useThemeToggle()
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
```

## Hooks Disponíveis

- useThemeToggle
- useDashboard
- useResizable
- ... (em desenvolvimento)

## Padrão Headless UI

Todos os hooks seguem o padrão **Headless UI**:
- ✅ Fornecem apenas lógica, estado e API
- ❌ Não fornecem markup ou styles
- 🎨 Você controla completamente a apresentação

