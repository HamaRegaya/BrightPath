import React, { useRef, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useDrawing } from '../context/DrawingContext';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    tool,
    strokeColor,
    strokeWidth,
    isDrawing,
    setIsDrawing,
    addStroke,
    strokes,
    redrawCanvas,
    aiAssistancePoints,
    generateAIText
  } = useDrawing();
  
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

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

  useEffect(() => {
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current);
    }
  }, [strokes, redrawCanvas]);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setCurrentPath([pos]);

    if (tool === 'pen') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const handleSparkleClick = (pointId: string) => {
    generateAIText(pointId);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      setCurrentPath(prev => [...prev, pos]);
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, strokeWidth, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 0) {
      addStroke({
        tool,
        color: strokeColor,
        width: strokeWidth,
        path: currentPath
      });
    }
    
    setCurrentPath([]);
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          startDrawing(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          draw(e);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopDrawing();
        }}
      />
      
      {/* AI Assistance Points (Sparkles) */}
      {aiAssistancePoints.filter(point => point.isVisible).map((point) => (
        <button
          key={point.id}
          onClick={() => handleSparkleClick(point.id)}
          className="absolute z-10 p-1 bg-yellow-400 text-yellow-800 rounded-full shadow-lg hover:bg-yellow-500 transition-all transform hover:scale-110 animate-pulse"
          style={{
            left: `${point.position.x}px`,
            top: `${point.position.y}px`,
          }}
          title="Click for AI assistance"
        >
          <Sparkles size={16} />
        </button>
      ))})
      
      {/* Grid overlay for better writing guidance */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
};

export default Whiteboard;