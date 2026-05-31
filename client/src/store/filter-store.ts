import { create } from "zustand";
import type { TimelineResourceType } from "../types/timeline";

const DEFAULT_TYPES: TimelineResourceType[] = [
  "encounter",
  "condition",
  "medication",
  "observation",
  "procedure"
];

interface FilterState {
  visibleTypes: TimelineResourceType[];
  toggleType: (type: TimelineResourceType) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  visibleTypes: DEFAULT_TYPES,
  toggleType: (type) =>
    set((state) => ({
      visibleTypes: state.visibleTypes.includes(type)
        ? state.visibleTypes.filter((visibleType) => visibleType !== type)
        : [...state.visibleTypes, type]
    })),
  reset: () => set({ visibleTypes: DEFAULT_TYPES })
}));
