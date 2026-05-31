import { FhirClient } from "./fhirClient";
import type { ClinicalResourceName, FhirBundle, FhirResource, ResourceBundleMap } from "../types";

export const CLINICAL_RESOURCE_TYPES: ClinicalResourceName[] = [
  "Encounter",
  "Condition",
  "MedicationRequest",
  "Observation",
  "Procedure",
  "AllergyIntolerance"
];

export interface PatientResourceSet {
  patient: FhirResource;
  bundles: ResourceBundleMap;
}

export async function fetchPatientResourceSet(
  patientId: string,
  client = new FhirClient()
): Promise<PatientResourceSet> {
  const [patient, resourcePairs] = await Promise.all([
    client.getPatient(patientId),
    Promise.all(
      CLINICAL_RESOURCE_TYPES.map(async (resourceType) => {
        const bundle = await safeFetchResource(client, resourceType, patientId);
        return [resourceType, bundle] as const;
      })
    )
  ]);

  return {
    patient,
    bundles: Object.fromEntries(resourcePairs) as ResourceBundleMap
  };
}

async function safeFetchResource(
  client: FhirClient,
  resourceType: ClinicalResourceName,
  patientId: string
): Promise<FhirBundle> {
  try {
    return await client.searchPatientResource(resourceType, patientId);
  } catch {
    return { resourceType: "Bundle", entry: [] };
  }
}
