import { create } from 'zustand';
import { Tool, ToolType, Color } from '../types';

interface EditorStore {
  // Current selection
  currentFrameIndex: number;
  currentLayerIndex: number;

  // Tool state
  currentTool: Tool;
  toolType: ToolType;
  brushSize: number;
  primaryColor: Color;
  secondaryColor: Color;

  // View state
  zoom: number;
  showGrid: boolean;
  showPivot: boolean;
  showHitboxes: boolean;
  panOffset: { x: number; y: number };

  // Playback state
  isPlaying: boolean;
  playbackFps: number;
  currentAnimationId: string | null;

  // Actions
  setCurrentFrame: (index: number) => void;
  setCurrentLayer: (index: number) => void;
  setToolType: (type: ToolType) => void;
  setBrushSize: (size: number) => void;
  setPrimaryColor: (color: Color) => void;
  setSecondaryColor: (color: Color) => void;
  swapColors: () => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  togglePivot: () => void;
  toggleHitboxes: () => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  startPlayback: (animationId?: string) => void;
  stopPlayback: () => void;
  setPlaybackFps: (fps: number) => void;
}

const defaultPrimaryColor: Color = { r: 0, g: 0, b: 0, a: 255 };
const defaultSecondaryColor: Color = { r: 255, g: 255, b: 255, a: 255 };

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentFrameIndex: 0,
  currentLayerIndex: 0,

  currentTool: {
    type: 'pen',
    size: 1,
    color: defaultPrimaryColor,
  },
  toolType: 'pen',
  brushSize: 1,
  primaryColor: defaultPrimaryColor,
  secondaryColor: defaultSecondaryColor,

  zoom: 8,
  showGrid: true,
  showPivot: true,
  showHitboxes: true,
  panOffset: { x: 0, y: 0 },

  isPlaying: false,
  playbackFps: 12,
  currentAnimationId: null,

  setCurrentFrame: (index) => {
    set({ currentFrameIndex: index });
  },

  setCurrentLayer: (index) => {
    set({ currentLayerIndex: index });
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

  togglePivot: () => {
    set((state) => ({ showPivot: !state.showPivot }));
  },

  toggleHitboxes: () => {
    set((state) => ({ showHitboxes: !state.showHitboxes }));
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  startPlayback: (animationId) => {
    set({ isPlaying: true, currentAnimationId: animationId || null });
  },

  stopPlayback: () => {
    set({ isPlaying: false });
  },

  setPlaybackFps: (fps) => {
    set({ playbackFps: Math.max(1, Math.min(60, fps)) });
  },
}));
