import React from 'react';
import { Pen, Eraser, Square, Circle, Type, Undo, Redo, Trash2, Download } from 'lucide-react';
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
    canRedo
  } = useDrawing();

  const tools = [
    { id: 'pen', icon: Pen, name: 'Pen' },
    { id: 'eraser', icon: Eraser, name: 'Eraser' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
    { id: 'text', icon: Type, name: 'Text' }
  ];

  const colors = [
    '#000000', '#2563EB', '#DC2626', '#16A34A', 
    '#CA8A04', '#9333EA', '#C2410C', '#0891B2'
  ];

  const strokeWidths = [2, 4, 6, 8, 12];

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
      {/* Drawing Tools */}
      <div className="space-y-2">
        {tools.map((toolItem) => {
          const Icon = toolItem.icon;
          return (
            <button
              key={toolItem.id}
              onClick={() => setTool(toolItem.id)}
              className={`p-3 rounded-lg transition-colors group relative ${
                tool === toolItem.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={toolItem.name}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      <div className="h-px bg-gray-200 w-12"></div>

      {/* Colors */}
      <div className="space-y-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => setStrokeColor(color)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              strokeColor === color
                ? 'border-gray-800 scale-110'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>

      <div className="h-px bg-gray-200 w-12"></div>

      {/* Stroke Width */}
      <div className="space-y-2">
        {strokeWidths.map((width) => (
          <button
            key={width}
            onClick={() => setStrokeWidth(width)}
            className={`p-2 rounded-lg transition-colors ${
              strokeWidth === width
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={`Width: ${width}px`}
          >
            <div
              className="bg-current rounded-full"
              style={{
                width: `${Math.min(width, 12)}px`,
                height: `${Math.min(width, 12)}px`,
              }}
            />
          </button>
        ))}
      </div>

      <div className="h-px bg-gray-200 w-12"></div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          title="Undo"
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          title="Redo"
        >
          <Redo className="w-5 h-5" />
        </button>
        <button
          onClick={clear}
          className="p-3 rounded-lg transition-colors text-red-600 hover:bg-red-50"
          title="Clear Board"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          className="p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          title="Export"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;