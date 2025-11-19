import { Project, FrameData, LayerData } from '../types';

export interface ImportOptions {
  frameWidth: number;
  frameHeight: number;
  columns?: number;
  rows?: number;
}

export const importPNG = (
  file: File,
  options: ImportOptions
): Promise<ImageData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const { frameWidth, frameHeight, columns, rows } = options;

          // Calculate grid
          const cols = columns || Math.floor(img.width / frameWidth);
          const rowCount = rows || Math.floor(img.height / frameHeight);

          const frames: ImageData[] = [];

          // Extract each frame
          for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < cols; col++) {
              const canvas = document.createElement('canvas');
              canvas.width = frameWidth;
              canvas.height = frameHeight;
              const ctx = canvas.getContext('2d');

              if (!ctx) continue;

              const sx = col * frameWidth;
              const sy = row * frameHeight;

              ctx.drawImage(
                img,
                sx,
                sy,
                frameWidth,
                frameHeight,
                0,
                0,
                frameWidth,
                frameHeight
              );

              const imageData = ctx.getImageData(0, 0, frameWidth, frameHeight);
              frames.push(imageData);
            }
          }

          resolve(frames);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const createProjectFromFrames = (
  name: string,
  frames: ImageData[]
): Project => {
  if (frames.length === 0) {
    throw new Error('No frames to import');
  }

  const width = frames[0].width;
  const height = frames[0].height;

  const projectFrames: FrameData[] = frames.map((imageData, index) => {
    const layer: LayerData = {
      id: crypto.randomUUID(),
      name: 'Imported',
      visible: true,
      opacity: 1,
      pixels: imageData,
    };

    return {
      id: crypto.randomUUID(),
      index,
      layers: [layer],
      pivot: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
      hitboxes: [],
      tags: [],
    };
  });

  return {
    id: crypto.randomUUID(),
    version: '1.0',
    settings: {
      name,
      width,
      height,
      defaultFrameCount: frames.length,
      isTilesetMode: false,
    },
    frames: projectFrames,
    animations: [],
    palette: [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
      { r: 255, g: 0, b: 0, a: 255 },
      { r: 0, g: 255, b: 0, a: 255 },
      { r: 0, g: 0, b: 255, a: 255 },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};
