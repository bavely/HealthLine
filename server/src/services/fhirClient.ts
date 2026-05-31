import type { FhirBundle, FhirResource, PatientDemographics, PatientSearchResult } from "../types";

const DEFAULT_FHIR_BASE_URL = "https://hapi.fhir.org/baseR4";

export class FhirClient {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.FHIR_BASE_URL ?? DEFAULT_FHIR_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async searchPatients(query: string): Promise<PatientSearchResult[]> {
    const url = this.url("/Patient", {
      name: query,
      _count: "10"
    });
    const bundle = await this.getJson<FhirBundle>(url);

    return (bundle.entry ?? [])
      .map((entry) => entry.resource)
      .filter((resource): resource is FhirResource => resource?.resourceType === "Patient" && Boolean(resource.id))
      .map(normalizePatient);
  }

  async getPatient(patientId: string): Promise<FhirResource> {
    return this.getJson<FhirResource>(this.url(`/Patient/${encodeURIComponent(patientId)}`));
  }

  async searchPatientResource(resourceType: string, patientId: string): Promise<FhirBundle> {
    return this.getJson<FhirBundle>(
      this.url(`/${resourceType}`, {
        patient: patientId,
        _count: "100",
        _sort: "-_lastUpdated"
      })
    );
  }

  private url(path: string, params: Record<string, string> = {}): string {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private async getJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        accept: "application/fhir+json, application/json"
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`FHIR request failed (${response.status}) ${body.slice(0, 240)}`);
    }

    return response.json() as Promise<T>;
  }
}

export function normalizePatient(resource: FhirResource): PatientDemographics {
  return {
    id: String(resource.id),
    name: getPatientName(resource),
    gender: getString(resource.gender),
    birthDate: getString(resource.birthDate),
    identifiers: getIdentifiers(resource)
  };
}

function getPatientName(resource: FhirResource): string {
  const names = Array.isArray(resource.name) ? resource.name : [];
  const official = names.find((name) => isObject(name) && name.use === "official") ?? names[0];

  if (!isObject(official)) {
    return "Unnamed patient";
  }

  const given = Array.isArray(official.given) ? official.given.join(" ") : "";
  const family = getString(official.family);
  const text = getString(official.text);
  return text || [given, family].filter(Boolean).join(" ") || "Unnamed patient";
}

function getIdentifiers(resource: FhirResource): string[] {
  const identifiers = Array.isArray(resource.identifier) ? resource.identifier : [];

  return identifiers
    .map((identifier) => (isObject(identifier) ? getString(identifier.value) : undefined))
    .filter((value): value is string => Boolean(value));
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
