import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

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
  isTyping: boolean;
  fullText: string;
  currentText: string;
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
  removeAIText: (pointId: string) => void;
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
  const [lastStrokeTime, setLastStrokeTime] = useState<number>(0);
  const [sparkleTimeout, setSparkleTimeout] = useState<number | null>(null);
  const [typingIntervals, setTypingIntervals] = useState<Map<string, number>>(new Map());

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

    // Clear any existing sparkle timeout
    if (sparkleTimeout) {
      clearTimeout(sparkleTimeout);
    }

    // Remove all existing AI assistance points (keep only the latest)
    setAIAssistancePoints([]);

    // Only set up delayed sparkle for pen strokes (handwriting)
    if (stroke.tool === 'pen' && stroke.path.length > 5) {
      // Update last stroke time
      setLastStrokeTime(Date.now());
      
      // Set up delayed sparkle appearance
      const timeoutId = setTimeout(() => {
        const lastPoint = stroke.path[stroke.path.length - 1];
        const aiPoint: AIAssistancePoint = {
          id: `ai-${strokeWithId.id}`,
          position: { x: lastPoint.x + 20, y: lastPoint.y - 10 },
          strokeId: strokeWithId.id,
          isVisible: true,
          hasGeneratedText: false,
          isTyping: false,
          fullText: '',
          currentText: ''
        };
        
        setAIAssistancePoints([aiPoint]); // Only keep the latest sparkle
      }, 3000); // 3 second delay

      setSparkleTimeout(timeoutId);
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
    
    // Hide the sparkle and start typing effect
    setAIAssistancePoints(prev => 
      prev.map(p => 
        p.id === pointId ? { 
          ...p, 
          isVisible: false, 
          isTyping: true, 
          fullText: randomText,
          currentText: ''
        } : p
      )
    );

    // Create initial AI text stroke (empty)
    const textStroke: Omit<Stroke, 'id'> = {
      tool: 'ai-text',
      color: '#2563EB',
      width: 2,
      path: [{ x: point.position.x + 30, y: point.position.y + 5 }]
    };

    const strokeWithId: Stroke = {
      ...textStroke,
      id: `ai-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    (strokeWithId as any).text = '';
    (strokeWithId as any).aiPointId = pointId;
    (strokeWithId as any).isTyping = true;

    setStrokes(prev => {
      const newStrokes = [...prev, strokeWithId];
      setUndoStack(prevUndo => [...prevUndo, prev]);
      return newStrokes;
    });

    // Start typing animation
    let currentIndex = 0;
    const typingSpeed = 100; // milliseconds per character

    const typeText = () => {
      if (currentIndex <= randomText.length) {
        const currentText = randomText.substring(0, currentIndex);
        
        // Update the stroke with current text
        setStrokes(prev => 
          prev.map(stroke => {
            if (stroke.id === strokeWithId.id) {
              (stroke as any).text = currentText;
            }
            return stroke;
          })
        );

        // Update AI point current text
        setAIAssistancePoints(prev => 
          prev.map(p => 
            p.id === pointId ? { ...p, currentText } : p
          )
        );

        currentIndex++;
        
        if (currentIndex <= randomText.length) {
          const timeoutId = setTimeout(typeText, typingSpeed);
          setTypingIntervals(prev => {
            const newMap = new Map(prev);
            newMap.set(pointId, timeoutId);
            return newMap;
          });
        } else {
          // Typing finished
          setAIAssistancePoints(prev => 
            prev.map(p => 
              p.id === pointId ? { 
                ...p, 
                isTyping: false, 
                hasGeneratedText: true,
                currentText: randomText
              } : p
            )
          );

          setStrokes(prev => 
            prev.map(stroke => {
              if (stroke.id === strokeWithId.id) {
                (stroke as any).isTyping = false;
              }
              return stroke;
            })
          );

          // Remove from typing intervals
          setTypingIntervals(prev => {
            const newMap = new Map(prev);
            newMap.delete(pointId);
            return newMap;
          });
        }
      }
    };

    // Start typing with a small delay
    setTimeout(typeText, 300);
  };

  const removeAIText = (pointId: string) => {
    // Clear any active typing interval
    const intervalId = typingIntervals.get(pointId);
    if (intervalId) {
      clearTimeout(intervalId);
      setTypingIntervals(prev => {
        const newMap = new Map(prev);
        newMap.delete(pointId);
        return newMap;
      });
    }

    // Find and remove the AI text stroke associated with this point
    setStrokes(prev => {
      const filteredStrokes = prev.filter(stroke => {
        return !(stroke.tool === 'ai-text' && (stroke as any).aiPointId === pointId);
      });
      
      if (filteredStrokes.length !== prev.length) {
        setUndoStack(prevUndo => [...prevUndo, prev]);
      }
      
      return filteredStrokes;
    });

    // Show the sparkle again and reset typing state
    setAIAssistancePoints(prev => 
      prev.map(p => 
        p.id === pointId ? { 
          ...p, 
          hasGeneratedText: false, 
          isVisible: true, 
          isTyping: false,
          fullText: '',
          currentText: ''
        } : p
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
      
      // Clear sparkles and typing intervals when undoing
      if (sparkleTimeout) {
        clearTimeout(sparkleTimeout);
        setSparkleTimeout(null);
      }
      
      // Clear all typing intervals
      typingIntervals.forEach((intervalId) => {
        clearTimeout(intervalId);
      });
      setTypingIntervals(new Map());
      
      setAIAssistancePoints([]);
    }
  };

  const redo = () => {
    // For now, simplified redo (would need a proper redo stack in production)
  };

  const clear = () => {
    if (strokes.length > 0) {
      setUndoStack(prev => [...prev, strokes]);
      setStrokes([]);
      
      // Clear sparkles and typing intervals when clearing canvas
      if (sparkleTimeout) {
        clearTimeout(sparkleTimeout);
        setSparkleTimeout(null);
      }
      
      // Clear all typing intervals
      typingIntervals.forEach((intervalId) => {
        clearTimeout(intervalId);
      });
      setTypingIntervals(new Map());
      
      setAIAssistancePoints([]);
    }
  };

  const redrawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      if (stroke.path.length === 0) return;

      if (stroke.tool === 'ai-text') {
        // Render AI text with Outfit font
        const text = (stroke as any).text || '';
        
        ctx.font = '500 16px "Outfit", sans-serif';
        ctx.fillStyle = stroke.color;
        ctx.fillText(text, stroke.path[0].x, stroke.path[0].y);
      } else if (stroke.tool === 'text') {
        // Render regular text
        const text = (stroke as any).text || '';
        
        ctx.font = `${stroke.width * 4}px Arial`;
        ctx.fillStyle = stroke.color;
        ctx.fillText(text, stroke.path[0].x, stroke.path[0].y);
      } else if (stroke.tool === 'eraser') {
        // Render eraser strokes as continuous lines
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.lineWidth = stroke.width * 4; // Make eraser thicker
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(stroke.path[0].x, stroke.path[0].y);
        
        for (let i = 1; i < stroke.path.length; i++) {
          ctx.lineTo(stroke.path[i].x, stroke.path[i].y);
        }
        
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (stroke.tool === 'rectangle') {
        // Render rectangle
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        
        if (stroke.path.length >= 2) {
          const startPoint = stroke.path[0];
          const endPoint = stroke.path[stroke.path.length - 1];
          const width = endPoint.x - startPoint.x;
          const height = endPoint.y - startPoint.y;
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        }
      } else if (stroke.tool === 'circle') {
        // Render circle with the same logic as in Whiteboard.tsx
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        
        if (stroke.path.length >= 2) {
          const startPoint = stroke.path[0];
          const endPoint = stroke.path[stroke.path.length - 1];
          
          // Calculate radius from start point to end position
          const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
          
          // Calculate direction vector from start to end position
          const dx = endPoint.x - startPoint.x;
          const dy = endPoint.y - startPoint.y;
          
          // Calculate circle center: start point + half the distance vector
          const centerX = startPoint.x + dx / 2;
          const centerY = startPoint.y + dy / 2;
          
          // Draw circle with center between start and end position
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
          ctx.stroke();
        }
      } else {
        // Render normal pen strokes
        ctx.globalCompositeOperation = 'source-over';
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (sparkleTimeout) {
        clearTimeout(sparkleTimeout);
      }
      // Clear all typing intervals
      typingIntervals.forEach((intervalId) => {
        clearTimeout(intervalId);
      });
    };
  }, [sparkleTimeout, typingIntervals]);

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
    removeAIText,
    toggleAIPointVisibility
  };

  return (
    <DrawingContext.Provider value={value}>
      {children}
    </DrawingContext.Provider>
  );
};