import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Stroke {
  tool: string;
  color: string;
  width: number;
  path: { x: number; y: number }[];
}

interface DrawingContextType {
  tool: string;
  setTool: (tool: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  strokes: Stroke[];
  addStroke: (stroke: Stroke) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  redrawCanvas: (canvas: HTMLCanvasElement) => void;
  currentSubject: string;
  setCurrentSubject: (subject: string) => void;
  sessionTitle: string;
  setSessionTitle: (title: string) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const useDrawing = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
};

interface DrawingProviderProps {
  children: ReactNode;
}

export const DrawingProvider: React.FC<DrawingProviderProps> = ({ children }) => {
  const [tool, setTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [currentSubject, setCurrentSubject] = useState('math');
  const [sessionTitle, setSessionTitle] = useState('My Homework Session');

  const addStroke = (stroke: Stroke) => {
    setStrokes(prev => {
      const newStrokes = [...prev, stroke];
      setUndoStack(prevUndo => [...prevUndo, prev]);
      return newStrokes;
    });
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setStrokes(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const redo = () => {
    // For now, simplified redo (would need a proper redo stack in production)
  };

  const clear = () => {
    if (strokes.length > 0) {
      setUndoStack(prev => [...prev, strokes]);
      setStrokes([]);
    }
  };

  const redrawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      if (stroke.path.length === 0) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.path[0].x, stroke.path[0].y);
      
      for (let i = 1; i < stroke.path.length; i++) {
        ctx.lineTo(stroke.path[i].x, stroke.path[i].y);
      }
      
      ctx.stroke();
    });
  }, [strokes]);

  const value: DrawingContextType = {
    tool,
    setTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    isDrawing,
    setIsDrawing,
    strokes,
    addStroke,
    undo,
    redo,
    clear,
    canUndo: undoStack.length > 0,
    canRedo: false, // Simplified for now
    redrawCanvas,
    currentSubject,
    setCurrentSubject,
    sessionTitle,
    setSessionTitle
  };

  return (
    <DrawingContext.Provider value={value}>
      {children}
    </DrawingContext.Provider>
  );
};