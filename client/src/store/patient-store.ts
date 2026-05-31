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

export const usePatientStore = create<PatientState>((set) => ({
  allergies: [],
  searchResults: [],
  isSearching: false,
  setActivePatient: (patient) => set({ activePatient: patient }),
  setPatientContext: (patient, allergies) => set({ activePatient: patient, allergies }),
  search: async (query) => {
    set({ isSearching: true, searchError: undefined });
    try {
      const searchResults = await searchPatients(query);
      set({ searchResults, isSearching: false });
    } catch (error) {
      set({
        isSearching: false,
        searchError: error instanceof Error ? error.message : "Unable to search patients."
      });
    }
  }
}));
