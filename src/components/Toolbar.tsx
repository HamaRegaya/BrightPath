import React from 'react';
import { Pen, Eraser, Square, Circle, Type, Undo, Redo, Trash2, Download, Move, Image as ImageIcon } from 'lucide-react';
import { useDrawing } from '../context/DrawingContext';

const Toolbar: React.FC = () => {
  const {
    tool,
    setTool,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    exportCanvas
  } = useDrawing();

  const drawingTools = [
    { id: 'pen', icon: Pen, name: 'Pen', category: 'drawing' },
    { id: 'eraser', icon: Eraser, name: 'Eraser', category: 'drawing' },
    { id: 'move', icon: Move, name: 'Move', category: 'drawing' }
  ];

  const shapeTools = [
    { id: 'rectangle', icon: Square, name: 'Rectangle', category: 'shape' },
    { id: 'circle', icon: Circle, name: 'Circle', category: 'shape' },
    { id: 'text', icon: Type, name: 'Text', category: 'shape' }
  ];

  const colors = [
    { color: '#000000', name: 'Black' },
    { color: '#2563EB', name: 'Blue' },
    { color: '#DC2626', name: 'Red' },
    { color: '#16A34A', name: 'Green' },
    { color: '#CA8A04', name: 'Yellow' },
    { color: '#9333EA', name: 'Purple' },
    { color: '#C2410C', name: 'Orange' },
    { color: '#0891B2', name: 'Cyan' }
  ];

  const strokeWidths = [
    { width: 2, name: 'Extra Fine' },
    { width: 4, name: 'Fine' },
    { width: 6, name: 'Medium' },
    { width: 8, name: 'Thick' },
    { width: 12, name: 'Extra Thick' }
  ];

  const handleExport = () => {
    // Find the canvas element in the whiteboard
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      exportCanvas(canvas);
    } else {
      alert('Aucun dessin à exporter. Veuillez d\'abord dessiner quelque chose.');
    }
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[1] ? input.files?.[0] : input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imageSrc = reader.result as string;
        const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
        const rect = canvas?.getBoundingClientRect();
        const x = rect ? rect.width / 2 - 100 : 100;
        const y = rect ? rect.height / 2 - 75 : 100;
        const img = new Image();
        img.onload = () => {
          const maxW = rect ? rect.width * 0.4 : 400;
          const scale = Math.min(1, maxW / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          (window as any).__drawing_addImage__?.({ imageSrc, x, y, w, h });
        };
        img.src = imageSrc;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="w-24 bg-white border-r border-gray-200 flex flex-col py-6 shadow-sm h-full min-h-0 overflow-y-auto">
      {/* Tool Groups Container */}
      <div className="flex flex-col items-center space-y-6">
        
        {/* Drawing Tools Group */}
        <div className="flex flex-col items-center space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Draw
          </div>
          <div className="flex flex-col space-y-2">
            {drawingTools.map((toolItem) => {
              const Icon = toolItem.icon;
              return (
                <button
                  key={toolItem.id}
                  onClick={() => setTool(toolItem.id)}
                  className={`p-3 rounded-xl transition-all duration-200 group relative ${
                    tool === toolItem.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                  }`}
                  title={toolItem.name}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Shape Tools Group */}
        <div className="flex flex-col items-center space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Shapes
          </div>
          <div className="flex flex-col space-y-2">
            {shapeTools.map((toolItem) => {
              const Icon = toolItem.icon;
              return (
                <button
                  key={toolItem.id}
                  onClick={() => setTool(toolItem.id)}
                  className={`p-3 rounded-xl transition-all duration-200 group relative ${
                    tool === toolItem.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105'
                  }`}
                  title={toolItem.name}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Colors Group */}
        <div className="flex flex-col items-center space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Colors
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {colors.map((colorItem) => (
              <button
                key={colorItem.color}
                onClick={() => setStrokeColor(colorItem.color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  strokeColor === colorItem.color
                    ? 'border-gray-800 scale-110 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: colorItem.color }}
                title={colorItem.name}
              />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Stroke Width Group */}
        <div className="flex flex-col items-center space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Size
          </div>
          <div className="flex flex-col space-y-2">
            {strokeWidths.map((widthItem) => (
              <button
                key={widthItem.width}
                onClick={() => setStrokeWidth(widthItem.width)}
                className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  strokeWidth === widthItem.width
                    ? 'bg-blue-100 text-blue-600 scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                }`}
                title={widthItem.name}
              >
                <div
                  className="bg-current rounded-full"
                  style={{
                    width: `${Math.min(widthItem.width, 12)}px`,
                    height: `${Math.min(widthItem.width, 12)}px`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

        {/* Actions Group */}
        <div className="flex flex-col items-center space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Actions
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleInsertImage}
              className="p-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105"
              title="Insert Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105 disabled:hover:scale-100 disabled:hover:bg-transparent"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105 disabled:hover:scale-100 disabled:hover:bg-transparent"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={clear}
              className="p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:scale-105"
              title="Clear Board"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-105"
              title="Export"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;