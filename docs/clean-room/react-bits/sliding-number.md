# Spec de comportamento: `sliding-number` (melhoria do componente existente)

> **Proveniência (clean room).** Escrita em 04/10/2026 comparando o nosso `sliding-number` com a
> demo pública "Counter" em `reactbits.dev` (só a aba Preview e a tabela de props). O código do
> React Bits **não foi lido**.

## O que muda

O efeito de "odômetro" já é o nosso. Falta agrupar os milhares.

```ts
/** Separador de milhar, ex.: "." para 1.234.567. Vazio = sem agrupamento (comportamento atual). */
thousandsSeparator?: string;          // default ""
```

## Regras

1. A parte inteira é agrupada de 3 em 3 dígitos, da direita para a esquerda. Isso vale com
   `padStart`, com números negativos e com casas decimais (`decimalSeparator` continua valendo).
2. O separador é um caractere **estático**: ele não rola. Só os dígitos têm rolo.
3. O texto acessível (`sr-only`) inclui o separador: "1.234.567".
4. Com movimento reduzido, o texto simples também sai agrupado.
5. Separador igual ao `decimalSeparator` é aceito sem validação (responsabilidade de quem usa).

## Testes mínimos

- 1234567 com `thousandsSeparator="."`: o sr-only diz "1.234.567" e há 7 rolos.
- -1234.5 com `decimalPlaces=1`, `thousandsSeparator="."` e `decimalSeparator=","` dá
  "-1.234,5".
- 999 não leva separador.
- Movimento reduzido mostra o texto agrupado.
- Sem a prop, a saída é igual a hoje (regressão).
