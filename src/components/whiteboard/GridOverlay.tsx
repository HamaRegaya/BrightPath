import React from 'react';

/**
 * Composant pour la grille de guidage en arrière-plan
 */
export const GridOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-5">
      <svg className="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};
