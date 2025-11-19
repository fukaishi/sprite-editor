import { create } from 'zustand';
import {
  Project,
  FrameData,
  LayerData,
  Animation,
  Color,
  Hitbox,
  Point,
  TileData,
} from '../types';

interface ProjectStore {
  project: Project | null;

  // Project operations
  createProject: (name: string, width: number, height: number) => void;
  loadProject: (project: Project) => void;
  updateProjectSettings: (settings: Partial<Project['settings']>) => void;

  // Frame operations
  addFrame: () => void;
  duplicateFrame: (frameIndex: number) => void;
  deleteFrame: (frameIndex: number) => void;
  moveFrame: (fromIndex: number, toIndex: number) => void;
  updateFramePivot: (frameIndex: number, pivot: Point) => void;

  // Layer operations
  addLayer: (frameIndex: number, name?: string) => void;
  duplicateLayer: (frameIndex: number, layerIndex: number) => void;
  deleteLayer: (frameIndex: number, layerIndex: number) => void;
  moveLayer: (frameIndex: number, fromIndex: number, toIndex: number) => void;
  updateLayer: (frameIndex: number, layerIndex: number, updates: Partial<LayerData>) => void;
  updateLayerPixels: (frameIndex: number, layerIndex: number, imageData: ImageData) => void;

  // Hitbox operations
  addHitbox: (frameIndex: number, hitbox: Hitbox) => void;
  updateHitbox: (frameIndex: number, hitboxId: string, updates: Partial<Hitbox>) => void;
  deleteHitbox: (frameIndex: number, hitboxId: string) => void;

  // Animation operations
  addAnimation: (animation: Animation) => void;
  updateAnimation: (animationId: string, updates: Partial<Animation>) => void;
  deleteAnimation: (animationId: string) => void;

  // Palette operations
  addColor: (color: Color) => void;
  updateColor: (index: number, color: Color) => void;
  removeColor: (index: number) => void;

  // Tile operations (for tileset mode)
  addTile: (tile: TileData) => void;
  updateTile: (tileId: string, updates: Partial<TileData>) => void;
  deleteTile: (tileId: string) => void;
}

const createEmptyLayer = (name: string = 'Layer'): LayerData => ({
  id: crypto.randomUUID(),
  name,
  visible: true,
  opacity: 1,
  pixels: null,
});

const createEmptyFrame = (index: number, width: number, height: number): FrameData => ({
  id: crypto.randomUUID(),
  index,
  layers: [createEmptyLayer('Background')],
  pivot: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
  hitboxes: [],
  tags: [],
});

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,

  createProject: (name, width, height) => {
    const project: Project = {
      id: crypto.randomUUID(),
      version: '1.0',
      settings: {
        name,
        width,
        height,
        defaultFrameCount: 1,
        isTilesetMode: false,
      },
      frames: [createEmptyFrame(0, width, height)],
      animations: [],
      palette: [
        { r: 0, g: 0, b: 0, a: 255 },     // Black
        { r: 255, g: 255, b: 255, a: 255 }, // White
        { r: 255, g: 0, b: 0, a: 255 },   // Red
        { r: 0, g: 255, b: 0, a: 255 },   // Green
        { r: 0, g: 0, b: 255, a: 255 },   // Blue
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ project });
  },

  loadProject: (project) => {
    set({ project });
  },

  updateProjectSettings: (settings) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        settings: { ...project.settings, ...settings },
        updatedAt: Date.now(),
      },
    });
  },

  // Frame operations
  addFrame: () => {
    const { project } = get();
    if (!project) return;

    const newFrame = createEmptyFrame(
      project.frames.length,
      project.settings.width,
      project.settings.height
    );

    set({
      project: {
        ...project,
        frames: [...project.frames, newFrame],
        updatedAt: Date.now(),
      },
    });
  },

  duplicateFrame: (frameIndex) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frameToDuplicate = project.frames[frameIndex];
    const newFrame: FrameData = {
      ...frameToDuplicate,
      id: crypto.randomUUID(),
      index: project.frames.length,
      layers: frameToDuplicate.layers.map(layer => ({
        ...layer,
        id: crypto.randomUUID(),
      })),
    };

    set({
      project: {
        ...project,
        frames: [...project.frames, newFrame],
        updatedAt: Date.now(),
      },
    });
  },

  deleteFrame: (frameIndex) => {
    const { project } = get();
    if (!project || project.frames.length <= 1) return;

    const newFrames = project.frames
      .filter((_, i) => i !== frameIndex)
      .map((frame, i) => ({ ...frame, index: i }));

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  moveFrame: (fromIndex, toIndex) => {
    const { project } = get();
    if (!project) return;

    const newFrames = [...project.frames];
    const [movedFrame] = newFrames.splice(fromIndex, 1);
    newFrames.splice(toIndex, 0, movedFrame);

    // Update indices
    newFrames.forEach((frame, i) => {
      frame.index = i;
    });

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  updateFramePivot: (frameIndex, pivot) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const newFrames = [...project.frames];
    newFrames[frameIndex] = { ...newFrames[frameIndex], pivot };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  // Layer operations
  addLayer: (frameIndex, name = 'New Layer') => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const newFrames = [...project.frames];
    const frame = newFrames[frameIndex];
    frame.layers = [...frame.layers, createEmptyLayer(name)];

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  duplicateLayer: (frameIndex, layerIndex) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    if (layerIndex >= frame.layers.length) return;

    const layerToDuplicate = frame.layers[layerIndex];
    const newLayer: LayerData = {
      ...layerToDuplicate,
      id: crypto.randomUUID(),
      name: `${layerToDuplicate.name} Copy`,
    };

    const newFrames = [...project.frames];
    newFrames[frameIndex] = {
      ...frame,
      layers: [...frame.layers, newLayer],
    };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  deleteLayer: (frameIndex, layerIndex) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    if (frame.layers.length <= 1) return; // Keep at least one layer

    const newFrames = [...project.frames];
    newFrames[frameIndex] = {
      ...frame,
      layers: frame.layers.filter((_, i) => i !== layerIndex),
    };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  moveLayer: (frameIndex, fromIndex, toIndex) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    const newLayers = [...frame.layers];
    const [movedLayer] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, movedLayer);

    const newFrames = [...project.frames];
    newFrames[frameIndex] = { ...frame, layers: newLayers };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  updateLayer: (frameIndex, layerIndex, updates) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    if (layerIndex >= frame.layers.length) return;

    const newLayers = [...frame.layers];
    newLayers[layerIndex] = { ...newLayers[layerIndex], ...updates };

    const newFrames = [...project.frames];
    newFrames[frameIndex] = { ...frame, layers: newLayers };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  updateLayerPixels: (frameIndex, layerIndex, imageData) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    if (layerIndex >= frame.layers.length) return;

    const newLayers = [...frame.layers];
    newLayers[layerIndex] = { ...newLayers[layerIndex], pixels: imageData };

    const newFrames = [...project.frames];
    newFrames[frameIndex] = { ...frame, layers: newLayers };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  // Hitbox operations
  addHitbox: (frameIndex, hitbox) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const newFrames = [...project.frames];
    const frame = newFrames[frameIndex];
    frame.hitboxes = [...frame.hitboxes, hitbox];

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  updateHitbox: (frameIndex, hitboxId, updates) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    const hitboxIndex = frame.hitboxes.findIndex(h => h.id === hitboxId);
    if (hitboxIndex === -1) return;

    const newFrames = [...project.frames];
    const newHitboxes = [...frame.hitboxes];
    newHitboxes[hitboxIndex] = { ...newHitboxes[hitboxIndex], ...updates };
    newFrames[frameIndex] = { ...frame, hitboxes: newHitboxes };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  deleteHitbox: (frameIndex, hitboxId) => {
    const { project } = get();
    if (!project || frameIndex >= project.frames.length) return;

    const frame = project.frames[frameIndex];
    const newFrames = [...project.frames];
    newFrames[frameIndex] = {
      ...frame,
      hitboxes: frame.hitboxes.filter(h => h.id !== hitboxId),
    };

    set({
      project: {
        ...project,
        frames: newFrames,
        updatedAt: Date.now(),
      },
    });
  },

  // Animation operations
  addAnimation: (animation) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        animations: [...project.animations, animation],
        updatedAt: Date.now(),
      },
    });
  },

  updateAnimation: (animationId, updates) => {
    const { project } = get();
    if (!project) return;

    const animationIndex = project.animations.findIndex(a => a.id === animationId);
    if (animationIndex === -1) return;

    const newAnimations = [...project.animations];
    newAnimations[animationIndex] = { ...newAnimations[animationIndex], ...updates };

    set({
      project: {
        ...project,
        animations: newAnimations,
        updatedAt: Date.now(),
      },
    });
  },

  deleteAnimation: (animationId) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        animations: project.animations.filter(a => a.id !== animationId),
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

  // Tile operations
  addTile: (tile) => {
    const { project } = get();
    if (!project) return;

    set({
      project: {
        ...project,
        tiles: [...(project.tiles || []), tile],
        updatedAt: Date.now(),
      },
    });
  },

  updateTile: (tileId, updates) => {
    const { project } = get();
    if (!project || !project.tiles) return;

    const tileIndex = project.tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return;

    const newTiles = [...project.tiles];
    newTiles[tileIndex] = { ...newTiles[tileIndex], ...updates };

    set({
      project: {
        ...project,
        tiles: newTiles,
        updatedAt: Date.now(),
      },
    });
  },

  deleteTile: (tileId) => {
    const { project } = get();
    if (!project || !project.tiles) return;

    set({
      project: {
        ...project,
        tiles: project.tiles.filter(t => t.id !== tileId),
        updatedAt: Date.now(),
      },
    });
  },
}));
