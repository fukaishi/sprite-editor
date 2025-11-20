import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types';

const AUTO_SAVE_KEY = 'sprite-editor-autosave';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const useAutoSave = () => {
  const { project } = useProjectStore();

  useEffect(() => {
    if (!project) return;

    const saveToLocalStorage = () => {
      try {
        // Serialize ImageData
        const serialized = {
          ...project,
          sheetPixels: project.sheetPixels
            ? {
                width: project.sheetPixels.width,
                height: project.sheetPixels.height,
                data: Array.from(project.sheetPixels.data),
              }
            : null,
        };

        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(serialized));
        console.log('Auto-saved project');
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    };

    const interval = setInterval(saveToLocalStorage, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [project]);
};

export const loadAutoSave = async (): Promise<Project | null> => {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    // Deserialize ImageData
    if (parsed.sheetPixels) {
      const imageData = new ImageData(
        new Uint8ClampedArray(parsed.sheetPixels.data),
        parsed.sheetPixels.width,
        parsed.sheetPixels.height
      );
      parsed.sheetPixels = imageData;
    }

    return parsed as Project;
  } catch (error) {
    console.error('Failed to load auto-save:', error);
    return null;
  }
};

export const clearAutoSave = () => {
  localStorage.removeItem(AUTO_SAVE_KEY);
};
