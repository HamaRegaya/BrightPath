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
    updateAINote
  } = useDrawing();
  
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

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

  const handleSparkleClick = (pointId: string, currentNote: string) => {
    setEditingNote(pointId);
    setNoteText(currentNote);
  };

  const handleNoteSubmit = (pointId: string) => {
    updateAINote(pointId, noteText);
    setEditingNote(null);
    setNoteText('');
  };

  const handleNoteCancel = () => {
    setEditingNote(null);
    setNoteText('');
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
      {aiAssistancePoints.map((point) => (
        <div key={point.id}>
          {/* Sparkles Icon */}
          <button
            onClick={() => handleSparkleClick(point.id, point.note)}
            className="absolute z-10 p-1 bg-yellow-400 text-yellow-800 rounded-full shadow-lg hover:bg-yellow-500 transition-colors transform hover:scale-110"
            style={{
              left: `${point.position.x}px`,
              top: `${point.position.y}px`,
            }}
            title="Add AI assistance note"
          >
            <Sparkles size={16} />
          </button>
          
          {/* Note Display */}
          {point.note !== 'Click to add a note here' && editingNote !== point.id && (
            <div
              className="absolute z-10 bg-yellow-100 border border-yellow-300 rounded-lg p-2 shadow-lg max-w-xs"
              style={{
                left: `${point.position.x + 25}px`,
                top: `${point.position.y}px`,
              }}
            >
              <p className="text-sm text-gray-800">{point.note}</p>
            </div>
          )}
          
          {/* Note Editing Interface */}
          {editingNote === point.id && (
            <div
              className="absolute z-20 bg-white border border-gray-300 rounded-lg p-3 shadow-xl"
              style={{
                left: `${point.position.x + 25}px`,
                top: `${point.position.y}px`,
              }}
            >
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add your note here..."
                className="w-48 h-20 p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleNoteCancel}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleNoteSubmit(point.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      
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