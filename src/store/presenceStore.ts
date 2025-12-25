import { create } from "zustand";

interface PresenceState {
  cursor: { blockId: string; offset: number } | null;
}

export const usePresenceStore = create<PresenceState>(() => ({
  cursor: null,
}));
