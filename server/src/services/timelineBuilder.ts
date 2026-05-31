import { normalizePatient } from "./fhirClient";
import type {
  Coding,
  FhirBundle,
  FhirResource,
  PatientDemographics,
  ResourceBundleMap,
  TimelineEntry,
  TimelineResponse
} from "../types";
import type { PatientResourceSet } from "./resourceFetcher";

export function buildTimeline(resourceSet: PatientResourceSet): TimelineResponse {
  const patient = normalizePatient(resourceSet.patient);
  const resources = flattenBundles(resourceSet.bundles);
  const entries = resources
    .map((resource) => normalizeTimelineResource(resource))
    .filter((entry): entry is TimelineEntry => Boolean(entry))
    .sort((left, right) => left.date.localeCompare(right.date));

  return {
    patient,
    allergies: extractAllergies(resourceSet.bundles.AllergyIntolerance),
    entries,
    fetchedAt: new Date().toISOString()
  };
}

export function normalizeTimelineResource(resource: FhirResource): TimelineEntry | null {
  switch (resource.resourceType) {
    case "Encounter":
      return normalizeEncounter(resource);
    case "Condition":
      return normalizeCondition(resource);
    case "MedicationRequest":
      return normalizeMedicationRequest(resource);
    case "Observation":
      return normalizeObservation(resource);
    case "Procedure":
      return normalizeProcedure(resource);
    default:
      return null;
  }
}

export function emptyTimeline(patient: PatientDemographics): TimelineResponse {
  return {
    patient,
    allergies: [],
    entries: [],
    fetchedAt: new Date().toISOString()
  };
}

function normalizeEncounter(resource: FhirResource): TimelineEntry | null {
  const period = getObject(resource.period);
  const date = getString(period?.start) ?? getString(period?.end);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: getString(period?.end),
    type: "encounter",
    title: codeableConceptText(firstArrayItem(resource.type)) ?? codingDisplay(getObject(resource.class)) ?? "Encounter",
    detail: codeableConceptText(firstArrayItem(resource.reasonCode)),
    status: getString(resource.status),
    coding: codingFromConcept(firstArrayItem(resource.type)) ?? codingFromRaw(getObject(resource.class)),
    resource
  };
}

function normalizeCondition(resource: FhirResource): TimelineEntry | null {
  const date =
    getString(resource.onsetDateTime) ??
    getString(resource.recordedDate) ??
    getString(resource.abatementDateTime);

  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: getString(resource.abatementDateTime),
    type: "condition",
    title: codeableConceptText(resource.code) ?? "Condition",
    detail: codeableConceptText(resource.clinicalStatus),
    status: codeableConceptText(resource.verificationStatus),
    coding: codingFromConcept(resource.code),
    resource
  };
}

function normalizeMedicationRequest(resource: FhirResource): TimelineEntry | null {
  const dosage = firstArrayItem(resource.dosageInstruction);
  const timing = getObject(dosage?.timing);
  const repeat = getObject(timing?.repeat);
  const bounds = getObject(repeat?.boundsPeriod);
  const date = getString(resource.authoredOn) ?? getString(bounds?.start);

  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: getString(bounds?.end),
    type: "medication",
    title: codeableConceptText(resource.medicationCodeableConcept) ?? referenceDisplay(resource.medicationReference) ?? "Medication",
    detail: getString(dosage?.text),
    status: getString(resource.status),
    coding: codingFromConcept(resource.medicationCodeableConcept),
    resource
  };
}

function normalizeObservation(resource: FhirResource): TimelineEntry | null {
  const date = getString(resource.effectiveDateTime) ?? getString(resource.issued);
  if (!date) {
    return null;
  }

  const value = observationValue(resource);

  return {
    id: entryId(resource),
    date,
    type: "observation",
    title: codeableConceptText(resource.code) ?? "Observation",
    detail: observationDetail(resource),
    status: getString(resource.status),
    coding: codingFromConcept(resource.code),
    values: value,
    resource
  };
}

function normalizeProcedure(resource: FhirResource): TimelineEntry | null {
  const period = getObject(resource.performedPeriod);
  const date = getString(resource.performedDateTime) ?? getString(period?.start);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: getString(period?.end),
    type: "procedure",
    title: codeableConceptText(resource.code) ?? "Procedure",
    detail: codeableConceptText(firstArrayItem(resource.reasonCode)),
    status: getString(resource.status),
    coding: codingFromConcept(resource.code),
    resource
  };
}

function extractAllergies(bundle?: FhirBundle): string[] {
  return (bundle?.entry ?? [])
    .map((entry) => entry.resource)
    .filter((resource): resource is FhirResource => resource?.resourceType === "AllergyIntolerance")
    .map((resource) => codeableConceptText(resource.code))
    .filter((allergy): allergy is string => Boolean(allergy));
}

function flattenBundles(bundles: ResourceBundleMap): FhirResource[] {
  return Object.values(bundles).flatMap((bundle) =>
    (bundle?.entry ?? [])
      .map((entry) => entry.resource)
      .filter((resource): resource is FhirResource => Boolean(resource))
  );
}

function observationDetail(resource: FhirResource): string | undefined {
  const quantity = getObject(resource.valueQuantity);
  const stringValue = getString(resource.valueString);
  const codeableValue = codeableConceptText(resource.valueCodeableConcept);

  if (quantity) {
    const value = getNumber(quantity.value);
    const unit = getString(quantity.unit) ?? getString(quantity.code);
    return [value, unit].filter((part) => part !== undefined && part !== "").join(" ");
  }

  return stringValue ?? codeableValue;
}

function observationValue(resource: FhirResource) {
  const quantity = getObject(resource.valueQuantity);
  if (!quantity) {
    return undefined;
  }

  const firstRange = firstArrayItem(resource.referenceRange);
  const low = getObject(firstRange?.low);
  const high = getObject(firstRange?.high);

  return {
    value: getNumber(quantity.value),
    unit: getString(quantity.unit) ?? getString(quantity.code),
    referenceRange: firstRange
      ? {
          low: getNumber(low?.value),
          high: getNumber(high?.value)
        }
      : undefined
  };
}

function codeableConceptText(value: unknown): string | undefined {
  const concept = getObject(value);
  if (!concept) {
    return undefined;
  }

  const text = getString(concept.text);
  const coding = firstArrayItem(concept.coding);
  return text ?? codingDisplay(coding);
}

function codingFromConcept(value: unknown): Coding | undefined {
  const coding = firstArrayItem(getObject(value)?.coding);
  return codingFromRaw(coding);
}

function codingFromRaw(value: unknown): Coding | undefined {
  const coding = getObject(value);
  if (!coding) {
    return undefined;
  }

  return {
    system: getString(coding.system),
    code: getString(coding.code),
    display: getString(coding.display)
  };
}

function codingDisplay(value: unknown): string | undefined {
  return getString(getObject(value)?.display) ?? getString(getObject(value)?.code);
}

function referenceDisplay(value: unknown): string | undefined {
  return getString(getObject(value)?.display);
}

function entryId(resource: FhirResource): string {
  return `${resource.resourceType ?? "Resource"}/${resource.id ?? crypto.randomUUID()}`;
}

function firstArrayItem(value: unknown): Record<string, unknown> | undefined {
  return Array.isArray(value) ? getObject(value[0]) : undefined;
}

function getObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}
