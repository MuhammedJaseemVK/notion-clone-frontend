import { create } from "zustand";
import { nanoid } from "nanoid";

type BlockType = "paragraph" | "heading" | "code";

interface BlockData {
  id: string;
  type: BlockType;
  content: string;
  version: number;
}

interface BlockState {
  blocks: Record<string, BlockData>;
  addBlockBelow: (currentId: string) => string;
  mergeBlocks: (targetId: string, sourceId: string) => void;
  updateBlock: (id: string, content: string) => void;
}

export const useBlockStore = create<BlockState>((set, get) => ({
  blocks: {
    "1": {
      id: "1",
      type: "paragraph",
      content: "Hello world",
      version: 1,
    },
    "2": { id: "2", type: "paragraph", content: "Second block", version: 1 },
  },
  addBlockBelow: (currentId) => {
    const newId = nanoid();

    const newBlock: BlockData = {
      id: newId,
      type: "paragraph",
      content: "",
      version: 1,
    };

    const { blocks } = get();
    set({
      blocks: {
        ...blocks,
        [newId]: newBlock,
      },
    });

    return newId;
  },
  mergeBlocks: (targetId, sourceId) => {
    set((state) => {
      const target = state.blocks[targetId];
      const source = state.blocks[sourceId];

      if (!target || !source) {
        return state;
      }
      return {
        blocks: {
          ...state.blocks,
          [targetId]: {
            ...target,
            content: (target.content || "") + (source.content || ""),
          },
        },
      };
    });
  },
  updateBlock: (id, content) =>
    set((state) => ({
      blocks: {
        ...state.blocks,
        [id]: {
          ...state.blocks[id],
          content,
          version: state.blocks[id].version + 1,
        },
      },
    })),
}));
