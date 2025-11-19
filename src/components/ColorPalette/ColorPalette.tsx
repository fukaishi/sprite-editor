import { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { colorToRGBA, hexToColor, colorToHex } from '../../utils/color';
import { Color } from '../../types';

export const ColorPalette = () => {
  const { project, addColor } = useProjectStore();
  const { primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor, swapColors } =
    useEditorStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddColor = () => {
    const newColor: Color = { r: 128, g: 128, b: 128, a: 255 };
    addColor(newColor);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">現在の色</h3>
        <div className="flex gap-2 items-center">
          <div
            className="w-16 h-16 border-2 border-gray-600 rounded cursor-pointer"
            style={{ backgroundColor: colorToRGBA(primaryColor) }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="メイン色"
          />
          <button
            onClick={swapColors}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            ⇄
          </button>
          <div
            className="w-12 h-12 border-2 border-gray-600 rounded cursor-pointer"
            style={{ backgroundColor: colorToRGBA(secondaryColor) }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="サブ色"
          />
        </div>

        {showColorPicker && (
          <div className="mt-2 p-2 bg-gray-700 rounded">
            <input
              type="color"
              value={colorToHex(primaryColor)}
              onChange={(e) => {
                const color = hexToColor(e.target.value, primaryColor.a);
                setPrimaryColor(color);
              }}
              className="w-full h-8"
            />
            <div className="mt-2">
              <label className="text-xs text-gray-400">不透明度</label>
              <input
                type="range"
                min="0"
                max="255"
                value={primaryColor.a}
                onChange={(e) => {
                  setPrimaryColor({ ...primaryColor, a: parseInt(e.target.value) });
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-300">パレット</h3>
          <button
            onClick={handleAddColor}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            + 追加
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {project?.palette.map((color, index) => (
            <div
              key={index}
              className="w-8 h-8 border border-gray-600 rounded cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: colorToRGBA(color) }}
              onClick={() => setPrimaryColor(color)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSecondaryColor(color);
              }}
              title={`RGB(${color.r}, ${color.g}, ${color.b})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
