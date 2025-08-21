import React, { useEffect } from 'react';
import { useDrawing } from '../context/DrawingContext';
import { 
  useShiftKey, 
  useCanvasSetup, 
  useAITextElements, 
  useDrawingState,
  useDrawingLogic
} from '../hooks/whiteboard';
import { 
  AIAssistancePoints, 
  AITextDisplay, 
  GridOverlay, 
  WhiteboardCanvas,
  AILoadingOverlay
} from './whiteboard/index';

const Whiteboard: React.FC = () => {
  const {
    tool,
    strokes,
    redrawCanvas,
    aiAssistancePoints,
    generateAIText,
  removeAIText,
  addStroke
  } = useDrawing();
  
  // Hooks personnalisés pour la logique modulaire
  const canvasRef = useCanvasSetup(redrawCanvas);
  const isShiftPressed = useShiftKey();
  const aiTextElements = useAITextElements(strokes, canvasRef);
  
  const [drawingState, { setCurrentPath, setStartPos, setDragOffset }] = useDrawingState();
  const { startDrawing, draw, stopDrawing } = useDrawingLogic(
    canvasRef,
    drawingState.currentPath,
    setCurrentPath,
    drawingState.startPos,
    setStartPos,
    drawingState.dragOffset,
    setDragOffset,
    isShiftPressed
  );

  // Redessiner le canvas quand les strokes changent
  useEffect(() => {
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current);
    }
  }, [strokes, redrawCanvas]);

  // Gestionnaire pour les clics sur les sparkles IA
  const handleSparkleClick = (pointId: string) => {
    const canvas = canvasRef.current;
    generateAIText(pointId, canvas || undefined);
  };

  // Expose a minimal global hook for toolbar image insertion
  useEffect(() => {
    (window as any).__drawing_addImage__ = ({ imageSrc, x, y, w, h }: { imageSrc: string; x: number; y: number; w: number; h: number; }) => {
      addStroke({
        tool: 'image',
        color: '#000000',
        width: 1,
        path: [{ x, y }],
        imageSrc,
        imgWidth: w,
        imgHeight: h
      } as any);
      if (canvasRef.current) redrawCanvas(canvasRef.current);
    };
    return () => {
      if ((window as any).__drawing_addImage__) delete (window as any).__drawing_addImage__;
    };
  }, [addStroke, redrawCanvas]);

  // Gestionnaires d'événements tactiles
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startDrawing(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    draw(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stopDrawing();
  };

  // Global paste handler so Ctrl+V works anywhere on the site
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const imageSrc = reader.result as string;
            const rect = canvas.getBoundingClientRect();
            // Default to center of canvas
            const x = rect.width / 2 - 100;
            const y = rect.height / 2 - 75;
            const img = new Image();
            img.onload = () => {
              const maxW = rect.width * 0.4;
              const scale = Math.min(1, maxW / img.width);
              const w = Math.round(img.width * scale);
              const h = Math.round(img.height * scale);
              addStroke({
                tool: 'image',
                color: '#000000',
                width: 1,
                path: [{ x, y }],
                imageSrc,
                imgWidth: w,
                imgHeight: h
              } as any);
              redrawCanvas(canvas);
            };
            img.src = imageSrc;
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [canvasRef, addStroke, redrawCanvas]);

  return (
  <div className="flex-1 min-h-0 flex bg-white mx-3 my-1 md:mx-4 md:my-2 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
      {/* Animated gradient + sparkles while AI is typing */}
      <AILoadingOverlay
        active={aiAssistancePoints.some(p => p.isLoading || p.isTyping)}
        anchors={aiAssistancePoints.filter(p => p.isLoading || p.isTyping).map(p => p.position)}
        duration={14000}
      />
      <WhiteboardCanvas
        canvasRef={canvasRef}
        tool={tool}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Points d'assistance IA (Sparkles) */}
      <AIAssistancePoints 
        points={aiAssistancePoints}
        onSparkleClick={handleSparkleClick}
      />

      {/* Texte IA avec rendu mathématique */}
      <AITextDisplay
        aiTextElements={aiTextElements}
        canvasRef={canvasRef}
        onRemoveAIText={removeAIText}
      />
      
      {/* Grille de guidage pour l'écriture */}
      <GridOverlay />
    </div>
  );
};

export default Whiteboard;