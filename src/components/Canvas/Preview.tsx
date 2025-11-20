import { useRef, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { drawCheckerboard } from '../../utils/canvas';

export const Preview = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { project } = useProjectStore();
  const { selectedCharacterX, selectedCharacterY, setSelectedCharacter } = useEditorStore();

  const sheetWidth = project?.settings.sheetWidth || 512;
  const sheetHeight = project?.settings.sheetHeight || 512;
  const characterWidth = project?.settings.characterWidth || 16;
  const characterHeight = project?.settings.characterHeight || 16;

  // Calculate grid dimensions
  const gridCols = Math.floor(sheetWidth / characterWidth);
  const gridRows = Math.floor(sheetHeight / characterHeight);

  // Preview is fixed 256x256
  const previewSize = 256;
  const scale = previewSize / Math.max(characterWidth, characterHeight);

  // Render preview
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project?.sheetPixels) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = previewSize;
    canvas.height = previewSize;

    // Clear canvas
    ctx.clearRect(0, 0, previewSize, previewSize);

    // Draw checkerboard background
    drawCheckerboard(ctx, previewSize, previewSize, 8);

    // Calculate source rectangle
    const srcX = selectedCharacterX * characterWidth;
    const srcY = selectedCharacterY * characterHeight;

    // Extract character pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = characterWidth;
    tempCanvas.height = characterHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.putImageData(project.sheetPixels, -srcX, -srcY);

    // Draw scaled character
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      characterWidth,
      characterHeight,
      0,
      0,
      characterWidth * scale,
      characterHeight * scale
    );
  }, [project, selectedCharacterX, selectedCharacterY, characterWidth, characterHeight, previewSize, scale]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="bg-gray-700 p-4 rounded-lg space-y-4">
      <h3 className="text-sm font-semibold text-gray-300">プレビュー</h3>

      {/* Preview Canvas */}
      <div className="flex justify-center bg-gray-800 p-2 rounded">
        <canvas
          ref={canvasRef}
          style={{
            imageRendering: 'pixelated',
            border: '2px solid #444',
          }}
        />
      </div>

      {/* Character Position Selector */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">キャラクタ位置</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">X</label>
            <input
              type="number"
              value={selectedCharacterX}
              onChange={(e) => {
                const x = Math.max(0, Math.min(gridCols - 1, parseInt(e.target.value) || 0));
                setSelectedCharacter(x, selectedCharacterY);
              }}
              className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
              min="0"
              max={gridCols - 1}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y</label>
            <input
              type="number"
              value={selectedCharacterY}
              onChange={(e) => {
                const y = Math.max(0, Math.min(gridRows - 1, parseInt(e.target.value) || 0));
                setSelectedCharacter(selectedCharacterX, y);
              }}
              className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
              min="0"
              max={gridRows - 1}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          範囲: 0-{gridCols - 1} x 0-{gridRows - 1}
        </p>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 space-y-1">
        <div>キャラクタサイズ: {characterWidth}x{characterHeight}px</div>
        <div>シートサイズ: {sheetWidth}x{sheetHeight}px</div>
        <div>グリッド: {gridCols}x{gridRows}</div>
      </div>
    </div>
  );
};
