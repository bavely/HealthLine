import { create } from "zustand";
import { getPatientTimeline } from "../services/api";
import { usePatientStore } from "./patient-store";
import type { TimelineEntry } from "../types/timeline";

interface TimelineState {
  entries: TimelineEntry[];
  fetchedAt?: string;
  isLoading: boolean;
  error?: string;
  loadPatientTimeline: (patientId: string) => Promise<void>;
  clearTimeline: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  entries: [],
  isLoading: false,
  loadPatientTimeline: async (patientId) => {
    set({ isLoading: true, error: undefined });
    try {
      const timeline = await getPatientTimeline(patientId);
      usePatientStore.getState().setPatientContext(timeline.patient, timeline.allergies);
      set({
        entries: timeline.entries,
        fetchedAt: timeline.fetchedAt,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unable to load timeline."
      });
    }
  },
  clearTimeline: () => set({ entries: [], fetchedAt: undefined, error: undefined })
}));
