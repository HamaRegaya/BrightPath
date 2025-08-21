import React, { useEffect, useRef } from 'react';
import { WhiteboardPage } from '../../types/whiteboard';

interface PageThumbnailProps {
  page: WhiteboardPage;
  isActive: boolean;
  onClick: () => void;
  width?: number;
  height?: number;
}

/**
 * Composant pour afficher un aperçu miniature d'une page
 */
export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  page,
  isActive,
  onClick,
  width = 120,
  height = 80
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !page.strokes.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Scale factor pour adapter les strokes à la taille du thumbnail
    const scaleFactor = Math.min(width / 800, height / 600); // Assume original canvas is ~800x600

    // Dessiner chaque stroke
    page.strokes.forEach(stroke => {
      if (!stroke.path || stroke.path.length === 0) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = Math.max(1, (stroke.width || 2) * scaleFactor);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'rectangle') {
        const [start, end] = stroke.path;
        if (start && end) {
          const x = start.x * scaleFactor;
          const y = start.y * scaleFactor;
          const w = (end.x - start.x) * scaleFactor;
          const h = (end.y - start.y) * scaleFactor;
          ctx.strokeRect(x, y, w, h);
        }
      } else if (stroke.tool === 'circle') {
        const [start, end] = stroke.path;
        if (start && end) {
          const centerX = (start.x + (end.x - start.x) / 2) * scaleFactor;
          const centerY = (start.y + (end.y - start.y) / 2) * scaleFactor;
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) * scaleFactor / 2;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      } else {
        // Pen, eraser, etc.
        stroke.path.forEach((point: any, index: number) => {
          const x = point.x * scaleFactor;
          const y = point.y * scaleFactor;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    });
  }, [page.strokes, width, height]);

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-md ${
        isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full bg-white"
      />
      
      {/* Overlay avec le nom de la page */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
        {page.name}
      </div>
      
      {/* Indicateur de page active */}
      {isActive && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
};
