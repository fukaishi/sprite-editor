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
  sheetWidth: number; // 512 or 1024
  sheetHeight: number; // 512 or 1024
  characterWidth: number; // 8, 16, 24, 32, or 64
  characterHeight: number; // 8, 16, 24, 32, or 64
}

// Project Type
export interface Project {
  id: string;
  version: string;
  settings: ProjectSettings;
  sheetPixels: ImageData | null; // The entire sprite sheet
  palette: Color[];
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
  selectedCharacterX: number; // Grid X position for preview
  selectedCharacterY: number; // Grid Y position for preview
  currentTool: Tool;
  zoom: number;
  showGrid: boolean;
}

// History for Undo/Redo
export interface HistoryEntry {
  type: 'draw' | 'project';
  description: string;
  undo: () => void;
  redo: () => void;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxSteps: number;
}
