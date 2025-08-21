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

export interface WhiteboardPage {
  id: string;
  name: string;
  strokes: any[]; // Sera typé avec le type Stroke du contexte
  aiAssistancePoints: any[]; // Sera typé avec le type AIAssistancePoint du contexte
  createdAt: Date;
  updatedAt: Date;
}

export interface PageNavigationProps {
  pages: WhiteboardPage[];
  currentPageId: string;
  onPageChange: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, newName: string) => void;
}

export type DrawingTool = 'pen' | 'eraser' | 'move' | 'rectangle' | 'circle' | 'text' | 'ai-text';

export interface CanvasConfig {
  eraserMultiplier: number;
  lineHeight: number;
  fontSize: string;
  fontFamily: string;
}
