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

  // Helpers for image handle hover and cursor mapping
  const getImageHandleAt = (stroke: any, pos: Position, handleSize = 10): null | string => {
    if (!stroke || stroke.tool !== 'image' || !stroke.path?.length) return null;
    const topLeft = stroke.path[0];
    const w = stroke.imgWidth || 0;
    const h = stroke.imgHeight || 0;
    const handles = [
      { k: 'nw', x: topLeft.x, y: topLeft.y },
      { k: 'n',  x: topLeft.x + w / 2, y: topLeft.y },
      { k: 'ne', x: topLeft.x + w, y: topLeft.y },
      { k: 'e',  x: topLeft.x + w, y: topLeft.y + h / 2 },
      { k: 'se', x: topLeft.x + w, y: topLeft.y + h },
      { k: 's',  x: topLeft.x + w / 2, y: topLeft.y + h },
      { k: 'sw', x: topLeft.x, y: topLeft.y + h },
      { k: 'w',  x: topLeft.x, y: topLeft.y + h / 2 }
    ];
    const tol = handleSize;
    const hit = handles.find(h => Math.abs(pos.x - h.x) <= tol && Math.abs(pos.y - h.y) <= tol);
    return hit ? hit.k : null;
  };

  const handleToCursor = (handle: string): string => {
    switch (handle) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'move';
    }
  };

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getMousePosition(e, canvas);
    // Hover cursor feedback for move tool
    if (tool === 'move') {
      let hoverCursor = 'move';
      let imageStroke: any = null;
      const selected = selectedStrokeId ? strokes.find(s => s.id === selectedStrokeId) : null;
      if (selected && selected.tool === 'image') imageStroke = selected as any;
      if (!imageStroke) {
        const hit = findStrokeAt(pos.x, pos.y);
        if (hit && hit.tool === 'image') imageStroke = hit as any;
      }
      if (imageStroke) {
        const handle = getImageHandleAt(imageStroke, pos);
        if (handle) {
          hoverCursor = handleToCursor(handle);
        } else {
          const tl = imageStroke.path[0];
          const w = imageStroke.imgWidth || 0;
          const h = imageStroke.imgHeight || 0;
          if (pos.x >= tl.x && pos.x <= tl.x + w && pos.y >= tl.y && pos.y <= tl.y + h) {
            hoverCursor = isDrawing ? 'grabbing' : 'grab';
          }
        }
      }
      (canvas.style as any).cursor = hoverCursor;
    }

    if (!isDrawing) return;
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
      // keep a neutral move cursor after finishing
      const canvas = canvasRef.current;
      if (canvas) (canvas.style as any).cursor = 'move';
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
      // For images, detect if a resize handle is clicked
      if (clickedStroke.tool === 'image') {
        const topLeft = clickedStroke.path[0];
        const w = (clickedStroke as any).imgWidth || 0;
        const h = (clickedStroke as any).imgHeight || 0;
        const handleSize = 10;
        const handles = [
          { k: 'nw', x: topLeft.x, y: topLeft.y },
          { k: 'n',  x: topLeft.x + w / 2, y: topLeft.y },
          { k: 'ne', x: topLeft.x + w, y: topLeft.y },
          { k: 'e',  x: topLeft.x + w, y: topLeft.y + h / 2 },
          { k: 'se', x: topLeft.x + w, y: topLeft.y + h },
          { k: 's',  x: topLeft.x + w / 2, y: topLeft.y + h },
          { k: 'sw', x: topLeft.x, y: topLeft.y + h },
          { k: 'w',  x: topLeft.x, y: topLeft.y + h / 2 }
        ];
        const hit = handles.find(h => Math.abs(pos.x - h.x) <= handleSize && Math.abs(pos.y - h.y) <= handleSize);
        if (hit) {
          // Store handle key in dragOffset.x using NaN packing is messy; instead, extend via any
          (setDragOffset as any)({ x: pos.x - topLeft.x, y: pos.y - topLeft.y, handle: hit.k, base: { x: topLeft.x, y: topLeft.y, w, h, startX: pos.x, startY: pos.y } });
          return;
        }
      }
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
        // If resizing an image
        const anyOffset: any = dragOffset as any;
        if (selectedStroke.tool === 'image' && anyOffset.handle) {
          const base = anyOffset.base;
          let newW = base.w;
          let newH = base.h;
          let newX = base.x;
          let newY = base.y;
          const dx = pos.x - base.startX;
          const dy = pos.y - base.startY;
          switch (anyOffset.handle) {
            case 'se': newW = Math.max(10, base.w + dx); newH = Math.max(10, base.h + dy); break;
            case 'e':  newW = Math.max(10, base.w + dx); break;
            case 's':  newH = Math.max(10, base.h + dy); break;
            case 'nw': newX = base.x + dx; newY = base.y + dy; newW = Math.max(10, base.w - dx); newH = Math.max(10, base.h - dy); break;
            case 'ne': newY = base.y + dy; newW = Math.max(10, base.w + dx); newH = Math.max(10, base.h - dy); break;
            case 'sw': newX = base.x + dx; newW = Math.max(10, base.w - dx); newH = Math.max(10, base.h + dy); break;
            case 'n':  newY = base.y + dy; newH = Math.max(10, base.h - dy); break;
            case 'w':  newX = base.x + dx; newW = Math.max(10, base.w - dx); break;
          }
          // Keep aspect ratio if Shift is held
          if ((window as any).__shiftKey) {
            const ratio = base.w / base.h || 1;
            if (newW / newH > ratio) newW = Math.round(newH * ratio); else newH = Math.round(newW / ratio);
          }
          updateStroke(selectedStrokeId, { path: [{ x: newX, y: newY }], imgWidth: newW as any, imgHeight: newH as any } as any);
          return;
        }
        // Otherwise, drag the shape normally
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
