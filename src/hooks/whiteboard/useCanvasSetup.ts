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
      canvas.width = rect.width;
      canvas.height = rect.height;
      redrawCanvas(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  return canvasRef;
};
