export type TimelineResourceType =
  | "encounter"
  | "condition"
  | "medication"
  | "observation"
  | "procedure";

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface ObservationValue {
  value?: number;
  unit?: string;
  referenceRange?: {
    low?: number;
    high?: number;
  };
}

export interface PatientDemographics {
  id: string;
  name: string;
  gender?: string;
  birthDate?: string;
  identifiers?: string[];
}

export interface TimelineEntry {
  id: string;
  date: string;
  endDate?: string;
  type: TimelineResourceType;
  title: string;
  detail?: string;
  status?: string;
  coding?: Coding;
  values?: ObservationValue;
  resource?: unknown;
}

export interface TimelineResponse {
  patient: PatientDemographics;
  allergies: string[];
  entries: TimelineEntry[];
  fetchedAt: string;
}

export interface SummaryResponse {
  summary: string;
  glossary: Array<{
    term: string;
    definition: string;
  }>;
  disclaimer: string;
}
