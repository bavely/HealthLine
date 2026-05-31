export type TimelineResourceType =
  | "encounter"
  | "condition"
  | "medication"
  | "observation"
  | "procedure";

export type ClinicalResourceName =
  | "Encounter"
  | "Condition"
  | "MedicationRequest"
  | "Observation"
  | "Procedure"
  | "AllergyIntolerance";

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

export type PatientSearchResult = PatientDemographics;

export interface TimelineEntry<TResource = FhirResource> {
  id: string;
  date: string;
  endDate?: string;
  type: TimelineResourceType;
  title: string;
  detail?: string;
  status?: string;
  coding?: Coding;
  values?: ObservationValue;
  resource: TResource;
}

export interface TimelineResponse {
  patient: PatientDemographics;
  allergies: string[];
  entries: TimelineEntry[];
  fetchedAt: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface SummaryResponse {
  summary: string;
  glossary: GlossaryTerm[];
  disclaimer: string;
}

export interface FhirBundle<TResource = FhirResource> {
  resourceType: "Bundle";
  entry?: Array<{
    resource?: TResource;
  }>;
}

export interface FhirResource {
  resourceType?: string;
  id?: string;
  [key: string]: unknown;
}

export type ResourceBundleMap = Partial<Record<ClinicalResourceName, FhirBundle>>;
