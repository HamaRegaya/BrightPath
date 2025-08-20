import { useState, useEffect } from 'react';
import { AITextElement } from '../../types/whiteboard';
import { calculateTextDimensions } from '../../utils/whiteboard/drawing';
import { Stroke } from '../../context/DrawingContext';

/**
 * Hook pour gérer les éléments de texte IA
 */
export const useAITextElements = (
  strokes: Stroke[],
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const [aiTextElements, setAITextElements] = useState<AITextElement[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const aiTexts = strokes
      .filter(stroke => stroke.tool === 'ai-text')
      .map(stroke => {
        const text = (stroke as any).text || '';
        const position = stroke.path[0];
        const maxWidth = canvas.width - position.x - 20; // Marge depuis le bord droit
        
        // Calcul des dimensions
        const ctx = canvas.getContext('2d');
        let dimensions = { width: 0, height: 0 };
        
        if (ctx) {
          dimensions = calculateTextDimensions(text, maxWidth, ctx);
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
  }, [strokes, canvasRef]);

  return aiTextElements;
};
