import { create } from "zustand";

interface EditorState {
  documentId: string;
  title: string;
  orderedBlockIds: string[];
  insertBlockAfter: (currentId: string, newId: string) => void;
  removeBlockFromOrder: (id: string) => void;
}

export const useEditoreStore = create<EditorState>((set, get) => ({
  documentId: "",
  title: "",
  orderedBlockIds: ["1", "2"],
  insertBlockAfter: (currentId, newId) => {
    set((state) => {
      const index = state.orderedBlockIds.indexOf(currentId);
      if (index === -1) {
        return state;
      }

      const next = [...state.orderedBlockIds];
      next.splice(index + 1, 0, newId);

      return { orderedBlockIds: next };
    });
  },
  removeBlockFromOrder: (id) => {
    set((state) => ({
      orderedBlockIds: state.orderedBlockIds.filter((b) => b !== id),
    }));
  },
}));
