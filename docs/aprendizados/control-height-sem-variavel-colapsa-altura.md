# Button e Input do @flowtomic/ui 1.1+ colapsam a altura sem --control-height definida no consumidor

## Subir o flowtomic e os botões perdem altura

## Sintoma

Depois de atualizar `@flowtomic/ui` para 1.1 ou mais, botões e campos de texto
ficam sem altura própria: encolhem ao tamanho do conteúdo. Nenhum erro, nem de
build nem de console.

## Causa

Do 1.1 em diante, `Button` e `Input` se dimensionam pela variável CSS
`--control-height`. Ela é definida no CSS do próprio flowtomic, que o Pandora
**não importa** (consome só os componentes, via `transpilePackages`). Sem a
variável, o `height` resolve para nada.

## Correção

Em `app/globals.css`:

```css
:root {
  --control-height: 2.25rem;
}
```

`2.25rem` é o `h-9` do 1.0, então o visual antigo se mantém.

## Como detectar

Depois de qualquer bump do flowtomic, abra a home e o formulário de login:
botões e inputs sem altura própria indicam variável nova que o consumidor ainda
não define. Para listar as variáveis que o pacote usa e o app não declara:

```bash
grep -oE 'var\(--[a-z-]+' node_modules/@flowtomic/ui/dist/index.js | sort -u
```

Compare com o `:root` de `app/globals.css`.
