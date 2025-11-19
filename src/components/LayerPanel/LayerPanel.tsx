import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';

export const LayerPanel = () => {
  const { project, addLayer, deleteLayer, updateLayer, moveLayer } = useProjectStore();
  const { currentFrameIndex, currentLayerIndex, setCurrentLayer } = useEditorStore();

  const currentFrame = project?.frames[currentFrameIndex];

  if (!currentFrame) return null;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-300">レイヤー</h3>
        <button
          onClick={() => addLayer(currentFrameIndex)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          + レイヤー追加
        </button>
      </div>

      <div className="space-y-1">
        {currentFrame.layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`p-2 rounded cursor-pointer flex items-center justify-between ${
              index === currentLayerIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setCurrentLayer(index)}
          >
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLayer(currentFrameIndex, index, { visible: !layer.visible });
                }}
                className="text-sm"
              >
                {layer.visible ? '👁️' : '🚫'}
              </button>
              <input
                type="text"
                value={layer.name}
                onChange={(e) => {
                  e.stopPropagation();
                  updateLayer(currentFrameIndex, index, { name: e.target.value });
                }}
                className="bg-transparent border-none outline-none text-sm flex-1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (index > 0) moveLayer(currentFrameIndex, index, index - 1);
                }}
                disabled={index === 0}
                className="text-xs px-1 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (index < currentFrame.layers.length - 1)
                    moveLayer(currentFrameIndex, index, index + 1);
                }}
                disabled={index === currentFrame.layers.length - 1}
                className="text-xs px-1 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentFrame.layers.length > 1) {
                    deleteLayer(currentFrameIndex, index);
                    if (currentLayerIndex >= index && currentLayerIndex > 0) {
                      setCurrentLayer(currentLayerIndex - 1);
                    }
                  }
                }}
                disabled={currentFrame.layers.length <= 1}
                className="text-xs px-1 disabled:opacity-30"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <label className="text-xs text-gray-400">不透明度</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentFrame.layers[currentLayerIndex]?.opacity || 1}
          onChange={(e) =>
            updateLayer(currentFrameIndex, currentLayerIndex, {
              opacity: parseFloat(e.target.value),
            })
          }
          className="w-full"
        />
        <div className="text-xs text-gray-400 text-center">
          {Math.round((currentFrame.layers[currentLayerIndex]?.opacity || 1) * 100)}%
        </div>
      </div>
    </div>
  );
};
