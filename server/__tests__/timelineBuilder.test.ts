import { buildTimeline, normalizeTimelineResource } from "../src/services/timelineBuilder";
import type { PatientResourceSet } from "../src/services/resourceFetcher";

describe("timelineBuilder", () => {
  it("normalizes supported FHIR resources into timeline entries", () => {
    const entry = normalizeTimelineResource({
      resourceType: "Condition",
      id: "c1",
      recordedDate: "2024-02-01",
      code: {
        text: "Hypertension"
      },
      clinicalStatus: {
        text: "active"
      }
    });

    expect(entry).toMatchObject({
      id: "Condition/c1",
      date: "2024-02-01",
      type: "condition",
      title: "Hypertension",
      detail: "active"
    });
  });

  it("sorts timeline entries chronologically and extracts allergies", () => {
    const resourceSet: PatientResourceSet = {
      patient: {
        resourceType: "Patient",
        id: "p1",
        name: [{ given: ["Jane"], family: "Smith" }]
      },
      bundles: {
        Observation: {
          resourceType: "Bundle",
          entry: [
            {
              resource: {
                resourceType: "Observation",
                id: "o1",
                effectiveDateTime: "2024-04-01",
                code: { text: "Blood pressure" }
              }
            }
          ]
        },
        Encounter: {
          resourceType: "Bundle",
          entry: [
            {
              resource: {
                resourceType: "Encounter",
                id: "e1",
                period: { start: "2024-01-15" },
                type: [{ text: "Office visit" }]
              }
            }
          ]
        },
        AllergyIntolerance: {
          resourceType: "Bundle",
          entry: [
            {
              resource: {
                resourceType: "AllergyIntolerance",
                id: "a1",
                code: { text: "Penicillin" }
              }
            }
          ]
        }
      }
    };

    const timeline = buildTimeline(resourceSet);

    expect(timeline.patient.name).toBe("Jane Smith");
    expect(timeline.allergies).toEqual(["Penicillin"]);
    expect(timeline.entries.map((entry) => entry.id)).toEqual(["Encounter/e1", "Observation/o1"]);
  });
});
