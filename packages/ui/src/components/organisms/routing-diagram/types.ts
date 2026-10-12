import type { ReactNode } from "react";

export type RoutingTarget = {
  kind: "target";
  id: string;
  title: ReactNode;
  /** Texto em mono, truncado com reticências. */
  subtitle?: string;
  icon?: ReactNode;
  /** Selo à direita do cartão (ex.: "180 ms"). */
  badge?: ReactNode;
  /** `down` marca o destino como desviado (selo em `muted`, sem vermelho). */
  status?: "ok" | "down";
  /** Cadeia horizontal: para onde o pedido vai quando este destino não responde. */
  fallback?: { label?: string; to: RoutingTarget };
};

export type RoutingDecision = {
  kind: "decision";
  id: string;
  question: ReactNode;
  branches: { label: string; to: RoutingNode }[];
};

export type RoutingNode = RoutingDecision | RoutingTarget;

export type RoutingScenario = {
  value: string;
  /** Texto da aba. */
  label: ReactNode;
  /** Vai para o slot de descrição. */
  description?: ReactNode;
  /** O que vem logo depois da origem. */
  root: RoutingNode;
  /** Ids dos nós no caminho, em ordem, terminando no destino. */
  activePath: string[];
};
