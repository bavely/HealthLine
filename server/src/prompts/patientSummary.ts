import type { TimelineResponse } from "../types";

export const AI_SUMMARY_DISCLAIMER =
  "This summary is AI-generated for education and care navigation support. It is not a diagnosis, treatment plan, or substitute for clinician review.";

export function buildPatientSummaryMessages(timeline: TimelineResponse) {
  return [
    {
      role: "system" as const,
      content:
        "You summarize FHIR patient history in plain language. Explain medical terms in parentheses, avoid diagnosing, avoid treatment recommendations, and call out when data appears incomplete. Return only valid JSON with keys summary, glossary (as an array of objects with term and definition properties), and disclaimer."
    },
    {
      role: "user" as const,
      content: JSON.stringify(
        {
          patient: timeline.patient,
          allergies: timeline.allergies,
          timeline: timeline.entries.map((entry) => ({
            date: entry.date,
            endDate: entry.endDate,
            type: entry.type,
            title: entry.title,
            detail: entry.detail,
            status: entry.status,
            values: entry.values
          })),
          requiredDisclaimer: AI_SUMMARY_DISCLAIMER
        },
        null,
        2
      )
    }
  ];
}
