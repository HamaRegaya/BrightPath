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
  WhiteboardCanvas 
} from './whiteboard/index';

const Whiteboard: React.FC = () => {
  const {
    tool,
    strokes,
    redrawCanvas,
    aiAssistancePoints,
    generateAIText,
    removeAIText
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

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
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