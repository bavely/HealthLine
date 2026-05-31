import { create } from "zustand";
import { searchPatients } from "../services/api";
import type { PatientDemographics } from "../types/timeline";

interface PatientState {
  activePatient?: PatientDemographics;
  allergies: string[];
  searchResults: PatientDemographics[];
  isSearching: boolean;
  searchError?: string;
  setActivePatient: (patient?: PatientDemographics) => void;
  setPatientContext: (patient: PatientDemographics, allergies: string[]) => void;
  search: (query: string) => Promise<void>;
}

let searchRequestId = 0;

export const usePatientStore = create<PatientState>((set) => ({
  allergies: [],
  searchResults: [],
  isSearching: false,
  setActivePatient: (patient) => set({ activePatient: patient, allergies: [] }),
  setPatientContext: (patient, allergies) => set({ activePatient: patient, allergies }),
  search: async (query) => {
    const trimmedQuery = query.trim();
    const requestId = ++searchRequestId;

    if (!trimmedQuery) {
      set({ searchResults: [], isSearching: false, searchError: undefined });
      return;
    }

    set({ isSearching: true, searchError: undefined });
    try {
      const searchResults = await searchPatients(trimmedQuery);
      if (requestId === searchRequestId) {
        set({ searchResults, isSearching: false });
      }
    } catch (error) {
      if (requestId === searchRequestId) {
        set({
          isSearching: false,
          searchError: error instanceof Error ? error.message : "Unable to search patients."
        });
      }
    }
  }
}));
