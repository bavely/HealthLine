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

let timelineRequestId = 0;

export const useTimelineStore = create<TimelineState>((set) => ({
  entries: [],
  isLoading: false,
  loadPatientTimeline: async (patientId) => {
    const requestId = ++timelineRequestId;
    set({ entries: [], fetchedAt: undefined, isLoading: true, error: undefined });
    try {
      const timeline = await getPatientTimeline(patientId);
      if (requestId === timelineRequestId) {
        usePatientStore.getState().setPatientContext(timeline.patient, timeline.allergies);
        set({
          entries: timeline.entries,
          fetchedAt: timeline.fetchedAt,
          isLoading: false
        });
      }
    } catch (error) {
      if (requestId === timelineRequestId) {
        set({
          entries: [],
          fetchedAt: undefined,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unable to load timeline."
        });
      }
    }
  },
  clearTimeline: () => {
    timelineRequestId += 1;
    set({ entries: [], fetchedAt: undefined, isLoading: false, error: undefined });
  }
}));
