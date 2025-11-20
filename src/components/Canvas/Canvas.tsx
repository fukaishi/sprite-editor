import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { useHistoryStore } from '../../store/historyStore';
import {
  drawCheckerboard,
  drawBrush,
  drawLine,
  floodFill,
  cloneImageData,
} from '../../utils/canvas';
import { Point, Color } from '../../types';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  const { project, updateSheetPixels } = useProjectStore();
  const { currentTool, zoom, showGrid } = useEditorStore();
  const { addHistory } = useHistoryStore();

  const sheetWidth = project?.settings.sheetWidth || 512;
  const sheetHeight = project?.settings.sheetHeight || 512;
  const characterWidth = project?.settings.characterWidth || 16;
  const characterHeight = project?.settings.characterHeight || 16;

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project?.sheetPixels) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = sheetWidth * zoom;
    canvas.height = sheetHeight * zoom;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    drawCheckerboard(ctx, canvas.width, canvas.height, 8 * zoom);

    // Scale for zoom
    ctx.save();
    ctx.scale(zoom, zoom);

    // Draw sheet pixels
    ctx.putImageData(project.sheetPixels, 0, 0);

    ctx.restore();

    // Draw character grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = characterWidth; x < sheetWidth; x += characterWidth) {
        ctx.beginPath();
        ctx.moveTo(x * zoom, 0);
        ctx.lineTo(x * zoom, sheetHeight * zoom);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = characterHeight; y < sheetHeight; y += characterHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom);
        ctx.lineTo(sheetWidth * zoom, y * zoom);
        ctx.stroke();
      }
    }
  }, [project, sheetWidth, sheetHeight, characterWidth, characterHeight, zoom, showGrid]);

  useEffect(() => {
    render();
  }, [render]);

  // Mouse event handlers
  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
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
      if (!project?.sheetPixels) return;

      const point = getCanvasPoint(e);
      setIsDrawing(true);
      setLastPoint(point);

      const imageData = cloneImageData(project.sheetPixels);

      if (currentTool.type === 'pen') {
        drawBrush(imageData, point.x, point.y, currentTool.color, currentTool.size);
      } else if (currentTool.type === 'eraser') {
        const transparent: Color = { r: 0, g: 0, b: 0, a: 0 };
        drawBrush(imageData, point.x, point.y, transparent, currentTool.size);
      } else if (currentTool.type === 'bucket') {
        floodFill(imageData, point.x, point.y, currentTool.color);
      }

      const oldImageData = project.sheetPixels;
      updateSheetPixels(imageData);

      // Add to history
      addHistory({
        type: 'draw',
        description: `Draw with ${currentTool.type}`,
        undo: () => {
          updateSheetPixels(oldImageData);
        },
        redo: () => {
          updateSheetPixels(imageData);
        },
      });
    },
    [project, currentTool, getCanvasPoint, updateSheetPixels, addHistory]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !project?.sheetPixels || !lastPoint) return;

      const point = getCanvasPoint(e);

      if (currentTool.type === 'pen' || currentTool.type === 'eraser') {
        const imageData = cloneImageData(project.sheetPixels);
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

        updateSheetPixels(imageData);
      }

      setLastPoint(point);
    },
    [isDrawing, lastPoint, project, currentTool, getCanvasPoint, updateSheetPixels]
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
    <div className="flex items-center justify-center bg-gray-800 p-4 rounded-lg overflow-auto">
      <canvas
        ref={canvasRef}
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
  );
};
