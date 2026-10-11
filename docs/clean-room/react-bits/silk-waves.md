# Spec de comportamento: `silk-waves`

> **Proveniência (clean room).** Escrita em 11/10/2026 a partir da demo pública "Silk" em
> `reactbits.dev` (aba Preview e tabela de props). O código do React Bits **não foi lido**.
> Segue o contrato `_fundo-webgl.md`.

## O que a pessoa vê

O fundo inteiro é um **tecido acetinado de uma cor só**, com **dobras diagonais** largas que
deslizam devagar, como seda ondulando. As cristas das dobras são mais claras, os vales mais
escuros, e uma **textura fina granulada** dá aspecto de tecido.

## API (`atoms/background/silk-waves`)

```ts
type SilkWavesProps = React.ComponentProps<"div"> & {
  color?: string;          // token; default "--primary"
  speed?: number;          // default 1 (0 congela)
  scale?: number;          // tamanho das dobras; default 1 (maior = dobras maiores)
  rotation?: number;       // graus da direção das dobras; default -30
  grain?: number;          // 0–1, textura de tecido; default 0.35
  children?: React.ReactNode;
};
```

## Regras

1. **Coordenadas.** `p = (gl_FragCoord.xy − uResolution/2) / uResolution.y`, girado por
   `rotation`, dividido por `scale`.
2. **Padrão.** Distorção de domínio: `p.y += 0.12·sin(p.x·3.0 + t)`; depois
   `f = 0.5 + 0.5·sin(p.x·5.0 + 2.0·sin(p.y·2.0 + t·0.6) + t)`, com `t = uTime·uSpeed·0.15`.
3. **Luz.** `shade = mix(0.35, 1.15, f)` multiplica a cor; uma crista estreita
   `pow(f, 8.0)·0.25` soma brilho.
4. **Grão.** Ruído por pixel (hash de `gl_FragCoord.xy`) estático, amplitude `grain·0.08`.
5. **Alfa** 1 (fundo opaco; o conteúdo fica legível porque a story escolhe `text-primary-foreground`).
6. **Fallback.** `linear-gradient(135deg, var(--c), color-mix(in oklch, var(--c), var(--foreground) 35%))`.

## Testes mínimos

Contrato comum + o grau de `rotation` vira radianos no uniform (puro `toRadians`).
