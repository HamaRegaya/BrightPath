import { Position } from '../../types/whiteboard';
import { useDrawing } from '../../context/DrawingContext';
import { 
  getMousePosition, 
  configureDrawingStyle, 
  drawShape, 
  drawStraightLine 
} from '../../utils/whiteboard/drawing';
import { 
  calculateDragOffset, 
  calculateNewPosition, 
  calculateMovementDelta, 
  applyMovementToPath 
} from '../../utils/whiteboard/movement';

/**
 * Hook pour gérer la logique de dessin du whiteboard
 */
export const useDrawingLogic = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  currentPath: Position[],
  setCurrentPath: React.Dispatch<React.SetStateAction<Position[]>>,
  startPos: Position | null,
  setStartPos: React.Dispatch<React.SetStateAction<Position | null>>,
  dragOffset: Position | null,
  setDragOffset: React.Dispatch<React.SetStateAction<Position | null>>,
  isShiftPressed: boolean
) => {
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
    selectedStrokeId,
    setSelectedStrokeId,
    findStrokeAt
  } = useDrawing();

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getMousePosition(e, canvas);
    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    switch (tool) {
      case 'move':
        handleMoveStart(pos);
        break;
      case 'pen':
        handlePenStart(pos, ctx);
        break;
      case 'eraser':
        handleEraserStart(pos, ctx);
        break;
      case 'rectangle':
      case 'circle':
        handleShapeStart(pos);
        break;
      case 'text':
        handleTextStart(pos);
        break;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getMousePosition(e, canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    switch (tool) {
      case 'move':
        handleMove(pos);
        break;
      case 'pen':
        handlePenDraw(pos, ctx);
        break;
      case 'eraser':
        handleEraserDraw(pos, ctx);
        break;
      case 'rectangle':
      case 'circle':
        handleShapeDraw(pos, ctx);
        break;
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    if (tool === 'move') {
      setDragOffset(null);
      return;
    }

    if (currentPath.length > 0) {
      addStroke({
        tool,
        color: strokeColor,
        width: strokeWidth,
        path: currentPath
      });
    }
    
    setCurrentPath([]);
    setStartPos(null);
  };

  // Handlers spécifiques aux outils
  const handleMoveStart = (pos: Position) => {
    const clickedStroke = findStrokeAt(pos.x, pos.y);
    if (clickedStroke) {
      setSelectedStrokeId(clickedStroke.id);
      const startPoint = clickedStroke.path[0];
      setDragOffset(calculateDragOffset(pos, startPoint));
    } else {
      setSelectedStrokeId(null);
      setDragOffset(null);
    }
  };

  const handlePenStart = (pos: Position, ctx: CanvasRenderingContext2D) => {
    setCurrentPath([pos]);
    setStartPos(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleEraserStart = (pos: Position, ctx: CanvasRenderingContext2D) => {
    setCurrentPath([pos]);
    configureDrawingStyle(ctx, 'eraser', strokeColor, strokeWidth);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleShapeStart = (pos: Position) => {
    setStartPos(pos);
    setCurrentPath([pos]);
  };

  const handleTextStart = (pos: Position) => {
    const text = prompt('Enter text:');
    if (text) {
      const textStroke = {
        tool: 'text',
        color: strokeColor,
        width: strokeWidth,
        path: [pos]
      };
      
      (textStroke as any).text = text;
      addStroke(textStroke);
    }
    setIsDrawing(false);
  };

  const handleMove = (pos: Position) => {
    if (selectedStrokeId && dragOffset) {
      const selectedStroke = strokes.find(s => s.id === selectedStrokeId);
      if (selectedStroke) {
        const newStartPos = calculateNewPosition(pos, dragOffset);
        const oldStartPos = selectedStroke.path[0];
        const delta = calculateMovementDelta(oldStartPos, newStartPos);
        const newPath = applyMovementToPath(selectedStroke.path, delta);
        
        updateStroke(selectedStrokeId, { path: newPath });
      }
    }
  };

  const handlePenDraw = (pos: Position, ctx: CanvasRenderingContext2D) => {
    if (isShiftPressed && startPos) {
      // Ligne droite avec Shift
      redrawCanvas(canvasRef.current!);
      drawStraightLine(ctx, startPos, pos, strokeColor, strokeWidth);
      setCurrentPath([startPos, pos]);
    } else {
      // Dessin à main levée
      configureDrawingStyle(ctx, 'pen', strokeColor, strokeWidth);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setCurrentPath(prev => [...prev, pos]);
    }
  };

  const handleEraserDraw = (pos: Position, ctx: CanvasRenderingContext2D) => {
    configureDrawingStyle(ctx, 'eraser', strokeColor, strokeWidth);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setCurrentPath(prev => [...prev, pos]);
  };

  const handleShapeDraw = (pos: Position, ctx: CanvasRenderingContext2D) => {
    if (startPos) {
      redrawCanvas(canvasRef.current!);
      drawShape(ctx, tool as 'rectangle' | 'circle', startPos, pos, strokeColor, strokeWidth);
      setCurrentPath([startPos, pos]);
    }
  };

  return {
    startDrawing,
    draw,
    stopDrawing
  };
};
