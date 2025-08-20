import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useDrawing } from '../context/DrawingContext';
import MathText from './MathText';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    tool,
    strokeColor,
    strokeWidth,
    isDrawing,
    setIsDrawing,
    addStroke,
    updateStroke,
    strokes,
    redrawCanvas,
    aiAssistancePoints,
    generateAIText,
    removeAIText,
    selectedStrokeId,
    setSelectedStrokeId,
    findStrokeAt
  } = useDrawing();
  
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [aiTextElements, setAITextElements] = useState<Array<{
    id: string;
    position: { x: number; y: number };
    aiPointId: string;
    text: string;
    dimensions: { width: number; height: number };
  }>>([]);

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

  // Handle keyboard events for SHIFT key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current);
    }
  }, [strokes, redrawCanvas]);

  // Track AI text elements for showing remove buttons
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const aiTexts = strokes
      .filter(stroke => stroke.tool === 'ai-text')
      .map(stroke => {
        const text = (stroke as any).text || '';
        const position = stroke.path[0];
        const maxWidth = canvas.width - position.x - 20; // Leave margin from right edge
        
        // Calculate dimensions inline to avoid dependency issues
        const ctx = canvas.getContext('2d');
        let dimensions = { width: 0, height: 0 };
        
        if (ctx) {
          ctx.font = '500 16px "Urbanist", sans-serif';
          
          const words = text.split(' ');
          let line = '';
          let lines = 0;
          let maxLineWidth = 0;
          const lineHeight = 20;

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
              maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
              line = words[i] + ' ';
              lines++;
            } else {
              line = testLine;
            }
          }
          
          if (line.trim()) {
            maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
            lines++;
          }

          dimensions = {
            width: Math.min(maxLineWidth, maxWidth),
            height: lines * lineHeight
          };
        }
        
        return {
          id: stroke.id,
          position,
          aiPointId: (stroke as any).aiPointId || '',
          text,
          dimensions
        };
      });
    setAITextElements(aiTexts);
  }, [strokes]);

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
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'move') {
      // Check if we clicked on an existing shape
      const clickedStroke = findStrokeAt(pos.x, pos.y);
      if (clickedStroke) {
        setSelectedStrokeId(clickedStroke.id);
        
        // Calculate offset from click point to shape origin
        const startPoint = clickedStroke.path[0];
        setDragOffset({
          x: pos.x - startPoint.x,
          y: pos.y - startPoint.y
        });
      } else {
        // Clicked on empty space, deselect
        setSelectedStrokeId(null);
        setDragOffset(null);
      }
    } else if (tool === 'pen') {
      setCurrentPath([pos]);
      setStartPos(pos); // Store start position for straight line drawing
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'eraser') {
      setCurrentPath([pos]);
      // Set up eraser context and start erasing
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 4; // Make eraser thicker
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'rectangle' || tool === 'circle') {
      // For shapes, we just store the start position
      setStartPos(pos);
      setCurrentPath([pos]);
    } else if (tool === 'text') {
      // For text tool, immediately prompt for text
      const text = prompt('Enter text:');
      if (text) {
        const textStroke = {
          tool: 'text',
          color: strokeColor,
          width: strokeWidth,
          path: [pos]
        };
        
        // Add text property to the stroke
        (textStroke as any).text = text;
        
        addStroke(textStroke);
      }
      setIsDrawing(false);
    }
  };

  const handleSparkleClick = (pointId: string) => {
    const canvas = canvasRef.current;
    generateAIText(pointId, canvas || undefined);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'move' && selectedStrokeId && dragOffset) {
      // Move the selected shape
      const selectedStroke = strokes.find(s => s.id === selectedStrokeId);
      if (selectedStroke) {
        const newStartPos = {
          x: pos.x - dragOffset.x,
          y: pos.y - dragOffset.y
        };
        
        // Calculate the difference in position
        const oldStartPos = selectedStroke.path[0];
        const deltaX = newStartPos.x - oldStartPos.x;
        const deltaY = newStartPos.y - oldStartPos.y;
        
        // Update all points in the path
        const newPath = selectedStroke.path.map(point => ({
          x: point.x + deltaX,
          y: point.y + deltaY
        }));
        
        updateStroke(selectedStrokeId, { path: newPath });
      }
    } else if (tool === 'pen') {
      if (isShiftPressed && startPos) {
        // Draw straight line when SHIFT is pressed
        // Clear canvas and redraw everything
        redrawCanvas(canvas);
        
        // Draw the straight line preview
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        // Update current path to only contain start and end points for straight line
        setCurrentPath([startPos, pos]);
      } else {
        // Normal freehand drawing
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        setCurrentPath(prev => [...prev, pos]);
      }
    } else if (tool === 'eraser') {
      // Draw continuous erasing line
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = strokeWidth * 4; // Make eraser thicker
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      setCurrentPath(prev => [...prev, pos]);
    } else if ((tool === 'rectangle' || tool === 'circle') && startPos) {
      // Draw preview of shape while dragging
      redrawCanvas(canvas); // Clear and redraw everything
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([]);
      
      if (tool === 'rectangle') {
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        // Calculate radius from start point to current position
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        
        // Calculate direction vector from start to current position
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        
        // Calculate circle center: start point + half the distance vector
        const centerX = startPos.x + dx / 2;
        const centerY = startPos.y + dy / 2;
        
        // Draw circle with center between start and current position
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Store current end position for final shape
      setCurrentPath([startPos, pos]);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over'; // Reset to normal drawing mode
      }
    }

    if (tool === 'move') {
      // Reset drag state
      setDragOffset(null);
      return; // Don't add a new stroke for move operations
    }

    if (currentPath.length > 0) {
      addStroke({
        tool,
        color: strokeColor,
        width: strokeWidth,
        path: currentPath
      });
    }
    
    // Reset shape-specific state
    setCurrentPath([]);
    setStartPos(null);
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${
          tool === 'eraser' ? 'cursor-eraser' : 
          tool === 'pen' ? 'cursor-crosshair' : 
          tool === 'move' ? 'cursor-move' :
          tool === 'rectangle' || tool === 'circle' ? 'cursor-crosshair' :
          tool === 'text' ? 'cursor-text' :
          'cursor-default'
        }`}
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
      ))}

      {/* AI Text with Math Rendering */}
      {aiTextElements.map((aiText) => (
        <div key={`ai-text-container-${aiText.id}`} className="absolute" style={{
          left: `${aiText.position.x}px`,
          top: `${aiText.position.y}px`,
        }}>
          <MathText
            text={aiText.text}
            position={{ x: 0, y: 0 }} // Position relative to container
            maxWidth={Math.min(400, canvasRef.current ? canvasRef.current.width - aiText.position.x - 20 : 400)}
          />
          {/* Remove button positioned at top-right corner of the note */}
          <button
            onClick={() => removeAIText(aiText.aiPointId)}
            className="absolute z-30 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110 border-2 border-white"
            style={{
              right: '-8px',
              top: '-8px',
            }}
            title="Remove AI suggestion"
          >
            <X size={10} />
          </button>
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