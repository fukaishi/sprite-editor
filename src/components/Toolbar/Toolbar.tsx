import { useEditorStore } from '../../store/editorStore';
import { ToolType } from '../../types';

const tools: Array<{ type: ToolType; icon: string; label: string }> = [
  { type: 'pen', icon: '✏️', label: 'Pen' },
  { type: 'eraser', icon: '🧹', label: 'Eraser' },
  { type: 'bucket', icon: '🪣', label: 'Bucket' },
  { type: 'eyedropper', icon: '💧', label: 'Eyedropper' },
  { type: 'rectangle', icon: '▢', label: 'Rectangle' },
  { type: 'line', icon: '╱', label: 'Line' },
  { type: 'select', icon: '⬚', label: 'Select' },
];

export const Toolbar = () => {
  const { toolType, setToolType, brushSize, setBrushSize, zoom, setZoom } = useEditorStore();

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => setToolType(tool.type)}
              className={`p-2 rounded text-sm ${
                toolType === tool.type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={tool.label}
            >
              <span className="text-lg">{tool.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Brush Size</h3>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-400 text-center mt-1">{brushSize}px</div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Zoom</h3>
        <input
          type="range"
          min="1"
          max="32"
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-400 text-center mt-1">{zoom}x</div>
      </div>
    </div>
  );
};
