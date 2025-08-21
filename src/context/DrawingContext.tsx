import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';

export interface Stroke {
  tool: string;
  color: string;
  width: number;
  path: { x: number; y: number }[];
  id: string;
  // Optional fields for image strokes
  imageSrc?: string;
  imgWidth?: number;
  imgHeight?: number;
}

export interface AIAssistancePoint {
  id: string;
  position: { x: number; y: number };
  strokeId: string;
  isVisible: boolean;
  isLoading: boolean;
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
  updateStroke: (id: string, updates: Partial<Stroke>) => void;
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
  generateAIText: (pointId: string, canvas?: HTMLCanvasElement) => void;
  removeAIText: (pointId: string) => void;
  toggleAIPointVisibility: (pointId: string) => void;
  selectedStrokeId: string | null;
  setSelectedStrokeId: (id: string | null) => void;
  findStrokeAt: (x: number, y: number) => Stroke | null;
  exportCanvas: (canvas: HTMLCanvasElement) => void;
  getCanvasImage: (canvas: HTMLCanvasElement) => string;
  // Page management methods
  loadPageData: (strokes: Stroke[], aiPoints: AIAssistancePoint[]) => void;
  getCurrentPageData: () => { strokes: Stroke[]; aiPoints: AIAssistancePoint[] };
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
  const [sparkleTimeout, setSparkleTimeout] = useState<number | null>(null);
  const [typingIntervals, setTypingIntervals] = useState<Map<string, number>>(new Map());
  const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(null);
  // Cache loaded images by stroke id to avoid reloading on each redraw
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Deselect shape when tool changes (unless switching to move tool)
  useEffect(() => {
    if (tool !== 'move' && selectedStrokeId) {
      setSelectedStrokeId(null);
    }
  }, [tool, selectedStrokeId]);

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
      // Set up delayed sparkle appearance
      const timeoutId = setTimeout(() => {
        const lastPoint = stroke.path[stroke.path.length - 1];
        const aiPoint: AIAssistancePoint = {
          id: `ai-${strokeWithId.id}`,
          position: { x: lastPoint.x + 20, y: lastPoint.y - 10 },
          strokeId: strokeWithId.id,
          isVisible: true,
          isLoading: false,
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

  const updateStroke = (id: string, updates: Partial<Stroke>) => {
    setStrokes(prev => prev.map(stroke => 
      stroke.id === id ? { ...stroke, ...updates } : stroke
    ));
  };

  const findStrokeAt = (x: number, y: number): Stroke | null => {
    // Check strokes in reverse order (most recent first)
    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      
      if (stroke.tool === 'rectangle') {
        if (stroke.path.length >= 2) {
          const startPoint = stroke.path[0];
          const endPoint = stroke.path[stroke.path.length - 1];
          const minX = Math.min(startPoint.x, endPoint.x);
          const maxX = Math.max(startPoint.x, endPoint.x);
          const minY = Math.min(startPoint.y, endPoint.y);
          const maxY = Math.max(startPoint.y, endPoint.y);
          
          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return stroke;
          }
        }
      } else if (stroke.tool === 'circle') {
        if (stroke.path.length >= 2) {
          const startPoint = stroke.path[0];
          const endPoint = stroke.path[stroke.path.length - 1];
          
          // Calculate circle center and radius using the same logic as rendering
          const dx = endPoint.x - startPoint.x;
          const dy = endPoint.y - startPoint.y;
          const centerX = startPoint.x + dx / 2;
          const centerY = startPoint.y + dy / 2;
          const radius = Math.sqrt(dx * dx + dy * dy) / 2;
          
          // Check if point is within circle
          const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          if (distFromCenter <= radius + 10) { // Add 10px tolerance
            return stroke;
          }
        }
  } else if (stroke.tool === 'text' || stroke.tool === 'ai-text') {
        // Simple bounding box check for text
        const textPoint = stroke.path[0];
        const text = (stroke as any).text || '';
        const fontSize = stroke.tool === 'ai-text' ? 16 : stroke.width * 4;
        const textWidth = text.length * fontSize * 0.6; // Rough text width estimation
        
        if (x >= textPoint.x && x <= textPoint.x + textWidth && 
            y >= textPoint.y - fontSize && y <= textPoint.y) {
          return stroke;
        }
      } else if (stroke.tool === 'image') {
        const topLeft = stroke.path[0];
        const w = (stroke as any).imgWidth || 0;
        const h = (stroke as any).imgHeight || 0;
        if (
          x >= topLeft.x && x <= topLeft.x + w &&
          y >= topLeft.y && y <= topLeft.y + h
        ) {
          return stroke;
        }
      }
    }
    
    return null;
  };

  const exportCanvas = (canvas: HTMLCanvasElement) => {
    try {
      // Create a temporary canvas with white background
      const exportCanvas = document.createElement('canvas');
      const exportCtx = exportCanvas.getContext('2d');
      
      if (!exportCtx) return;
      
      // Set the same dimensions as the original canvas
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      
      // Fill with white background
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw the original canvas content on top
      exportCtx.drawImage(canvas, 0, 0);
      
      // Convert to blob and download
      exportCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${sessionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Échec de l\'export. Veuillez réessayer.');
    }
  };

  const getCanvasImage = (canvas: HTMLCanvasElement): string => {
    try {
      // Create a temporary canvas with white background for better AI analysis
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return '';
      
      // Set the same dimensions as the original canvas
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Fill with white background
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the original canvas content on top
      tempCtx.drawImage(canvas, 0, 0);
      
      // Return as base64 data URL
      return tempCanvas.toDataURL('image/png');
    } catch (error) {
      console.error('Canvas image capture failed:', error);
      return '';
    }
  };

  const addAIAssistancePoint = (point: AIAssistancePoint) => {
    setAIAssistancePoints(prev => [...prev, point]);
  };

  const generateAIText = async (pointId: string, canvas?: HTMLCanvasElement) => {
    const point = aiAssistancePoints.find(p => p.id === pointId);
    if (!point || point.hasGeneratedText) return;

    // Mark as loading and hide sparkle to prevent re-clicks
    setAIAssistancePoints(prev => 
      prev.map(p => p.id === pointId ? { ...p, isLoading: true, isVisible: false } : p)
    );

    // Import the AI analysis service
    const { analyzeBoard, analyzeBoardWithImage } = await import('../services/aiAnalysisService');
    
    let aiText: string;
    
  try {
      // Try image analysis first if canvas is available
      if (canvas && strokes.length > 3) {
        const imageDataUrl = getCanvasImage(canvas);
        if (imageDataUrl) {
          console.log('Using AI image analysis for enhanced context');
          aiText = await analyzeBoardWithImage(imageDataUrl, currentSubject);
        } else {
          // Fall back to text analysis
          aiText = await analyzeBoard(strokes, currentSubject, sessionTitle);
        }
      } else {
        // Use text-based analysis for fewer strokes or no canvas
        aiText = await analyzeBoard(strokes, currentSubject, sessionTitle);
      }
    } catch (error) {
      console.error('Dynamic AI analysis failed, using fallback:', error);
      
      // Fallback to context-aware static responses
      const fallbackTexts = {
        math: [
          "Break it down step by step!",
          "Check your work here.",
          "What's next?",
          "Good start! Keep going.",
          "Try a diagram!"
        ],
        science: [
          "What patterns do you see?",
          "Test your idea here.",
          "Observe and record.",
          "What causes this?",
          "Connect to real life!"
        ],
        language: [
          "Expand your main idea.",
          "Add details here.",
          "Consider your audience.",
          "Organize clearly.",
          "Show, don't tell!"
        ],
        general: [
          "You're on track!",
          "Keep building.",
          "What's next?",
          "Trust your process!",
          "Great progress!"
        ]
      };
      
      const subjectTexts = fallbackTexts[currentSubject as keyof typeof fallbackTexts] || fallbackTexts.general;
      aiText = subjectTexts[Math.floor(Math.random() * subjectTexts.length)];
    }

  const randomText = aiText;
    
  // Switch from loading to typing
    setAIAssistancePoints(prev => 
      prev.map(p => 
        p.id === pointId ? { 
      ...p,
      isLoading: false,
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

  // Show the sparkle again and reset typing/loading state
    setAIAssistancePoints(prev => 
      prev.map(p => 
        p.id === pointId ? { 
          ...p, 
          hasGeneratedText: false, 
      isVisible: true, 
      isLoading: false,
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
        // AI text is now rendered as React components, so we skip canvas rendering
        return;
      } else if (stroke.tool === 'image') {
        // Draw image strokes
        const imgId = stroke.id;
        const cached = imageCacheRef.current.get(imgId);
        const drawIt = (img: HTMLImageElement) => {
          const topLeft = stroke.path[0];
          const w = (stroke as any).imgWidth || img.width;
          const h = (stroke as any).imgHeight || img.height;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(img, topLeft.x, topLeft.y, w, h);
        };
        if (cached) {
          drawIt(cached);
        } else if ((stroke as any).imageSrc) {
          const img = new Image();
          img.onload = () => {
            imageCacheRef.current.set(imgId, img);
            drawIt(img);
            // Trigger a re-render pass to ensure proper layering after load
            requestAnimationFrame(() => redrawCanvas(canvas));
          };
          img.src = (stroke as any).imageSrc as string;
        }
        return;
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

    // Draw selection outline for selected stroke
    if (selectedStrokeId) {
      const selectedStroke = strokes.find(s => s.id === selectedStrokeId);
      if (selectedStroke) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6'; // Blue selection color
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line
        
        if (selectedStroke.tool === 'rectangle' && selectedStroke.path.length >= 2) {
          const startPoint = selectedStroke.path[0];
          const endPoint = selectedStroke.path[selectedStroke.path.length - 1];
          const width = endPoint.x - startPoint.x;
          const height = endPoint.y - startPoint.y;
          ctx.strokeRect(startPoint.x - 5, startPoint.y - 5, width + 10, height + 10);
        } else if (selectedStroke.tool === 'circle' && selectedStroke.path.length >= 2) {
          const startPoint = selectedStroke.path[0];
          const endPoint = selectedStroke.path[selectedStroke.path.length - 1];
          const dx = endPoint.x - startPoint.x;
          const dy = endPoint.y - startPoint.y;
          const centerX = startPoint.x + dx / 2;
          const centerY = startPoint.y + dy / 2;
          const radius = Math.sqrt(dx * dx + dy * dy) / 2;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (selectedStroke.tool === 'image') {
          const topLeft = selectedStroke.path[0];
          const w = (selectedStroke as any).imgWidth || 0;
          const h = (selectedStroke as any).imgHeight || 0;
          // Outline
          ctx.strokeRect(topLeft.x - 5, topLeft.y - 5, w + 10, h + 10);
          // Resize handles (8 points)
          const handleSize = 8;
          const half = handleSize / 2;
          const points = [
            { x: topLeft.x, y: topLeft.y },                       // nw
            { x: topLeft.x + w / 2, y: topLeft.y },               // n
            { x: topLeft.x + w, y: topLeft.y },                   // ne
            { x: topLeft.x + w, y: topLeft.y + h / 2 },           // e
            { x: topLeft.x + w, y: topLeft.y + h },               // se
            { x: topLeft.x + w / 2, y: topLeft.y + h },           // s
            { x: topLeft.x, y: topLeft.y + h },                   // sw
            { x: topLeft.x, y: topLeft.y + h / 2 }                // w
          ];
          ctx.setLineDash([]);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#3b82f6';
          points.forEach(p => {
            ctx.fillRect(p.x - half, p.y - half, handleSize, handleSize);
            ctx.strokeRect(p.x - half, p.y - half, handleSize, handleSize);
          });
        }
        
        ctx.restore();
      }
    }
  }, [strokes, selectedStrokeId]);

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

  // Page management methods
  const loadPageData = useCallback((pageStrokes: Stroke[], pageAiPoints: AIAssistancePoint[]) => {
    setStrokes(pageStrokes);
    setAIAssistancePoints(pageAiPoints);
    setSelectedStrokeId(null); // Clear selection when switching pages
  }, []);

  const getCurrentPageData = useCallback(() => {
    return {
      strokes,
      aiPoints: aiAssistancePoints
    };
  }, [strokes, aiAssistancePoints]);

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
    updateStroke,
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
    toggleAIPointVisibility,
    selectedStrokeId,
    setSelectedStrokeId,
    findStrokeAt,
    exportCanvas,
    getCanvasImage,
    loadPageData,
    getCurrentPageData
  };

  return (
    <DrawingContext.Provider value={value}>
      {children}
    </DrawingContext.Provider>
  );
};