export interface Position {
  x: number;
  y: number;
}

export interface AITextElement {
  id: string;
  position: Position;
  aiPointId: string;
  text: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface DrawingState {
  currentPath: Position[];
  startPos: Position | null;
  dragOffset: Position | null;
  isShiftPressed: boolean;
  aiTextElements: AITextElement[];
}

export type DrawingTool = 'pen' | 'eraser' | 'move' | 'rectangle' | 'circle' | 'text' | 'ai-text';

export interface CanvasConfig {
  eraserMultiplier: number;
  lineHeight: number;
  fontSize: string;
  fontFamily: string;
}
