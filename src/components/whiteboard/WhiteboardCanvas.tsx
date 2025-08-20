import React from 'react';

interface WhiteboardCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tool: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Composant canvas principal pour le whiteboard
 */
export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  canvasRef,
  tool,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const getCursorClass = (tool: string) => {
    switch (tool) {
      case 'eraser': return 'cursor-eraser';
      case 'pen': return 'cursor-crosshair';
      case 'move': return 'cursor-move';
      case 'rectangle':
      case 'circle': return 'cursor-crosshair';
      case 'text': return 'cursor-text';
      default: return 'cursor-default';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${getCursorClass(tool)}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
};
