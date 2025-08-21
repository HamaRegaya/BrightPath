import { useEffect, useRef } from 'react';

/**
 * Hook pour gérer le redimensionnement et l'initialisation du canvas
 */
export const useCanvasSetup = (
  redrawCanvas: (canvas: HTMLCanvasElement) => void
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const nextW = Math.max(1, Math.floor(rect.width));
      const nextH = Math.max(1, Math.floor(rect.height));
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        redrawCanvas(canvas);
      }
    };

    resizeCanvas();
    // Observe container size changes
    const ro = new ResizeObserver(() => resizeCanvas());
    ro.observe(canvas.parentElement || canvas);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ro.disconnect();
    };
  }, [redrawCanvas]);

  return canvasRef;
};
