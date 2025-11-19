import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';

const AUTO_SAVE_KEY = 'sprite-editor-autosave';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const useAutoSave = () => {
  const { project } = useProjectStore();

  useEffect(() => {
    if (!project) return;

    const saveToLocalStorage = () => {
      try {
        // Convert ImageData to serializable format
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

        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(projectCopy));
        console.log('Auto-saved project');
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    };

    const interval = setInterval(saveToLocalStorage, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [project]);
};

export const loadAutoSave = async (): Promise<any | null> => {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (!saved) return null;

    const projectData = JSON.parse(saved);

    // Convert base64 back to ImageData
    for (const frame of projectData.frames) {
      for (const layer of frame.layers) {
        if (layer.pixelsData) {
          const img = new Image();
          await new Promise<void>((resolve) => {
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
              resolve();
            };
            img.src = layer.pixelsData;
          });
        }
      }
    }

    return projectData;
  } catch (error) {
    console.error('Failed to load auto-save:', error);
    return null;
  }
};

export const clearAutoSave = () => {
  localStorage.removeItem(AUTO_SAVE_KEY);
};
