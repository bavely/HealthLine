import type { FhirResource } from "../types/fhir";
import type { TimelineEntry } from "../types/timeline";

export function normalizeFhirResource(resource: FhirResource): TimelineEntry | null {
  switch (resource.resourceType) {
    case "Encounter":
      return normalizeEncounter(resource);
    case "Condition":
      return normalizeCondition(resource);
    case "MedicationRequest":
      return normalizeMedication(resource);
    case "Observation":
      return normalizeObservation(resource);
    case "Procedure":
      return normalizeProcedure(resource);
    default:
      return null;
  }
}

function normalizeEncounter(resource: FhirResource): TimelineEntry | null {
  const period = asObject(resource.period);
  const date = asString(period?.start) ?? asString(period?.end);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: asString(period?.end),
    type: "encounter",
    title: codeableText(first(resource.type)) ?? codingDisplay(asObject(resource.class)) ?? "Encounter",
    detail: codeableText(first(resource.reasonCode)),
    status: asString(resource.status),
    coding: codingFromConcept(first(resource.type)) ?? codingFromRaw(asObject(resource.class)),
    resource
  };
}

function normalizeCondition(resource: FhirResource): TimelineEntry | null {
  const date =
    asString(resource.onsetDateTime) ??
    asString(resource.recordedDate) ??
    asString(resource.abatementDateTime);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: asString(resource.abatementDateTime),
    type: "condition",
    title: codeableText(resource.code) ?? "Condition",
    detail: codeableText(resource.clinicalStatus),
    status: codeableText(resource.verificationStatus),
    coding: codingFromConcept(resource.code),
    resource
  };
}

function normalizeMedication(resource: FhirResource): TimelineEntry | null {
  const dosage = first(resource.dosageInstruction);
  const timing = asObject(dosage?.timing);
  const repeat = asObject(timing?.repeat);
  const bounds = asObject(repeat?.boundsPeriod);
  const date = asString(resource.authoredOn) ?? asString(bounds?.start);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: asString(bounds?.end),
    type: "medication",
    title: codeableText(resource.medicationCodeableConcept) ?? referenceDisplay(resource.medicationReference) ?? "Medication",
    detail: asString(dosage?.text),
    status: asString(resource.status),
    coding: codingFromConcept(resource.medicationCodeableConcept),
    resource
  };
}

function normalizeObservation(resource: FhirResource): TimelineEntry | null {
  const date = asString(resource.effectiveDateTime) ?? asString(resource.issued);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    type: "observation",
    title: codeableText(resource.code) ?? "Observation",
    detail: observationDetail(resource),
    status: asString(resource.status),
    coding: codingFromConcept(resource.code),
    values: observationValue(resource),
    resource
  };
}

function normalizeProcedure(resource: FhirResource): TimelineEntry | null {
  const period = asObject(resource.performedPeriod);
  const date = asString(resource.performedDateTime) ?? asString(period?.start);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: asString(period?.end),
    type: "procedure",
    title: codeableText(resource.code) ?? "Procedure",
    detail: codeableText(first(resource.reasonCode)),
    status: asString(resource.status),
    coding: codingFromConcept(resource.code),
    resource
  };
}

function observationDetail(resource: FhirResource): string | undefined {
  const quantity = asObject(resource.valueQuantity);
  const stringValue = asString(resource.valueString);
  const codeableValue = codeableText(resource.valueCodeableConcept);

  if (quantity) {
    const value = asNumber(quantity.value);
    const unit = asString(quantity.unit) ?? asString(quantity.code);
    return [value, unit].filter((part) => part !== undefined && part !== "").join(" ");
  }

  return stringValue ?? codeableValue;
}

function observationValue(resource: FhirResource) {
  const quantity = asObject(resource.valueQuantity);
  if (!quantity) {
    return undefined;
  }

  const firstRange = first(resource.referenceRange);
  const low = asObject(firstRange?.low);
  const high = asObject(firstRange?.high);

  return {
    value: asNumber(quantity.value),
    unit: asString(quantity.unit) ?? asString(quantity.code),
    referenceRange: firstRange
      ? {
          low: asNumber(low?.value),
          high: asNumber(high?.value)
        }
      : undefined
  };
}

function codeableText(value: unknown): string | undefined {
  const concept = asObject(value);
  const coding = first(concept?.coding);
  return asString(concept?.text) ?? asString(coding?.display) ?? asString(coding?.code);
}

function referenceDisplay(value: unknown): string | undefined {
  return asString(asObject(value)?.display);
}

function entryId(resource: FhirResource): string {
  return `${resource.resourceType ?? "Resource"}/${resource.id ?? randomId()}`;
}

function codingFromConcept(value: unknown) {
  return codingFromRaw(first(asObject(value)?.coding));
}

function codingFromRaw(value: unknown) {
  const coding = asObject(value);
  if (!coding) {
    return undefined;
  }

  return {
    system: asString(coding.system),
    code: asString(coding.code),
    display: asString(coding.display)
  };
}

function codingDisplay(value: unknown): string | undefined {
  const coding = asObject(value);
  return asString(coding?.display) ?? asString(coding?.code);
}

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

function first(value: unknown): Record<string, unknown> | undefined {
  return Array.isArray(value) ? asObject(value[0]) : undefined;
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}
