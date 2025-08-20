import React from 'react';
import { X } from 'lucide-react';
import { AITextElement } from '../../types/whiteboard';
import MathText from '../MathText';

interface AITextDisplayProps {
  aiTextElements: AITextElement[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onRemoveAIText: (aiPointId: string) => void;
}

/**
 * Composant pour afficher les textes IA avec rendu mathématique
 */
export const AITextDisplay: React.FC<AITextDisplayProps> = ({
  aiTextElements,
  canvasRef,
  onRemoveAIText
}) => {
  return (
    <>
      {aiTextElements.map((aiText) => (
        <div 
          key={`ai-text-container-${aiText.id}`} 
          className="absolute" 
          style={{
            left: `${aiText.position.x}px`,
            top: `${aiText.position.y}px`,
          }}
        >
          <MathText
            text={aiText.text}
            position={{ x: 0, y: 0 }} // Position relative au conteneur
            maxWidth={Math.min(400, canvasRef.current ? canvasRef.current.width - aiText.position.x - 20 : 400)}
          />
          {/* Bouton de suppression positionné dans le coin supérieur droit */}
          <button
            onClick={() => onRemoveAIText(aiText.aiPointId)}
            className="absolute z-30 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110 border-2 border-white"
            style={{
              right: '-8px',
              top: '-8px',
            }}
            title="Remove AI suggestion"
          >
            <X size={10} />
          </button>
        </div>
      ))}
    </>
  );
};
