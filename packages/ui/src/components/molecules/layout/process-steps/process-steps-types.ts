import type * as React from "react";

export type ProcessStepSlide = {
  media: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export type ProcessStepDetail = {
  /** Título da janela; padrão o título do passo. */
  title?: React.ReactNode;
  slides: ProcessStepSlide[];
};

export type ProcessStepPreviewState = { active: boolean };

export type ProcessStep = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Mini-mock acima do número; a função recebe se o passo está visível. */
  preview?: React.ReactNode | ((state: ProcessStepPreviewState) => React.ReactNode);
  detail?: ProcessStepDetail;
};
