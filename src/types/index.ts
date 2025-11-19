// Basic Types
export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Color {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-255
}

// Hitbox Types
export type HitboxType = 'hitbox' | 'hurtbox';

export interface Hitbox {
  id: string;
  type: HitboxType;
  rect: Rectangle;
}

// Layer Types
export interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  opacity: number; // 0-1
  pixels: ImageData | null;
}

// Frame Types
export interface FrameData {
  id: string;
  index: number;
  layers: LayerData[];
  pivot: Point;
  hitboxes: Hitbox[];
  tags: string[];
}

// Animation Types
export interface Animation {
  id: string;
  name: string;
  frameIndices: number[];
  loop: boolean;
  fps: number;
}

// Tool Types
export type ToolType =
  | 'pen'
  | 'eraser'
  | 'bucket'
  | 'rectangle'
  | 'line'
  | 'eyedropper'
  | 'select';

export interface Tool {
  type: ToolType;
  size: number; // brush size
  color: Color;
}

// Project Settings
export interface ProjectSettings {
  name: string;
  width: number;
  height: number;
  tileWidth?: number; // for tileset mode
  tileHeight?: number; // for tileset mode
  defaultFrameCount: number;
  isTilesetMode: boolean;
}

// Tile-specific Types
export interface TileData {
  id: string;
  tileId: number;
  name: string;
  collision?: Rectangle;
  terrainTag?: string;
}

// Project Type
export interface Project {
  id: string;
  version: string;
  settings: ProjectSettings;
  frames: FrameData[];
  animations: Animation[];
  palette: Color[];
  tiles?: TileData[]; // only for tileset mode
  createdAt: number;
  updatedAt: number;
}

// Export Types
export type SpriteSheetLayout = 'horizontal' | 'vertical' | 'grid';

export interface ExportSettings {
  layout: SpriteSheetLayout;
  gridColumns?: number; // for grid layout
  includeMetadata: boolean;
}

// Metadata for Godot Export
export interface GodotFrameMetadata {
  index: number;
  rect: Rectangle;
  pivot: Point;
  hitboxes: Array<{
    type: HitboxType;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  tags: string[];
}

export interface GodotMetadata {
  meta: {
    version: string;
    image: string;
    frame_width: number;
    frame_height: number;
  };
  frames: GodotFrameMetadata[];
  animations: Array<{
    name: string;
    frames: number[];
    loop: boolean;
    fps: number;
  }>;
}

// UI State Types
export interface EditorState {
  currentFrameIndex: number;
  currentLayerIndex: number;
  currentTool: Tool;
  zoom: number;
  showGrid: boolean;
  showPivot: boolean;
  showHitboxes: boolean;
  isPlaying: boolean;
  playbackFps: number;
}

// History for Undo/Redo
export interface HistoryEntry {
  type: 'draw' | 'layer' | 'frame' | 'project';
  data: any;
  timestamp: number;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxSteps: number;
}
