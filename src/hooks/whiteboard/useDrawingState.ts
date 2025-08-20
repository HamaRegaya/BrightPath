import { useState } from 'react';
import { Position, DrawingState } from '../../types/whiteboard';

/**
 * Hook pour gérer l'état de dessin du whiteboard
 */
export const useDrawingState = (): [DrawingState, {
  setCurrentPath: React.Dispatch<React.SetStateAction<Position[]>>;
  setStartPos: React.Dispatch<React.SetStateAction<Position | null>>;
  setDragOffset: React.Dispatch<React.SetStateAction<Position | null>>;
  resetDrawingState: () => void;
}] => {
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [dragOffset, setDragOffset] = useState<Position | null>(null);

  const resetDrawingState = () => {
    setCurrentPath([]);
    setStartPos(null);
    setDragOffset(null);
  };

  const drawingState: DrawingState = {
    currentPath,
    startPos,
    dragOffset,
    isShiftPressed: false, // Sera géré par useShiftKey
    aiTextElements: [] // Sera géré par useAITextElements
  };

  return [
    drawingState,
    {
      setCurrentPath,
      setStartPos,
      setDragOffset,
      resetDrawingState
    }
  ];
};
