import { create } from 'zustand';
import { Tool, ToolType, Color } from '../types';

interface EditorStore {
  // Character selection for preview
  selectedCharacterX: number;
  selectedCharacterY: number;

  // Tool state
  currentTool: Tool;
  toolType: ToolType;
  brushSize: number;
  primaryColor: Color;
  secondaryColor: Color;

  // View state
  zoom: number;
  showGrid: boolean;

  // Actions
  setSelectedCharacter: (x: number, y: number) => void;
  setToolType: (type: ToolType) => void;
  setBrushSize: (size: number) => void;
  setPrimaryColor: (color: Color) => void;
  setSecondaryColor: (color: Color) => void;
  swapColors: () => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
}

const defaultPrimaryColor: Color = { r: 0, g: 0, b: 0, a: 255 };
const defaultSecondaryColor: Color = { r: 255, g: 255, b: 255, a: 255 };

export const useEditorStore = create<EditorStore>((set, get) => ({
  selectedCharacterX: 0,
  selectedCharacterY: 0,

  currentTool: {
    type: 'pen',
    size: 1,
    color: defaultPrimaryColor,
  },
  toolType: 'pen',
  brushSize: 1,
  primaryColor: defaultPrimaryColor,
  secondaryColor: defaultSecondaryColor,

  zoom: 4,
  showGrid: true,

  setSelectedCharacter: (x, y) => {
    set({ selectedCharacterX: x, selectedCharacterY: y });
  },

  setToolType: (type) => {
    const { brushSize, primaryColor } = get();
    set({
      toolType: type,
      currentTool: { type, size: brushSize, color: primaryColor },
    });
  },

  setBrushSize: (size) => {
    const { toolType, primaryColor } = get();
    set({
      brushSize: size,
      currentTool: { type: toolType, size, color: primaryColor },
    });
  },

  setPrimaryColor: (color) => {
    const { toolType, brushSize } = get();
    set({
      primaryColor: color,
      currentTool: { type: toolType, size: brushSize, color },
    });
  },

  setSecondaryColor: (color) => {
    set({ secondaryColor: color });
  },

  swapColors: () => {
    const { primaryColor, secondaryColor, toolType, brushSize } = get();
    set({
      primaryColor: secondaryColor,
      secondaryColor: primaryColor,
      currentTool: { type: toolType, size: brushSize, color: secondaryColor },
    });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(1, Math.min(32, zoom)) });
  },

  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }));
  },
}));
