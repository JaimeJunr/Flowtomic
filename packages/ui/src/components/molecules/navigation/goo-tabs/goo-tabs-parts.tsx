import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { PARTICLE_COLORS, type ParticlePath } from "./goo-tabs-utils";

export type ParticleSpec = {
  id: number;
  left: number;
  top: number;
  path: ParticlePath;
  /** Duração em ms. */
  duration: number;
};

/** Filtro de gosma: borra, endurece o alfa e recompõe sobre o original. */
export function GooFilter({ id }: { id: string }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
      <defs>
        {/* Região larga: as bolinhas voam bem além da caixa da barra. */}
        <filter
          data-slot="goo-tabs-filter"
          id={id}
          x="-100%"
          y="-500%"
          width="300%"
          height="1100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Desfoque de 8 px com esse corte de alfa apagava as bolinhas de 12 px. */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

export function GooParticle({ spec }: { spec: ParticleSpec }) {
  const { path } = spec;
  return (
    <motion.span
      data-slot="goo-tabs-particle"
      aria-hidden="true"
      className={cn(
        "absolute -ml-1.5 -mt-1.5 size-3 rounded-full",
        PARTICLE_COLORS[spec.id % PARTICLE_COLORS.length]
      )}
      style={{ left: spec.left, top: spec.top }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, path.outX, path.inX],
        y: [0, path.outY, path.inY],
        scale: [1, 0.6, 0],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: spec.duration / 1000, ease: "easeInOut", times: [0, 0.5, 1] }}
    />
  );
}
