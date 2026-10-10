import type * as React from "react";
import { outlineBetween, pointAtX } from "./curved-input-utils";

const BUTTON_WIDTH = 112;
const EDGE = 6;

export type CurvedLayout = {
  trackStart: number;
  trackEnd: number;
  chipX: number;
  chipR: number;
  buttonStart: number;
  buttonEnd: number;
};

export function computeLayout(
  width: number,
  height: number,
  hasIcon: boolean,
  hasButton: boolean
): CurvedLayout {
  const chipR = Math.max(8, (height - 16) / 2);
  const chipX = 8 + chipR;
  const buttonWidth = Math.min(BUTTON_WIDTH, width / 3);
  const buttonEnd = width - EDGE;
  const buttonStart = buttonEnd - buttonWidth;
  return {
    chipX,
    chipR,
    buttonStart,
    buttonEnd,
    trackStart: hasIcon ? chipX + chipR + 10 : 22,
    trackEnd: hasButton ? buttonStart - 10 : width - 22,
  };
}

type PartGeometry = { width: number; height: number; bend: number; radius: number };

export function ChipShape({
  geo,
  layout,
  icon,
}: {
  geo: PartGeometry;
  layout: CurvedLayout;
  icon: React.ReactNode;
}): React.JSX.Element {
  const p = pointAtX(layout.chipX, geo.width, geo.bend);
  const size = layout.chipR * 2;
  return (
    <g data-slot="curved-input-chip">
      <circle cx={p.x} cy={p.y} r={layout.chipR} fill="var(--primary)" />
      <foreignObject x={p.x - layout.chipR} y={p.y - layout.chipR} width={size} height={size}>
        <div className="flex size-full items-center justify-center text-primary-foreground [&_svg]:size-[45%]">
          {icon}
        </div>
      </foreignObject>
    </g>
  );
}

export function ButtonShape({
  geo,
  layout,
  label,
}: {
  geo: PartGeometry;
  layout: CurvedLayout;
  label: string;
}): React.JSX.Element {
  const inner = geo.height - 12;
  const center = pointAtX((layout.buttonStart + layout.buttonEnd) / 2, geo.width, geo.bend);
  return (
    <g data-slot="curved-input-button-shape">
      <path
        d={outlineBetween(
          layout.buttonStart,
          layout.buttonEnd,
          geo.width,
          inner,
          geo.bend,
          geo.radius - 4
        )}
        fill="var(--primary)"
      />
      <text
        x={center.x}
        y={center.y}
        transform={`rotate(${center.angle} ${center.x} ${center.y})`}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--primary-foreground)"
        className="font-medium text-sm"
      >
        {label}
      </text>
    </g>
  );
}
