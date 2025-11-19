import { useRef, useEffect, useCallback } from 'react';

interface UseCanvasProps {
  width: number;
  height: number;
  onDraw?: (ctx: CanvasRenderingContext2D) => void;
}

export const useCanvas = ({ width, height, onDraw }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (onDraw) {
      onDraw(ctx);
    }
  }, [onDraw]);

  useEffect(() => {
    draw();
  }, [draw, width, height]);

  return { canvasRef, draw };
};
