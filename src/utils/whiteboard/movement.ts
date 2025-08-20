import { Position } from '../../types/whiteboard';

/**
 * Calcule la nouvelle position d'un objet déplacé
 */
export const calculateNewPosition = (
  currentPos: Position,
  dragOffset: Position
): Position => ({
  x: currentPos.x - dragOffset.x,
  y: currentPos.y - dragOffset.y
});

/**
 * Calcule le delta de mouvement entre deux positions
 */
export const calculateMovementDelta = (
  oldPos: Position,
  newPos: Position
): Position => ({
  x: newPos.x - oldPos.x,
  y: newPos.y - oldPos.y
});

/**
 * Applique un delta de mouvement à un ensemble de points
 */
export const applyMovementToPath = (
  path: Position[],
  delta: Position
): Position[] => 
  path.map(point => ({
    x: point.x + delta.x,
    y: point.y + delta.y
  }));

/**
 * Calcule l'offset de glissement depuis un point de clic vers l'origine d'une forme
 */
export const calculateDragOffset = (
  clickPos: Position,
  shapeOrigin: Position
): Position => ({
  x: clickPos.x - shapeOrigin.x,
  y: clickPos.y - shapeOrigin.y
});
