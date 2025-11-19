import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { useHistoryStore } from '../../store/historyStore';
import {
  drawCheckerboard,
  drawGrid,
  drawBrush,
  drawLine,
  floodFill,
  createImageData,
  cloneImageData,
} from '../../utils/canvas';
import { Point, Color } from '../../types';

export const Canvas = () => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  const { project, updateLayerPixels } = useProjectStore();
  const {
    currentFrameIndex,
    currentLayerIndex,
    currentTool,
    zoom,
    showGrid,
    showPivot,
    showHitboxes,
  } = useEditorStore();
  const { addHistory } = useHistoryStore();

  const currentFrame = project?.frames[currentFrameIndex];
  const currentLayer = currentFrame?.layers[currentLayerIndex];

  const width = project?.settings.width || 32;
  const height = project?.settings.height || 32;

  // Initialize layer pixels if needed
  useEffect(() => {
    if (currentLayer && !currentLayer.pixels) {
      const newImageData = createImageData(width, height);
      updateLayerPixels(currentFrameIndex, currentLayerIndex, newImageData);
    }
  }, [currentLayer, width, height, currentFrameIndex, currentLayerIndex, updateLayerPixels]);

  // Render main canvas (zoomed)
  const render = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width * zoom;
    canvas.height = height * zoom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    drawCheckerboard(ctx, canvas.width, canvas.height, 8 * zoom);

    // Scale for zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw all visible layers
    if (currentFrame) {
      for (let i = currentFrame.layers.length - 1; i >= 0; i--) {
        const layer = currentFrame.layers[i];
        if (layer.visible && layer.pixels) {
          ctx.globalAlpha = layer.opacity;
          ctx.putImageData(layer.pixels, 0, 0);
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, width, height, zoom);
    }

    // Draw pivot point
    if (showPivot && currentFrame) {
      const pivot = currentFrame.pivot;
      ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(pivot.x * zoom, pivot.y * zoom, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw crosshair
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pivot.x * zoom - 5, pivot.y * zoom);
      ctx.lineTo(pivot.x * zoom + 5, pivot.y * zoom);
      ctx.moveTo(pivot.x * zoom, pivot.y * zoom - 5);
      ctx.lineTo(pivot.x * zoom, pivot.y * zoom + 5);
      ctx.stroke();
    }

    // Draw hitboxes
    if (showHitboxes && currentFrame) {
      currentFrame.hitboxes.forEach((hitbox) => {
        const color = hitbox.type === 'hitbox' ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';
        ctx.strokeStyle = color;
        ctx.fillStyle = color.replace('0.5', '0.2');
        ctx.lineWidth = 2;
        ctx.strokeRect(
          hitbox.rect.x * zoom,
          hitbox.rect.y * zoom,
          hitbox.rect.width * zoom,
          hitbox.rect.height * zoom
        );
        ctx.fillRect(
          hitbox.rect.x * zoom,
          hitbox.rect.y * zoom,
          hitbox.rect.width * zoom,
          hitbox.rect.height * zoom
        );
      });
    }
  }, [currentFrame, width, height, zoom, showGrid, showPivot, showHitboxes]);

  // Render preview canvas (scaled for visibility)
  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewScale = 4; // Preview scale factor

    // Set canvas size with scale
    canvas.width = width * previewScale;
    canvas.height = height * previewScale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    drawCheckerboard(ctx, canvas.width, canvas.height, 8 * previewScale);

    // Scale for preview
    ctx.save();
    ctx.scale(previewScale, previewScale);

    // Draw all visible layers
    if (currentFrame) {
      for (let i = currentFrame.layers.length - 1; i >= 0; i--) {
        const layer = currentFrame.layers[i];
        if (layer.visible && layer.pixels) {
          ctx.globalAlpha = layer.opacity;
          ctx.putImageData(layer.pixels, 0, 0);
        }
      }
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }, [currentFrame, width, height]);

  useEffect(() => {
    render();
    renderPreview();
  }, [render, renderPreview]);

  // Mouse event handlers
  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = displayCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / zoom);
      const y = Math.floor((e.clientY - rect.top) / zoom);

      return { x, y };
    },
    [zoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!currentLayer || !currentLayer.pixels) return;

      const point = getCanvasPoint(e);
      setIsDrawing(true);
      setLastPoint(point);

      const imageData = cloneImageData(currentLayer.pixels);

      if (currentTool.type === 'pen') {
        drawBrush(imageData, point.x, point.y, currentTool.color, currentTool.size);
      } else if (currentTool.type === 'eraser') {
        const transparent: Color = { r: 0, g: 0, b: 0, a: 0 };
        drawBrush(imageData, point.x, point.y, transparent, currentTool.size);
      } else if (currentTool.type === 'bucket') {
        floodFill(imageData, point.x, point.y, currentTool.color);
      }

      const oldImageData = currentLayer.pixels;
      updateLayerPixels(currentFrameIndex, currentLayerIndex, imageData);

      // Add to history
      addHistory({
        type: 'draw',
        description: `Draw with ${currentTool.type}`,
        undo: () => {
          updateLayerPixels(currentFrameIndex, currentLayerIndex, oldImageData);
        },
        redo: () => {
          updateLayerPixels(currentFrameIndex, currentLayerIndex, imageData);
        },
      });
    },
    [
      currentLayer,
      currentTool,
      currentFrameIndex,
      currentLayerIndex,
      getCanvasPoint,
      updateLayerPixels,
      addHistory,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !currentLayer || !currentLayer.pixels || !lastPoint) return;

      const point = getCanvasPoint(e);

      if (currentTool.type === 'pen' || currentTool.type === 'eraser') {
        const imageData = cloneImageData(currentLayer.pixels);
        const color =
          currentTool.type === 'eraser'
            ? { r: 0, g: 0, b: 0, a: 0 }
            : currentTool.color;

        drawLine(
          imageData,
          lastPoint.x,
          lastPoint.y,
          point.x,
          point.y,
          color,
          currentTool.size
        );

        updateLayerPixels(currentFrameIndex, currentLayerIndex, imageData);
      }

      setLastPoint(point);
    },
    [
      isDrawing,
      lastPoint,
      currentLayer,
      currentTool,
      currentFrameIndex,
      currentLayerIndex,
      getCanvasPoint,
      updateLayerPixels,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex gap-4 items-start">
        {/* キャンバス (左側) */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-300">キャンバス</h3>
          <canvas
            ref={displayCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="cursor-crosshair"
            style={{
              imageRendering: 'pixelated',
              border: '2px solid #444',
            }}
          />
        </div>

        {/* プレビュー (右側) */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-300">プレビュー</h3>
          <canvas
            ref={previewCanvasRef}
            className="pointer-events-none"
            style={{
              imageRendering: 'pixelated',
              border: '2px solid #444',
            }}
          />
        </div>
      </div>
    </div>
  );
};
