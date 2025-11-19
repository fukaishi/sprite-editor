import { create } from 'zustand';

export type HistoryActionType = 'draw' | 'layer' | 'frame' | 'animation' | 'hitbox' | 'pivot';

export interface HistoryEntry {
  type: HistoryActionType;
  description: string;
  undo: () => void;
  redo: () => void;
  timestamp: number;
}

interface HistoryStore {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxSteps: number;

  // Actions
  addHistory: (entry: Omit<HistoryEntry, 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  maxSteps: 50,

  addHistory: (entry) => {
    const { past, maxSteps } = get();
    const newEntry: HistoryEntry = {
      ...entry,
      timestamp: Date.now(),
    };

    const newPast = [...past, newEntry];
    if (newPast.length > maxSteps) {
      newPast.shift();
    }

    set({
      past: newPast,
      future: [], // Clear redo stack when new action is performed
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const entry = past[past.length - 1];
    entry.undo();

    set({
      past: past.slice(0, -1),
      future: [entry, ...future],
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const entry = future[0];
    entry.redo();

    set({
      past: [...past, entry],
      future: future.slice(1),
    });
  },

  clear: () => {
    set({ past: [], future: [] });
  },

  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },
}));
