# O Sonner embutido no @flowtomic/ui não reproduz avisos disparados antes do Toaster montar — aviso de efeito de montagem some

## Aviso pedido antes do Toaster montar se perde

## Sintoma

Um `addToast` chamado num efeito de montagem não aparece. O caso real foi o erro
de conexão da home: a requisição falhava, o aviso era pedido e nada surgia na
tela, sem erro no console.

## Causa

Duas coisas se somam:

- `@flowtomic/ui@1.2.0` embute **a própria cópia do sonner** dentro de
  `dist/index.js`. Essa cópia **não reproduz** os toasts criados antes de o
  `<Toaster/>` montar. O pacote `sonner` raiz reproduz, então testar com ele dá
  um falso "funciona".
- O Pandora monta o Toaster por `next/dynamic(..., { ssr: false })` em
  `components/ui/client-toaster.tsx`, porque o `@flowtomic/ui` toca `document` no
  boot do módulo e quebra o SSR. Montagem dinâmica é assíncrona: o efeito da
  página roda **antes** do Toaster existir.

## Correção

- `components/ui/toaster-ready.ts`: um portão de promessa, liberado no efeito do
  próprio Toaster.
- `contexts/ToastContext.tsx`: importa `components/ui/notify` sob demanda e
  espera o portão antes de disparar. Se o Toaster nunca carregar, avisa no
  console após ~10 s.
- A API do `addToast` não mudou; o id de deduplicação é `type|title|message`.
- A dependência `sonner` saiu do `package.json` do Pandora: o único sonner em uso
  é o do flowtomic.

## Como verificar

`tests/components/client-toaster.test.tsx` falha se o portão for trocado por uma
promessa já resolvida (confirmado por revisor independente). Para reproduzir à
mão, peça um toast num `useEffect` de montagem sem o portão e observe a tela.

```bash
bun run test tests/components/client-toaster.test.tsx
```

Ao subir a versão do `@flowtomic/ui`, reveja se a cópia embutida passou a
reproduzir avisos; só então o portão deixa de ser necessário.
