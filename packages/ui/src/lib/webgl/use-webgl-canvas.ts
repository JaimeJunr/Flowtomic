"use client";

import * as React from "react";
import { useShouldReduceMotion } from "../use-should-reduce-motion";
import { createGlContext } from "./create-gl-context";
import {
  createWebglRenderer,
  type WebglRenderer,
  type WebglRendererOptions,
} from "./create-webgl-renderer";

export type UseWebglCanvasOptions = {
  fragmentShader: string;
  uniforms?: (gl: WebGL2RenderingContext, program: WebGLProgram, time: number) => void;
  paused?: boolean;
};

function rendererOptions(
  input: UseWebglCanvasOptions,
  reducedMotion: boolean,
  onError: () => void
): WebglRendererOptions {
  return { ...input, paused: input.paused ?? false, reducedMotion, onError };
}

function useRendererOptions(
  input: UseWebglCanvasOptions,
  renderer: React.RefObject<WebglRenderer | null>,
  onError: () => void
): React.RefObject<WebglRendererOptions> {
  const reducedMotion = useShouldReduceMotion();
  const options = React.useRef(rendererOptions(input, reducedMotion, onError));
  React.useEffect(() => {
    options.current = rendererOptions(input, reducedMotion, onError);
    renderer.current?.sync();
  }, [input, reducedMotion, onError, renderer]);
  return options;
}

function useRendererAttachment(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: React.RefObject<WebglRendererOptions>,
  renderer: React.RefObject<WebglRenderer | null>,
  setIsSupported: React.Dispatch<React.SetStateAction<boolean>>
): void {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = createGlContext(canvas);
    if (!gl) return;
    const { fragmentShader } = options.current;
    renderer.current = createWebglRenderer(canvas, gl, fragmentShader, () => options.current);
    setIsSupported(renderer.current !== null);
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [canvasRef, options, renderer, setIsSupported]);
}

export function useWebglCanvas(input: UseWebglCanvasOptions): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isSupported: boolean;
} {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = React.useState(false);
  const renderer = React.useRef<WebglRenderer | null>(null);
  const onError = React.useCallback(() => setIsSupported(false), []);
  const options = useRendererOptions(input, renderer, onError);
  useRendererAttachment(canvasRef, options, renderer, setIsSupported);
  return { canvasRef, isSupported };
}
