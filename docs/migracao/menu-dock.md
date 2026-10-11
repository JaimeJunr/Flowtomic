# Migração: MenuDock agora é só o dock flutuante

> **Status**: o `MenuDock` **fica**, mas mudou de papel. Ele é o dock flutuante com ampliação
> por proximidade (estilo macOS). O modo de abas saiu: quem quer abas usa o `GooTabs`.

## Por que mudou

O `MenuDock` misturava dois componentes num só. O modo padrão (abas com indicador sublinhado)
usava `bg-accent` no hover, quase a mesma cor do item ativo, então dois itens pareciam ativos, e
o indicador saía fora do lugar. O `GooTabs` resolve a navegação por abas (e ganhou `icon`,
`orientation` e `showLabels`). O que o `GooTabs` não tem é a ampliação do dock, e é só isso que
o `MenuDock` faz agora.

## Quem usava o modo flutuante

Nada quebra. Os nomes antigos continuam aceitos, marcados `@deprecated`, e o nome novo ganha se
vierem os dois:

| Antes | Agora |
|---|---|
| `dockItemSize` | `itemSize` |
| `dockMagnification` | `magnification` |
| `dockMagnifyDistance` | `magnifyDistance` |
| `animationType="floating"` | sem efeito (pode remover) |
| `items[].path` | `items[].href` |
| `desktopClassName` / `mobileClassName` | iguais |

## Quem usava o modo de abas

Troque por `GooTabs`:

| `MenuDock` (abas) | `GooTabs` |
|---|---|
| `items[].label` / `icon` / `href` | iguais |
| `items[].path` | `items[].href` |
| `items[].id` | `items[].value` (obrigatório, string) |
| `items[].onClick` | `onValueChange` (decida pelo valor) |
| `activeIndex` | `value` (string) |
| `defaultActiveIndex` | `defaultValue` (string) |
| `onActiveIndexChange(index)` | `onValueChange(value)` |
| `orientation` | `orientation` |
| `showLabels` | `showLabels` |
| `variant` compact / large | `className` |
| `animated` | sem efeito; a animação segue o movimento reduzido do sistema |

```tsx
// Antes
<MenuDock
  items={[
    { id: "inicio", label: "Início", icon: Home },
    { id: "carteiras", label: "Carteiras", icon: Wallet },
  ]}
  activeIndex={index}
  onActiveIndexChange={setIndex}
/>

// Depois
<GooTabs
  items={[
    { value: "inicio", label: "Início", icon: Home },
    { value: "carteiras", label: "Carteiras", icon: Wallet },
  ]}
  value={value}
  onValueChange={setValue}
/>
```

## Mudanças de comportamento do dock flutuante

- Item sem `href` (ou `path`) vira `<button>` em vez de `<a href="#">`; com destino, é um link.
- A posição do ponteiro usa `clientX`, coerente com `getBoundingClientRect`.
- A altura da barra acompanha `itemSize`.
- O foco de teclado amplia o item ao tamanho máximo e mostra o rótulo, como se o ponteiro
  estivesse sobre ele.
- O `className` vai para a raiz `<nav>` do dock (antes ia direto à barra); a barra e o botão
  mobile têm `desktopClassName` e `mobileClassName`.
- O dock mobile deixou de usar `layoutId="nav"`.
- `itemSize`, `magnification` e `magnifyDistance` inválidos lançam `RangeError` com o valor recebido.

## Pontos de atenção

- O `GooTabs` trabalha com **valores em string**, não índices. Se o seu estado era um número,
  guarde o `value` do item (ou converta pelo índice do array).
- O `MenuDock` **não se posiciona**: não há `fixed` embutido. Quem usa decide onde ele fica,
  por exemplo `className="fixed inset-x-0 bottom-4 mx-auto"`.
- Pelo CLI, o alias `menu` aponta para `goo-tabs`; `flowtomic-cli add menu-dock` instala o dock.
