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
  const date = asString(period?.start);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    endDate: asString(period?.end),
    type: "encounter",
    title: codeableText(first(resource.type)) ?? "Encounter",
    status: asString(resource.status),
    resource
  };
}

function normalizeCondition(resource: FhirResource): TimelineEntry | null {
  const date = asString(resource.onsetDateTime) ?? asString(resource.recordedDate);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    type: "condition",
    title: codeableText(resource.code) ?? "Condition",
    detail: codeableText(resource.clinicalStatus),
    resource
  };
}

function normalizeMedication(resource: FhirResource): TimelineEntry | null {
  const date = asString(resource.authoredOn);
  if (!date) {
    return null;
  }

  return {
    id: entryId(resource),
    date,
    type: "medication",
    title: codeableText(resource.medicationCodeableConcept) ?? referenceDisplay(resource.medicationReference) ?? "Medication",
    status: asString(resource.status),
    resource
  };
}

function normalizeObservation(resource: FhirResource): TimelineEntry | null {
  const date = asString(resource.effectiveDateTime) ?? asString(resource.issued);
  if (!date) {
    return null;
  }

  const quantity = asObject(resource.valueQuantity);
  const value = asNumber(quantity?.value);
  const unit = asString(quantity?.unit) ?? asString(quantity?.code);

  return {
    id: entryId(resource),
    date,
    type: "observation",
    title: codeableText(resource.code) ?? "Observation",
    detail: quantity ? [value, unit].filter((part) => part !== undefined).join(" ") : undefined,
    values: quantity ? { value, unit } : undefined,
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
    status: asString(resource.status),
    resource
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
  return `${resource.resourceType ?? "Resource"}/${resource.id ?? "unknown"}`;
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
