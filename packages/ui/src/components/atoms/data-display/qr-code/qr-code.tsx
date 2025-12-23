"use client";
import { cva, type VariantProps } from "class-variance-authority";
import QRCodeStyling, { type Options as QRCodeStylingOptions } from "qr-code-styling";
import * as React from "react";
import { cn } from "@/lib/utils";

// Size tokens (visual wrapper padding + internal QR size)
const qrCodeRootVariants = cva(
  "relative flex items-center justify-center select-none", // base classes
  {
    variants: {
      size: {
        md: "p-2",
        lg: "p-3",
      },
      animated: {
        true: "", // animation handled conditionally
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      animated: false,
    },
  }
);

export interface QRCodeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof qrCodeRootVariants> {
  /** Valor (data) codificado no QR. */
  value: string;
  /** Opções extras da lib qr-code-styling para customização avançada. */
  options?: QRCodeStylingOptions;
  /** Rótulo de acessibilidade (aria-label). */
  ariaLabel?: string;
}

// Map sizes to pixel dimensions for QR render
const QR_SIZE = {
  md: { width: 96, height: 96 },
  lg: { width: 128, height: 128 },
};

// Corner frame handle
const FrameHandle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "size-3 rounded-tl border-t-2 border-l-2 border-[hsl(var(--primary))]", // use primary token
        className
      )}
      {...props}
    />
  )
);
FrameHandle.displayName = "QRCodeFrameHandle";

// Animated gradient scan overlay (only when animated && !prefers-reduced-motion)
const GradientScan = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "absolute bottom-0 h-1/2 w-full border-t border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.10]",
        "[mask-image:radial-gradient(52.19%_100%_at_50%_0%,_#000_0%,_rgba(0,0,0,0)_95.31%)]",
        "[webkit-mask-image:radial-gradient(52.19%_100%_at_50%_0%,_#000_0%,_rgba(0,0,0,0)_95.31%)]",
        className
      )}
      style={style}
      {...props}
    />
  )
);
GradientScan.displayName = "QRCodeGradientScan";

export const QRCode = React.forwardRef<HTMLDivElement, QRCodeProps>(
  (
    { value, options, size = "md", animated = false, className, ariaLabel = "QR code", ...props },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const qrInstanceRef = React.useRef<QRCodeStyling | null>(null);
    const mountedRef = React.useRef(false);

    // Create instance once
    React.useEffect(() => {
      if (!containerRef.current || mountedRef.current) return;
      mountedRef.current = true;
      const qrSize = size ?? "md";
      qrInstanceRef.current = new QRCodeStyling({
        width: QR_SIZE[qrSize].width,
        height: QR_SIZE[qrSize].height,
        data: value,
        type: "svg",
        // Sensible defaults (can be overridden via options)
        margin: 0,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4 },
        dotsOptions: { type: "rounded" },
        backgroundOptions: { color: "transparent" },
        ...options,
      });
      qrInstanceRef.current.append(containerRef.current);
    }, [options, size, value]);

    // Update when value/options/size change
    React.useEffect(() => {
      if (!qrInstanceRef.current) return;
      const qrSize = size ?? "md";
      qrInstanceRef.current.update({
        data: value,
        width: QR_SIZE[qrSize].width,
        height: QR_SIZE[qrSize].height,
        ...options,
      });
    }, [value, options, size]);

    // Respect prefers-reduced-motion for animated overlay
    const prefersReducedMotion = React.useMemo(
      () =>
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      []
    );

    return (
      <div
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        className={cn(qrCodeRootVariants({ size, animated }), className)}
        {...props}
      >
        <div ref={containerRef} className="[&>canvas]:h-auto [&>canvas]:w-auto" />
        {/* Frame corners */}
        <FrameHandle className="absolute left-0 top-0" />
        <FrameHandle className="absolute top-0 right-0 rotate-90" />
        <FrameHandle className="absolute bottom-0 right-0 rotate-180" />
        <FrameHandle className="absolute bottom-0 left-0 -rotate-90" />
        {animated && !prefersReducedMotion && (
          <GradientScan className="animate-[scan_2.4s_linear_infinite]" style={{}} />
        )}
        {/* Keyframes via arbitrary CSS (Tailwind v4 supports @keyframes in theme or inline style) */}
        <style>{`@keyframes scan { from { transform: translateY(100%); opacity: .15; } to { transform: translateY(0%); opacity: .55; } }`}</style>
      </div>
    );
  }
);
QRCode.displayName = "QRCode";

export { qrCodeRootVariants };
