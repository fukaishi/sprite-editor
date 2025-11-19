import { Color, LayerData } from '../types';
import { colorsEqual, getColorAtPixel, setColorAtPixel } from './color';

export const createImageData = (width: number, height: number): ImageData => {
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      return ctx.createImageData(width, height);
    }
  }
  return new ImageData(width, height);
};

export const clearCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  ctx.clearRect(0, 0, width, height);
};

export const drawCheckerboard = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number = 8,
  color1: string = '#CCCCCC',
  color2: string = '#999999'
): void => {
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const isEven = (Math.floor(x / cellSize) + Math.floor(y / cellSize)) % 2 === 0;
      ctx.fillStyle = isEven ? color1 : color2;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
};

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  color: string = 'rgba(255, 255, 255, 0.2)'
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * zoom, 0);
    ctx.lineTo(x * zoom, height * zoom);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * zoom);
    ctx.lineTo(width * zoom, y * zoom);
    ctx.stroke();
  }
};

export const drawPixel = (
  imageData: ImageData,
  x: number,
  y: number,
  color: Color
): void => {
  if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
    return;
  }
  setColorAtPixel(imageData, x, y, color);
};

export const drawLine = (
  imageData: ImageData,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Color,
  size: number = 1
): void => {
  // Bresenham's line algorithm
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currentX = x0;
  let currentY = y0;

  while (true) {
    drawBrush(imageData, currentX, currentY, color, size);

    if (currentX === x1 && currentY === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currentX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currentY += sy;
    }
  }
};

export const drawBrush = (
  imageData: ImageData,
  x: number,
  y: number,
  color: Color,
  size: number
): void => {
  const halfSize = Math.floor(size / 2);
  for (let dy = -halfSize; dy <= halfSize; dy++) {
    for (let dx = -halfSize; dx <= halfSize; dx++) {
      drawPixel(imageData, x + dx, y + dy, color);
    }
  }
};

export const drawRectangle = (
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Color,
  filled: boolean = false
): void => {
  if (filled) {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        drawPixel(imageData, x + dx, y + dy, color);
      }
    }
  } else {
    // Top and bottom
    for (let dx = 0; dx < width; dx++) {
      drawPixel(imageData, x + dx, y, color);
      drawPixel(imageData, x + dx, y + height - 1, color);
    }
    // Left and right
    for (let dy = 0; dy < height; dy++) {
      drawPixel(imageData, x, y + dy, color);
      drawPixel(imageData, x + width - 1, y + dy, color);
    }
  }
};

export const floodFill = (
  imageData: ImageData,
  x: number,
  y: number,
  newColor: Color
): void => {
  if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
    return;
  }

  const targetColor = getColorAtPixel(imageData, x, y);

  if (colorsEqual(targetColor, newColor)) {
    return;
  }

  const stack: Array<[number, number]> = [[x, y]];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const [currentX, currentY] = stack.pop()!;
    const key = `${currentX},${currentY}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (
      currentX < 0 ||
      currentX >= imageData.width ||
      currentY < 0 ||
      currentY >= imageData.height
    ) {
      continue;
    }

    const currentColor = getColorAtPixel(imageData, currentX, currentY);
    if (!colorsEqual(currentColor, targetColor)) {
      continue;
    }

    setColorAtPixel(imageData, currentX, currentY, newColor);

    stack.push([currentX + 1, currentY]);
    stack.push([currentX - 1, currentY]);
    stack.push([currentX, currentY + 1]);
    stack.push([currentX, currentY - 1]);
  }
};

export const mergeLayers = (
  layers: LayerData[],
  width: number,
  height: number
): ImageData => {
  const merged = createImageData(width, height);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return merged;

  // Draw layers from bottom to top
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (!layer.visible || !layer.pixels) continue;

    tempCtx.globalAlpha = layer.opacity;
    tempCtx.putImageData(layer.pixels, 0, 0);
  }

  tempCtx.globalAlpha = 1;
  return tempCtx.getImageData(0, 0, width, height);
};

export const cloneImageData = (imageData: ImageData): ImageData => {
  const cloned = createImageData(imageData.width, imageData.height);
  cloned.data.set(imageData.data);
  return cloned;
};
