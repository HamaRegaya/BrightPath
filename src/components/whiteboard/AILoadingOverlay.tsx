import React, { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'motion/react';

type Point = { x: number; y: number };

interface AILoadingOverlayProps {
  active: boolean;
  anchors?: Point[]; // unused, kept for API compatibility
  duration?: number;
}

const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ active, duration = 3000 }) => {
  const pathRef = useRef<SVGRectElement | null>(null);
  const progress = useMotionValue<number>(0);
  const lengthRef = useRef<number>(0);

  useAnimationFrame((time) => {
    if (!active) return;
    const length = pathRef.current?.getTotalLength?.();
    if (length) {
      lengthRef.current = length;
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        {/* Hidden path used to compute total length */}
        <rect ref={pathRef} fill="none" stroke="none" width="100%" height="100%" rx="8" ry="8" />
        {/* Visible moving line segment along the border */}
        <motion.rect
          fill="none"
          stroke="rgba(14,165,233,0.9)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          width="100%"
          height="100%"
          rx="8"
          ry="8"
          // Show a short segment (dash) followed by the remaining gap
          strokeDasharray={`${Math.max(80, Math.min(160, lengthRef.current * 0.12))} ${Math.max(1, (lengthRef.current || 1000) - Math.max(80, Math.min(160, lengthRef.current * 0.12)))}`}
          style={{ strokeDashoffset: progress }}
        />
      </svg>
    </div>
  );
};

export default AILoadingOverlay;
