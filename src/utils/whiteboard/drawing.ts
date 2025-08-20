import { Position } from '../../types/whiteboard';

/**
 * Extrait la position de la souris/tactile relative au canvas
 */
export const getMousePosition = (
  e: React.MouseEvent | React.TouchEvent,
  canvas: HTMLCanvasElement
): Position => {
  const rect = canvas.getBoundingClientRect();
  
  if ('touches' in e) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
};

/**
 * Calcule les dimensions d'un texte sur le canvas
 */
export const calculateTextDimensions = (
  text: string,
  maxWidth: number,
  ctx: CanvasRenderingContext2D,
  fontSize = '16px',
  fontFamily = '"Urbanist", sans-serif',
  lineHeight = 20
): { width: number; height: number } => {
  ctx.font = `500 ${fontSize} ${fontFamily}`;
  
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  let maxLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
      line = words[i] + ' ';
      lines++;
    } else {
      line = testLine;
    }
  }
  
  if (line.trim()) {
    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
    lines++;
  }

  return {
    width: Math.min(maxLineWidth, maxWidth),
    height: lines * lineHeight
  };
};

/**
 * Configure le style de dessin pour un outil donné
 */
export const configureDrawingStyle = (
  ctx: CanvasRenderingContext2D,
  tool: string,
  strokeColor: string,
  strokeWidth: number
): void => {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = tool === 'eraser' ? strokeWidth * 4 : strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  if (tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }
};

/**
 * Dessine une forme géométrique (rectangle ou cercle)
 */
export const drawShape = (
  ctx: CanvasRenderingContext2D,
  tool: 'rectangle' | 'circle',
  startPos: Position,
  currentPos: Position,
  strokeColor: string,
  strokeWidth: number
): void => {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.setLineDash([]);
  
  if (tool === 'rectangle') {
    const width = currentPos.x - startPos.x;
    const height = currentPos.y - startPos.y;
    ctx.strokeRect(startPos.x, startPos.y, width, height);
  } else if (tool === 'circle') {
    // Calcule le rayon depuis le point de départ vers la position actuelle
    const radius = Math.sqrt(
      Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)
    );
    
    // Calcule le centre du cercle
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const centerX = startPos.x + dx / 2;
    const centerY = startPos.y + dy / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
};

/**
 * Dessine une ligne droite
 */
export const drawStraightLine = (
  ctx: CanvasRenderingContext2D,
  startPos: Position,
  endPos: Position,
  strokeColor: string,
  strokeWidth: number
): void => {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(startPos.x, startPos.y);
  ctx.lineTo(endPos.x, endPos.y);
  ctx.stroke();
};
