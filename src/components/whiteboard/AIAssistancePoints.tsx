import React from 'react';
import { Sparkles } from 'lucide-react';
import { AIAssistancePoint } from '../../context/DrawingContext';

interface AIAssistancePointsProps {
  points: AIAssistancePoint[];
  onSparkleClick: (pointId: string) => void;
}

/**
 * Composant pour afficher les points d'assistance IA (sparkles)
 */
export const AIAssistancePoints: React.FC<AIAssistancePointsProps> = ({
  points,
  onSparkleClick
}) => {
  return (
    <>
      {points.filter(point => point.isVisible).map((point) => (
        <button
          key={point.id}
          onClick={() => onSparkleClick(point.id)}
          className="absolute z-10 p-1 bg-yellow-400 text-yellow-800 rounded-full shadow-lg hover:bg-yellow-500 transition-all transform hover:scale-110 animate-pulse"
          style={{
            left: `${point.position.x}px`,
            top: `${point.position.y}px`,
          }}
          title="Click for AI assistance"
        >
          <Sparkles size={16} />
        </button>
      ))}
    </>
  );
};
