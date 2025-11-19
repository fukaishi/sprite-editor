import { Project, GodotMetadata, SpriteSheetLayout } from '../types';
import { mergeLayers } from './canvas';

export const exportSpriteSheet = (
  project: Project,
  layout: SpriteSheetLayout = 'horizontal'
): { canvas: HTMLCanvasElement; metadata: GodotMetadata } => {
  const frameWidth = project.settings.width;
  const frameHeight = project.settings.height;
  const frameCount = project.frames.length;

  // Calculate canvas dimensions based on layout
  let canvasWidth = 0;
  let canvasHeight = 0;
  let columns = 0;
  let rows = 0;

  if (layout === 'horizontal') {
    canvasWidth = frameWidth * frameCount;
    canvasHeight = frameHeight;
    columns = frameCount;
    rows = 1;
  } else if (layout === 'vertical') {
    canvasWidth = frameWidth;
    canvasHeight = frameHeight * frameCount;
    columns = 1;
    rows = frameCount;
  } else {
    // Grid layout
    columns = Math.ceil(Math.sqrt(frameCount));
    rows = Math.ceil(frameCount / columns);
    canvasWidth = frameWidth * columns;
    canvasHeight = frameHeight * rows;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Render each frame
  const metadata: GodotMetadata = {
    meta: {
      version: project.version,
      image: 'spritesheet.png',
      frame_width: frameWidth,
      frame_height: frameHeight,
    },
    frames: [],
    animations: project.animations.map((anim) => ({
      name: anim.name,
      frames: anim.frameIndices,
      loop: anim.loop,
      fps: anim.fps,
    })),
  };

  project.frames.forEach((frame, index) => {
    // Calculate position
    const col = layout === 'vertical' ? 0 : index % columns;
    const row = layout === 'horizontal' ? 0 : Math.floor(index / columns);
    const x = col * frameWidth;
    const y = row * frameHeight;

    // Merge layers
    const merged = mergeLayers(frame.layers, frameWidth, frameHeight);
    ctx.putImageData(merged, x, y);

    // Add metadata
    metadata.frames.push({
      index,
      rect: { x, y, width: frameWidth, height: frameHeight },
      pivot: frame.pivot,
      hitboxes: frame.hitboxes.map((hitbox) => ({
        type: hitbox.type,
        x: hitbox.rect.x,
        y: hitbox.rect.y,
        w: hitbox.rect.width,
        h: hitbox.rect.height,
      })),
      tags: frame.tags,
    });
  });

  return { canvas, metadata };
};

export const downloadSpriteSheet = (
  project: Project,
  layout: SpriteSheetLayout = 'horizontal'
): void => {
  const { canvas, metadata } = exportSpriteSheet(project, layout);

  // Download PNG
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.settings.name}_spritesheet.png`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Download JSON
  const json = JSON.stringify(metadata, null, 2);
  const jsonBlob = new Blob([json], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonA = document.createElement('a');
  jsonA.href = jsonUrl;
  jsonA.download = `${project.settings.name}_metadata.json`;
  jsonA.click();
  URL.revokeObjectURL(jsonUrl);
};

export const saveProject = (project: Project): void => {
  // Convert ImageData to base64 for storage
  const projectCopy = JSON.parse(JSON.stringify(project));

  project.frames.forEach((frame, frameIndex) => {
    frame.layers.forEach((layer, layerIndex) => {
      if (layer.pixels) {
        const canvas = document.createElement('canvas');
        canvas.width = layer.pixels.width;
        canvas.height = layer.pixels.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(layer.pixels, 0, 0);
          const dataUrl = canvas.toDataURL();
          if (!projectCopy.frames[frameIndex].layers[layerIndex]) {
            projectCopy.frames[frameIndex].layers[layerIndex] = {};
          }
          projectCopy.frames[frameIndex].layers[layerIndex].pixelsData = dataUrl;
        }
      }
    });
  });

  const json = JSON.stringify(projectCopy, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.settings.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const loadProject = (file: File): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const projectData = JSON.parse(json);

        // Convert base64 back to ImageData
        for (const frame of projectData.frames) {
          for (const layer of frame.layers) {
            if (layer.pixelsData) {
              const img = new Image();
              await new Promise<void>((resolveImg) => {
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    layer.pixels = ctx.getImageData(0, 0, img.width, img.height);
                  }
                  delete layer.pixelsData;
                  resolveImg();
                };
                img.src = layer.pixelsData;
              });
            }
          }
        }

        resolve(projectData as Project);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
