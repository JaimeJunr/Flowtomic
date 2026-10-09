# Spec de comportamento: `folder-picker`

> **Proveniência (clean room).** Escrita em 09/10/2026 a partir da demo pública "Folder Float" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.

## O que a pessoa vê

Uma pasta de papel ("Feedback de design · 4 notas"). Passar o mouse (ou clicar) **abre** a pasta:
a aba da frente inclina para a pessoa, uma borda de papel sobe de dentro, e as notas saem
**flutuando para cima** em pílulas ("Paleta mais quente", "Apertar o espaçamento", "Logo parece
pequeno", "Adorei o novo hero"), uma de cada vez, levemente inclinadas, formando uma nuvem acima
da pasta. Lá em cima elas **boiam** devagar e podem ser arrastadas dentro da nuvem. Escolher uma
nota a seleciona e (por padrão) a pasta fecha, as notas voltando para dentro na ordem inversa.

## API (`molecules/forms/folder-picker`)

```ts
type FolderPickerItem = string | { label: string; value: string };
type FolderPickerProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  items: FolderPickerItem[];
  label: string;                     // na aba
  sublabel?: string;                 // vazio = "N notas"
  trigger?: "hover" | "click";       // default "hover"
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;           // default true
  /** Boiar e arrastar na nuvem depois que as pílulas pousam. */
  float?: boolean;                   // default true
  drift?: number;                    // 0..1, default 0.5
  onSelect?: (value: string, index: number) => void;
  spread?: number;                   // meia-largura da nuvem, default 180
  tilt?: number;                     // graus máx., default 8
  openMs?: number;                   // default 520 (fechar = 60%)
  staggerMs?: number;                // default 45
  bounce?: number;                   // default 0.3
};
```

## Regras

1. **Acessibilidade:** a pasta é um `<button aria-expanded aria-controls>` (nome = `label` +
   `sublabel`). As notas são `<button>` comuns (não `menuitem`, porque não é um menu de comandos), num `div role="group" aria-label={label}`; Escape fecha e devolve o foco à pasta. Com
   `trigger="hover"`, foco e Enter também abrem (hover não é a única via).
2. **Pasta (só tokens):** fundo `bg-muted`, aba da frente `bg-secondary` com rótulo
   `text-secondary-foreground`, borda de papel `bg-card`. A aba inclina por `rotateX` (perspectiva)
   de `restAngle` 12° fechada para 30° aberta.
3. **Layout da nuvem:** função pura `packRows(widths, spread, gap)` distribui as pílulas em linhas
   centradas de largura ≤ 2·spread, de baixo para cima a partir da pasta (+ 24 px); cada pílula
   recebe inclinação determinística `tiltFor(i, tilt)` (sem aleatório no render).
   Larguras medidas com `offsetWidth` (jsdom → estimativa por caracteres).
4. **Subir:** cada pílula sai do centro da pasta para sua posição com mola (`bounce`), atraso
   `i * staggerMs`; fechar inverte a ordem, em 60% do tempo.
5. **Boiar:** com `float`, depois de pousar, cada pílula oscila devagar (x/y senoidal, amplitude
   proporcional a `drift`, fases diferentes); arrastar (`drag` do motion com `dragConstraints` na
   nuvem) move a pílula e ela fica onde soltou. Sem física de colisão (documentar).
6. **Pílulas:** `bg-card text-card-foreground border shadow-sm rounded-full`.
7. Clique numa pílula: `onSelect(value, i)`; com `closeOnSelect`, fecha.

## Movimento reduzido

Abre e fecha com fade, pílulas já no lugar, sem boiar nem inclinar a aba.

## Marcação

Raiz `data-slot="folder-picker"`, `data-state="open"|"closed"`. Partes: `folder-picker-folder`,
`folder-picker-item`.

## Testes mínimos

- Puras: `packRows` (respeita a largura, todas as pílulas colocadas, linhas centradas),
  `tiltFor` determinística e dentro de ±tilt.
- `trigger="click"`: clique abre (`aria-expanded`), pílulas acessíveis; Escape fecha e foca a pasta.
- `trigger="hover"`: pointerenter abre, pointerleave do conjunto fecha; Enter também abre.
- Clique numa pílula chama `onSelect` e fecha; `closeOnSelect=false` mantém aberta.
- `sublabel` vazio mostra "4 notas". Movimento reduzido. `ref`/`className`.
