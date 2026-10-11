import { motion } from "motion/react";

import type { LockInfo } from "./target-cursor-controller";
import type { Corner } from "./target-cursor-utils";
import type { CursorValues } from "./target-cursor-values";

type CornerProps = {
  corner: Corner;
  values: CursorValues["corners"][Corner];
  cornerSize: number;
  thickness: number;
  radius: number;
};

const BORDERS: Record<Corner, { sides: [string, string]; radius: string }> = {
  tl: { sides: ["borderTopWidth", "borderLeftWidth"], radius: "borderTopLeftRadius" },
  tr: { sides: ["borderTopWidth", "borderRightWidth"], radius: "borderTopRightRadius" },
  br: { sides: ["borderBottomWidth", "borderRightWidth"], radius: "borderBottomRightRadius" },
  bl: { sides: ["borderBottomWidth", "borderLeftWidth"], radius: "borderBottomLeftRadius" },
};

export function CursorCorner({ corner, values, cornerSize, thickness, radius }: CornerProps) {
  const { sides, radius: radiusKey } = BORDERS[corner];
  return (
    <motion.div
      data-slot="target-cursor-corner"
      data-corner={corner}
      className="absolute top-0 left-0"
      style={{
        x: values.x,
        y: values.y,
        width: cornerSize,
        height: cornerSize,
        borderStyle: "solid",
        borderColor: "currentColor",
        borderWidth: 0,
        [sides[0]]: thickness,
        [sides[1]]: thickness,
        [radiusKey]: radius,
      }}
    />
  );
}

export function CursorDot({ size, values }: { size: number; values: CursorValues }) {
  return (
    <motion.div
      data-slot="target-cursor-dot"
      className="absolute top-0 left-0 rounded-full bg-current"
      style={{
        x: values.x,
        y: values.y,
        scale: values.dotScale,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    />
  );
}

export function CursorLabel({
  lock,
  padding,
  values,
}: {
  lock: LockInfo;
  padding: number;
  values: CursorValues;
}) {
  if (!lock.label) return null;
  return (
    <motion.div className="absolute top-0 left-0 size-0" style={{ x: values.x, y: values.y }}>
      <motion.span
        data-slot="target-cursor-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="absolute -translate-y-full whitespace-nowrap rounded-sm bg-foreground px-1.5 py-0.5 font-mono text-background text-xs"
        style={{
          left: -lock.halfWidth - padding,
          top: -lock.halfHeight - padding - 6,
        }}
      >
        {lock.label}
      </motion.span>
    </motion.div>
  );
}
