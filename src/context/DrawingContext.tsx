import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Stroke {
  tool: string;
  color: string;
  width: number;
  path: { x: number; y: number }[];
  id: string;
}

export interface AIAssistancePoint {
  id: string;
  position: { x: number; y: number };
  strokeId: string;
  isVisible: boolean;
  hasGeneratedText: boolean;
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
  addStroke: (stroke: Omit<Stroke, 'id'>) => void;
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
  aiAssistancePoints: AIAssistancePoint[];
  addAIAssistancePoint: (point: AIAssistancePoint) => void;
  generateAIText: (pointId: string) => void;
  toggleAIPointVisibility: (pointId: string) => void;
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
  const [aiAssistancePoints, setAIAssistancePoints] = useState<AIAssistancePoint[]>([]);

  const addStroke = (stroke: Omit<Stroke, 'id'>) => {
    // Generate unique ID for the stroke
    const strokeWithId: Stroke = {
      ...stroke,
      id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setStrokes(prev => {
      const newStrokes = [...prev, strokeWithId];
      setUndoStack(prevUndo => [...prevUndo, prev]);
      return newStrokes;
    });

    // Only add AI assistance point for pen strokes (handwriting)
    if (stroke.tool === 'pen' && stroke.path.length > 5) {
      // Calculate the end position of the stroke
      const lastPoint = stroke.path[stroke.path.length - 1];
      const aiPoint: AIAssistancePoint = {
        id: `ai-${strokeWithId.id}`,
        position: { x: lastPoint.x + 20, y: lastPoint.y - 10 },
        strokeId: strokeWithId.id,
        isVisible: true,
        hasGeneratedText: false
      };
      
      setAIAssistancePoints(prev => [...prev, aiPoint]);
    }
  };

  const addAIAssistancePoint = (point: AIAssistancePoint) => {
    setAIAssistancePoints(prev => [...prev, point]);
  };

  const generateAIText = (pointId: string) => {
    const point = aiAssistancePoints.find(p => p.id === pointId);
    if (!point || point.hasGeneratedText) return;

    // Generate AI assistance text based on current subject
    const aiTexts = {
      math: [
        "x = -b ± √(b²-4ac) / 2a",
        "Remember: PEMDAS order",
        "Check your work!",
        "Area = πr²",
        "Slope = (y₂-y₁)/(x₂-x₁)"
      ],
      science: [
        "H₂O → H₂ + ½O₂",
        "F = ma (Newton's 2nd Law)",
        "Speed = Distance/Time",
        "Energy = mc²",
        "Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂"
      ],
      language: [
        "Subject + Verb + Object",
        "Use commas in series",
        "Check spelling!",
        "Thesis → Body → Conclusion",
        "Show, don't tell"
      ],
      general: [
        "Great work!",
        "Keep going!",
        "Think step by step",
        "Break it down",
        "You're on the right track!"
      ]
    };

    const subjectTexts = aiTexts[currentSubject as keyof typeof aiTexts] || aiTexts.general;
    const randomText = subjectTexts[Math.floor(Math.random() * subjectTexts.length)];
    
    // Create a text stroke on the canvas
    const textStroke: Omit<Stroke, 'id'> = {
      tool: 'ai-text',
      color: '#2563EB', // Blue color for AI text
      width: 2,
      path: [{ x: point.position.x + 30, y: point.position.y + 5 }]
    };

    // Add the AI text as a stroke with metadata
    const strokeWithId: Stroke = {
      ...textStroke,
      id: `ai-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Store the text content in a custom property
    (strokeWithId as any).text = randomText;

    setStrokes(prev => {
      const newStrokes = [...prev, strokeWithId];
      setUndoStack(prevUndo => [...prevUndo, prev]);
      return newStrokes;
    });

    // Mark the AI point as having generated text and hide it
    setAIAssistancePoints(prev => 
      prev.map(p => 
        p.id === pointId ? { ...p, hasGeneratedText: true, isVisible: false } : p
      )
    );
  };

  const toggleAIPointVisibility = (pointId: string) => {
    setAIAssistancePoints(prev => 
      prev.map(point => 
        point.id === pointId ? { ...point, isVisible: !point.isVisible } : point
      )
    );
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

      if (stroke.tool === 'ai-text') {
        // Render AI text
        const text = (stroke as any).text || 'AI Help';
        ctx.font = '16px Arial';
        ctx.fillStyle = stroke.color;
        ctx.fillText(text, stroke.path[0].x, stroke.path[0].y);
      } else {
        // Render normal strokes
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
      }
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
    setSessionTitle,
    aiAssistancePoints,
    addAIAssistancePoint,
    generateAIText,
    toggleAIPointVisibility
  };

  return (
    <DrawingContext.Provider value={value}>
      {children}
    </DrawingContext.Provider>
  );
};