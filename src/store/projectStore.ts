import { create } from 'zustand';
import { Project, Color } from '../types';
import { createImageData } from '../utils/canvas';

interface ProjectStore {
  project: Project | null;

  // Project operations
  createProject: (name: string, sheetWidth: number, sheetHeight: number, characterWidth: number, characterHeight: number) => void;
  loadProject: (project: Project) => void;
  updateSheetPixels: (imageData: ImageData) => void;

  // Palette operations
  addColor: (color: Color) => void;
  updateColor: (index: number, color: Color) => void;
  removeColor: (index: number) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,

  createProject: (name, sheetWidth, sheetHeight, characterWidth, characterHeight) => {
    const project: Project = {
      id: crypto.randomUUID(),
      version: '1.0',
      settings: {
        name,
        sheetWidth,
        sheetHeight,
        characterWidth,
        characterHeight,
      },
      sheetPixels: createImageData(sheetWidth, sheetHeight),
      palette: [
        { r: 0, g: 0, b: 0, a: 255 },     // Black
        { r: 255, g: 255, b: 255, a: 255 }, // White
        { r: 255, g: 0, b: 0, a: 255 },   // Red
        { r: 0, g: 255, b: 0, a: 255 },   // Green
        { r: 0, g: 0, b: 255, a: 255 },   // Blue
        { r: 255, g: 255, b: 0, a: 255 }, // Yellow
        { r: 255, g: 0, b: 255, a: 255 }, // Magenta
        { r: 0, g: 255, b: 255, a: 255 }, // Cyan
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ project });
  },

  loadProject: (project) => {
    set({ project });
  },

  updateSheetPixels: (imageData) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        sheetPixels: imageData,
        updatedAt: Date.now(),
      },
    });
  },

  // Palette operations
  addColor: (color) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        palette: [...project.palette, color],
        updatedAt: Date.now(),
      },
    });
  },

  updateColor: (index, color) => {
    const { project } = get();
    if (!project || index >= project.palette.length) return;

    const newPalette = [...project.palette];
    newPalette[index] = color;

    set({
      project: {
        ...project,
        palette: newPalette,
        updatedAt: Date.now(),
      },
    });
  },

  removeColor: (index) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        palette: project.palette.filter((_, i) => i !== index),
        updatedAt: Date.now(),
      },
    });
  },
}));
