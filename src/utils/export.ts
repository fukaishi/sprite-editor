import { Project } from '../types';

// Save project to JSON file
export const saveProject = (project: Project): void => {
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

  const json = JSON.stringify(serialized, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.settings.name || 'project'}.json`;
  a.click();

  URL.revokeObjectURL(url);
};

// Load project from JSON file
export const loadProject = (file: File): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = JSON.parse(json);

        // Deserialize ImageData
        if (parsed.sheetPixels) {
          const imageData = new ImageData(
            new Uint8ClampedArray(parsed.sheetPixels.data),
            parsed.sheetPixels.width,
            parsed.sheetPixels.height
          );
          parsed.sheetPixels = imageData;
        }

        resolve(parsed as Project);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
