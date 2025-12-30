import { create } from "zustand";

type Operation = {
  do: () => void;
  undo: () => void;
};

interface HistoryStore {
  undoStack: Operation[];
  redoStack: Operation[];
  push: (operation: Operation) => void;
  undo: () => void;
  redo: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  undoStack: [],
  redoStack: [],
  push: (operation) => {
    const { undoStack } = get();
    set({
      undoStack: [...undoStack, operation],
      redoStack: [], // clearing redo on new action
    });
  },
  undo: () => {
    const { undoStack, redoStack } = get();
    const operation = undoStack[undoStack.length - 1];
    if (!operation) {
      return;
    }

    operation.undo();

    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, operation],
    });
  },
  redo: () => {
    const { undoStack, redoStack } = get();
    const operation = redoStack[redoStack.length - 1];
    if (!operation) {
      return;
    }

    operation.do();

    set({
      undoStack: [...undoStack, operation],
      redoStack: redoStack.slice(0, -1),
    });
  },
}));
