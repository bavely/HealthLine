import type { PatientDemographics, SummaryResponse, TimelineResponse } from "../types/timeline";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

export async function searchPatients(query: string): Promise<PatientDemographics[]> {
  const data = await request<{ patients: PatientDemographics[] }>(
    `/patients/search?q=${encodeURIComponent(query)}`
  );
  return data.patients;
}

export async function getPatientTimeline(patientId: string): Promise<TimelineResponse> {
  return request<TimelineResponse>(`/patients/${encodeURIComponent(patientId)}/timeline`);
}

export async function summarizePatientTimeline(
  patientId: string,
  timeline: TimelineResponse
): Promise<SummaryResponse> {
  return request<SummaryResponse>(`/patients/${encodeURIComponent(patientId)}/summary`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(timeline)
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw new Error(body?.error ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
